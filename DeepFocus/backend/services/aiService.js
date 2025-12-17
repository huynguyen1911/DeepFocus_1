/**
 * AI Service for Focus Training Plan
 * Supports multiple AI providers: OpenAI, Anthropic, Google Gemini, Ollama
 */

const OpenAI = require("openai");

class AIService {
  constructor() {
    this.provider = process.env.AI_PROVIDER || "openai";
    this.model = process.env.AI_MODEL || "gpt-4o-mini";

    // Initialize based on provider
    this.initializeProvider();
  }

  initializeProvider() {
    switch (this.provider) {
      case "openai":
        if (!process.env.OPENAI_API_KEY) {
          console.warn("⚠️  OPENAI_API_KEY not found in environment");
        }
        this.client = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
          timeout: 120000, // 120 second timeout - plan generation needs more time
          maxRetries: 1, // Reduce retries to 1 to avoid very long waits
        });
        break;

      case "anthropic":
        const Anthropic = require("@anthropic-ai/sdk");
        if (!process.env.ANTHROPIC_API_KEY) {
          console.warn("⚠️  ANTHROPIC_API_KEY not found in environment");
        }
        this.client = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY,
        });
        break;

      case "google":
        try {
          const { GoogleGenerativeAI } = require("@google/generative-ai");
          if (!process.env.GOOGLE_AI_API_KEY) {
            console.warn("⚠️  GOOGLE_AI_API_KEY not found in environment");
          }
          this.client = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
          console.log("✅ Google Gemini AI initialized successfully");
        } catch (error) {
          console.error(
            "❌ Failed to initialize Google Gemini:",
            error.message
          );
          throw error;
        }
        break;

      case "ollama":
        // Ollama runs locally, no API key needed
        this.ollamaBaseUrl =
          process.env.OLLAMA_BASE_URL || "http://localhost:11434";
        break;

      default:
        console.warn(
          `⚠️  Unknown AI provider: ${this.provider}, defaulting to OpenAI`
        );
        this.provider = "openai";
        this.initializeProvider();
    }
  }

  /**
   * Generate initial assessment analysis
   */
  async analyzeInitialAssessment(assessmentData) {
    const prompt = this.buildInitialAssessmentPrompt(assessmentData);

    try {
      const response = await this.callAI(prompt, {
        temperature: 0.7,
        maxTokens: 1000,
      });

      return {
        analysis: response,
        recommendations: this.extractRecommendations(response),
        suggestedDifficulty: this.determineDifficulty(assessmentData),
        suggestedDuration: this.determineDuration(assessmentData),
      };
    } catch (error) {
      console.error("❌ Error analyzing assessment with AI:", error.message);
      console.log("⚠️  Using fallback analysis");

      // Fallback analysis without AI
      const difficulty = this.determineDifficulty(assessmentData);
      const duration = this.determineDuration(assessmentData);

      return {
        analysis: `Based on your focus level of ${assessmentData.focusLevel}/10 and ${assessmentData.availableTimePerDay} minutes available daily, we recommend starting with a ${difficulty} ${duration}-week program. This will help you build sustainable focus habits gradually.`,
        recommendations: [
          "Start with short focus sessions",
          "Practice daily consistency",
          "Track your progress regularly",
        ],
        suggestedDifficulty: difficulty,
        suggestedDuration: duration,
      };
    }
  }

  /**
   * Generate personalized focus training plan (progressive - week by week)
   */
  async generateTrainingPlan(assessmentData, userProfile) {
    const { duration } = this.determinePlanParameters(assessmentData);

    console.log(`🔄 Generating ${duration}-week plan with AI only...`);
    const weeks = [];

    // Generate ALL weeks with AI (no fallback unless absolutely necessary)
    for (let weekNum = 1; weekNum <= duration; weekNum++) {
      let weekData = null;
      let retryCount = 0;
      const maxRetries = 3;

      while (!weekData && retryCount < maxRetries) {
        try {
          console.log(
            `🤖 AI generating Week ${weekNum} (attempt ${
              retryCount + 1
            }/${maxRetries})...`
          );

          const prompt = this.buildPlanGenerationPrompt(
            assessmentData,
            userProfile,
            weekNum
          );

          const response = await this.callAI(prompt, {
            temperature: 0.7, // Higher for creative, varied, detailed content
            maxTokens: 3000, // More tokens for very detailed descriptions and examples
            responseFormat: "json", // Force JSON mode for validation
          });

          weekData = this.parseAIResponse(response);
          console.log(`✅ Week ${weekNum} generated successfully`);
        } catch (error) {
          retryCount++;
          console.error(
            `❌ Week ${weekNum} attempt ${retryCount} failed:`,
            error.message
          );

          if (retryCount >= maxRetries) {
            throw new Error(
              `Failed to generate Week ${weekNum} after ${maxRetries} attempts: ${error.message}`
            );
          }

          // Wait a bit before retry
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      weeks.push(weekData);
    }

    // Validate and add metadata
    const planData = { weeks };
    return this.validateAndStructurePlan(planData, assessmentData);
  }

  /**
   * Parse AI response with robust error handling and JSON repair
   */
  parseAIResponse(response) {
    let cleanedResponse = response;

    // Remove markdown code blocks if present
    if (typeof response === "string") {
      cleanedResponse = response
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();

      // Try to find JSON object if wrapped in other text
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedResponse = jsonMatch[0];
      }

      // CRITICAL: Remove Vietnamese diacritics (AI ignores instruction)
      cleanedResponse = this.removeVietnameseDiacritics(cleanedResponse);

      // Repair common JSON errors
      cleanedResponse = this.repairJSON(cleanedResponse);
      console.log(
        "🔍 FINAL JSON BEFORE PARSE (first 300 chars):",
        cleanedResponse.substring(0, 300)
      );
    }

    try {
      return typeof cleanedResponse === "string"
        ? JSON.parse(cleanedResponse)
        : cleanedResponse;
    } catch (error) {
      // Log problematic area for debugging
      const errorPos = parseInt(
        error.message.match(/position (\d+)/)?.[1] || 0
      );
      const start = Math.max(0, errorPos - 100);
      const end = Math.min(cleanedResponse.length, errorPos + 100);
      console.error("❌ JSON Parse Error at position", errorPos);
      console.error("Context:", cleanedResponse.substring(start, end));

      // Log more context - look at the end of JSON where structure issues often occur
      console.error("📄 JSON length:", cleanedResponse.length);
      console.error(
        "📄 Last 300 chars:",
        cleanedResponse.substring(cleanedResponse.length - 300)
      );

      // Check for common issues around error position
      const nearError = cleanedResponse.substring(
        Math.max(0, errorPos - 50),
        Math.min(cleanedResponse.length, errorPos + 50)
      );
      console.error("🔍 Near error (±50 chars):", nearError);

      throw error;
    }
  }

  /**
   * Remove Vietnamese diacritics from string using Unicode normalization
   */
  removeVietnameseDiacritics(str) {
    // First normalize to NFD (decompose combined characters)
    // Then remove all combining diacritical marks
    let result = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Handle special Vietnamese characters that don't decompose
    result = result
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/ơ/g, "o")
      .replace(/Ơ/g, "O")
      .replace(/ư/g, "u")
      .replace(/Ư/g, "U");

    console.log(
      "🧹 Stripped diacritics sample:",
      str.substring(0, 100),
      "→",
      result.substring(0, 100)
    );
    return result;
  }

  /**
   * Repair common JSON syntax errors (aggressive)
   */
  repairJSON(jsonString) {
    let repaired = jsonString;

    console.log(
      "🔧 BEFORE REPAIR (first 200 chars):",
      repaired.substring(0, 200)
    );

    // 1. Remove all newlines and carriage returns FIRST
    repaired = repaired.replace(/\r?\n/g, " ");

    // 2. FIX CRITICAL: Add quotes to unquoted property names
    // Match property names that are NOT preceded by a quote
    // Pattern: , theme : -> , "theme":
    // Pattern: { theme : -> { "theme":
    // Use (?<!") negative lookbehind to ensure no quote before property name
    repaired = repaired.replace(
      /([,{]\s*)(?!")([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)/g,
      '$1"$2"$3'
    );

    console.log(
      "🔧 AFTER QUOTE REPAIR (first 200 chars):",
      repaired.substring(0, 200)
    );

    // 3. Remove trailing commas before ] or }
    repaired = repaired.replace(/,(\s*[\]}])/g, "$1");

    // 4. Remove control characters
    repaired = repaired.replace(/[\u0000-\u001F]+/g, " ");

    // 5. Remove multiple spaces
    repaired = repaired.replace(/\s+/g, " ");

    // 6. Fix missing commas between array elements
    repaired = repaired.replace(/\}\s*\{/g, "}, {"); // "}  {" -> "}, {"
    repaired = repaired.replace(/\]\s*\[/g, "], ["); // "]  [" -> "], ["
    repaired = repaired.replace(/"\s+"/g, '", "'); // '" "' -> '", "'

    // 7. Fix missing commas after closing brackets before opening bracket/quote
    repaired = repaired.replace(/\]\s*"/g, '], "'); // '] "' -> '], "'
    repaired = repaired.replace(/\}\s*"/g, '}, "'); // '} "' -> '}, "'

    // 8. Fix double commas
    repaired = repaired.replace(/,\s*,/g, ",");

    return repaired;
  }

  /**
   * Generate weekly assessment feedback
   */
  async generateWeeklyFeedback(weekData, planData) {
    const prompt = this.buildWeeklyFeedbackPrompt(weekData, planData);

    try {
      const response = await this.callAI(prompt, {
        temperature: 0.7,
        maxTokens: 800,
      });

      return {
        feedback: response,
        adjustments: this.suggestAdjustments(weekData),
        encouragement: this.generateEncouragement(weekData),
      };
    } catch (error) {
      console.error("❌ Error generating weekly feedback:", error);
      return this.generateFallbackFeedback(weekData);
    }
  }

  /**
   * Generate daily encouragement message
   */
  async generateDailyEncouragement(trainingDay, userProgress) {
    const prompt = `You are a supportive focus training coach. Generate a short, encouraging message (2-3 sentences) for a user about to start their daily focus training.

Context:
- Day ${trainingDay.dayNumber} of their training plan
- Week ${trainingDay.weekNumber}
- Challenges today: ${trainingDay.challenges.length}
- Current streak: ${userProgress.currentStreak} days
- Previous completion rate: ${userProgress.completionRate}%

Tone: Positive, motivating, personal. In Vietnamese language.`;

    try {
      const response = await this.callAI(prompt, {
        temperature: 0.9,
        maxTokens: 150,
      });
      return response;
    } catch (error) {
      // Fallback encouragement messages
      const fallbacks = [
        "🌟 Hôm nay là ngày tuyệt vời để rèn luyện sự tập trung! Bạn có thể làm được!",
        "💪 Mỗi phút tập trung hôm nay là một bước tiến gần hơn đến mục tiêu của bạn!",
        "🎯 Hãy bắt đầu với thử thách đầu tiên. Bạn đã sẵn sàng chưa?",
      ];
      return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
  }

  /**
   * Core AI calling method - handles different providers
   */
  async callAI(prompt, options = {}) {
    const {
      temperature = 0.7,
      maxTokens = 1000,
      responseFormat = "text",
    } = options;

    // If provider is 'none', throw error to trigger fallback
    if (this.provider === "none") {
      throw new Error("AI provider disabled - using fallback");
    }

    switch (this.provider) {
      case "openai":
        return await this.callOpenAI(
          prompt,
          temperature,
          maxTokens,
          responseFormat
        );

      case "anthropic":
        return await this.callAnthropic(prompt, temperature, maxTokens);

      case "google":
        return await this.callGoogle(prompt, temperature, maxTokens);

      case "ollama":
        return await this.callOllama(prompt, temperature, maxTokens);

      default:
        throw new Error(`Unsupported AI provider: ${this.provider}`);
    }
  }

  async callOpenAI(prompt, temperature, maxTokens, responseFormat) {
    const messages = [
      {
        role: "system",
        content: this.getSystemPrompt(),
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    const params = {
      model: this.model,
      messages,
      temperature,
      max_tokens: maxTokens,
    };

    // Add response format for JSON if needed
    if (responseFormat === "json") {
      params.response_format = { type: "json_object" };
      // Add explicit JSON instruction in system message for better compliance
      messages[0].content +=
        "\n\nIMPORTANT: You MUST respond with valid JSON only. Do not include any markdown formatting or code blocks.";
    }

    const completion = await this.client.chat.completions.create(params);
    return completion.choices[0].message.content;
  }

  async callAnthropic(prompt, temperature, maxTokens) {
    const message = await this.client.messages.create({
      model: this.model,
      max_tokens: maxTokens,
      temperature,
      system: this.getSystemPrompt(),
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });
    return message.content[0].text;
  }

  async callGoogle(prompt, temperature, maxTokens) {
    const model = this.client.getGenerativeModel({
      model: this.model,
      systemInstruction: this.getSystemPrompt(),
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      },
    });

    return result.response.text();
  }

  async callOllama(prompt, temperature, maxTokens) {
    const axios = require("axios");

    const response = await axios.post(`${this.ollamaBaseUrl}/api/generate`, {
      model: this.model,
      prompt: `${this.getSystemPrompt()}\n\nUser: ${prompt}`,
      temperature,
      options: {
        num_predict: maxTokens,
      },
    });

    return response.data.response;
  }

  getSystemPrompt() {
    return `Bạn là chuyên gia huấn luyện tập trung, chuyên giúp người dùng xây dựng thói quen làm việc sâu (deep work).

Nguyên tắc thiết kế kế hoạch:
1. LỊCH TẬP RÕ RÀNG: 6 ngày training + 1 ngày rest (Chủ Nhật)
2. ĐA DẠNG: Mỗi ngày 4-7 thử thách KHÁC NHAU (Pomodoro, thở sâu, meditation, tracking, etc)
3. TĂNG DẦN: Tuần 1 dễ (15-20 phút), tuần cuối khó (30-45 phút)
4. CHI TIẾT CỤ THỂ: Mỗi thử thách phải có hướng dẫn từng bước rõ ràng
5. TIẾNG VIỆT: Tất cả nội dung phải bằng tiếng Việt

QUY TẮC QUAN TRỌNG:
- Không lặp lại cùng 1 pattern thử thách 2 ngày liên tiếp
- Pomodoro phải ghi rõ: X chu kỳ, mỗi chu kỳ bao nhiêu phút work + nghỉ
- Thử thách phải có số liệu cụ thể (10 phút, 3 lần, 5 chu kỳ, etc)
- JSON phải VALID, không có markdown wrapper

Luôn động viên, cụ thể và thực tế.`;
  }

  buildInitialAssessmentPrompt(assessmentData) {
    return `Analyze this user's initial focus training assessment and provide detailed insights:

User Profile:
- Current focus level: ${assessmentData.focusLevel}/10
- Distraction level: ${assessmentData.distractionLevel}/10
- Motivation: ${assessmentData.motivationLevel}/10
- Energy: ${assessmentData.energyLevel}/10
- Stress: ${assessmentData.stressLevel}/10
- Primary goal: ${assessmentData.primaryGoal}
- Available time per day: ${assessmentData.availableTimePerDay} minutes
- Experience level: ${assessmentData.experienceLevel}
- Main distractions: ${
      assessmentData.distractions?.join(", ") || "not specified"
    }

Provide:
1. A comprehensive analysis of their current state (3-4 sentences)
2. Key strengths to build upon
3. Main challenges to address
4. 3-5 specific, actionable recommendations
5. Realistic expectations for their journey

Respond in Vietnamese. Be empathetic, encouraging, and specific.`;
  }

  buildPlanGenerationPrompt(assessmentData, userProfile, weekNumber = 1) {
    const { duration, difficulty } =
      this.determinePlanParameters(assessmentData);

    // Personalize based on week number and user data
    const weekThemes = {
      1: {
        focus: "Xay dung nen tang",
        activities: ["Pomodoro co ban", "Tho sau", "Ghi nhat ky"],
      },
      2: {
        focus: "Tang cuong thoi quen",
        activities: ["Pomodoro nang cao", "Thien dinh", "Tu danh gia"],
      },
      3: {
        focus: "Lam chu tap trung",
        activities: ["Deep work", "Phan tich hieu suat", "Ke hoach hang ngay"],
      },
      4: {
        focus: "Hoan thien ky nang",
        activities: [
          "Phien lam viec mo rong",
          "On tap toan bo",
          "Dat muc tieu moi",
        ],
      },
    };

    const theme = weekThemes[weekNumber] || weekThemes[1];

    // PROGRESSIVE DIFFICULTY SYSTEM - Dynamically adapt based on ALL assessment scores
    const focusLevel = assessmentData.focusLevel || 5;
    const distractionLevel = assessmentData.distractionLevel || 5;
    const stressLevel = assessmentData.stressLevel || 5;
    const energyLevel = assessmentData.energyLevel || 5;
    const motivationLevel = assessmentData.motivationLevel || 5;

    // Calculate weighted ability score (1-10 scale)
    // Formula: Higher focus/energy/motivation = higher score; Higher distraction/stress = lower score
    const abilityScore =
      focusLevel * 0.4 + // 40% - Most critical for work sessions
      energyLevel * 0.2 + // 20% - Affects sustained attention
      motivationLevel * 0.15 + // 15% - Drives consistency
      (10 - distractionLevel) * 0.15 + // 15% - Lower distraction = better (inverted)
      (10 - stressLevel) * 0.1; // 10% - Lower stress = better (inverted)
    // Result: 1.0 (worst) to 10.0 (best) representing current capability

    // Determine Pomodoro settings based on ability score
    let basePomodoroWork,
      basePomodoroShortBreak,
      basePomodoroLongBreak,
      baseCyclesBeforeLongBreak,
      userLevelDescription,
      maxCyclesDay5;

    if (abilityScore <= 3) {
      // Very Low (1-3): Maximum support needed
      basePomodoroWork = 10;
      basePomodoroShortBreak = 5;
      basePomodoroLongBreak = 15;
      baseCyclesBeforeLongBreak = 2; // Long break after just 2 cycles
      maxCyclesDay5 = 3; // Peak day limited to 3 cycles
      userLevelDescription = "rat kho tap trung can ho tro toi da";
    } else if (abilityScore <= 4.5) {
      // Low (3-4.5): Need gentle progression
      basePomodoroWork = 12;
      basePomodoroShortBreak = 5;
      basePomodoroLongBreak = 15;
      baseCyclesBeforeLongBreak = 3;
      maxCyclesDay5 = 3;
      userLevelDescription = "kho tap trung can tap tu tu";
    } else if (abilityScore <= 6) {
      // Moderate-Low (4.5-6): Standard beginner
      basePomodoroWork = 15;
      basePomodoroShortBreak = 5;
      basePomodoroLongBreak = 15;
      baseCyclesBeforeLongBreak = 3;
      maxCyclesDay5 = 4;
      userLevelDescription = "trung binh thap";
    } else if (abilityScore <= 7.5) {
      // Moderate-High (6-7.5): Can handle more
      basePomodoroWork = 20;
      basePomodoroShortBreak = 5;
      basePomodoroLongBreak = 15;
      baseCyclesBeforeLongBreak = 4;
      maxCyclesDay5 = 4;
      userLevelDescription = "trung binh kha";
    } else if (abilityScore <= 8.5) {
      // High (7.5-8.5): Standard Pomodoro ready
      basePomodoroWork = 25;
      basePomodoroShortBreak = 5;
      basePomodoroLongBreak = 15;
      baseCyclesBeforeLongBreak = 4;
      maxCyclesDay5 = 5;
      userLevelDescription = "tot";
    } else {
      // Very High (8.5-10): Advanced capability
      basePomodoroWork = 30;
      basePomodoroShortBreak = 5;
      basePomodoroLongBreak = 20;
      baseCyclesBeforeLongBreak = 4;
      maxCyclesDay5 = 5;
      userLevelDescription = "rat tot co the lam nhieu";
    }

    // Adaptive weekly increase: slower for lower ability
    const weeklyIncreaseRate = abilityScore <= 5 ? 3 : 5; // 3min for struggling users, 5min for capable
    const weeklyIncrease = (weekNumber - 1) * weeklyIncreaseRate;
    const adjustedWork = basePomodoroWork + weeklyIncrease;

    // Generate only 1 week at a time for faster response
    return `Create WEEK ${weekNumber} of a ${duration}-week focus training plan (difficulty: ${difficulty}).

USER ASSESSMENT SCORES:
- Focus: ${focusLevel}/10
- Distraction: ${distractionLevel}/10
- Energy: ${energyLevel}/10
- Motivation: ${motivationLevel}/10
- Stress: ${stressLevel}/10
- 🎯 Calculated Ability Score: ${abilityScore.toFixed(
      1
    )}/10 (${userLevelDescription})

User Context:
- Main goal: ${assessmentData.primaryGoal}
- Available time: ${assessmentData.availableTimePerDay} min/day
- Experience: ${assessmentData.experienceLevel || "none"}

WEEK ${weekNumber} THEME: "${theme.focus}"
- This week emphasizes: ${theme.activities.join(", ")}

🎯 PERSONALIZED PROGRESSIVE SYSTEM (ADAPTED TO ABILITY SCORE ${abilityScore.toFixed(
      1
    )}/10):

Base Settings (Calculated from assessment scores):
- Starting work time: ${basePomodoroWork} phut
- Week ${weekNumber} adjusted: ${adjustedWork} phut (${weeklyIncreaseRate}min increase per week)
- Short break: ${basePomodoroShortBreak} phut
- Long break: ${basePomodoroLongBreak} phut after ${baseCyclesBeforeLongBreak} cycles
- Peak day max cycles: ${maxCyclesDay5} cycles (Day 5)

DAILY PROGRESSION WITHIN WEEK ${weekNumber} (6 training days):
Day 1 (Monday): EASIEST - Build confidence
  - 2 chu ky Pomodoro (${adjustedWork}p work ${basePomodoroShortBreak}p nghi ngan)
  - Simple breathing (5 phut)
  - Light mindfulness (5 phut)

Day 2 (Tuesday): SLIGHTLY HARDER
  - 2 chu ky Pomodoro (${adjustedWork}p work ${basePomodoroShortBreak}p nghi ngan)
  - Breathing technique (8 phut)
  - Mindfulness (10 phut)

Day 3 (Wednesday): MODERATE
  - ${baseCyclesBeforeLongBreak} chu ky Pomodoro (${adjustedWork}p work ${basePomodoroShortBreak}p nghi ngan then ${basePomodoroLongBreak}p nghi dai)
  - Breathing (10 phut)
  - Reflection activity (10 phut)

Day 4 (Thursday): CHALLENGING
  - ${baseCyclesBeforeLongBreak} chu ky Pomodoro (${adjustedWork}p work ${basePomodoroShortBreak}p nghi ngan then ${basePomodoroLongBreak}p nghi dai)
  - Advanced breathing (12 phut)
  - Deep mindfulness (15 phut)

Day 5 (Friday): PEAK DIFFICULTY
  - ${maxCyclesDay5} chu ky Pomodoro (${adjustedWork}p work ${basePomodoroShortBreak}p nghi ngan then ${basePomodoroLongBreak}p nghi dai)
  - Breathing practice (12-15 phut depending on ability)
  - Reflection (10-15 phut)

Day 6 (Saturday): LIGHTER - Consolidation
  - 2 chu ky Pomodoro (${adjustedWork}p work ${basePomodoroShortBreak}p nghi ngan)
  - Relaxing breathing (8 phut)
  - Weekly review (10 phut)

Day 7 (Sunday): REST DAY - No challenges

CRITICAL RULES FOR PROGRESSION:
1. Days 1-2: Build confidence with EASY challenges
2. Days 3-5: GRADUALLY increase difficulty each day (more cycles, longer duration)
3. Day 6: LIGHTER to allow recovery before rest day
4. NEVER jump from easy to hard suddenly - smooth incremental steps
5. Each day should be slightly harder than previous (except Day 6)

REQUIREMENTS:

1. Create exactly 7 days (Mon-Sun) following PROGRESSIVE structure above
   - Days 1-6: training days with EXACTLY 3 challenges each
   - Day 7: rest day (type="rest", challenges=[])
   - MUST follow difficulty progression: Easy -> Gradually Harder -> Peak -> Lighter

2. Challenge variety (use diverse types, but maintain progression):
   - focus_session: Pomodoro with progressive cycles (2 -> 3 -> 4 cycles)
   - breathing: Progressive duration (5 -> 8 -> 10 -> 12 -> 15 phut)
   - mindfulness: Progressive depth (5 -> 10 -> 15 phut)
   - reflection: Track progress and plan ahead
   - stretching: Light physical activity for focus breaks

3. Personalization rules (BASED ON ABILITY SCORE ${abilityScore.toFixed(1)}/10):
   - Current settings: ${basePomodoroWork}p work, max ${maxCyclesDay5} cycles on peak day
   - If abilityScore <= 4: Keep instructions EXTRA simple, use encouragement heavily
   - If abilityScore 4-6: Standard beginner approach with gentle progression
   - If abilityScore 6-8: Moderate challenge, standard Pomodoro techniques
   - If abilityScore >= 8: Can handle advanced techniques and longer sessions
   - If distraction > 7: Add MORE breathing/mindfulness (current: ${distractionLevel}/10)
   - If stress > 7: Include relaxation techniques (current: ${stressLevel}/10)
   - If energy < 4: Shorter initial sessions (current: ${energyLevel}/10)
   - If goal is "exam_preparation": Focus on study-specific strategies

4. CHALLENGE DETAIL REQUIREMENTS (CRITICAL - BE VERY SPECIFIC):

For focus_session (Pomodoro) - PROGRESSIVE FORMAT:
- Title format: "X chu ky Pomodoro (Yp work Zp nghi ngan)" or "X chu ky Pomodoro (Yp work Zp nghi ngan then Wp nghi dai)"
- Use base settings: ${basePomodoroWork}p work, ${basePomodoroShortBreak}p short break, ${basePomodoroLongBreak}p long break
- Week ${weekNumber} adjustment: Use ${adjustedWork}p work time
- Description: What to focus on during work phase (study, deep work, reading, etc)
- Instructions: ["Chuan bi khong gian yen tinh", "Bat timer ${adjustedWork} phut", "Tap trung 100 phan tram", "Nghi ${basePomodoroShortBreak} phut", "Lap lai X lan"]
- Duration calculation: 
  * 2 cycles = 2 × (${adjustedWork} + ${basePomodoroShortBreak}) = ${
      2 * (adjustedWork + basePomodoroShortBreak)
    } phut
  * 3 cycles with long break = 3 × (${adjustedWork} + ${basePomodoroShortBreak}) + ${basePomodoroLongBreak} = ${
      3 * (adjustedWork + basePomodoroShortBreak) + basePomodoroLongBreak
    } phut

For breathing - PROGRESSIVE DURATION:
- Day 1-2: 5-8 phut (simple techniques)
- Day 3-4: 10-12 phut (intermediate)
- Day 5: 15 phut (advanced)
- Day 6: 8 phut (relaxing)
- Instructions: Always 4 specific steps
- Example: "Box Breathing 10 phut" → ["Hut vao 4 giay", "Giu 4 giay", "Tho ra 4 giay", "Giu 4 giay"]

For mindfulness - PROGRESSIVE DEPTH:
- Day 1-2: 5-10 phut (basic observation)
- Day 3-4: 10-15 phut (deeper practice)
- Day 5: 15 phut (advanced techniques)
- Day 6: 10 phut (reflection)

For all challenges:
- Benefits: Specific, measurable ("Tang 20 phan tram nang suat", "Giam 30 phan tram stress")
- Tips: Practical, actionable advice (3 tips each)
- Difficulty: Increase gradually across days (2, 2, 3, 3, 4, 2)

5. JSON format with PROGRESSIVE examples (NO Vietnamese diacritics!):

EXAMPLE - Day 1 (Monday - EASIEST):
{
  "dayNumber": ${(weekNumber - 1) * 7 + 1},
  "type": "training",
  "dailyTheme": "Bat dau tuan voi ky thuat co ban",
  "challenges": [
    {
      "type": "focus_session",
      "title": "2 chu ky Pomodoro (${adjustedWork}p work ${basePomodoroShortBreak}p nghi ngan)",
      "duration": ${2 * (adjustedWork + basePomodoroShortBreak)},
      "difficulty": 2,
      "description": "Lam quen voi Pomodoro thoi gian ngan",
      "instructions": ["Chuan bi khong gian yen tinh", "Bat timer ${adjustedWork} phut", "Tap trung hoan toan", "Nghi ${basePomodoroShortBreak} phut", "Lap lai 1 lan"],
      "benefits": ["Xay dung thoi quen", "Giam suc ep", "Tang tu tin"],
      "tips": ["Bat dau don gian", "Tat thong bao", "Chon viec de lam"]
    },
    {
      "type": "breathing",
      "title": "Tho sau co ban 5 phut",
      "duration": 5,
      "difficulty": 1,
      "description": "Hoc ky thuat tho sau gian don",
      "instructions": ["Ngoi thoai mai", "Hut vao qua mui 4 giay", "Tho ra qua mieng 6 giay", "Lap lai 8 lan"],
      "benefits": ["Giam cang thang", "Tang oxy", "On dinh"],
      "tips": ["Lam cham lai", "Tap buoi sang", "Nhum mat neu can"]
    },
    {
      "type": "mindfulness",
      "title": "Quan sat hoi tho 5 phut",
      "duration": 5,
      "difficulty": 1,
      "description": "Tap trung quan sat hoi tho tu nhien",
      "instructions": ["Ngoi thang lung", "Nhum mat nhe nhang", "Chu y vao hoi tho", "Khong can thay doi gi"],
      "benefits": ["Tang nhan thuc", "Lam chu tam tri", "Giam suy nghi"],
      "tips": ["Khong bat ep", "Chap nhan phan tam", "Tap ngan han"]
    }
  ]
}

EXAMPLE - Day 5 (Friday - PEAK):
{
  "dayNumber": ${(weekNumber - 1) * 7 + 5},
  "type": "training",
  "dailyTheme": "Thach thuc lon nhat trong tuan",
  "challenges": [
    {
      "type": "focus_session",
      "title": "4 chu ky Pomodoro (${adjustedWork}p work ${basePomodoroShortBreak}p nghi ngan then ${basePomodoroLongBreak}p nghi dai)",
      "duration": ${
        4 * (adjustedWork + basePomodoroShortBreak) + basePomodoroLongBreak
      },
      "difficulty": 4,
      "description": "Phien lam viec day du voi nghi dai",
      "instructions": ["Chuan bi du an kho", "Lam 3 chu ky ${adjustedWork} phut voi nghi ${basePomodoroShortBreak} phut", "Nghi dai ${basePomodoroLongBreak} phut", "Lam chu ky cuoi ${adjustedWork} phut"],
      "benefits": ["Hoan thanh cong viec lon", "Tang su ben bi", "Lam chu tap trung sau"],
      "tips": ["Chon du an quan trong", "Chuan bi truoc", "An uong trong nghi dai"]
    },
    {
      "type": "breathing",
      "title": "4 7 8 Breathing 15 phut",
      "duration": 15,
      "difficulty": 3,
      "description": "Ky thuat tho nang cao giam stress sau",
      "instructions": ["Hut vao qua mui 4 giay", "Giu 7 giay", "Tho ra qua mieng 8 giay", "Lap lai 12 lan"],
      "benefits": ["Giam stress sau", "Tang su tap trung", "Hoi phuc nang luong"],
      "tips": ["Lam cham lai", "Tap sau khi Pomodoro", "Tao khong gian yen tinh"]
    },
    {
      "type": "reflection",
      "title": "Danh gia tuan 15 phut",
      "duration": 15,
      "difficulty": 3,
      "description": "Nhin lai thanh tuu va thach thuc trong tuan",
      "instructions": ["Ghi lai nhung gi da lam tot", "Danh gia kho khan da gap", "Lap ke hoach cho tuan sau", "Ghi nhan bai hoc"],
      "benefits": ["Nhan thuc thanh tuu", "Hoc tu sai lam", "Ke hoach ro rang"],
      "tips": ["Ghi chu cu the", "Trung thuc voi ban than", "Dat muc tieu thuc te"]
    }
  ]
}

PROGRESSIVE DIFFICULTY REQUIREMENTS (MOST IMPORTANT):
- Day 1-2: Keep EASY to build confidence (2 cycles, short duration)
- Day 3: MODERATE increase (3 cycles, medium duration)
- Day 4: MORE CHALLENGING (3-4 cycles, longer techniques)
- Day 5: PEAK difficulty (4 cycles, longest sessions)
- Day 6: LIGHTER for recovery (2 cycles, relaxing activities)
- Day 7: REST (no challenges)

NEVER make difficulty jump randomly - it must follow smooth progression!

VARIETY WITHIN PROGRESSION:
- Breathing techniques: Deep breathing -> Box breathing -> 4-7-8 -> Body scan
- Mindfulness: Breath observation -> Body awareness -> Thought observation -> Full meditation
- Reflection: Simple journaling -> Progress tracking -> Goal setting -> Weekly review
- Use base Pomodoro settings: ${basePomodoroWork}p work (Week ${weekNumber}: ${adjustedWork}p), ${basePomodoroShortBreak}p short, ${basePomodoroLongBreak}p long break

CRITICAL RULES TO AVOID JSON ERRORS:
- Return ONLY valid JSON (test with JSON.parse before sending!)
- Vietnamese WITHOUT ANY diacritics: "tap trung" NOT "tập trung", "thuc hien" NOT "thực hiện"
- ALL arrays MUST have EXACTLY 3-4 items, NO MORE NO LESS
- Each string: 2-6 words max, NO commas/quotes/colons/percent signs inside
- Use "30 phan tram" NOT "30%", use "100 phan tram" NOT "100%"
- Title format: "X chu ky Pomodoro (Yp work Zp nghi ngan)" or "X chu ky Pomodoro (Yp work Zp nghi ngan then Wp nghi dai)"
- NO slashes (/), NO special characters
- EVERY challenge must end with closing bracket and comma EXCEPT last one
- Structure: days array has 7 items, training days (1-6) have 3 challenges each, rest day (7) has empty challenges array
- Difficulty values: Day 1-2 use difficulty 2, Day 3-4 use 3, Day 5 use 4, Day 6 use 2
- This MUST parse with JSON.parse or it fails!`;
  }

  buildWeeklyFeedbackPrompt(weekData, planData) {
    const completionRate = (weekData.completedDays / weekData.totalDays) * 100;

    return `Provide encouraging weekly feedback for this focus training progress:

Week ${weekData.weekNumber} of ${planData.duration} Summary:
- Days completed: ${weekData.completedDays}/${weekData.totalDays}
- Completion rate: ${completionRate.toFixed(1)}%
- Total focus minutes: ${weekData.totalMinutes || 0}
- Average session score: ${weekData.avgScore || 0}/100
- Challenges faced: ${weekData.challenges?.join(", ") || "none reported"}

User's self-assessment:
- Energy level: ${weekData.energyLevel || "not provided"}/10
- Difficulty level: ${weekData.difficultyLevel || "not provided"}/10
- Satisfaction: ${weekData.satisfaction || "not provided"}/10

Provide:
1. Specific positive feedback on what went well (2-3 points)
2. Constructive observations (1-2 points)
3. Adjustments for next week (if needed)
4. Motivational closing statement

Respond in Vietnamese. Be specific, supportive, and actionable. Max 200 words.`;
  }

  determineDifficulty(assessmentData) {
    const score = assessmentData.focusLevel || 5;
    const experience = assessmentData.experienceLevel || "none";

    if (experience === "advanced" || score >= 8) return "advanced";
    if (experience === "intermediate" || score >= 6) return "intermediate";
    return "beginner";
  }

  determineDuration(assessmentData) {
    const goal = assessmentData.primaryGoal;
    const experience = assessmentData.experienceLevel;
    const focusLevel = assessmentData.focusLevel || 5;

    // Exam preparation or urgent goals: shorter, intensive plan (2 weeks)
    if (goal === "exam_preparation") return 2;

    // Complete beginners: longer plan for habit building (3 weeks)
    if (experience === "none" || focusLevel <= 3) return 3;

    // Intermediate users: standard plan (3 weeks)
    if (experience === "intermediate" || focusLevel <= 6) return 3;

    // Advanced users: focused improvement (2 weeks)
    return 2;
  }

  determinePlanParameters(assessmentData) {
    return {
      duration: this.determineDuration(assessmentData),
      difficulty: this.determineDifficulty(assessmentData),
    };
  }

  extractRecommendations(analysisText) {
    // Simple regex to extract numbered or bulleted recommendations
    const recommendations = [];
    const lines = analysisText.split("\n");

    for (const line of lines) {
      if (/^[\d\-\*•]/.test(line.trim())) {
        const clean = line.replace(/^[\d\-\*•.\s]+/, "").trim();
        if (clean) recommendations.push(clean);
      }
    }

    return recommendations.slice(0, 5); // Max 5 recommendations
  }

  validateAndStructurePlan(planData, assessmentData) {
    // Ensure plan has required structure
    if (!planData.weeks || !Array.isArray(planData.weeks)) {
      throw new Error("Invalid plan structure: missing weeks array");
    }

    // Add metadata
    planData.totalWeeks = planData.weeks.length;
    planData.totalDays = planData.weeks.reduce(
      (sum, week) => sum + (week.days?.length || 0),
      0
    );
    planData.trainingDays = 0;
    planData.restDays = 0;

    // Count training vs rest days
    planData.weeks.forEach((week) => {
      week.days?.forEach((day) => {
        if (day.type === "rest") planData.restDays++;
        else planData.trainingDays++;
      });
    });

    return planData;
  }

  /**
   * Generate a single fallback week (used by progressive generation)
   */
  generateFallbackWeek(assessmentData, weekNum, totalDuration) {
    const startDuration = assessmentData.preferredSessionLength || 15;
    const weekDuration = startDuration + (weekNum - 1) * 5; // Increase 5 min per week
    const days = [];
    const numChallenges = Math.min(3 + weekNum, 7); // 4-7 challenges tùy tuần
    const dayStartNumber = (weekNum - 1) * 7 + 1;

    for (let dayInWeek = 1; dayInWeek <= 7; dayInWeek++) {
      // CHỈ Chủ Nhật (day 7) là ngày nghỉ
      const isRestDay = dayInWeek === 7;

      if (isRestDay) {
        days.push({
          dayNumber: dayStartNumber + dayInWeek - 1,
          type: "rest",
          challenges: [],
        });
      } else {
        // Tạo challenges như generateFallbackPlan (giữ nguyên logic cũ)
        const challenges = this.createDiverseChallenges(weekNum, numChallenges);

        days.push({
          dayNumber: dayStartNumber + dayInWeek - 1,
          type: "training",
          challenges,
        });
      }
    }

    return {
      weekNumber: weekNum,
      theme: this.getWeekTheme(weekNum, totalDuration),
      description: `Tuần ${weekNum}: ${this.getWeekTheme(
        weekNum,
        totalDuration
      )}`,
      focusAreas: ["Pomodoro", "Thở sâu", "Mindfulness"],
      days,
    };
  }

  /**
   * Create diverse challenges for a training day
   */
  createDiverseChallenges(weekNum, numChallenges) {
    const challenges = [];

    // Challenge 1: Pomodoro
    const pomodoroCount = Math.min(Math.floor(weekNum / 2) + 1, 4);
    challenges.push({
      type: "focus_session",
      title: `Pomodoro ${pomodoroCount} chu kỳ`,
      duration: pomodoroCount * 30,
      difficulty: weekNum + 2,
      description: `Thực hiện ${pomodoroCount} chu kỳ Pomodoro (25 phút focus + 5 phút nghỉ)`,
      instructions: [
        `Chu kỳ 1-${pomodoroCount - 1}: Tập trung 25 phút, nghỉ 5 phút`,
        `Chu kỳ ${pomodoroCount}: Tập trung 25 phút, nghỉ DÀI 15 phút`,
        "Tắt thông báo trước khi bắt đầu",
        "Ghi lại số lần phân tâm",
      ],
      benefits: ["Tăng thời gian tập trung liên tục", "Học quản lý năng lượng"],
      tips: ["Đứng dậy duỗi người trong mỗi lần nghỉ"],
    });

    // Challenge 2: Breathing
    challenges.push({
      type: "breathing",
      title: "Box Breathing - Thở hộp vuông",
      duration: 10,
      difficulty: 3,
      description: "Kỹ thuật thở 4-4-4-4 giúp tăng oxy não",
      instructions: [
        "Hít vào 4 giây",
        "Nín thở 4 giây",
        "Thở ra 4 giây",
        "Nín thở 4 giây",
        "Lặp lại 10 lần",
      ],
      benefits: ["Giảm căng thẳng", "Tăng oxy não"],
      tips: ["Làm trước khi học bài"],
    });

    // Challenge 3: Mindfulness
    challenges.push({
      type: "mindfulness",
      title: "Body Scan Meditation",
      duration: 10,
      difficulty: 4,
      description: "Quét toàn thân để nhận thức cơ thể",
      instructions: [
        "Nằm hoặc ngồi thoải mái",
        "Chú ý từ đầu xuống chân",
        "Nhận biết cảm giác mỗi vùng",
        "Thư giãn mỗi phần cơ thể",
      ],
      benefits: ["Tăng nhận thức cơ thể", "Giảm căng thẳng"],
      tips: ["Làm sau khi hoàn thành công việc"],
    });

    // Challenge 4+: Additional challenges for higher weeks
    if (numChallenges >= 4) {
      challenges.push({
        type: "reflection",
        title: "Theo dõi phân tâm",
        duration: 15,
        difficulty: 3,
        description: "Ghi lại và phân tích các lần bị phân tâm",
        instructions: [
          "Chuẩn bị giấy bút",
          "Mỗi lần phân tâm, ghi dấu tick",
          "Sau 15 phút, đếm tổng số lần",
          "Ghi chú nguyên nhân chính",
        ],
        benefits: ["Nhận biết patterns phân tâm"],
        tips: ["Không tự trách bản thân khi phân tâm"],
      });
    }

    if (numChallenges >= 5) {
      challenges.push({
        type: "stretching",
        title: "Giãn cơ mắt và cổ",
        duration: 5,
        difficulty: 2,
        description: "Bài tập giảm mỏi mắt và căng cứng cổ vai",
        instructions: [
          "Nhìn xa 20 giây (quy tắc 20-20-20)",
          "Xoay tròn mắt 10 lần",
          "Xoay cổ nhẹ nhàng 5 lần mỗi bên",
          "Nhún vai lên xuống 10 lần",
        ],
        benefits: ["Giảm mỏi mắt", "Giảm căng cứng cổ vai"],
        tips: ["Làm mỗi 2 giờ làm việc"],
      });
    }

    return challenges.slice(0, numChallenges);
  }

  generateFallbackPlan(assessmentData) {
    // Simple template-based plan if AI fails
    const duration = this.determineDuration(assessmentData);
    const difficulty = this.determineDifficulty(assessmentData);
    const weeks = [];

    for (let weekNum = 1; weekNum <= duration; weekNum++) {
      weeks.push(this.generateFallbackWeek(assessmentData, weekNum, duration));
    }

    return { weeks };
  }

  /**
   * OLD generateFallbackPlan logic below - kept for reference, can be removed
   */
  _generateFallbackPlanOld(assessmentData) {
    const duration = this.determineDuration(assessmentData);
    const difficulty = this.determineDifficulty(assessmentData);
    const startDuration = assessmentData.preferredSessionLength || 15;

    const weeks = [];
    let dayCounter = 1;
    let trainingDaysCount = 0;
    let restDaysCount = 0;

    for (let weekNum = 1; weekNum <= duration; weekNum++) {
      const weekDuration = startDuration + (weekNum - 1) * 5; // Increase 5 min per week
      const days = [];
      const numChallenges = Math.min(3 + weekNum, 7); // 4-7 challenges tùy tuần

      for (let dayInWeek = 1; dayInWeek <= 7; dayInWeek++) {
        // CHỈ Chủ Nhật (day 7) là ngày nghỉ
        const isRestDay = dayInWeek === 7;

        if (isRestDay) {
          days.push({
            dayNumber: dayCounter++,
            type: "rest",
            challenges: [],
          });
          restDaysCount++;
        } else {
          // Tạo nhiều challenges đa dạng
          const challenges = [];

          // Challenge 1: Pomodoro
          const pomodoroCount = Math.min(Math.floor(weekNum / 2) + 1, 4);
          challenges.push({
            type: "focus_session",
            title: `Pomodoro ${pomodoroCount} chu kỳ`,
            duration: pomodoroCount * 30,
            difficulty: weekNum + 2,
            description: `Thực hiện ${pomodoroCount} chu kỳ Pomodoro (25 phút focus + 5 phút nghỉ)`,
            instructions: [
              `Chu kỳ 1-${pomodoroCount - 1}: Tập trung 25 phút, nghỉ 5 phút`,
              `Chu kỳ ${pomodoroCount}: Tập trung 25 phút, nghỉ DÀI 15 phút`,
              "Tắt thông báo trước khi bắt đầu",
              "Ghi lại số lần phán tâm",
            ],
            benefits: [
              "Tăng thời gian tập trung liên tục",
              "Học quản lý năng lượng",
            ],
            tips: ["Đứng dậy duỗi người trong mỗi lần nghỉ"],
          });

          // Challenge 2: Breathing
          challenges.push({
            type: "breathing",
            title: "Box Breathing - Thở hộp vuông",
            duration: 10,
            difficulty: 3,
            description: "Kỹ thuật thở 4-4-4-4 giúp tăng oxy não",
            instructions: [
              "Hít vào 4 giây",
              "Nín thở 4 giây",
              "Thở ra 4 giây",
              "Nín thở 4 giây",
              "Lặp lại 10 lần",
            ],
            benefits: ["Giảm căng thẳng", "Tăng oxy não"],
            tips: ["Làm trước khi học bài"],
          });

          // Challenge 3: Mindfulness
          challenges.push({
            type: "mindfulness",
            title: "Body Scan Meditation",
            duration: 10,
            difficulty: 4,
            description: "Quét toàn thân để nhận thức cơ thể",
            instructions: [
              "Nằm hoặc ngồi thoải mái",
              "Chú ý từ đầu xuống chân",
              "Nhận biết cảm giác mỗi vùng",
              "Thư giãn mỗi phần cơ thể",
            ],
            benefits: ["Tăng nhận thức cơ thể", "Giảm căng thẳng"],
            tips: ["Làm sau khi hoàn thành công việc"],
          });

          // Thêm challenges nếu tuần cao hơn
          if (numChallenges >= 4) {
            challenges.push({
              type: "reflection",
              title: "Theo dõi phân tâm",
              duration: 15,
              difficulty: 3,
              description: "Ghi lại và phân tích các lần bị phân tâm",
              instructions: [
                "Chuẩn bị giấy bút",
                "Mỗi lần phân tâm, ghi dấu tick",
                "Sau 15 phút, đếm tổng số lần",
                "Ghi chú nguyên nhân chính",
              ],
              benefits: ["Nhận biết patterns phân tâm"],
              tips: ["Không tự trách khi phân tâm, chỉ ghi lại"],
            });
          }

          if (numChallenges >= 5) {
            challenges.push({
              type: "reflection",
              title: "Ghi nhật ký tập trung",
              duration: 10,
              difficulty: 4,
              description: "Viết ra suy nghĩ về phiên tập",
              instructions: [
                "Điều gì giúp tập trung tốt hôm nay?",
                "Thử thách lớn nhất là gì?",
                "Học được gì từ hôm nay?",
                "Cải thiện gì cho ngày mai?",
              ],
              benefits: ["Tăng tự nhận thức", "Học từ kinh nghiệm"],
              tips: ["Viết tay sẽ tốt hơn gõ máy"],
            });
          }

          days.push({
            dayNumber: dayCounter++,
            type: "training",
            challenges: challenges.slice(0, numChallenges),
          });
          trainingDaysCount++;
        }
      }

      weeks.push({
        weekNumber: weekNum,
        theme: `Tuần ${weekNum}: ${this.getWeekTheme(weekNum, duration)}`,
        description: `${numChallenges} thử thách mỗi ngày, ${weekDuration} phút/phiên`,
        days,
      });
    }

    return {
      weeks,
      totalWeeks: duration,
      totalDays: dayCounter - 1,
      trainingDays: trainingDaysCount,
      restDays: restDaysCount,
    };
  }

  getWeekTheme(weekNum, totalWeeks) {
    const progress = weekNum / totalWeeks;

    if (progress <= 0.25) return "Xây dựng nền tảng";
    if (progress <= 0.5) return "Phát triển kỹ năng";
    if (progress <= 0.75) return "Tăng cường năng lực";
    return "Hoàn thiện & Thành thạo";
  }

  generateFallbackFeedback(weekData) {
    const completionRate = (weekData.completedDays / weekData.totalDays) * 100;

    let feedback = "";
    if (completionRate >= 80) {
      feedback =
        "🌟 Tuyệt vời! Bạn đã hoàn thành xuất sắc tuần này. Hãy tiếp tục duy trì nhịp độ tuyệt vời này!";
    } else if (completionRate >= 60) {
      feedback =
        "👍 Làm tốt lắm! Bạn đang trên đà phát triển tốt. Hãy cố gắng thêm chút nữa tuần sau!";
    } else {
      feedback =
        "💪 Đừng nản chí! Mỗi bước nhỏ đều quan trọng. Hãy bắt đầu lại với quyết tâm mới tuần sau!";
    }

    return {
      feedback,
      adjustments: [],
      encouragement: feedback,
    };
  }

  suggestAdjustments(weekData) {
    const adjustments = [];
    const completionRate = (weekData.completedDays / weekData.totalDays) * 100;

    if (completionRate < 50) {
      adjustments.push("Giảm độ khó hoặc thời lượng phiên tập trung");
      adjustments.push("Thêm nhiều ngày nghỉ hơn");
    } else if (completionRate >= 90 && weekData.avgScore >= 80) {
      adjustments.push("Tăng độ khó thử thách");
      adjustments.push("Kéo dài thời gian tập trung");
    }

    return adjustments;
  }

  generateEncouragement(weekData) {
    const messages = [
      "🎯 Bạn đang làm rất tốt! Mỗi ngày tập trung là một chiến thắng!",
      "💪 Sự kiên trì của bạn sẽ được đền đáp. Tiếp tục phấn đấu!",
      "🌟 Từng bước nhỏ dẫn đến thành công lớn. Bạn đang đi đúng hướng!",
      "🔥 Năng lực tập trung của bạn đang được cải thiện từng ngày!",
      "✨ Hãy tự hào về tiến bộ của mình. Bạn đã làm được nhiều hơn bạn nghĩ!",
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  }
}

// Singleton instance
let aiServiceInstance = null;

function getAIService() {
  if (!aiServiceInstance) {
    aiServiceInstance = new AIService();
  }
  return aiServiceInstance;
}

module.exports = {
  AIService,
  getAIService,
};

const FocusPlan = require("../models/FocusPlan");
const TrainingDay = require("../models/TrainingDay");
const UserAssessment = require("../models/UserAssessment");
const { getAIService } = require("../services/aiService");

/**
 * Submit initial assessment and get AI analysis
 */
exports.submitAssessment = async (req, res) => {
  try {
    const userId = req.user.id;
    const assessmentData = req.body;

    // Validate required fields
    const requiredFields = ["focusLevel", "primaryGoal", "availableTimePerDay"];
    const missingFields = requiredFields.filter(
      (field) => !assessmentData[field]
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        missingFields,
      });
    }

    // Get AI service
    const aiService = getAIService();

    // Analyze assessment with AI
    console.log("🤖 Analyzing assessment with AI...");
    const aiAnalysis = await aiService.analyzeInitialAssessment(assessmentData);

    // Create assessment record
    const assessment = new UserAssessment({
      userId,
      type: "initial",
      responses: new Map(Object.entries(assessmentData)),
      focusLevel: assessmentData.focusLevel,
      distractionLevel: assessmentData.distractionLevel || 5,
      motivationLevel: assessmentData.motivationLevel || 7,
      energyLevel: assessmentData.energyLevel || 7,
      stressLevel: assessmentData.stressLevel || 5,
      primaryGoal: assessmentData.primaryGoal,
      availableTimePerDay: assessmentData.availableTimePerDay,
      preferredSessionLength: assessmentData.preferredSessionLength || 15,
      experienceLevel: assessmentData.experienceLevel || "none",
      distractions: assessmentData.distractions || [],
      aiAnalysis: aiAnalysis.analysis,
      aiRecommendations: aiAnalysis.recommendations,
      suggestedDifficulty: aiAnalysis.suggestedDifficulty,
      suggestedDuration: aiAnalysis.suggestedDuration,
      aiModel: aiService.model,
    });

    await assessment.save();

    res.status(201).json({
      success: true,
      message: "Assessment submitted successfully",
      data: {
        assessmentId: assessment._id,
        focusScore: assessment.focusScore,
        analysis: aiAnalysis.analysis,
        recommendations: aiAnalysis.recommendations,
        suggestedDifficulty: aiAnalysis.suggestedDifficulty,
        suggestedDuration: aiAnalysis.suggestedDuration,
      },
    });
  } catch (error) {
    console.error("❌ Error submitting assessment:", error);
    res.status(500).json({
      success: false,
      message: "Error processing assessment",
      error: error.message,
    });
  }
};

/**
 * Generate personalized training plan based on assessment
 */
exports.generatePlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const { assessmentId, customDuration, startDate } = req.body;

    // Cancel any existing active plans before creating new one
    const existingPlan = await FocusPlan.getActivePlan(userId);
    if (existingPlan) {
      console.log(`🔄 Cancelling old active plan: ${existingPlan._id}`);
      existingPlan.status = "cancelled";
      await existingPlan.save();
    }

    // Get latest assessment if not provided
    let assessment;
    if (assessmentId) {
      assessment = await UserAssessment.findById(assessmentId);
    } else {
      assessment = await UserAssessment.getLatestAssessment(userId);
    }

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "No assessment found. Please complete assessment first.",
      });
    }

    // Get AI service and generate plan
    const aiService = getAIService();
    console.log("🤖 Generating training plan with AI...");

    const planData = await aiService.generateTrainingPlan(
      {
        focusLevel: assessment.focusLevel,
        distractionLevel: assessment.distractionLevel,
        motivationLevel: assessment.motivationLevel,
        energyLevel: assessment.energyLevel,
        stressLevel: assessment.stressLevel,
        primaryGoal: assessment.primaryGoal,
        availableTimePerDay: assessment.availableTimePerDay,
        preferredSessionLength: assessment.preferredSessionLength,
        experienceLevel: assessment.experienceLevel,
        distractions: assessment.distractions,
      },
      {
        suggestedDifficulty: assessment.suggestedDifficulty,
        suggestedDuration: customDuration || assessment.suggestedDuration,
      }
    );

    // Create plan with current date (ignore old startDate from client)
    const planStartDate = new Date();
    // Normalize to start of day to avoid timezone issues
    planStartDate.setHours(0, 0, 0, 0);

    // Calculate end date based on duration (weeks)
    const planEndDate = new Date(planStartDate);
    planEndDate.setDate(planEndDate.getDate() + planData.totalWeeks * 7);
    planEndDate.setHours(23, 59, 59, 999);

    const plan = new FocusPlan({
      userId,
      title: `Kế hoạch ${planData.totalWeeks} tuần - ${assessment.suggestedDifficulty}`,
      description:
        planData.weeks[0]?.description ||
        "Kế hoạch rèn luyện tập trung cá nhân hóa",
      duration: planData.totalWeeks,
      difficulty: assessment.suggestedDifficulty,
      goals: assessment.aiRecommendations || [],
      startDate: planStartDate,
      endDate: planEndDate,
      totalDays: planData.totalDays,
      trainingDays: planData.trainingDays,
      restDays: planData.restDays,
      initialAssessmentId: assessment._id,
      status: "active",
      aiModel: aiService.model,
      planStructure: new Map(Object.entries(planData)),
    });

    await plan.save();

    // Create training days
    const trainingDays = [];
    let currentDate = new Date(planStartDate);

    for (const week of planData.weeks) {
      for (const day of week.days) {
        const trainingDay = new TrainingDay({
          planId: plan._id,
          userId,
          date: new Date(currentDate),
          dayNumber: day.dayNumber,
          weekNumber: week.weekNumber,
          type: day.type,
          challenges: day.challenges || [],
        });

        trainingDays.push(trainingDay);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    await TrainingDay.insertMany(trainingDays);

    console.log(`✅ Created plan with ${trainingDays.length} training days`);

    res.status(201).json({
      success: true,
      message: "Training plan generated successfully",
      data: {
        plan: {
          id: plan._id,
          title: plan.title,
          duration: plan.duration,
          difficulty: plan.difficulty,
          startDate: plan.startDate,
          endDate: plan.endDate,
          totalDays: plan.totalDays,
          trainingDays: plan.trainingDays,
          restDays: plan.restDays,
        },
        previewDays: trainingDays.slice(0, 7).map((day) => ({
          date: day.date,
          type: day.type,
          challengesCount: day.challenges.length,
        })),
      },
    });
  } catch (error) {
    console.error("❌ Error generating plan:", error);
    res.status(500).json({
      success: false,
      message: "Error generating training plan",
      error: error.message,
    });
  }
};

/**
 * Get user's active training plan
 */
exports.getActivePlan = async (req, res) => {
  try {
    const userId = req.user.id;

    const plan = await FocusPlan.getActivePlan(userId).populate(
      "initialAssessmentId",
      "focusScore primaryGoal"
    );

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "No active training plan found",
      });
    }

    res.json({
      success: true,
      data: { plan },
    });
  } catch (error) {
    console.error("❌ Error getting active plan:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving plan",
      error: error.message,
    });
  }
};

/**
 * Get training days for date range (for calendar view)
 */
exports.getTrainingDays = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      });
    }

    const days = await TrainingDay.getForDateRange(
      userId,
      new Date(startDate),
      new Date(endDate)
    );

    res.json({
      success: true,
      data: { days },
    });
  } catch (error) {
    console.error("❌ Error getting training days:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving training days",
      error: error.message,
    });
  }
};

/**
 * Get training day details
 */
exports.getTrainingDay = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.params;

    // Get active plan first
    const activePlan = await FocusPlan.getActivePlan(userId);
    if (!activePlan) {
      return res.status(404).json({
        success: false,
        message: "No active training plan",
      });
    }

    // Parse date and create date range for the entire day (to handle timezone issues)
    const queryDate = new Date(date);
    const startOfDay = new Date(queryDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(queryDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Only get training day from active plan
    const trainingDay = await TrainingDay.findOne({
      userId,
      planId: activePlan._id,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    if (!trainingDay) {
      return res.status(404).json({
        success: false,
        message: "No training scheduled for this date",
      });
    }

    // Get AI encouragement for the day
    const aiService = getAIService();
    const plan = activePlan;

    if (!trainingDay.aiEncouragement && trainingDay.type === "training") {
      try {
        const encouragement = await aiService.generateDailyEncouragement(
          trainingDay,
          {
            currentStreak: plan.currentStreak,
            completionRate: plan.completionRate,
          }
        );
        trainingDay.aiEncouragement = encouragement;
        await trainingDay.save();
      } catch (error) {
        console.warn("⚠️  Could not generate encouragement:", error.message);
      }
    }

    res.json({
      success: true,
      data: { trainingDay },
    });
  } catch (error) {
    console.error("❌ Error getting training day:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving training day",
      error: error.message,
    });
  }
};

/**
 * Complete a challenge
 */
exports.completeChallenge = async (req, res) => {
  try {
    const userId = req.user.id;
    const { dayId, challengeIndex } = req.params;
    const { score, feedback } = req.body;

    const trainingDay = await TrainingDay.findOne({
      _id: dayId,
      userId,
    });

    if (!trainingDay) {
      return res.status(404).json({
        success: false,
        message: "Training day not found",
      });
    }

    // Mark challenge as completed
    await trainingDay.completeChallenge(challengeIndex, score || 80);

    // Update plan if day is fully completed
    if (trainingDay.completed) {
      const plan = await FocusPlan.findById(trainingDay.planId);
      await plan.markDayCompleted(trainingDay.totalPoints);

      // Add focus minutes to plan
      const focusMinutes = trainingDay.challenges.reduce(
        (sum, c) => sum + (c.duration || 0),
        0
      );
      plan.totalFocusMinutes += focusMinutes;
      await plan.save();
    }

    res.json({
      success: true,
      message: "Challenge completed successfully",
      data: {
        trainingDay,
        points: trainingDay.totalPoints,
        dayCompleted: trainingDay.completed,
      },
    });
  } catch (error) {
    console.error("❌ Error completing challenge:", error);
    res.status(500).json({
      success: false,
      message: "Error completing challenge",
      error: error.message,
    });
  }
};

/**
 * Submit weekly assessment
 */
exports.submitWeeklyAssessment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { weekNumber, responses } = req.body;

    const plan = await FocusPlan.getActivePlan(userId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "No active plan found",
      });
    }

    // Get week's training days
    const weekDays = await TrainingDay.getWeekTraining(
      userId,
      weekNumber,
      plan._id
    );

    // Calculate week stats
    const completedDays = weekDays.filter((d) => d.completed).length;
    const totalMinutes = weekDays.reduce(
      (sum, d) => sum + d.challenges.reduce((s, c) => s + (c.duration || 0), 0),
      0
    );
    const avgScore =
      weekDays.reduce(
        (sum, d) =>
          sum +
          d.challenges.reduce((s, c) => s + (c.score || 0), 0) /
            (d.challenges.length || 1),
        0
      ) / (weekDays.length || 1);

    // Get AI feedback
    const aiService = getAIService();
    const feedback = await aiService.generateWeeklyFeedback(
      {
        weekNumber,
        totalDays: weekDays.length,
        completedDays,
        totalMinutes,
        avgScore,
        ...responses,
      },
      {
        duration: plan.duration,
        difficulty: plan.difficulty,
      }
    );

    // Create assessment record
    const assessment = new UserAssessment({
      userId,
      planId: plan._id,
      type: "weekly",
      responses: new Map(Object.entries(responses)),
      focusLevel: responses.focusLevel || 5,
      energyLevel: responses.energyLevel || 5,
      stressLevel: responses.stressLevel || 5,
      aiAnalysis: feedback.feedback,
      aiRecommendations: feedback.adjustments,
      aiModel: aiService.model,
    });

    await assessment.calculateImprovement();

    res.json({
      success: true,
      message: "Weekly assessment submitted",
      data: {
        assessment,
        feedback: feedback.feedback,
        encouragement: feedback.encouragement,
        improvement: assessment.improvement,
      },
    });
  } catch (error) {
    console.error("❌ Error submitting weekly assessment:", error);
    res.status(500).json({
      success: false,
      message: "Error processing weekly assessment",
      error: error.message,
    });
  }
};

/**
 * Get user's progress dashboard
 */
exports.getProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    const plan = await FocusPlan.getActivePlan(userId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "No active plan found",
      });
    }

    // Get assessments
    const assessments = await UserAssessment.find({ planId: plan._id })
      .sort({ assessmentDate: 1 })
      .select("type focusScore assessmentDate improvement");

    // Get recent training days
    const recentDays = await TrainingDay.find({
      userId,
      planId: plan._id,
    })
      .sort({ date: -1 })
      .limit(30);

    // Calculate statistics
    const stats = {
      totalDays: plan.totalDays,
      completedDays: plan.completedDays,
      completionRate: plan.completionRate,
      currentStreak: plan.currentStreak,
      longestStreak: plan.longestStreak,
      totalPoints: plan.totalPoints,
      totalFocusMinutes: plan.totalFocusMinutes,
      totalFocusHours: Math.round((plan.totalFocusMinutes / 60) * 10) / 10,
      averageSessionDuration: plan.averageSessionDuration,
      focusScoreImprovement:
        assessments.length > 1
          ? assessments[assessments.length - 1].focusScore -
            assessments[0].focusScore
          : 0,
    };

    res.json({
      success: true,
      data: {
        plan,
        stats,
        assessments,
        recentActivity: recentDays.slice(0, 7),
      },
    });
  } catch (error) {
    console.error("❌ Error getting progress:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving progress",
      error: error.message,
    });
  }
};

/**
 * Pause/Resume plan
 */
exports.updatePlanStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { action } = req.body; // 'pause', 'resume', 'cancel'

    const plan = await FocusPlan.getActivePlan(userId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "No active plan found",
      });
    }

    switch (action) {
      case "pause":
        await plan.pause();
        break;
      case "resume":
        await plan.resume();
        break;
      case "cancel":
        await plan.cancel();
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid action. Use: pause, resume, or cancel",
        });
    }

    res.json({
      success: true,
      message: `Plan ${action}d successfully`,
      data: { plan },
    });
  } catch (error) {
    console.error("❌ Error updating plan status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating plan",
      error: error.message,
    });
  }
};

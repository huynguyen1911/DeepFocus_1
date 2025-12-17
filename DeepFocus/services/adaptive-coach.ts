// @ts-nocheck
/**
 * Adaptive Coaching Service - Phase 6: AI Learning & Personalization
 * Learns from user patterns and provides personalized coaching
 */

interface SessionData {
  id: string;
  startTime: Date;
  duration: number;
  score: number;
  distractions: string[];
  completed: boolean;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: number;
}

interface UserPattern {
  bestTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  bestDayOfWeek: number;
  optimalDuration: number;
  commonDistractions: { type: string; frequency: number }[];
  averageScore: number;
  completionRate: number;
  peakPerformanceHours: number[];
  strugglingHours: number[];
}

interface CoachingRecommendation {
  id: string;
  type: 'timing' | 'duration' | 'technique' | 'environment' | 'difficulty';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  reasoning: string;
  actionable: string;
  confidence: number; // 0-100
  icon: string;
  color: string;
}

export class AdaptiveCoach {
  // Analyze user patterns from session history
  static analyzeUserPatterns(sessions: SessionData[]): UserPattern {
    if (sessions.length === 0) {
      return this.getDefaultPattern();
    }

    // Analyze best time of day
    const timeStats = {
      morning: { total: 0, totalScore: 0 },
      afternoon: { total: 0, totalScore: 0 },
      evening: { total: 0, totalScore: 0 },
      night: { total: 0, totalScore: 0 }
    };

    sessions.forEach(session => {
      timeStats[session.timeOfDay].total++;
      timeStats[session.timeOfDay].totalScore += session.score;
    });

    const bestTimeOfDay = Object.entries(timeStats)
      .filter(([_, stats]) => stats.total > 0)
      .sort((a, b) => {
        const avgA = a[1].totalScore / a[1].total;
        const avgB = b[1].totalScore / b[1].total;
        return avgB - avgA;
      })[0]?.[0] as 'morning' | 'afternoon' | 'evening' | 'night' || 'morning';

    // Analyze best day of week
    const dayStats: { [key: number]: { total: number; totalScore: number } } = {};
    sessions.forEach(session => {
      const day = session.dayOfWeek;
      if (!dayStats[day]) dayStats[day] = { total: 0, totalScore: 0 };
      dayStats[day].total++;
      dayStats[day].totalScore += session.score;
    });

    const bestDayOfWeek = Object.entries(dayStats)
      .sort((a, b) => {
        const avgA = a[1].totalScore / a[1].total;
        const avgB = b[1].totalScore / b[1].total;
        return avgB - avgA;
      })[0]?.[0] ? parseInt(Object.entries(dayStats)[0][0]) : 1;

    // Analyze optimal duration
    const durationScores: { [key: number]: number[] } = {};
    sessions.forEach(session => {
      const bucket = Math.floor(session.duration / 15) * 15; // Group by 15-min intervals
      if (!durationScores[bucket]) durationScores[bucket] = [];
      durationScores[bucket].push(session.score);
    });

    const optimalDuration = Object.entries(durationScores)
      .map(([duration, scores]) => ({
        duration: parseInt(duration),
        avgScore: scores.reduce((a, b) => a + b, 0) / scores.length
      }))
      .sort((a, b) => b.avgScore - a.avgScore)[0]?.duration || 30;

    // Analyze common distractions
    const distractionCount: { [key: string]: number } = {};
    sessions.forEach(session => {
      session.distractions.forEach(distraction => {
        distractionCount[distraction] = (distractionCount[distraction] || 0) + 1;
      });
    });

    const commonDistractions = Object.entries(distractionCount)
      .map(([type, frequency]) => ({ type, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);

    // Calculate average score and completion rate
    const completedSessions = sessions.filter(s => s.completed);
    const averageScore = sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length;
    const completionRate = (completedSessions.length / sessions.length) * 100;

    // Analyze peak performance hours
    const hourStats: { [key: number]: { total: number; totalScore: number } } = {};
    sessions.forEach(session => {
      const hour = session.startTime.getHours();
      if (!hourStats[hour]) hourStats[hour] = { total: 0, totalScore: 0 };
      hourStats[hour].total++;
      hourStats[hour].totalScore += session.score;
    });

    const hourAverages = Object.entries(hourStats)
      .map(([hour, stats]) => ({
        hour: parseInt(hour),
        avgScore: stats.totalScore / stats.total,
        count: stats.total
      }))
      .filter(h => h.count >= 2); // Only consider hours with 2+ sessions

    const peakPerformanceHours = hourAverages
      .filter(h => h.avgScore >= 85)
      .map(h => h.hour);

    const strugglingHours = hourAverages
      .filter(h => h.avgScore < 70)
      .map(h => h.hour);

    return {
      bestTimeOfDay,
      bestDayOfWeek,
      optimalDuration,
      commonDistractions,
      averageScore,
      completionRate,
      peakPerformanceHours,
      strugglingHours
    };
  }

  // Generate personalized coaching recommendations
  static generateRecommendations(
    patterns: UserPattern,
    recentSessions: SessionData[]
  ): CoachingRecommendation[] {
    const recommendations: CoachingRecommendation[] = [];

    // Timing recommendation
    if (patterns.peakPerformanceHours.length > 0) {
      const hours = patterns.peakPerformanceHours.sort((a, b) => a - b);
      const timeRanges = this.groupConsecutiveHours(hours);
      
      recommendations.push({
        id: 'timing-optimal',
        type: 'timing',
        priority: 'high',
        title: 'Thời điểm vàng của bạn',
        description: `Bạn tập trung tốt nhất vào ${this.formatTimeRanges(timeRanges)}`,
        reasoning: `Dựa trên ${recentSessions.length} phiên gần đây, điểm trung bình cao nhất vào khung giờ này.`,
        actionable: `Lên lịch các công việc quan trọng vào ${patterns.bestTimeOfDay}`,
        confidence: patterns.peakPerformanceHours.length >= 3 ? 90 : 70,
        icon: 'clock-time-four',
        color: '#FF9800'
      });
    }

    // Duration recommendation
    if (patterns.optimalDuration > 0) {
      recommendations.push({
        id: 'duration-optimal',
        type: 'duration',
        priority: 'high',
        title: 'Độ dài phiên lý tưởng',
        description: `Phiên ${patterns.optimalDuration} phút cho kết quả tốt nhất`,
        reasoning: 'Phân tích cho thấy bạn duy trì tập trung tốt ở độ dài này.',
        actionable: `Cài đặt timer ${patterns.optimalDuration} phút cho phiên tiếp theo`,
        confidence: 85,
        icon: 'timer-outline',
        color: '#4CAF50'
      });
    }

    // Difficulty adjustment
    if (patterns.averageScore >= 90) {
      recommendations.push({
        id: 'difficulty-increase',
        type: 'difficulty',
        priority: 'medium',
        title: 'Tăng độ khó',
        description: 'Bạn đã thành thạo mức hiện tại',
        reasoning: `Điểm TB ${Math.round(patterns.averageScore)} cho thấy bạn đã sẵn sàng thử thách lớn hơn.`,
        actionable: `Thử tăng thời gian lên ${patterns.optimalDuration + 15} phút hoặc chọn tasks khó hơn`,
        confidence: 80,
        icon: 'trending-up',
        color: '#9C27B0'
      });
    } else if (patterns.averageScore < 70 && patterns.completionRate < 70) {
      recommendations.push({
        id: 'difficulty-decrease',
        type: 'difficulty',
        priority: 'high',
        title: 'Giảm áp lực',
        description: 'Bắt đầu với mục tiêu nhỏ hơn',
        reasoning: 'Tỷ lệ hoàn thành thấp có thể do mục tiêu quá cao.',
        actionable: `Thử giảm xuống ${Math.max(15, patterns.optimalDuration - 10)} phút và tăng dần`,
        confidence: 85,
        icon: 'arrow-down-circle',
        color: '#FF6B6B'
      });
    }

    // Distraction management
    if (patterns.commonDistractions.length > 0) {
      const topDistraction = patterns.commonDistractions[0];
      const solutions = this.getDistractionSolution(topDistraction.type);
      
      recommendations.push({
        id: 'environment-distraction',
        type: 'environment',
        priority: patterns.commonDistractions[0].frequency > 5 ? 'high' : 'medium',
        title: 'Giảm phân tâm',
        description: `${solutions.problem} xuất hiện ${topDistraction.frequency} lần`,
        reasoning: `Đây là nguồn phân tâm chính của bạn.`,
        actionable: solutions.solution,
        confidence: 90,
        icon: solutions.icon,
        color: '#667eea'
      });
    }

    // Technique recommendation based on performance
    if (patterns.averageScore < 80) {
      recommendations.push({
        id: 'technique-pomodoro',
        type: 'technique',
        priority: 'medium',
        title: 'Thử kỹ thuật Pomodoro',
        description: '25 phút tập trung + 5 phút nghỉ',
        reasoning: 'Phương pháp này giúp duy trì tập trung ổn định.',
        actionable: 'Bắt đầu với 2-3 Pomodoro mỗi ngày',
        confidence: 75,
        icon: 'timer-sand',
        color: '#FF9800'
      });
    }

    // Time-based recommendation
    const currentHour = new Date().getHours();
    if (patterns.strugglingHours.includes(currentHour)) {
      recommendations.push({
        id: 'timing-avoid',
        type: 'timing',
        priority: 'high',
        title: 'Không phải lúc tốt nhất',
        description: `Khung giờ ${currentHour}h thường khó tập trung với bạn`,
        reasoning: 'Dữ liệu cho thấy hiệu suất thấp vào giờ này.',
        actionable: patterns.peakPerformanceHours.length > 0 
          ? `Chuyển sang ${this.formatHour(patterns.peakPerformanceHours[0])} nếu có thể`
          : 'Thử nghỉ ngơi và quay lại sau',
        confidence: 85,
        icon: 'alert-circle',
        color: '#EF5350'
      });
    }

    // Day of week recommendation
    const currentDay = new Date().getDay();
    if (currentDay === patterns.bestDayOfWeek) {
      recommendations.push({
        id: 'timing-best-day',
        type: 'timing',
        priority: 'medium',
        title: 'Ngày tốt nhất trong tuần',
        description: `${this.getDayName(currentDay)} là ngày bạn tập trung tốt nhất`,
        reasoning: 'Tận dụng ngày này để làm những việc quan trọng nhất!',
        actionable: 'Ưu tiên các task khó trong ngày hôm nay',
        confidence: 80,
        icon: 'star-circle',
        color: '#FFD700'
      });
    }

    // Sort by priority and confidence
    return recommendations.sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.confidence - a.confidence;
    });
  }

  // Predict optimal session time for today
  static predictOptimalTime(patterns: UserPattern): { hour: number; confidence: number } {
    if (patterns.peakPerformanceHours.length > 0) {
      const currentHour = new Date().getHours();
      const upcomingPeakHours = patterns.peakPerformanceHours.filter(h => h > currentHour);
      
      if (upcomingPeakHours.length > 0) {
        return { hour: upcomingPeakHours[0], confidence: 85 };
      } else if (patterns.peakPerformanceHours.length > 0) {
        return { hour: patterns.peakPerformanceHours[0], confidence: 70 };
      }
    }

    // Default to time of day preference
    const defaultHours = {
      morning: 9,
      afternoon: 14,
      evening: 19,
      night: 21
    };

    return { 
      hour: defaultHours[patterns.bestTimeOfDay], 
      confidence: 60 
    };
  }

  // Helper methods
  private static getDefaultPattern(): UserPattern {
    return {
      bestTimeOfDay: 'morning',
      bestDayOfWeek: 1,
      optimalDuration: 25,
      commonDistractions: [],
      averageScore: 0,
      completionRate: 0,
      peakPerformanceHours: [],
      strugglingHours: []
    };
  }

  private static groupConsecutiveHours(hours: number[]): number[][] {
    if (hours.length === 0) return [];
    
    const groups: number[][] = [];
    let currentGroup = [hours[0]];
    
    for (let i = 1; i < hours.length; i++) {
      if (hours[i] === hours[i - 1] + 1) {
        currentGroup.push(hours[i]);
      } else {
        groups.push(currentGroup);
        currentGroup = [hours[i]];
      }
    }
    groups.push(currentGroup);
    
    return groups;
  }

  private static formatTimeRanges(ranges: number[][]): string {
    return ranges.map(range => {
      if (range.length === 1) {
        return `${range[0]}h`;
      } else {
        return `${range[0]}h-${range[range.length - 1]}h`;
      }
    }).join(', ');
  }

  private static formatHour(hour: number): string {
    return `${hour}h`;
  }

  private static getDayName(day: number): string {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return days[day];
  }

  private static getDistractionSolution(type: string): { problem: string; solution: string; icon: string } {
    const solutions: { [key: string]: { problem: string; solution: string; icon: string } } = {
      phone: {
        problem: 'Điện thoại',
        solution: 'Bật chế độ không làm phiền hoặc để điện thoại xa 2-3 mét',
        icon: 'cellphone-off'
      },
      noise: {
        problem: 'Tiếng ồn',
        solution: 'Sử dụng tai nghe chống ồn hoặc nghe nhạc lo-fi/white noise',
        icon: 'headphones'
      },
      thoughts: {
        problem: 'Suy nghĩ',
        solution: 'Thực hành mindfulness 5 phút trước khi bắt đầu',
        icon: 'meditation'
      },
      people: {
        problem: 'Con người',
        solution: 'Tìm không gian riêng tư hoặc thông báo giờ tập trung cho mọi người',
        icon: 'account-off'
      },
      notifications: {
        problem: 'Thông báo',
        solution: 'Tắt tất cả thông báo trên máy tính và điện thoại',
        icon: 'bell-off'
      },
      hungry: {
        problem: 'Đói',
        solution: 'Ăn nhẹ trước phiên hoặc uống nước/cà phê',
        icon: 'food-apple'
      },
      tired: {
        problem: 'Mệt mỏi',
        solution: 'Nghỉ ngơi 15-20 phút hoặc chuyển sang phiên ngắn hơn',
        icon: 'sleep'
      }
    };

    return solutions[type] || {
      problem: 'Phân tâm',
      solution: 'Chuẩn bị môi trường tốt hơn trước khi bắt đầu',
      icon: 'alert'
    };
  }
}

// Example usage:
/*
import { AdaptiveCoach } from '@/services/adaptive-coach';

// Analyze patterns
const userPattern = AdaptiveCoach.analyzeUserPatterns(sessionHistory);

// Get recommendations
const recommendations = AdaptiveCoach.generateRecommendations(userPattern, recentSessions);

// Predict optimal time
const optimalTime = AdaptiveCoach.predictOptimalTime(userPattern);
console.log(`Best time to focus today: ${optimalTime.hour}h (${optimalTime.confidence}% confidence)`);
*/

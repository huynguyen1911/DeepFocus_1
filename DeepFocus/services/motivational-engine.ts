// @ts-nocheck
/**
 * Motivational Messages Service - Phase 6: Dynamic Motivation Engine
 * Generates personalized motivational messages based on user context
 */

interface UserContext {
  currentStreak: number;
  totalSessions: number;
  avgFocusScore: number;
  recentTrend: 'improving' | 'declining' | 'stable';
  lastSession?: {
    score: number;
    completed: boolean;
    distractions: number;
  };
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  achievements: number;
  bestStreak: number;
}

interface MotivationalMessage {
  id: string;
  type: 'encouragement' | 'celebration' | 'challenge' | 'wisdom' | 'reminder';
  message: string;
  icon: string;
  color: string;
  intensity: 'low' | 'medium' | 'high';
  trigger?: string;
}

export class MotivationalEngine {
  private static messages = {
    // Encouragement messages
    encouragement: [
      {
        condition: (ctx: UserContext) => ctx.avgFocusScore < 70,
        messages: [
          { text: 'Mỗi ngày tiến bộ một chút, bạn sẽ đạt được mục tiêu! 💪', intensity: 'high' },
          { text: 'Đừng so sánh với người khác, hãy so sánh với chính mình ngày hôm qua! 🌟', intensity: 'medium' },
          { text: 'Tập trung là kỹ năng, cần thời gian để rèn luyện. Bạn đang làm rất tốt! 💙', intensity: 'medium' }
        ]
      },
      {
        condition: (ctx: UserContext) => ctx.recentTrend === 'declining',
        messages: [
          { text: 'Mọi người đều có lúc khó khăn. Hãy nghỉ ngơi và quay lại mạnh mẽ hơn! 💚', intensity: 'high' },
          { text: 'Thất bại là cơ hội để học hỏi. Bạn sẽ vượt qua được! 🌈', intensity: 'medium' },
          { text: 'Hãy nhớ lại lý do bạn bắt đầu. Động lực sẽ quay trở lại! ✨', intensity: 'high' }
        ]
      },
      {
        condition: (ctx: UserContext) => ctx.lastSession && !ctx.lastSession.completed,
        messages: [
          { text: 'Không sao cả! Lần sau sẽ tốt hơn. Điều quan trọng là không bỏ cuộc! 💪', intensity: 'high' },
          { text: 'Mỗi lần thử là một bước tiến. Hãy thử lại với thời gian ngắn hơn! 🎯', intensity: 'medium' }
        ]
      }
    ],

    // Celebration messages
    celebration: [
      {
        condition: (ctx: UserContext) => ctx.currentStreak >= 7,
        messages: [
          { text: `🔥 ${ctx.currentStreak} ngày streak! Bạn đang xây dựng thói quen tuyệt vời!`, intensity: 'high' },
          { text: `Tuần hoàn hảo! ${ctx.currentStreak} ngày liên tiếp - Xuất sắc! 🏆`, intensity: 'high' }
        ]
      },
      {
        condition: (ctx: UserContext) => ctx.currentStreak >= 30,
        messages: [
          { text: `🎉 30 NGÀY STREAK! Bạn là huyền thoại! Tiếp tục chinh phục nhé!`, intensity: 'high' },
          { text: `Tháng hoàn hảo! Bạn đã chứng minh sự kiên trì của mình! 👑`, intensity: 'high' }
        ]
      },
      {
        condition: (ctx: UserContext) => ctx.lastSession && ctx.lastSession.score >= 95,
        messages: [
          { text: '🌟 Điểm gần như hoàn hảo! Bạn đã làm chủ sự tập trung!', intensity: 'high' },
          { text: 'Wow! 95+ điểm! Đây là biểu hiện của bậc thầy! 🎯', intensity: 'high' }
        ]
      },
      {
        condition: (ctx: UserContext) => ctx.totalSessions === 50 || ctx.totalSessions === 100,
        messages: [
          { text: `🎊 Cột mốc ${ctx.totalSessions} phiên! Mỗi phiên là một chiến thắng!`, intensity: 'high' },
          { text: `${ctx.totalSessions} phiên hoàn thành! Bạn đã đi được một chặng đường dài! 🚀`, intensity: 'high' }
        ]
      }
    ],

    // Challenge messages
    challenge: [
      {
        condition: (ctx: UserContext) => ctx.avgFocusScore >= 85,
        messages: [
          { text: 'Bạn đang làm rất tốt! Thử tăng thời gian lên 60 phút? 💪', intensity: 'medium' },
          { text: 'Điểm cao đều đặn! Đã đến lúc nâng cao độ khó! 🎯', intensity: 'medium' },
          { text: 'Bạn đã sẵn sàng cho thử thách 90 phút chưa? 🔥', intensity: 'low' }
        ]
      },
      {
        condition: (ctx: UserContext) => ctx.currentStreak >= 5 && ctx.currentStreak < 7,
        messages: [
          { text: `Còn ${7 - ctx.currentStreak} ngày nữa đến tuần hoàn hảo! Bạn làm được! 💪`, intensity: 'medium' },
          { text: 'Gần đạt mục tiêu 7 ngày rồi! Đừng bỏ cuộc nhé! 🔥', intensity: 'high' }
        ]
      }
    ],

    // Wisdom messages
    wisdom: [
      { text: 'Tập trung không phải là làm nhiều việc, mà là làm đúng việc. 🎯', intensity: 'low' },
      { text: 'Thành công là tổng của những nỗ lực nhỏ lặp đi lặp lại mỗi ngày. 💫', intensity: 'low' },
      { text: 'Bộ não cần nghỉ ngơi để hoạt động tốt nhất. Đừng quên nghỉ! 🧠', intensity: 'medium' },
      { text: 'Môi trường yên tĩnh tạo nên tâm trí yên tĩnh. 🌿', intensity: 'low' },
      { text: 'Kỷ luật là cầu nối giữa mục tiêu và thành tựu. 🏆', intensity: 'medium' },
      { text: 'Mỗi phút tập trung là một khoản đầu tư cho tương lai. 💎', intensity: 'low' }
    ],

    // Reminder messages
    reminder: [
      {
        condition: (ctx: UserContext) => ctx.timeOfDay === 'morning',
        messages: [
          { text: 'Buổi sáng là thời điểm vàng để tập trung. Bắt đầu thôi! ☀️', intensity: 'medium' },
          { text: 'Khởi đầu ngày mới với một phiên tập trung! 🌅', intensity: 'medium' }
        ]
      },
      {
        condition: (ctx: UserContext) => ctx.timeOfDay === 'evening',
        messages: [
          { text: 'Buổi tối yên tĩnh cũng tốt cho tập trung. Thử xem sao? 🌙', intensity: 'low' },
          { text: 'Kết thúc ngày với một phiên tập trung ngắn? 🌆', intensity: 'low' }
        ]
      },
      {
        condition: (ctx: UserContext) => ctx.currentStreak === 0,
        messages: [
          { text: 'Hãy bắt đầu streak mới ngay hôm nay! Mỗi hành trình đều bắt đầu từ bước đầu tiên. 🚀', intensity: 'high' },
          { text: 'Đừng để ngày hôm nay trôi qua mà không làm gì! Bắt đầu ngay? 💪', intensity: 'medium' }
        ]
      }
    ]
  };

  static getMotivationalMessage(context: UserContext): MotivationalMessage {
    // Try celebration first (highest priority)
    for (const group of this.messages.celebration) {
      if (group.condition(context)) {
        const selected = this.selectRandom(group.messages);
        return {
          id: `celebration-${Date.now()}`,
          type: 'celebration',
          message: selected.text,
          icon: 'trophy-award',
          color: '#FFD700',
          intensity: selected.intensity,
          trigger: 'achievement'
        };
      }
    }

    // Check for challenges
    for (const group of this.messages.challenge) {
      if (group.condition(context)) {
        const selected = this.selectRandom(group.messages);
        return {
          id: `challenge-${Date.now()}`,
          type: 'challenge',
          message: selected.text,
          icon: 'target',
          color: '#FF9800',
          intensity: selected.intensity,
          trigger: 'performance'
        };
      }
    }

    // Check for encouragement
    for (const group of this.messages.encouragement) {
      if (group.condition(context)) {
        const selected = this.selectRandom(group.messages);
        return {
          id: `encouragement-${Date.now()}`,
          type: 'encouragement',
          message: selected.text,
          icon: 'heart',
          color: '#FF6B6B',
          intensity: selected.intensity,
          trigger: 'support'
        };
      }
    }

    // Check for reminders
    for (const group of this.messages.reminder) {
      if (group.condition && group.condition(context)) {
        const selected = this.selectRandom(group.messages);
        return {
          id: `reminder-${Date.now()}`,
          type: 'reminder',
          message: selected.text,
          icon: 'bell',
          color: '#667eea',
          intensity: selected.intensity,
          trigger: 'time'
        };
      }
    }

    // Default: wisdom message
    const selected = this.selectRandom(this.messages.wisdom);
    return {
      id: `wisdom-${Date.now()}`,
      type: 'wisdom',
      message: selected.text,
      icon: 'lightbulb-on',
      color: '#9C27B0',
      intensity: selected.intensity,
      trigger: 'default'
    };
  }

  static getMultipleMessages(context: UserContext, count: number = 3): MotivationalMessage[] {
    const messages: MotivationalMessage[] = [];
    
    // Always try to get one celebration if applicable
    for (const group of this.messages.celebration) {
      if (group.condition(context)) {
        const selected = this.selectRandom(group.messages);
        messages.push({
          id: `celebration-${Date.now()}-${messages.length}`,
          type: 'celebration',
          message: selected.text,
          icon: 'trophy-award',
          color: '#FFD700',
          intensity: selected.intensity,
          trigger: 'achievement'
        });
        break;
      }
    }

    // Get encouragement or challenge
    const performanceGroups = [...this.messages.encouragement, ...this.messages.challenge];
    for (const group of performanceGroups) {
      if (messages.length >= count) break;
      if (group.condition(context)) {
        const selected = this.selectRandom(group.messages);
        messages.push({
          id: `performance-${Date.now()}-${messages.length}`,
          type: messages.length === 0 ? 'encouragement' : 'challenge',
          message: selected.text,
          icon: messages.length === 0 ? 'heart' : 'target',
          color: messages.length === 0 ? '#FF6B6B' : '#FF9800',
          intensity: selected.intensity,
          trigger: 'performance'
        });
      }
    }

    // Fill with wisdom messages
    while (messages.length < count) {
      const selected = this.selectRandom(this.messages.wisdom);
      messages.push({
        id: `wisdom-${Date.now()}-${messages.length}`,
        type: 'wisdom',
        message: selected.text,
        icon: 'lightbulb-on',
        color: '#9C27B0',
        intensity: selected.intensity,
        trigger: 'wisdom'
      });
    }

    return messages;
  }

  private static selectRandom<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  static getGreeting(context: UserContext): string {
    const hour = new Date().getHours();
    const { name = 'Bạn', currentStreak, recentTrend } = context;

    let timeGreeting = '';
    if (hour < 12) timeGreeting = 'Chào buổi sáng';
    else if (hour < 18) timeGreeting = 'Chào buổi chiều';
    else timeGreeting = 'Chào buổi tối';

    if (currentStreak >= 7) {
      return `${timeGreeting}, ${name}! 🔥 Streak ${currentStreak} ngày - Xuất sắc!`;
    } else if (recentTrend === 'improving') {
      return `${timeGreeting}, ${name}! 📈 Bạn đang tiến bộ rất tốt!`;
    } else if (recentTrend === 'declining') {
      return `${timeGreeting}, ${name}! 💙 Hãy bắt đầu lại với tinh thần mới!`;
    } else {
      return `${timeGreeting}, ${name}! 😊 Sẵn sàng tập trung chưa?`;
    }
  }
}

// Helper function to get current time context
export function getTimeContext(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

// Example usage:
/*
import { MotivationalEngine, getTimeContext } from '@/services/motivational-engine';

const userContext = {
  currentStreak: 7,
  totalSessions: 68,
  avgFocusScore: 87,
  recentTrend: 'improving',
  lastSession: { score: 92, completed: true, distractions: 1 },
  timeOfDay: getTimeContext(),
  achievements: 5,
  bestStreak: 9
};

// Get single message
const message = MotivationalEngine.getMotivationalMessage(userContext);
console.log(message.message);

// Get multiple messages
const messages = MotivationalEngine.getMultipleMessages(userContext, 3);

// Get greeting
const greeting = MotivationalEngine.getGreeting(userContext);
*/

import { apiClient as api } from './api';

export interface Achievement {
  _id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum';
  icon: string;
  color: string;
  requirements: {
    metric: string;
    value: number;
    condition: string;
  };
  rewards: {
    points: number;
    badges?: string[];
  };
}

export interface UserAchievement {
  achievement: Achievement;
  isUnlocked: boolean;
  unlockedAt?: string;
  progress: {
    currentValue: number;
    targetValue: number;
    percentage: number;
  };
  isFavorite: boolean;
  isViewed: boolean;
}

export interface AchievementSummary {
  unlocked: number;
  inProgress: number;
  locked: number;
  totalPoints: number;
  favoriteAchievements: UserAchievement[];
}

class AchievementService {
  async getAllAchievements(): Promise<UserAchievement[]> {
    const response = await api.get('/achievements');
    return response.data.data;
  }

  async getAchievementDetail(achievementId: string): Promise<UserAchievement> {
    const response = await api.get(`/achievements/${achievementId}`);
    return response.data.data;
  }

  async getAchievementSummary(): Promise<AchievementSummary> {
    const response = await api.get('/achievements/summary');
    return response.data.data;
  }

  async checkUnlocks(): Promise<{ newUnlocks: UserAchievement[] }> {
    const response = await api.post('/achievements/check-unlocks');
    return response.data;
  }

  async toggleFavorite(achievementId: string): Promise<UserAchievement> {
    const response = await api.post(`/achievements/${achievementId}/favorite`);
    return response.data.data;
  }

  async shareAchievement(achievementId: string, platform: string = 'general'): Promise<{ shareUrl: string }> {
    const response = await api.post(`/achievements/${achievementId}/share`, { platform });
    return response.data;
  }
}

export default new AchievementService();

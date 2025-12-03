/**
 * Achievement Service Tests
 * Tests for Achievement API integration
 */

import * as achievementService from '../services/achievementService';
import * as api from '../services/api';

// Mock the api module
jest.mock('../services/api');

describe('AchievementService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllAchievements', () => {
    it('should fetch all achievements successfully', async () => {
      const mockAchievements = [
        {
          achievement: {
            _id: '1',
            name: 'First Blood',
            code: 'FIRST_POMODORO',
            category: 'getting-started',
          },
          isUnlocked: true,
          progress: { currentValue: 1, targetValue: 1, percentage: 100 },
        },
      ];

      api.get.mockResolvedValue({ data: { data: mockAchievements } });

      const result = await achievementService.getAllAchievements();

      expect(api.get).toHaveBeenCalledWith('/api/achievements');
      expect(result).toEqual(mockAchievements);
    });

    it('should handle API errors', async () => {
      api.get.mockRejectedValue(new Error('Network error'));

      await expect(achievementService.getAllAchievements()).rejects.toThrow('Network error');
    });
  });

  describe('getAchievementDetail', () => {
    it('should fetch achievement detail by ID', async () => {
      const mockAchievement = {
        achievement: {
          _id: '123',
          name: 'Marathon Runner',
          description: 'Complete 100 pomodoros',
        },
        isUnlocked: false,
        progress: { currentValue: 50, targetValue: 100, percentage: 50 },
      };

      api.get.mockResolvedValue({ data: { data: mockAchievement } });

      const result = await achievementService.getAchievementDetail('123');

      expect(api.get).toHaveBeenCalledWith('/api/achievements/123');
      expect(result).toEqual(mockAchievement);
    });
  });

  describe('getAchievementSummary', () => {
    it('should fetch achievement summary', async () => {
      const mockSummary = {
        unlocked: 5,
        inProgress: 10,
        locked: 15,
        totalPoints: 500,
        favoriteAchievements: [],
      };

      api.get.mockResolvedValue({ data: { data: mockSummary } });

      const result = await achievementService.getAchievementSummary();

      expect(api.get).toHaveBeenCalledWith('/api/achievements/summary');
      expect(result).toEqual(mockSummary);
    });
  });

  describe('checkUnlocks', () => {
    it('should check for new unlocks', async () => {
      const mockResponse = { newUnlocks: [] };

      api.post.mockResolvedValue({ data: mockResponse });

      const result = await achievementService.checkUnlocks();

      expect(api.post).toHaveBeenCalledWith('/api/achievements/check-unlocks');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('toggleFavorite', () => {
    it('should toggle achievement favorite status', async () => {
      const mockAchievement = {
        achievement: { _id: '123', name: 'Test' },
        isFavorite: true,
      };

      api.post.mockResolvedValue({ data: { data: mockAchievement } });

      const result = await achievementService.toggleFavorite('123');

      expect(api.post).toHaveBeenCalledWith('/api/achievements/123/favorite');
      expect(result).toEqual(mockAchievement);
    });
  });

  describe('shareAchievement', () => {
    it('should share achievement with default platform', async () => {
      const mockResponse = { shareUrl: 'https://example.com/share/123' };

      api.post.mockResolvedValue({ data: mockResponse });

      const result = await achievementService.shareAchievement('123');

      expect(api.post).toHaveBeenCalledWith('/api/achievements/123/share', { platform: 'general' });
      expect(result).toEqual(mockResponse);
    });

    it('should share achievement with specific platform', async () => {
      const mockResponse = { shareUrl: 'https://twitter.com/share/123' };

      api.post.mockResolvedValue({ data: mockResponse });

      const result = await achievementService.shareAchievement('123', 'twitter');

      expect(api.post).toHaveBeenCalledWith('/api/achievements/123/share', { platform: 'twitter' });
      expect(result).toEqual(mockResponse);
    });
  });
});

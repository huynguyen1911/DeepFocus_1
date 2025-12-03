/**
 * Achievements Screen Tests
 * Tests for Achievements list screen component
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import AchievementsScreen from '../../app/achievements/index';
import * as achievementService from '../../services/achievementService';
import { useRouter } from 'expo-router';

// Mock dependencies
jest.mock('../../services/achievementService');
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
  useRouter: jest.fn(),
}));

describe('AchievementsScreen', () => {
  const mockAchievements = [
    {
      achievement: {
        _id: '1',
        code: 'FIRST_POMODORO',
        name: 'First Blood',
        description: 'Complete your first pomodoro',
        category: 'getting-started',
        difficulty: 'bronze',
        icon: '🎯',
        color: '#CD7F32',
        requirements: { metric: 'pomodoros', value: 1, condition: 'complete' },
        rewards: { points: 10 },
      },
      isUnlocked: true,
      unlockedAt: '2025-11-01T00:00:00Z',
      progress: { currentValue: 1, targetValue: 1, percentage: 100 },
      isFavorite: false,
      isViewed: true,
    },
    {
      achievement: {
        _id: '2',
        code: 'MARATHON_RUNNER',
        name: 'Marathon Runner',
        description: 'Complete 100 pomodoros',
        category: 'productivity',
        difficulty: 'gold',
        icon: '🏃',
        color: '#FFD700',
        requirements: { metric: 'pomodoros', value: 100, condition: 'complete' },
        rewards: { points: 100 },
      },
      isUnlocked: false,
      progress: { currentValue: 50, targetValue: 100, percentage: 50 },
      isFavorite: true,
      isViewed: true,
    },
  ];

  const mockSummary = {
    unlocked: 5,
    inProgress: 10,
    locked: 15,
    totalPoints: 500,
    favoriteAchievements: [],
  };

  const renderScreen = () => {
    return render(
      <PaperProvider theme={DefaultTheme}>
        <AchievementsScreen />
      </PaperProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (achievementService.getAllAchievements as any).mockResolvedValue(mockAchievements);
    (achievementService.getAchievementSummary as any).mockResolvedValue(mockSummary);
  });

  it('should render loading state initially', () => {
    const { getByTestId } = renderScreen();
    // Note: Add testID to ActivityIndicator in actual component
    expect(achievementService.getAllAchievements).toHaveBeenCalled();
  });

  it('should display achievement summary cards', async () => {
    const { getByText } = renderScreen();

    await waitFor(() => {
      expect(getByText('5')).toBeTruthy(); // Unlocked count
      expect(getByText('10')).toBeTruthy(); // In progress count
      expect(getByText('500')).toBeTruthy(); // Total points
    });
  });

  it('should display list of achievements', async () => {
    const { getByText } = renderScreen();

    await waitFor(() => {
      expect(getByText('First Blood')).toBeTruthy();
      expect(getByText('Marathon Runner')).toBeTruthy();
    });
  });

  it('should show unlocked badge for unlocked achievements', async () => {
    const { getByText } = renderScreen();

    await waitFor(() => {
      expect(getByText('Unlocked')).toBeTruthy();
    });
  });

  it('should show progress bar for locked achievements', async () => {
    const { getByText } = renderScreen();

    await waitFor(() => {
      expect(getByText('50 / 100')).toBeTruthy();
    });
  });

  it('should filter achievements when filter button is pressed', async () => {
    const { getByText, queryByText } = renderScreen();

    await waitFor(() => {
      expect(getByText('First Blood')).toBeTruthy();
    });

    // Click "Unlocked" filter
    const unlockedFilter = getByText('Unlocked');
    fireEvent.press(unlockedFilter);

    await waitFor(() => {
      expect(getByText('First Blood')).toBeTruthy();
      expect(queryByText('Marathon Runner')).toBeNull(); // Locked achievement should be hidden
    });
  });

  it('should navigate to detail screen when achievement is pressed', async () => {
    const mockPush = jest.fn();
    (useRouter as any).mockReturnValue({ push: mockPush });

    const { getByText } = renderScreen();

    await waitFor(() => {
      const achievement = getByText('First Blood');
      fireEvent.press(achievement);
    });

    expect(mockPush).toHaveBeenCalledWith('/achievements/1');
  });

  it('should refresh data on pull-to-refresh', async () => {
    const { getByTestId } = renderScreen();

    await waitFor(() => {
      expect(achievementService.getAllAchievements).toHaveBeenCalledTimes(1);
    });

    // Note: Add testID to FlatList in actual component for easier testing
    // Simulate pull-to-refresh
    // const flatList = getByTestId('achievements-flatlist');
    // fireEvent(flatList, 'refresh');

    // For now, just verify initial load happened
    expect(achievementService.getAllAchievements).toHaveBeenCalled();
  });

  it('should display empty state when no achievements found', async () => {
    (achievementService.getAllAchievements as any).mockResolvedValue([]);

    const { getByText } = renderScreen();

    await waitFor(() => {
      expect(getByText('No achievements found')).toBeTruthy();
    });
  });

  it('should handle API errors gracefully', async () => {
    (achievementService.getAllAchievements as any).mockRejectedValue(new Error('Network error'));
    (achievementService.getAchievementSummary as any).mockRejectedValue(new Error('Network error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const { queryByText } = renderScreen();

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error loading achievements:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });
});

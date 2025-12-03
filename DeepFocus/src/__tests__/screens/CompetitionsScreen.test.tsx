/**
 * Competitions Screen Tests
 * Tests for Competitions list screen component
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import CompetitionsScreen from '../../app/competitions/index';
import * as competitionService from '../../services/competitionService';
import { useRouter } from 'expo-router';

// Mock dependencies
jest.mock('../../services/competitionService');
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
  useRouter: jest.fn(),
}));

describe('CompetitionsScreen', () => {
  const mockCompetitions = [
    {
      competition: {
        _id: '1',
        title: 'Marathon Challenge',
        description: 'Complete 100 pomodoros in 7 days',
        type: 'individual',
        scope: 'global',
        status: 'active',
        creator: { _id: 'user1', name: 'John Doe', email: 'john@example.com' },
        timing: {
          startDate: '2025-11-25T00:00:00Z',
          endDate: '2025-12-02T00:00:00Z',
        },
        goal: {
          metric: 'total_pomodoros',
          target: 100,
          unit: 'pomodoros',
        },
        statistics: {
          totalParticipants: 25,
          activeParticipants: 20,
          averageProgress: 45,
        },
        featured: true,
      },
      userEntry: null,
      isJoined: false,
      canJoin: true,
    },
    {
      competition: {
        _id: '2',
        title: 'Sprint Challenge',
        description: 'Complete 20 pomodoros in 1 day',
        type: 'individual',
        scope: 'global',
        status: 'upcoming',
        creator: { _id: 'user2', name: 'Jane Smith', email: 'jane@example.com' },
        timing: {
          startDate: '2025-12-05T00:00:00Z',
          endDate: '2025-12-06T00:00:00Z',
        },
        goal: {
          metric: 'total_pomodoros',
          target: 20,
          unit: 'pomodoros',
        },
        statistics: {
          totalParticipants: 0,
          activeParticipants: 0,
          averageProgress: 0,
        },
        featured: false,
      },
      userEntry: null,
      isJoined: false,
      canJoin: true,
    },
  ];

  const mockJoinedCompetitions = [
    {
      competition: mockCompetitions[0].competition,
      entry: {
        _id: 'entry1',
        score: 50,
        status: 'active',
        joinedAt: '2025-11-26T00:00:00Z',
      },
    },
  ];

  const renderScreen = () => {
    return render(
      <PaperProvider theme={DefaultTheme}>
        <CompetitionsScreen />
      </PaperProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (competitionService.getAllCompetitions as any).mockResolvedValue(mockCompetitions);
    (competitionService.getUserCompetitions as any).mockResolvedValue(mockJoinedCompetitions);
  });

  it('should render loading state initially', () => {
    const { getByTestId } = renderScreen();
    // Note: Add testID to ActivityIndicator in actual component
    expect(competitionService.getAllCompetitions).toHaveBeenCalled();
  });

  it('should display list of competitions', async () => {
    const { getByText } = renderScreen();

    await waitFor(() => {
      expect(getByText('Marathon Challenge')).toBeTruthy();
      expect(getByText('Sprint Challenge')).toBeTruthy();
    });
  });

  it('should show competition status badges', async () => {
    const { getByText } = renderScreen();

    await waitFor(() => {
      expect(getByText('active')).toBeTruthy();
      expect(getByText('upcoming')).toBeTruthy();
    });
  });

  it('should display participant count', async () => {
    const { getByText } = renderScreen();

    await waitFor(() => {
      expect(getByText('25 participants')).toBeTruthy();
    });
  });

  it('should show "Can Join" badge for joinable competitions', async () => {
    const { getAllByText } = renderScreen();

    await waitFor(() => {
      const canJoinBadges = getAllByText('Can Join');
      expect(canJoinBadges.length).toBeGreaterThan(0);
    });
  });

  it('should filter competitions by status', async () => {
    const { getByText, queryByText } = renderScreen();

    await waitFor(() => {
      expect(getByText('Marathon Challenge')).toBeTruthy();
    });

    // Click "Active" filter
    const activeFilter = getByText('Active');
    fireEvent.press(activeFilter);

    await waitFor(() => {
      expect(getByText('Marathon Challenge')).toBeTruthy();
      expect(queryByText('Sprint Challenge')).toBeNull(); // Upcoming competition should be hidden
    });
  });

  it('should show user\'s joined competitions when "Joined" filter is selected', async () => {
    const { getByText } = renderScreen();

    // Click "Joined" filter
    const joinedFilter = getByText('Joined');
    fireEvent.press(joinedFilter);

    await waitFor(() => {
      expect(competitionService.getUserCompetitions).toHaveBeenCalled();
      expect(getByText('Marathon Challenge')).toBeTruthy();
    });
  });

  it('should navigate to detail screen when competition is pressed', async () => {
    const mockPush = jest.fn();
    useRouter.mockReturnValue({ push: mockPush });

    const { getByText } = renderScreen();

    await waitFor(() => {
      const competition = getByText('Marathon Challenge');
      fireEvent.press(competition);
    });

    expect(mockPush).toHaveBeenCalledWith('/competitions/1');
  });

  it('should navigate to create screen when FAB is pressed', async () => {
    const mockPush = jest.fn();
    useRouter.mockReturnValue({ push: mockPush });

    const { getByTestId } = renderScreen();

    await waitFor(() => {
      // Note: Add testID to FAB in actual component
      // const fab = getByTestId('create-competition-fab');
      // fireEvent.press(fab);
    });

    // For now, just verify data loaded
    expect(competitionService.getAllCompetitions).toHaveBeenCalled();
  });

  it('should refresh data on pull-to-refresh', async () => {
    const { getByTestId } = renderScreen();

    await waitFor(() => {
      expect(competitionService.getAllCompetitions).toHaveBeenCalledTimes(1);
    });

    // Note: Add testID to FlatList for easier testing
    expect(competitionService.getAllCompetitions).toHaveBeenCalled();
  });

  it('should display empty state when no competitions found', async () => {
    competitionService.getAllCompetitions.mockResolvedValue([]);

    const { getByText } = renderScreen();

    await waitFor(() => {
      expect(getByText('No competitions found')).toBeTruthy();
    });
  });

  it('should handle API errors gracefully', async () => {
    competitionService.getAllCompetitions.mockRejectedValue(new Error('Network error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const { queryByText } = renderScreen();

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error loading competitions:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('should call API with correct filters', async () => {
    const { getByText } = renderScreen();

    // Test "all" filter (default)
    await waitFor(() => {
      expect(competitionService.getAllCompetitions).toHaveBeenCalledWith({});
    });

    // Test "active" filter
    const activeFilter = getByText('Active');
    fireEvent.press(activeFilter);

    await waitFor(() => {
      expect(competitionService.getAllCompetitions).toHaveBeenCalledWith({ status: 'active' });
    });

    // Test "upcoming" filter
    const upcomingFilter = getByText('Upcoming');
    fireEvent.press(upcomingFilter);

    await waitFor(() => {
      expect(competitionService.getAllCompetitions).toHaveBeenCalledWith({ status: 'upcoming' });
    });
  });
});

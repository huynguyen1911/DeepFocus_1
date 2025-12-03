/**
 * Competition Service Tests
 * Tests for Competition API integration
 */

import * as competitionService from '../services/competitionService';
import * as api from '../services/api';

// Mock the api module
jest.mock('../services/api');

describe('CompetitionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllCompetitions', () => {
    it('should fetch all competitions without filters', async () => {
      const mockCompetitions = [
        {
          competition: {
            _id: '1',
            title: 'Test Competition',
            status: 'active',
          },
          userEntry: null,
          isJoined: false,
          canJoin: true,
        },
      ];

      api.get.mockResolvedValue({ data: { data: mockCompetitions } });

      const result = await competitionService.getAllCompetitions();

      expect(api.get).toHaveBeenCalledWith('/api/competitions?');
      expect(result).toEqual(mockCompetitions);
    });

    it('should fetch competitions with filters', async () => {
      const mockCompetitions = [];

      api.get.mockResolvedValue({ data: { data: mockCompetitions } });

      await competitionService.getAllCompetitions({
        status: 'active',
        scope: 'global',
        featured: true,
      });

      expect(api.get).toHaveBeenCalledWith('/api/competitions?status=active&scope=global&featured=true');
    });
  });

  describe('getCompetitionDetail', () => {
    it('should fetch competition detail by ID', async () => {
      const mockDetail = {
        competition: {
          _id: '123',
          title: 'Marathon Competition',
          status: 'active',
        },
        userEntry: null,
        isJoined: false,
        canJoin: true,
        topParticipants: [],
        isCreator: false,
      };

      api.get.mockResolvedValue({ data: { data: mockDetail } });

      const result = await competitionService.getCompetitionDetail('123');

      expect(api.get).toHaveBeenCalledWith('/api/competitions/123');
      expect(result).toEqual(mockDetail);
    });
  });

  describe('getUserCompetitions', () => {
    it('should fetch user\'s competitions', async () => {
      const mockCompetitions = [
        {
          competition: { _id: '1', title: 'My Competition' },
          entry: { score: 100 },
        },
      ];

      api.get.mockResolvedValue({ data: { data: mockCompetitions } });

      const result = await competitionService.getUserCompetitions();

      expect(api.get).toHaveBeenCalledWith('/api/competitions/my-competitions');
      expect(result).toEqual(mockCompetitions);
    });
  });

  describe('createCompetition', () => {
    it('should create a new competition', async () => {
      const mockCompetition = {
        _id: 'new-comp-id',
        title: 'New Competition',
        status: 'upcoming',
      };

      const competitionData = {
        title: 'New Competition',
        description: 'Test description',
        type: 'individual' as const,
        scope: 'global' as const,
        timing: {
          startDate: '2025-12-01T00:00:00Z',
          endDate: '2025-12-08T00:00:00Z',
        },
        goal: {
          metric: 'total_pomodoros',
          target: 100,
          unit: 'pomodoros',
        },
      };

      api.post.mockResolvedValue({ data: { data: mockCompetition } });

      const result = await competitionService.createCompetition(competitionData);

      expect(api.post).toHaveBeenCalledWith('/api/competitions', competitionData);
      expect(result).toEqual(mockCompetition);
    });
  });

  describe('joinCompetition', () => {
    it('should join a competition', async () => {
      const mockEntry = {
        _id: 'entry-id',
        competition: 'comp-123',
        score: 0,
        status: 'active',
      };

      api.post.mockResolvedValue({ data: { data: mockEntry } });

      const result = await competitionService.joinCompetition('comp-123');

      expect(api.post).toHaveBeenCalledWith('/api/competitions/comp-123/join');
      expect(result).toEqual(mockEntry);
    });
  });

  describe('leaveCompetition', () => {
    it('should leave a competition without reason', async () => {
      api.post.mockResolvedValue({ data: {} });

      await competitionService.leaveCompetition('comp-123');

      expect(api.post).toHaveBeenCalledWith('/api/competitions/comp-123/leave', { reason: undefined });
    });

    it('should leave a competition with reason', async () => {
      api.post.mockResolvedValue({ data: {} });

      await competitionService.leaveCompetition('comp-123', 'Too busy');

      expect(api.post).toHaveBeenCalledWith('/api/competitions/comp-123/leave', { reason: 'Too busy' });
    });
  });

  describe('getLeaderboard', () => {
    it('should fetch leaderboard without options', async () => {
      const mockLeaderboard = {
        entries: [],
        totalCount: 0,
        limit: 10,
        skip: 0,
      };

      api.get.mockResolvedValue({ data: { data: mockLeaderboard } });

      const result = await competitionService.getLeaderboard('comp-123');

      expect(api.get).toHaveBeenCalledWith('/api/competitions/comp-123/leaderboard?');
      expect(result).toEqual(mockLeaderboard);
    });

    it('should fetch leaderboard with pagination options', async () => {
      const mockLeaderboard = {
        entries: [],
        totalCount: 100,
        limit: 20,
        skip: 40,
      };

      api.get.mockResolvedValue({ data: { data: mockLeaderboard } });

      const result = await competitionService.getLeaderboard('comp-123', { limit: 20, skip: 40 });

      expect(api.get).toHaveBeenCalledWith('/api/competitions/comp-123/leaderboard?limit=20&skip=40');
      expect(result).toEqual(mockLeaderboard);
    });
  });

  describe('updateProgress', () => {
    it('should update competition progress', async () => {
      api.post.mockResolvedValue({ data: {} });

      await competitionService.updateProgress('comp-123', { currentValue: 50 });

      expect(api.post).toHaveBeenCalledWith('/api/competitions/comp-123/progress', {
        progressData: { currentValue: 50 },
      });
    });
  });
});

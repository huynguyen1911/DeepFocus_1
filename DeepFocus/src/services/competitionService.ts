import api from './api';

export interface Competition {
  _id: string;
  title: string;
  description: string;
  type: 'individual' | 'team';
  scope: 'global' | 'class' | 'friends' | 'private';
  visibility: 'public' | 'private' | 'invite_only';
  status: 'draft' | 'upcoming' | 'active' | 'completed' | 'cancelled';
  creator: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  class?: {
    _id: string;
    name: string;
    code: string;
  };
  timing: {
    startDate: string;
    endDate: string;
    timezone?: string;
  };
  goal: {
    metric: 'total_pomodoros' | 'total_focus_time' | 'daily_streak' | 'tasks_completed';
    target: number;
    unit: string;
  };
  rules: {
    allowLateJoin: boolean;
    lateJoinDeadline?: string;
    maxParticipants?: number;
  };
  statistics: {
    totalParticipants: number;
    activeParticipants: number;
    averageProgress: number;
  };
  featured?: boolean;
}

export interface CompetitionEntry {
  _id: string;
  competition: Competition | string;
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  score: number;
  progress: {
    currentValue: number;
    target: number;
    percentage: number;
  };
  rank?: number;
  status: 'active' | 'withdrawn';
  joinedAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  score: number;
  progress: {
    currentValue: number;
    percentage: number;
  };
  isCurrentUser?: boolean;
}

class CompetitionService {
  async getAllCompetitions(filters?: {
    status?: string;
    scope?: string;
    type?: string;
    featured?: boolean;
  }): Promise<{ competition: Competition; userEntry: CompetitionEntry | null; isJoined: boolean; canJoin: boolean }[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.scope) params.append('scope', filters.scope);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.featured !== undefined) params.append('featured', String(filters.featured));

    const response = await api.get(`/api/competitions?${params.toString()}`);
    return response.data.data;
  }

  async getCompetitionDetail(competitionId: string): Promise<{
    competition: Competition;
    userEntry: CompetitionEntry | null;
    isJoined: boolean;
    canJoin: boolean;
    canJoinReason?: string;
    topParticipants: CompetitionEntry[];
    isCreator: boolean;
  }> {
    const response = await api.get(`/api/competitions/${competitionId}`);
    return response.data.data;
  }

  async getUserCompetitions(): Promise<{ competition: Competition; entry: CompetitionEntry }[]> {
    const response = await api.get('/api/competitions/my-competitions');
    return response.data.data;
  }

  async createCompetition(data: {
    title: string;
    description: string;
    type: 'individual' | 'team';
    scope: 'global' | 'class' | 'friends' | 'private';
    timing: {
      startDate: string;
      endDate: string;
    };
    goal: {
      metric: string;
      target: number;
      unit: string;
    };
    rules?: {
      allowLateJoin?: boolean;
      maxParticipants?: number;
    };
    classId?: string;
  }): Promise<Competition> {
    const response = await api.post('/api/competitions', data);
    return response.data.data;
  }

  async joinCompetition(competitionId: string): Promise<CompetitionEntry> {
    const response = await api.post(`/api/competitions/${competitionId}/join`);
    return response.data.data;
  }

  async leaveCompetition(competitionId: string, reason?: string): Promise<void> {
    await api.post(`/api/competitions/${competitionId}/leave`, { reason });
  }

  async getLeaderboard(
    competitionId: string,
    options?: { limit?: number; skip?: number }
  ): Promise<{
    entries: LeaderboardEntry[];
    totalCount: number;
    limit: number;
    skip: number;
  }> {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', String(options.limit));
    if (options?.skip) params.append('skip', String(options.skip));

    const response = await api.get(`/api/competitions/${competitionId}/leaderboard?${params.toString()}`);
    return response.data.data;
  }

  async updateProgress(competitionId: string, progressData: { currentValue: number }): Promise<void> {
    await api.post(`/api/competitions/${competitionId}/progress`, { progressData });
  }
}

export default new CompetitionService();

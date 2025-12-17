// Type definitions for Focus Training feature

export interface Challenge {
  type: 'focus' | 'breathing' | 'mindfulness' | 'break';
  title: string;
  description: string;
  duration: number;
  points: number;
  completed: boolean;
  completedAt?: string;
  score?: number;
}

export interface TrainingDay {
  _id: string;
  date: string;
  dayNumber: number;
  type: 'training' | 'rest';
  status: 'upcoming' | 'completed' | 'missed';
  completionPercentage: number;
  totalPoints: number;
  aiEncouragement?: string;
  challenges?: Challenge[];
}

export interface Plan {
  _id: string;
  title: string;
  description: string;
  totalWeeks: number;
  startDate: string;
  endDate: string;
  completionRate: number;
  currentStreak: number;
  totalPoints: number;
}

export interface AssessmentResponse {
  assessmentId: string;
  analysis: string;
  recommendations: string[];
  suggestedDuration: number;
  focusScore: number;
}

export interface PlanResponse {
  plan: Plan;
}

export interface TrainingDayResponse {
  trainingDay: TrainingDay;
}

export interface DaysResponse {
  days: TrainingDay[];
}

export interface CompleteChallengeResponse {
  data: {
    data: {
      points: number;
      dayCompleted: boolean;
    };
  };
}

export interface TrainingDaysMap {
  [key: string]: TrainingDay;
}

export type ResponseValue = string | number | string[];

export interface Responses {
  [key: string]: ResponseValue;
  focusLevel: number;
  distractionLevel: number;
  motivationLevel: number;
  energyLevel: number;
  stressLevel: number;
  primaryGoal: string;
  availableTimePerDay: number;
  preferredSessionLength: number;
  experienceLevel: string;
  distractions: string[];
}

// @ts-nocheck
/**
 * Focus Training Context - Global State Management
 * Manages the state of focus training flow to prevent navigation issues
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@focus_training_state';

interface FocusTrainingState {
  isGeneratingPlan: boolean;
  hasActivePlan: boolean;
  assessmentId: string | null;
  analysisData: any | null;
  planData: any | null;
  isBackgroundProcessing: boolean; // User navigated away while generating
  generationStartTime: number | null; // Track when generation started
}

interface FocusTrainingContextType extends FocusTrainingState {
  startPlanGeneration: (assessmentId: string, analysisData: any) => void;
  completePlanGeneration: (planData: any) => void;
  resetState: () => void;
  setActivePlan: (hasActivePlan: boolean) => void;
  navigateAwayFromGeneration: () => void; // User pressed "Go to Home"
  checkPlanStatus: () => Promise<any>; // Poll for plan completion
}

const FocusTrainingContext = createContext<FocusTrainingContextType | undefined>(undefined);

const initialState: FocusTrainingState = {
  isGeneratingPlan: false,
  hasActivePlan: false,
  assessmentId: null,
  analysisData: null,
  planData: null,
  isBackgroundProcessing: false,
  generationStartTime: null,
};

export const FocusTrainingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<FocusTrainingState>(initialState);
  const [isLoading, setIsLoading] = useState(true);

  // Load state from AsyncStorage on mount
  useEffect(() => {
    loadState();
  }, []);

  // Save state to AsyncStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      saveState();
    }
  }, [state, isLoading]);

  const loadState = async () => {
    try {
      const savedState = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        setState(parsed);
        console.log('📦 Loaded focus training state:', parsed);
      }
    } catch (error) {
      console.error('Error loading focus training state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveState = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      console.log('💾 Saved focus training state');
    } catch (error) {
      console.error('Error saving focus training state:', error);
    }
  };

  const startPlanGeneration = (assessmentId: string, analysisData: any) => {
    console.log('🚀 Starting plan generation');
    setState({
      ...state,
      isGeneratingPlan: true,
      assessmentId,
      analysisData,
      generationStartTime: Date.now(),
      isBackgroundProcessing: false,
    });
  };

  const navigateAwayFromGeneration = () => {
    console.log('🏠 User navigated away - switching to background processing');
    setState({
      ...state,
      isBackgroundProcessing: true,
    });
  };

  const checkPlanStatus = async () => {
    // This would poll the backend to check if plan generation is complete
    // For now, return the current state
    return {
      isComplete: state.hasActivePlan,
      planData: state.planData,
    };
  };

  const completePlanGeneration = (planData: any) => {
    console.log('✅ Plan generation completed');
    setState({
      ...state,
      isGeneratingPlan: false,
      hasActivePlan: true,
      planData,
      isBackgroundProcessing: false,
      generationStartTime: null,
    });
  };

  const setActivePlan = (hasActivePlan: boolean) => {
    setState({
      ...state,
      hasActivePlan,
    });
  };

  const resetState = () => {
    console.log('🔄 Resetting focus training state');
    setState(initialState);
    AsyncStorage.removeItem(STORAGE_KEY);
  };

  const contextValue: FocusTrainingContextType = {
    ...state,
    startPlanGeneration,
    completePlanGeneration,
    resetState,
    setActivePlan,
    navigateAwayFromGeneration,
    checkPlanStatus,
  };

  if (isLoading) {
    return null; // or a loading spinner
  }

  return (
    <FocusTrainingContext.Provider value={contextValue}>
      {children}
    </FocusTrainingContext.Provider>
  );
};

export const useFocusTraining = () => {
  const context = useContext(FocusTrainingContext);
  if (context === undefined) {
    throw new Error('useFocusTraining must be used within FocusTrainingProvider');
  }
  return context;
};

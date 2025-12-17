import React from 'react';
import AIPlannerNavigator from '@/src/navigation/AIPlannerNavigator';

/**
 * AI Planner Tab
 * 
 * Premium feature (free during testing) - AI-powered focus plan generator
 * 
 * Flow:
 * 1. Welcome screen - Introduction to AI Planner
 * 2. Assessment Intro - Explain 7-question survey
 * 3. Assessment - 7 interactive questions about focus habits
 * 4. AI Analysis - AI processes responses with fun facts
 * 5. Personalized Plan - AI-generated focus plan with coach personality
 * 
 * User can access this tab anytime to:
 * - Take/retake the assessment
 * - Generate new AI plans based on current needs
 * - View saved plans
 */
export default function AIPlannerTab() {
  return <AIPlannerNavigator />;
}

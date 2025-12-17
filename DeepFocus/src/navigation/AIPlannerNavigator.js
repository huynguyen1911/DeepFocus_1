import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import WelcomeScreen from "../screens/AIPlanner/WelcomeScreen";
import AssessmentIntroScreen from "../screens/AIPlanner/AssessmentIntroScreen";
import AssessmentScreen from "../screens/AIPlanner/AssessmentScreen";
import AIAnalysisScreen from "../screens/AIPlanner/AIAnalysisScreen";
import PersonalizedPlanScreen from "../screens/AIPlanner/PersonalizedPlanScreen";

const Stack = createStackNavigator();

const AIPlannerNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: ({ current: { progress } }) => ({
          cardStyle: {
            opacity: progress,
          },
        }),
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="AssessmentIntro" component={AssessmentIntroScreen} />
      <Stack.Screen name="Assessment" component={AssessmentScreen} />
      <Stack.Screen name="AIAnalysis" component={AIAnalysisScreen} />
      <Stack.Screen
        name="PersonalizedPlan"
        component={PersonalizedPlanScreen}
      />
    </Stack.Navigator>
  );
};

export default AIPlannerNavigator;

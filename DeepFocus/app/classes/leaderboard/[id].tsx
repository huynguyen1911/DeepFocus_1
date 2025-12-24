import { Stack } from "expo-router";
import LeaderboardScreen from "../../../src/screens/LeaderboardScreen";

export default function LeaderboardPage() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LeaderboardScreen />
    </>
  );
}

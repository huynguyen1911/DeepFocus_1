import { Redirect } from 'expo-router';

// This screen redirects to the actual guardian dashboard
// It exists only to satisfy the tab structure
export default function GuardianTabScreen() {
  return <Redirect href="/guardian/dashboard" />;
}

import { Redirect } from 'expo-router';

export default function Index() {
  // This will be handled by RootLayoutNav
  return <Redirect href="/(auth)/login" />;
}

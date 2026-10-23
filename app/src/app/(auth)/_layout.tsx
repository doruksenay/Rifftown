import { Redirect, Stack } from 'expo-router';
import { useSession } from '@/lib/session';
import { useColors } from '@/theme';

export default function AuthLayout() {
  const { ready, token } = useSession();
  const c = useColors();
  if (ready && token) return <Redirect href="/" />;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.paper } }} />;
}

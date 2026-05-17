import { Redirect, Stack } from 'expo-router'
import { useAuthStore } from '../../src/store/auth.store'

export default function AppLayout() {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />
  }

  return <Stack screenOptions={{ headerShown: false }} />
}

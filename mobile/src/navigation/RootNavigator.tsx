import { useEffect } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { View, ActivityIndicator } from 'react-native'
import { useAuthStore } from '../store/auth.store'
import { AuthNavigator } from './AuthNavigator'
import { MainNavigator } from './MainNavigator'
import { Colors } from '../theme/colors'
import type { RootStackParamList } from './types'

const Stack = createNativeStackNavigator<RootStackParamList>()

export function RootNavigator() {
  const { isAuthenticated, isLoading, loadFromStorage } = useAuthStore()

  useEffect(() => {
    console.log('RootNavigator: loading from storage...')
    loadFromStorage()
  }, [])

  console.log('RootNavigator state:', { isAuthenticated, isLoading })

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.brand} />
      </View>
    )
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  )
}

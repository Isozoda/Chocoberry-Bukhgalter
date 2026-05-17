import '../src/i18n'
import React, { useEffect } from 'react'
import { StyleSheet } from 'react-native'
import { Stack } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import Toast from 'react-native-toast-message'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import i18n from '../src/i18n'
import { useAuth } from '../src/hooks/useAuth'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    },
  },
})

function AppBootstrap({ children }: { children: React.ReactNode }) {
  const { restoreSession } = useAuth()
  useEffect(() => { restoreSession() }, [])
  return <>{children}</>
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <I18nextProvider i18n={i18n}>
            <BottomSheetModalProvider>
              <AppBootstrap>
                <Stack screenOptions={{ headerShown: false }} />
              </AppBootstrap>
              <Toast />
            </BottomSheetModalProvider>
          </I18nextProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({ root: { flex: 1 } })

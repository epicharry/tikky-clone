import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from '../contexts/AppContext';
import * as SplashScreen from 'expo-splash-screen';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="light" backgroundColor="#000" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#000' },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="record" />
          <Stack.Screen name="profile/[userID]" />
          <Stack.Screen name="+not-found" />
        </Stack>
      </AppProvider>
    </SafeAreaProvider>
  );
}

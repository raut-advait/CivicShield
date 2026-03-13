import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';

void SplashScreen.preventAutoHideAsync();

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#16384C',
    secondary: '#D97757',
    background: '#F4F1EA',
    surface: '#FFFFFF',
    surfaceVariant: '#EEF0EC',
    outline: '#D7DBD2',
  },
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <PaperProvider theme={theme}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#F4F1EA' },
          headerTintColor: '#16384C',
          headerTitleStyle: {
            fontFamily: 'Manrope_700Bold',
            fontSize: 18,
          },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: '#F4F1EA' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="result"
          options={{
            title: 'Verification',
            headerBackTitle: 'Back',
          }}
        />
      </Stack>
    </PaperProvider>
  );
}

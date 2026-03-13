import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2563EB',
    secondary: '#F59E0B',
    background: '#F3F4F6',
    surface: '#FFFFFF',
  },
};

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#2563EB' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '700', fontSize: 18 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: '#F3F4F6' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="result"
          options={{
            title: 'Fact Check Result',
            headerBackTitle: 'Back',
          }}
        />
      </Stack>
    </PaperProvider>
  );
}

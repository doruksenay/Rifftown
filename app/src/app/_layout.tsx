import { Nunito_500Medium, Nunito_700Bold, Nunito_800ExtraBold, useFonts } from '@expo-google-fonts/nunito';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from '@/components/ui';
import { I18nProvider, useI18n } from '@/lib/i18n';
import { SessionProvider } from '@/lib/session';
import { fonts, useColors } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    // Fredoka'nın Türkçe harfleri (Ş ş Ğ ğ İ) eklenmiş sürümü: assets/fonts/README.md
    RifftownDisplay_600SemiBold: require('../../assets/fonts/RifftownDisplay-SemiBold.ttf'),
    RifftownDisplay_700Bold: require('../../assets/fonts/RifftownDisplay-Bold.ttf'),
    Nunito_500Medium,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: 1, staleTime: 5000, refetchOnWindowFocus: true } },
      }),
  );

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync().catch(() => {});
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <I18nProvider>
          <ToastProvider>
            <SessionProvider>
              <Navigator />
            </SessionProvider>
          </ToastProvider>
        </I18nProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

function Navigator() {
  const c = useColors();
  const { t } = useI18n();
  const scheme = useColorScheme();
  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: c.paper },
          headerTintColor: c.ink,
          headerTitleStyle: { fontFamily: fonts.display, fontSize: 22 },
          headerShadowVisible: false,
          headerBackTitle: t('back'),
          contentStyle: { backgroundColor: c.paper },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="create-character" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

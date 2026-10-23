import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect, Tabs } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { LevelUpCelebration } from '@/components/level-up';
import { ErrorView, Loading } from '@/components/ui';
import { useI18n } from '@/lib/i18n';
import { syncPurchasesUser } from '@/lib/purchases';
import { registerForPush } from '@/lib/push';
import { useMe, useSession } from '@/lib/session';
import { fonts, useColors } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

export default function TabsLayout() {
  const { ready, token } = useSession();
  const me = useMe();
  const { t } = useI18n();
  const c = useColors();
  const hasCharacter = !!me.data?.character;

  useEffect(() => {
    if (hasCharacter) registerForPush();
  }, [hasCharacter]);

  // Mağaza satın alımlarını oyundaki hesapla eşle (VIP bildirimi sunucuda bu kimlikle işlenir)
  const userId = me.data?.user.id ?? null;
  useEffect(() => {
    syncPurchasesUser(userId);
  }, [userId]);

  if (!ready) return <Loading />;
  if (!token) return <Redirect href="/login" />;
  if (me.isLoading) return <Loading />;
  if (me.error && !me.data) return <ErrorView error={me.error} onRetry={() => me.refetch()} />;
  if (!hasCharacter) return <Redirect href="/create-character" />;

  const icon =
    (name: IconName) =>
    ({ color, size }: { color: any; size: number }) => <Ionicons name={name} size={size - 2} color={color} />;

  return (
    <>
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.pink,
        tabBarInactiveTintColor: c.inkSoft,
        tabBarStyle: { backgroundColor: c.surface, borderTopColor: c.line, ...(Platform.OS === 'web' ? { height: 64 } : {}) },
        tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 11, lineHeight: 16 },
        tabBarItemStyle: Platform.OS === 'web' ? { paddingVertical: 6 } : undefined,
        tabBarBadgeStyle: { backgroundColor: c.pink, fontFamily: fonts.bodyBold, fontSize: 10 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('tabHome'), tabBarIcon: icon('musical-notes') }} />
      <Tabs.Screen name="city" options={{ title: t('tabCity'), tabBarIcon: icon('business') }} />
      <Tabs.Screen
        name="band"
        options={{
          title: t('tabBand'),
          tabBarIcon: icon('people'),
          tabBarBadge: me.data?.pendingInvites ? me.data.pendingInvites : undefined,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{ title: t('tabChat'), tabBarIcon: icon('chatbubbles'), tabBarBadge: me.data?.unreadMessages ? me.data.unreadMessages : undefined }}
      />
      <Tabs.Screen
        name="me"
        options={{
          title: t('tabMe'),
          tabBarIcon: icon('person'),
          tabBarBadge: me.data?.unreadNotifications ? me.data.unreadNotifications : undefined,
        }}
      />
    </Tabs>
    <LevelUpCelebration />
    </>
  );
}

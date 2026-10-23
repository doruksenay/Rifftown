import { useQueryClient } from '@tanstack/react-query';
import { type Href, Stack, router } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { Empty, ListRow, Screen } from '@/components/ui';
import { useGate } from '@/components/gate';
import { api } from '@/lib/api';
import { useNotifications } from '@/lib/hooks';
import { useI18n } from '@/lib/i18n';
import { useMe } from '@/lib/session';
import { notificationHref, notificationText } from '@/lib/notify-text';
import { space, useColors } from '@/theme';

export default function Notifications() {
  const gate = useGate();
  if (gate) return gate;
  return <NotificationsScreen />;
}

function NotificationsScreen() {
  const { t, p, locale, lang } = useI18n();
  const c = useColors();
  const notes = useNotifications();
  const me = useMe();
  const qc = useQueryClient();

  // Ekran açılınca hepsini okundu say
  useEffect(() => {
    api
      .post('/notifications/read')
      .then(() => qc.invalidateQueries({ queryKey: ['me'] }))
      .catch(() => {});
  }, [qc]);

  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: t('notifications') }} />
      <View style={{ height: space.md }} />
      {notes.data?.length ? (
        notes.data.map((n, i, arr) => {
          const href = notificationHref(n, me.data?.character?.id);
          return (
            <ListRow
              key={n.id}
              title={notificationText(n, t, p, lang)}
              subtitle={new Date(n.createdAt).toLocaleString(locale, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              left={<View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: n.read ? 'transparent' : c.pink }} />}
              onPress={href ? () => router.push(href as Href) : undefined}
              last={i === arr.length - 1}
            />
          );
        })
      ) : (
        <Empty text={t('noNotifications')} />
      )}
    </Screen>
  );
}

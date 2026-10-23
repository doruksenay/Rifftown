// Ana ekranın tek gösterişli öğesi: süren eylem, neon bir konser bileti koçanı gibi.

import { type ActionDto, CITY_BY_ID, LOCATION_BY_ID } from '@rifftown/shared';
import { useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Alert, Platform, Text, View } from 'react-native';
import { Button, Small } from '@/components/ui';
import { api } from '@/lib/api';
import { countdown } from '@/lib/format';
import { useRun } from '@/lib/hooks';
import { useI18n } from '@/lib/i18n';
import type { StringKey } from '@/lib/strings';
import { brand, fonts, gradients, radius, space, type, useColors } from '@/theme';

function useNow(active: boolean) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active]);
  return now;
}

export function ActionTicket({ action }: { action: ActionDto | null }) {
  const c = useColors();
  const { t, p, locale } = useI18n();
  const qc = useQueryClient();
  const { run, pending } = useRun();
  const now = useNow(!!action);
  const ends = action ? new Date(action.endsAt).getTime() : 0;
  const started = action ? new Date(action.startedAt).getTime() : 0;
  const left = ends - now;
  const progress = action ? Math.min(1, Math.max(0, (now - started) / Math.max(1, ends - started))) : 0;

  // Süre dolunca sunucudaki zamanlayıcının işi bitirmesi birkaç saniye sürebilir
  useEffect(() => {
    if (!action) return;
    const ms = Math.max(0, ends - Date.now()) + 2500;
    const id = setTimeout(() => qc.invalidateQueries(), ms);
    return () => clearTimeout(id);
  }, [action, ends, qc]);

  const place = (() => {
    if (!action) return null;
    if (action.kind === 'travel') {
      const to = CITY_BY_ID[String(action.params.to)];
      return to ? p(to.name) : null;
    }
    const loc = action.locationId ? LOCATION_BY_ID[action.locationId] : null;
    return loc ? p(loc.name) : null;
  })();

  const cancel = () => {
    const go = () => run(() => api.post('/actions/cancel'), { invalidate: ['me', 'songs', 'band'] });
    if (Platform.OS === 'web') {
      if (globalThis.confirm?.(t('cancelConfirm'))) go();
      return;
    }
    Alert.alert(t('cancelAction'), t('cancelConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('confirm'), style: 'destructive', onPress: go },
    ]);
  };

  const big = { fontFamily: fonts.display, fontSize: type.hero, lineHeight: type.hero * 1.1, fontVariant: ['tabular-nums' as const] };

  return (
    <View style={{ marginTop: space.lg }}>
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: c.surface,
          borderRadius: radius.card,
          borderWidth: 1.5,
          borderColor: action ? c.purple : c.line,
          overflow: 'hidden',
        }}
      >
        {/* Ana bölüm */}
        <View style={{ flex: 1, padding: space.lg }}>
          <Small>{t('nowDoing')}</Small>
          <Text style={{ fontFamily: fonts.display, fontSize: type.title, color: c.ink, marginTop: 2 }} numberOfLines={1}>
            {action ? t(`action_${action.kind}` as StringKey) : t('idle')}
          </Text>
          {action ? (
            <View style={{ marginTop: space.sm }} accessible accessibilityLabel={`${countdown(left)} ${t('remaining')}`}>
              <Text style={[big, { color: brand.cyan, position: 'absolute', left: 3, top: 3 }]} aria-hidden>
                {left > 0 ? countdown(left) : '00:00'}
              </Text>
              <Text style={[big, { color: c.pink }]}>{left > 0 ? countdown(left) : '00:00'}</Text>
            </View>
          ) : (
            <Small style={{ marginTop: space.sm }}>{t('idleHint')}</Small>
          )}
          {action && place ? <Small style={{ marginTop: space.xs }} numberOfLines={1}>{place}</Small> : null}
        </View>

        {/* Delikli ayırıcı */}
        <View style={{ width: 1, marginVertical: space.md, borderLeftWidth: 1.5, borderStyle: 'dashed', borderColor: action ? c.purple : c.line }} />
        <View style={{ position: 'absolute', right: 96 - 9, top: -9, width: 18, height: 18, borderRadius: 9, backgroundColor: c.paper, borderWidth: 1.5, borderColor: action ? c.purple : c.line }} />
        <View style={{ position: 'absolute', right: 96 - 9, bottom: -9, width: 18, height: 18, borderRadius: 9, backgroundColor: c.paper, borderWidth: 1.5, borderColor: action ? c.purple : c.line }} />

        {/* Koçan */}
        <View style={{ width: 96, padding: space.md, justifyContent: 'center', alignItems: 'center' }}>
          {action ? (
            <>
              <Text style={{ fontFamily: fonts.display, fontSize: type.lead, color: c.ink }}>
                {new Date(ends).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <Small style={{ textAlign: 'center' }}>{left > 0 ? t('endsAt') : t('finishing')}</Small>
            </>
          ) : (
            <Text style={{ fontFamily: fonts.display, fontSize: type.display, color: c.line }}>♪</Text>
          )}
        </View>
      </View>

      {action ? (
        <View style={{ height: 6, backgroundColor: c.line, marginTop: space.sm, borderRadius: 3, overflow: 'hidden' }}>
          <LinearGradient colors={gradients.progress} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: `${progress * 100}%`, height: '100%' }} />
        </View>
      ) : null}

      {action && action.kind !== 'travel' && left > 0 ? (
        <Button title={t('cancelAction')} variant="ghost" small onPress={cancel} loading={pending} style={{ alignSelf: 'flex-start', marginTop: space.xs, paddingHorizontal: 0 }} />
      ) : null}
    </View>
  );
}

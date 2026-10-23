// Seviye atlama anı: oyunun en güçlü ödülü. Yeni bir "skill_up" ya da "fame_up" bildirimi
// geldiğinde tam ekran küçük bir kutlama gösterilir. Her bildirim bir kez kutlanır.

import { ACHIEVEMENT_BY_ID, CITY_BY_ID, type NotificationDto, SKILL_BY_ID, levelUpText, tierOf } from '@rifftown/shared';
import { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Text, View } from 'react-native';
import { Body, Button, Small } from '@/components/ui';
import { useNotifications } from '@/lib/hooks';
import { useI18n } from '@/lib/i18n';
import { storage } from '@/lib/storage';
import { brand, fonts, radius, space, useColors } from '@/theme';

const KEY = 'celebrated';

export function LevelUpCelebration() {
  const notes = useNotifications();
  const { t, p, lang } = useI18n();
  const c = useColors();
  const [seen, setSeen] = useState<Set<number> | null>(null);
  const [current, setCurrent] = useState<NotificationDto | null>(null);
  const scale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    storage.get(KEY).then((v) => {
      try {
        setSeen(new Set(v ? (JSON.parse(v) as number[]) : []));
      } catch {
        setSeen(new Set());
      }
    });
  }, []);

  useEffect(() => {
    if (!seen || current) return;
    // Sadece okunmamış ve son 2 günde gelmiş seviye bildirimleri kutlanır
    const fresh = (notes.data ?? [])
      .filter((n) => (n.kind === 'skill_up' || n.kind === 'fame_up' || (n.kind === 'achievement' && ACHIEVEMENT_BY_ID[(n.data as any).id])) && !n.read && !seen.has(n.id))
      .filter((n) => Date.now() - new Date(n.createdAt).getTime() < 2 * 86400 * 1000)
      .sort((a, b) => a.id - b.id);
    if (fresh[0]) {
      setCurrent(fresh[0]);
      scale.setValue(0.6);
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }).start();
    }
  }, [notes.data, seen, current, scale]);

  const close = () => {
    if (!current || !seen) return;
    const next = new Set(seen);
    next.add(current.id);
    setSeen(next);
    storage.set(KEY, JSON.stringify([...next].slice(-200)));
    setCurrent(null);
  };

  if (!current) return null;
  const d = current.data as Record<string, any>;
  const isSkill = current.kind === 'skill_up';
  const ach = current.kind === 'achievement' ? ACHIEVEMENT_BY_ID[d.id] : null;
  const word = ach ? `+${ach.points}` : isSkill ? tierOf('skill', d.level).name[lang] : tierOf('fame', d.fame).name[lang];
  const line = ach
    ? p(ach.about)
    : isSkill
      ? levelUpText(d.skill, d.level, lang)
      : `${d.bandName}, ${CITY_BY_ID[d.cityId] ? p(CITY_BY_ID[d.cityId].name) : ''}`;
  const sub = ach ? p(ach.name) : isSkill && SKILL_BY_ID[d.skill] ? p(SKILL_BY_ID[d.skill].name) : null;
  const big = { fontFamily: fonts.display, fontSize: word.length > 12 ? 48 : 72, lineHeight: (word.length > 12 ? 48 : 72) * 1.15, textAlign: 'center' as const };

  return (
    <Modal transparent animationType="fade" visible onRequestClose={close}>
      <View style={{ flex: 1, backgroundColor: '#110933B3', alignItems: 'center', justifyContent: 'center', padding: space.xl }}>
        <Animated.View
          accessibilityViewIsModal
          style={{
            width: '100%',
            maxWidth: 380,
            backgroundColor: c.surface,
            borderRadius: radius.card,
            borderWidth: 1.5,
            borderColor: c.purple,
            padding: space.xl,
            alignItems: 'center',
            transform: [{ scale }],
          }}
        >
          <Small>{ach ? t('achievementUnlockedTitle') : isSkill ? t('levelUpTitle') : t('fameUpTitle')}</Small>
          {sub ? <Body style={{ marginTop: space.xs }}>{sub}</Body> : null}
          <View style={{ marginVertical: space.lg }} accessible accessibilityLabel={word}>
            <Text aria-hidden style={[big, { color: brand.cyan, position: 'absolute', left: 3, top: 3, right: -3 }]}>
              {word}
            </Text>
            <Text style={[big, { color: c.pink }]}>{word}</Text>
          </View>
          <Body style={{ textAlign: 'center', marginBottom: space.xl }}>{line}</Body>
          <Button title={t('great')} onPress={close} style={{ alignSelf: 'stretch' }} />
        </Animated.View>
      </View>
    </Modal>
  );
}

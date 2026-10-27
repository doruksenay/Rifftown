import {
  ATTR_START_MAX_PER,
  ATTR_START_POINTS,
  ATTRIBUTE_DEFS,
  type AttributeId,
  CITIES,
  GENRES,
  GENRE_NAMES,
  type Genre,
  INSTRUMENTS,
  type Instrument,
  ROLE_NAMES,
  defaultStartAllocation,
  startingAttributes,
} from '@rifftown/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { TierText } from '@/components/tier';
import { Avatar, Body, Button, Card, Choice, Field, Heading, Loading, Row, Screen, ScreenHeader, Small, useToast } from '@/components/ui';
import { money } from '@/lib/format';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { useMe, useSession } from '@/lib/session';
import { space, useColors } from '@/theme';

export default function CreateCharacter() {
  const { t, p, err } = useI18n();
  const { token, ready } = useSession();
  const me = useMe();
  const qc = useQueryClient();
  const toast = useToast();
  const c = useColors();
  const colors = useQuery({
    queryKey: ['avatar-colors'],
    queryFn: () => api.get<{ colors: string[] }>('/character/avatar-colors').then((r) => r.colors),
    enabled: !!token,
  });
  const [name, setName] = useState('');
  const [cityId, setCityId] = useState('istanbul');
  const [instrument, setInstrument] = useState<Instrument>('guitar');
  const [genre, setGenre] = useState<Genre>('rock');
  const [color, setColor] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Başlangıç puanları: oyuncu dokunana kadar ilk enstrümana göre varsayılan dağılım
  const [custom, setCustom] = useState<Partial<Record<AttributeId, number>> | null>(null);

  if (!ready) return <Loading />;
  if (!token) return <Redirect href="/login" />;
  if (me.data?.character) return <Redirect href="/" />;

  const countries = [...new Map(CITIES.map((ct) => [ct.countryCode, ct.country])).entries()];
  const alloc = custom ?? defaultStartAllocation(instrument);
  const placed = Object.values(alloc).reduce<number>((a, b) => a + (b ?? 0), 0);
  const left = ATTR_START_POINTS - placed;
  const preview = startingAttributes(instrument, alloc);
  const bump = (id: AttributeId, d: number) => {
    const cur = alloc[id] ?? 0;
    const next = cur + d;
    if (next < 0 || next > ATTR_START_MAX_PER || (d > 0 && left <= 0)) return;
    setCustom({ ...alloc, [id]: next });
  };
  const picked = color ?? colors.data?.[0] ?? '#0E6FBF';

  const submit = async () => {
    setBusy(true);
    try {
      await api.post('/character', { name: name.trim(), cityId, mainInstrument: instrument, favoriteGenre: genre, avatarColor: picked, startAttributes: alloc });
      await qc.invalidateQueries({ queryKey: ['me'] });
      router.replace('/');
    } catch (e) {
      toast(err(e), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <ScreenHeader title={t('createTitle')} />
      {me.data?.death ? (
        <Card style={{ marginBottom: space.lg, borderColor: c.danger }}>
          <Body>{t('deathTitle', { name: me.data.death.name })}</Body>
          <Small>{t(me.data.death.cause === 'old_age' ? 'deathCause_old_age' : 'deathCause_neglect')}</Small>
          {me.data.death.inheritance > 0 ? <Small>{t('deathInheritance', { money: money(me.data.death.inheritance) })}</Small> : null}
        </Card>
      ) : null}
      <Body color={c.inkSoft} style={{ marginBottom: space.xl }}>
        {t('createIntro')}
      </Body>

      <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
        <Avatar name={name || '?'} color={picked} size={56} />
        <View style={{ flex: 1 }}>
          <Field label={t('characterName')} hint={t('characterNameHint')} value={name} onChangeText={setName} maxLength={24} autoCorrect={false} />
        </View>
      </View>

      {colors.data ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginBottom: space.md }}>
          {colors.data.map((col) => (
            <Pressable
              key={col}
              accessibilityRole="radio"
              accessibilityLabel={`${t('color')} ${col}`}
              accessibilityState={{ selected: picked === col }}
              onPress={() => setColor(col)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: col,
                borderWidth: picked === col ? 3 : 0,
                borderColor: c.ink,
              }}
            />
          ))}
        </View>
      ) : null}

      <Heading>{t('startCity')}</Heading>
      {countries.map(([code, country]) => (
        <View key={code} style={{ marginBottom: space.md }}>
          <Body color={c.inkSoft} style={{ marginBottom: space.xs }}>
            {p(country)}
          </Body>
          <Choice
            options={CITIES.filter((ct) => ct.countryCode === code).map((ct) => ({ value: ct.id, label: p(ct.name) }))}
            value={cityId}
            onChange={setCityId}
          />
        </View>
      ))}

      <Heading>{t('mainInstrument')}</Heading>
      <Choice
        options={INSTRUMENTS.map((i) => ({ value: i, label: p(ROLE_NAMES[i]) }))}
        value={instrument}
        onChange={setInstrument}
      />

      <Heading>{t('favoriteGenre')}</Heading>
      <Choice options={GENRES.map((g) => ({ value: g, label: p(GENRE_NAMES[g]) }))} value={genre} onChange={setGenre} />

      <Heading>{t('startAttributes')}</Heading>
      <Small style={{ marginBottom: space.sm }}>{t('startAttributesHint', { n: left })}</Small>
      {ATTRIBUTE_DEFS.map((def) => (
        <Row key={def.id} style={{ alignItems: 'center', marginBottom: space.xs }}>
          <View style={{ flex: 1 }}>
            <Body>{p(def.name)}</Body>
            <TierText scale="attribute" value={preview[def.id]} />
          </View>
          <Button title="−" small variant="secondary" accessibilityLabel={`${p(def.name)} −1`} disabled={(alloc[def.id] ?? 0) <= 0} onPress={() => bump(def.id, -1)} />
          <Small style={{ minWidth: 28, textAlign: 'center' }}>{`+${alloc[def.id] ?? 0}`}</Small>
          <Button
            title="+"
            small
            variant="secondary"
            accessibilityLabel={`${p(def.name)} +1`}
            disabled={left <= 0 || (alloc[def.id] ?? 0) >= ATTR_START_MAX_PER}
            onPress={() => bump(def.id, 1)}
          />
        </Row>
      ))}

      <Button title={t('createCharacter')} onPress={submit} loading={busy} disabled={name.trim().length < 3 || left !== 0} style={{ marginTop: space.xxl }} />
    </Screen>
  );
}

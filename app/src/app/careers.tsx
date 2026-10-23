import { CITY_BY_ID, LOCATION_TYPE_NAMES, PROFESSIONS, PROFESSION_BY_ID } from '@rifftown/shared';
import { Stack, router } from 'expo-router';
import { View } from 'react-native';
import { ProfessionCard } from '@/components/careers';
import { useGate } from '@/components/gate';
import { Body, Button, Heading, Screen, Small } from '@/components/ui';
import { useI18n } from '@/lib/i18n';
import { useMe } from '@/lib/session';
import { space, useColors } from '@/theme';

export default function Careers() {
  const gate = useGate();
  if (gate) return gate;
  return <CareersScreen />;
}

function CareersScreen() {
  const { t, p } = useI18n();
  const c = useColors();
  const me = useMe();
  const ch = me.data!.character!;
  const mine = ch.profession ? PROFESSION_BY_ID[ch.profession.id] : null;
  const city = ch.cityId ? CITY_BY_ID[ch.cityId] : null;

  const goTo = (zone: string) => {
    const loc = city?.locations.find((l) => l.type === zone);
    if (loc) router.push(`/location/${loc.id}`);
  };

  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: t('careers') }} />
      <Body color={c.inkSoft} style={{ marginTop: space.lg }}>
        {t('careerIntro')}
      </Body>

      <Heading>{t('yourJob')}</Heading>
      {mine ? (
        <>
          <ProfessionCard prof={mine} />
          <Button title={p(LOCATION_TYPE_NAMES[mine.zone])} variant="secondary" small style={{ alignSelf: 'flex-start' }} disabled={!city} onPress={() => goTo(mine.zone)} />
        </>
      ) : (
        <Body color={c.inkSoft}>{t('noCareer')}</Body>
      )}

      <Heading>{t('careers')}</Heading>
      {PROFESSIONS.filter((prof) => prof.id !== mine?.id).map((prof) => (
        <View key={prof.id}>
          <ProfessionCard prof={prof} />
          <Small style={{ marginTop: -space.sm, marginBottom: space.md }}>
            {p(LOCATION_TYPE_NAMES[prof.zone])}
          </Small>
        </View>
      ))}
    </Screen>
  );
}

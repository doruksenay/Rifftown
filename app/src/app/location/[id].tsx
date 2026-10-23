import {
  HOSPITAL_PRICE_PER_HOUR,
  HOUR_OPTIONS,
  INSTRUMENTS,
  ITEM_BY_ID,
  LOCATION_BY_ID,
  LOCATION_TYPE_NAMES,
  SCHOOL_PRICE_PER_HOUR,
  SELL_BACK_RATE,
  ROLE_NAMES,
  SKILL_BY_ID,
  SKILL_CATEGORIES,
  SKILL_CATEGORY_NAMES,
  SKILL_DEFS,
  type SkillCategory,
  STUDIO_PRICE_PER_HOUR,
  type ShopType,
  CITY_BY_ID,
  type Genre,
  familiarityCap,
  knows,
  learnBlocker,
  tierName,
  VENUE_RULES,
  isShop,
  isVenue,
  itemsForShop,
  priceFor,
  type VenueType,
  BUSK_HOURS,
  type CivicType,
  type Instrument,
  ROLE_SKILLS,
  UNIVERSITY_PRICE_PER_HOUR,
  buskPayPerHour,
  roleSkill,
  stageScore,
  studyPlaceFor,
} from '@rifftown/shared';
import { Stack, router, useLocalSearchParams } from 'expo-router';

const CIVIC: string[] = ['city_hall', 'police', 'courthouse', 'plaza', 'newspaper', 'worship'];
import { CrimeOptions, Courtroom, PoliceDesk, Prison } from '@/components/justice';
import { RecordingStudio } from '@/components/records';
import { RealEstate } from '@/components/homes';
import { BusinessPanel, useBusiness } from '@/components/business';
import { Bank, FestivalPanel, Gym, Hotel, Restaurant, TattooStudio, Workshop } from '@/components/lifestyle';
import { ColorDot, FleaMarket } from '@/components/market';
import { ProfessionsHere, VipTag } from '@/components/careers';
import { Politics } from '@/components/politics';
import { useIsVip } from '@/lib/session';
import { useState } from 'react';
import { View } from 'react-native';
import { HoursAction } from '@/components/action-form';
import { Body, Button, Card, Choice, Empty, Heading, ListRow, Row, Screen, Small, Strong } from '@/components/ui';
import { useGate } from '@/components/gate';
import { api } from '@/lib/api';
import { dateTime, money } from '@/lib/format';
import { TierText } from '@/components/tier';
import { useBand, useCity, useInventory, useRun } from '@/lib/hooks';
import { itemBonusText, itemDisplayName } from '@/lib/item-text';
import { useI18n } from '@/lib/i18n';
import type { StringKey } from '@/lib/strings';
import { useMe } from '@/lib/session';
import { space, useColors } from '@/theme';

export default function LocationScreen() {
  const gate = useGate();
  if (gate) return gate;
  return <LocationScreenScreen />;
}

function LocationScreenScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const loc = LOCATION_BY_ID[id];
  const me = useMe();
  const { t, p } = useI18n();
  const c = useColors();
  const { run, pending } = useRun();
  const cityInfo = useCity(loc?.cityId);
  if (!loc) return <Screen><Empty text={t('err_invalid_location')} /></Screen>;
  const ch = me.data!.character!;
  const city = CITY_BY_ID[loc.cityId];
  const here = ch.cityId === loc.cityId;
  const atPlace = ch.locationId === loc.id;
  const owned = loc.business ? cityInfo.data?.businesses.find((b) => b.locationId === loc.id) : undefined;

  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: owned ? owned.name : p(loc.name) }} />
      <Row style={{ justifyContent: 'space-between', marginTop: space.lg }}>
        <Small>{`${p(LOCATION_TYPE_NAMES[loc.type])}, ${p(city.name)}`}</Small>
        {here && !atPlace && loc.type !== 'prison' && !ch.jailedUntil ? (
          <Button
            title={t('goHere')}
            small
            variant="ghost"
            loading={pending}
            disabled={!!me.data?.action}
            onPress={() => run(() => api.post('/move', { locationId: loc.id }))}
          />
        ) : atPlace ? (
          <Small color={c.pink}>{t('youAreHere')}</Small>
        ) : null}
      </Row>

      {!here ? (
        <Card style={{ marginTop: space.lg }}>
          <Body>{t('err_not_in_city')}</Body>
        </Card>
      ) : loc.type === 'festival' ? (
        <FestivalPanel cityId={loc.cityId} />
      ) : isVenue(loc.type) ? (
        <>
          {loc.business ? <BusinessPanel locationId={loc.id} /> : null}
          <Venue locationId={loc.id} venue={loc.type} />
          <CrimeOptions locationId={loc.id} zone={loc.type} />
        </>
      ) : loc.type === 'restaurant' ? (
        <>
          <BusinessRestaurant locationId={loc.id} business={!!loc.business} />
          {loc.business ? <BusinessPanel locationId={loc.id} /> : null}
        </>
      ) : loc.type === 'flea_market' ? (
        <>
          <FleaMarket locationId={loc.id} />
          <CrimeOptions locationId={loc.id} zone={loc.type} />
        </>
      ) : loc.type === 'hotel' ? (
        <Hotel locationId={loc.id} />
      ) : loc.type === 'bank' ? (
        <>
          <Bank locationId={loc.id} />
          <CrimeOptions locationId={loc.id} zone={loc.type} />
        </>
      ) : loc.type === 'tattoo' ? (
        <TattooStudio locationId={loc.id} />
      ) : loc.type === 'gym' ? (
        <Gym locationId={loc.id} />
      ) : loc.type === 'recording_studio' ? (
        <RecordingStudio locationId={loc.id} />
      ) : loc.type === 'real_estate' ? (
        <RealEstate locationId={loc.id} />
      ) : loc.type === 'prison' ? (
        <View style={{ marginTop: space.lg }}>
          <Prison cityId={loc.cityId} />
        </View>
      ) : loc.type === 'school' ? (
        <>
          <School locationId={loc.id} cityMult={city.costMult} />
          <ProfessionsHere locationId={loc.id} zone="school" />
        </>
      ) : loc.type === 'studio' ? (
        <>
          <Studio locationId={loc.id} />
          <ProfessionsHere locationId={loc.id} zone="studio" />
        </>
      ) : loc.type === 'work' ? (
        <View style={{ marginTop: space.lg }}>
          <Body style={{ marginBottom: space.lg }}>{t('jobPay', { title: p(loc.jobTitle!), pay: money(loc.hourlyPay ?? 0) })}</Body>
          <HoursAction
            options={HOUR_OPTIONS.work}
            build={(hours) => ({ kind: 'work', locationId: loc.id, hours })}
            earnings={(h) => (loc.hourlyPay ?? 0) * h}
            label={t('workHere')}
          />
        </View>
      ) : loc.type === 'hospital' ? (
        <View style={{ marginTop: space.lg }}>
          <Body color={c.inkSoft} style={{ marginBottom: space.lg }}>
            {t('treatIntro')} {t('pricePerHour', { price: money(HOSPITAL_PRICE_PER_HOUR) })}
          </Body>
          <HoursAction
            options={HOUR_OPTIONS.treat}
            build={(hours) => ({ kind: 'treat', locationId: loc.id, hours })}
            price={(h) => (ch.profession?.id === 'doctor' ? 0 : HOSPITAL_PRICE_PER_HOUR * h)}
            label={t('treatHere')}
          />
          <ProfessionsHere locationId={loc.id} zone="hospital" />
        </View>
      ) : loc.type === 'bookstore' ? (
        <Bookstore locationId={loc.id} />
      ) : loc.type === 'university' ? (
        <School locationId={loc.id} cityMult={city.costMult} university />
      ) : loc.type === 'park' ? (
        <>
          <Park locationId={loc.id} />
          <CrimeOptions locationId={loc.id} zone={loc.type} />
        </>
      ) : CIVIC.includes(loc.type) ? (
        <View style={{ marginTop: space.lg }}>
          {loc.type === 'worship' ? <Body color={c.inkSoft}>{t('restIntroWorship')}</Body> : null}
          {loc.type === 'courthouse' ? <Courtroom cityId={loc.cityId} /> : null}
          <ProfessionsHere locationId={loc.id} zone={loc.type} />
          {loc.type === 'police' ? <PoliceDesk locationId={loc.id} cityId={loc.cityId} /> : null}
          <Politics cityId={loc.cityId} zone={loc.type as CivicType} />
          <CrimeOptions locationId={loc.id} zone={loc.type} />
        </View>
      ) : isShop(loc.type) ? (
        <>
          <Shop locationId={loc.id} shop={loc.type} />
          {loc.type === 'hardware' ? <Workshop locationId={loc.id} /> : null}
          <CrimeOptions locationId={loc.id} zone={loc.type} />
        </>
      ) : null}
    </Screen>
  );
}

function Venue({ locationId, venue }: { locationId: string; venue: VenueType }) {
  const { t, locale, lang } = useI18n();
  const c = useColors();
  const me = useMe();
  const band = useBand();
  const loc = LOCATION_BY_ID[locationId];
  const info = useCity(loc.cityId);
  const rules = VENUE_RULES[venue];
  const fame = band.data?.fame[loc.cityId] ?? 0;
  const isLeader = !!me.data?.band?.isLeader;
  const famous = fame >= rules.minFame;
  const gigsHere = info.data?.upcomingGigs.filter((g) => g.locationId === locationId) ?? [];
  return (
    <View style={{ marginTop: space.lg }}>
      <Card>
        <Body>{t('capacity', { n: rules.capacity })}</Body>
        <Body>{t('ticket', { price: money(rules.ticket * CITY_BY_ID[loc.cityId].costMult) })}</Body>
        <Body>{t('minFame', { tier: tierName('fame', rules.minFame, lang) })}</Body>
        {band.data ? <Body color={c.blue}>{t('yourFame', { tier: tierName('fame', fame, lang) })}</Body> : null}
      </Card>
      <View style={{ marginTop: space.lg, gap: space.sm }}>
        {!isLeader ? <Small>{t('needBandLeader')}</Small> : !famous ? <Small>{t('needFame')}</Small> : null}
        <Button title={t('bookGig')} disabled={!isLeader || !famous} onPress={() => router.push({ pathname: '/book-gig', params: { locationId } })} />
      </View>
      <Heading>{t('upcomingGigs')}</Heading>
      {gigsHere.length ? (
        gigsHere.map((g, i) => (
          <ListRow key={g.id} title={g.bandName} subtitle={dateTime(g.startsAt, locale)} onPress={() => router.push(`/gig/${g.id}`)} last={i === gigsHere.length - 1} />
        ))
      ) : (
        <Empty text={t('noUpcomingGigs')} />
      )}
    </View>
  );
}

const CATEGORIES: SkillCategory[] = ['instruments', 'music', 'stage', 'genres'];

/** Restoran: oyuncu işletmesiyse menü çarpanını işletmeden alır */
function BusinessRestaurant({ locationId, business }: { locationId: string; business: boolean }) {
  return business ? <OwnedRestaurant locationId={locationId} /> : <Restaurant locationId={locationId} />;
}

function OwnedRestaurant({ locationId }: { locationId: string }) {
  const b = useBusiness(locationId);
  return <Restaurant locationId={locationId} menuMult={b.data?.menuMult ?? 1} />;
}

function School({ locationId, cityMult, university = false }: { locationId: string; cityMult: number; university?: boolean }) {
  const { t, p, lang } = useI18n();
  const me = useMe();
  const vip = useIsVip();
  const c = useColors();
  const skills = me.data!.character!.skills;
  const place = university ? 'university' : 'school';
  // Okulda bilinen beceriler çalışılır; şartları sağlanan yeni beceriler de burada öğrenilebilir
  const options = SKILL_DEFS.filter(
    (d) => studyPlaceFor(d.category) === place && (knows(skills, d.id) || learnBlocker(skills, d.id, vip) === null),
  );
  const [skill, setSkill] = useState<string>(options.find((d) => knows(skills, d.id))?.id ?? options[0]?.id);
  return (
    <View style={{ marginTop: space.lg }}>
      <Body color={c.inkSoft}>{university ? t('universityIntro') : t('studyIntro')}</Body>
      {[...CATEGORIES, 'career' as SkillCategory].map((cat) => {
        const defs = options.filter((d) => d.category === cat);
        if (!defs.length) return null;
        return (
          <View key={cat}>
            <Heading>{p(SKILL_CATEGORY_NAMES[cat])}</Heading>
            <Choice
              options={defs.map((d) => ({
                value: d.id,
                label: p(d.name),
                hint: knows(skills, d.id) ? tierName('skill', skills[d.id], lang) : t('newSkill'),
              }))}
              value={skill}
              onChange={setSkill}
            />
          </View>
        );
      })}
      <View style={{ height: space.xl }} />
      <HoursAction
        options={HOUR_OPTIONS.study}
        build={(hours) => ({ kind: 'study', skill, hours, locationId })}
        price={(h) => Math.round((university ? UNIVERSITY_PRICE_PER_HOUR : SCHOOL_PRICE_PER_HOUR) * cityMult * h)}
        label={t('studyHere')}
        disabled={!skill}
      />
    </View>
  );
}

function Bookstore({ locationId }: { locationId: string }) {
  const { t, p, lang } = useI18n();
  const c = useColors();
  const me = useMe();
  const { run, pending } = useRun();
  const ch = me.data!.character!;
  const vip = useIsVip();
  const books = SKILL_DEFS.filter((d) => d.learn === 'book');
  return (
    <View style={{ marginTop: space.lg }}>
      <Body color={c.inkSoft}>{t('bookstoreIntro')}</Body>
      {SKILL_CATEGORIES.map((cat) => {
        const defs = books.filter((d) => d.category === cat);
        if (!defs.length) return null;
        return (
          <View key={cat}>
            <Heading>{p(SKILL_CATEGORY_NAMES[cat])}</Heading>
            {defs.map((d, i) => {
              const block = learnBlocker(ch.skills, d.id, vip);
              const pre = d.prereq ? SKILL_BY_ID[d.prereq.skill] : null;
              return (
                <ListRow
                  key={d.id}
                  title={p(d.name)}
                  subtitle={
                    block === 'vip_required'
                      ? t('vipRequiredHint')
                      : block === 'missing_prereq' && pre
                        ? t('requires', { skill: p(pre.name), tier: tierName('skill', d.prereq!.min, lang) })
                        : p(d.about)
                  }
                  right={
                    block === 'already_known' ? (
                      <Small color={c.blue}>{t('known')}</Small>
                    ) : (
                      <View style={{ alignItems: 'flex-end', gap: 2 }}>
                        <Strong>{money(d.bookPrice ?? 0)}</Strong>
                        <Button
                          title={t('buyBook')}
                          small
                          variant="secondary"
                          disabled={!!block || ch.money < (d.bookPrice ?? 0) || pending || !!me.data?.action || !!ch.jailedUntil}
                          onPress={() =>
                            run(() => api.post('/skills/learn', { skillId: d.id, locationId }), {
                              success: t('learnedSkill', { skill: p(d.name) }),
                              invalidate: ['me'],
                            })
                          }
                        />
                      </View>
                    )
                  }
                  last={i === defs.length - 1}
                />
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

function Studio({ locationId }: { locationId: string }) {
  const { t, lang } = useI18n();
  const c = useColors();
  const band = useBand();
  const me = useMe();
  const city = CITY_BY_ID[LOCATION_BY_ID[locationId].cityId];
  const songs = band.data?.songs ?? [];
  const [songId, setSongId] = useState<number | null>(null);
  const selected = songId ?? songs[0]?.id ?? null;
  if (!band.data) return <Empty text={t('err_no_band')} action={<Button title={t('createBand')} variant="secondary" onPress={() => router.navigate('/band')} />} />;
  if (!songs.length) return <Empty text={t('noBandSongs')} />;
  return (
    <View style={{ marginTop: space.lg }}>
      <Body color={c.inkSoft}>{t('rehearseIntro')}</Body>
      <Heading>{t('repertoire')}</Heading>
      <Choice
        options={songs.map((s) => ({ value: s.id, label: s.title, hint: tierName('familiarity', s.myFamiliarity, lang) }))}
        value={selected}
        onChange={setSongId}
      />
      {(() => {
        const song = songs.find((s) => s.id === selected);
        if (!song) return null;
        const cap = familiarityCap(me.data!.character!.skills, song.genre as Genre);
        return cap < 100 ? (
          <Small style={{ marginTop: space.sm }}>{t('capNote', { tier: tierName('familiarity', cap, lang) })}</Small>
        ) : null;
      })()}
      <View style={{ height: space.xl }} />
      <HoursAction
        options={HOUR_OPTIONS.rehearse}
        build={(hours) => ({ kind: 'rehearse', songId: selected!, hours, locationId })}
        price={(h) => priceFor(STUDIO_PRICE_PER_HOUR, city, h)}
        label={t('rehearseHere')}
        disabled={!selected}
      />
    </View>
  );
}

function Shop({ locationId, shop }: { locationId: string; shop: ShopType }) {
  const { t, p } = useI18n();
  const vip = useIsVip();
  const c = useColors();
  const me = useMe();
  const inv = useInventory();
  const { run, pending } = useRun();
  const moneyLeft = me.data?.character?.money ?? 0;
  // Atölyede üretilenler dükkâna satılmaz (pazarda satılır)
  const mine = (inv.data ?? []).filter((i) => ITEM_BY_ID[i.itemId]?.shop === shop && !ITEM_BY_ID[i.itemId]?.crafted);
  const groups =
    shop === 'music_store'
      ? INSTRUMENTS.map((inst) => ({ title: p(ROLE_NAMES[inst]), items: itemsForShop(shop).filter((i) => i.slot === inst) }))
      : shop === 'hardware'
        ? [
            { title: t('materialsGroup'), items: itemsForShop(shop).filter((i) => i.slot === 'material') },
            { title: t('spraysGroup'), items: itemsForShop(shop).filter((i) => i.slot === 'spray') },
          ]
        : [{ title: '', items: itemsForShop(shop) }];
  const countOf = (itemId: string) => mine.filter((m) => m.itemId === itemId).length;
  // Yığılabilir eşyalar (malzeme, sprey, efekt) tek satırda gösterilir
  const mineRows = mine.filter((m, i, arr) => !ITEM_BY_ID[m.itemId].stackable || arr.findIndex((x) => x.itemId === m.itemId && !x.listed) === i);
  const buy = (itemId: string, qty: number, name: string) =>
    run(() => api.post('/shop/buy', { locationId, itemId, qty }), {
      success: t('boughtItem', { item: qty > 1 ? `${name} ×${qty}` : name }),
      invalidate: ['me', 'inventory'],
    });

  return (
    <View style={{ marginTop: space.lg }}>
      <Body color={c.inkSoft}>{t(`shopIntro_${shop}` as StringKey)}</Body>
      {groups.map((g) => (
        <View key={g.title || 'all'}>
          {g.title ? <Heading>{g.title}</Heading> : <View style={{ height: space.lg }} />}
          {g.items.map((item, i) => {
            const owned = countOf(item.id);
            const blocked = pending || !!me.data?.action || !!me.data?.character?.jailedUntil || (!!item.vip && !vip);
            return (
              <ListRow
                key={item.id}
                title={p(item.name)}
                subtitle={itemBonusText(item, t, p)}
                right={
                  <View style={{ alignItems: 'flex-end', gap: 2 }}>
                    <Strong>{money(item.price)}</Strong>
                    {item.vip ? <VipTag /> : null}
                    <Row gap={space.xs}>
                      {item.stackable ? (
                        <Button title={t('buyFive')} small variant="ghost" disabled={moneyLeft < item.price * 5 || blocked} onPress={() => buy(item.id, 5, p(item.name))} />
                      ) : null}
                      <Button title={t('buy')} small variant="secondary" disabled={moneyLeft < item.price || blocked} onPress={() => buy(item.id, 1, p(item.name))} />
                    </Row>
                    {owned ? <Small color={c.blue}>{item.stackable ? t('ownedN', { n: owned }) : t('owned')}</Small> : null}
                  </View>
                }
                last={i === g.items.length - 1}
              />
            );
          })}
        </View>
      ))}

      {mine.length ? (
        <>
          <Heading>{t('yourItemsHere')}</Heading>
          {mineRows.map((m, i) => {
            const item = ITEM_BY_ID[m.itemId];
            const price = Math.floor(item.price * SELL_BACK_RATE);
            const n = item.stackable ? countOf(item.id) : 1;
            return (
              <ListRow
                key={m.id}
                left={<ColorDot color={m.color} />}
                title={`${itemDisplayName(item, p, m)}${n > 1 ? ` ×${n}` : ''}`}
                subtitle={m.listed ? t('listedBadge') : m.equipped && item.slot !== 'art' ? t('equipped') : undefined}
                right={
                  <Button
                    title={t('sell', { price: money(price) })}
                    small
                    variant="ghost"
                    disabled={pending || m.listed}
                    onPress={() =>
                      run(() => api.post('/shop/sell', { locationId, inventoryId: m.id }), {
                        success: t('soldItem', { price: money(price) }),
                        invalidate: ['me', 'inventory'],
                      })
                    }
                  />
                }
                last={i === mineRows.length - 1}
              />
            );
          })}
        </>
      ) : null}
    </View>
  );
}

function Park({ locationId }: { locationId: string }) {
  const { t, p, lang } = useI18n();
  const c = useColors();
  const me = useMe();
  const ch = me.data!.character!;
  const city = CITY_BY_ID[LOCATION_BY_ID[locationId].cityId];
  const roles = INSTRUMENTS.filter((r) => knows(ch.skills, ROLE_SKILLS[r].specific));
  const [role, setRole] = useState<Instrument | undefined>(roles.includes(ch.mainInstrument) ? ch.mainInstrument : roles[0]);
  if (!role) return <Empty text={t('err_skill_not_known')} />;
  const perHour = buskPayPerHour(roleSkill(ch.skills, role), stageScore(ch.skills), city.costMult);
  return (
    <View style={{ marginTop: space.lg }}>
      <Body color={c.inkSoft}>{t('buskIntro')}</Body>
      <Heading>{t('instrumentToPlay')}</Heading>
      <Choice
        options={roles.map((r) => ({ value: r, label: p(ROLE_NAMES[r]), hint: tierName('skill', roleSkill(ch.skills, r), lang) }))}
        value={role}
        onChange={setRole}
      />
      <View style={{ height: space.xl }} />
      <HoursAction
        options={BUSK_HOURS}
        build={(hours) => ({ kind: 'busk', role, hours, locationId })}
        earnings={(h) => perHour * h}
        label={t('busk')}
      />
    </View>
  );
}

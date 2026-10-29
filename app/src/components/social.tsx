// Profildeki sosyal araçlar: mesaj/arkadaş/engelle/şikâyet düğmeleri, ilişki paneli ve ziyaretçi defteri.

import {
  CHILD_NAME_RE,
  DATE_MIN_ROMANCE,
  FLIRT_MIN_FRIENDSHIP,
  type GuestbookEntryDto,
  ITEM_BY_ID,
  MAX_CHILDREN,
  PROPOSE_MIN_ROMANCE,
  type RelationshipDto,
} from '@rifftown/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { confirmThen } from '@/components/careers';
import { TierMeter } from '@/components/tier';
import { Avatar, Body, Button, Card, Choice, Empty, Field, Heading, Row, Small, Strong, useToast } from '@/components/ui';
import { api } from '@/lib/api';
import { dateTime, duration } from '@/lib/format';
import { useInventory, useRun } from '@/lib/hooks';
import { useI18n } from '@/lib/i18n';
import { itemDisplayName } from '@/lib/item-text';
import type { StringKey } from '@/lib/strings';
import { useMe } from '@/lib/session';
import { space, useColors } from '@/theme';

export function useRelationship(id: number) {
  return useQuery({
    queryKey: ['relationship', id],
    queryFn: () => api.get<RelationshipDto>(`/characters/${id}/relationship`),
  });
}

/** Profilin üstündeki hızlı düğmeler */
export function ProfileActions({ id, name }: { id: number; name: string }) {
  const { t } = useI18n();
  const c = useColors();
  const q = useRelationship(id);
  const qc = useQueryClient();
  const { run, pending } = useRun();
  const r = q.data;
  if (!r) return null;
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['relationship', id] });
    qc.invalidateQueries({ queryKey: ['character', String(id)] });
    qc.invalidateQueries({ queryKey: ['friends'] });
  };
  const blockedSomehow = r.blocked || r.blockedMe;

  return (
    <View style={{ marginTop: space.lg, gap: space.sm }}>
      {r.blockedMe && !r.blocked ? <Small color={c.danger}>{t('blockedByThem')}</Small> : null}
      {r.blocked ? <Small color={c.danger}>{t('blockedNote')}</Small> : null}
      <Row style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
        {!blockedSomehow ? <Button title={t('sendMessage')} small onPress={() => router.push(`/messages/${id}`)} /> : null}
        {!blockedSomehow && !r.friends && !r.friendRequest ? (
          <Button title={t('addFriend')} small variant="secondary" disabled={pending} onPress={async () => {
            if (await run(() => api.post(`/friends/${id}`), { success: t('requestSent'), invalidate: [] })) refresh();
          }} />
        ) : null}
        {r.friendRequest === 'outgoing' ? <Button title={t('requestSent')} small variant="secondary" disabled onPress={() => {}} /> : null}
        {!blockedSomehow ? <Button title={t('proposeTrade')} small variant="secondary" onPress={() => router.push(`/trade/${id}`)} /> : null}
        {r.friendRequest === 'incoming' ? (
          <Button title={t('acceptFriend')} small variant="secondary" disabled={pending} onPress={async () => {
            if (await run(() => api.post(`/friends/${id}/answer`, { accept: true }), { invalidate: [] })) refresh();
          }} />
        ) : null}
      </Row>
      <Row style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
        {r.friends ? (
          <Button title={t('unfriend')} small variant="ghost" onPress={() =>
            confirmThen(t('unfriend'), `${t('unfriend')}: ${name}?`, t('confirm'), t('cancel'), async () => {
              if (await run(() => api.del(`/friends/${id}`), { invalidate: [] })) refresh();
            })
          } />
        ) : null}
        <Button title={r.blocked ? t('unblock') : t('block')} small variant="ghost" onPress={() =>
          r.blocked
            ? run(() => api.del(`/blocks/${id}`), { invalidate: [] }).then(refresh)
            : confirmThen(t('block'), `${t('block')}: ${name}?`, t('confirm'), t('cancel'), async () => {
                if (await run(() => api.post(`/blocks/${id}`), { invalidate: [] })) refresh();
              })
        } />
        <Button title={t('report')} small variant="ghost" onPress={() =>
          confirmThen(t('report'), `${t('report')}: ${name}?`, t('confirm'), t('cancel'), () => {
            run(() => api.post('/reports', { kind: 'profile', targetId: id, text: '' }), { success: t('reported'), invalidate: [] });
          })
        } />
      </Row>
    </View>
  );
}

/** Arkadaşlık, romantizm, nişan/evlilik ve evlat edinme */
export function RelationshipPanel({ id, name }: { id: number; name: string }) {
  const { t, p, lang } = useI18n();
  const c = useColors();
  const me = useMe();
  const q = useRelationship(id);
  const inv = useInventory();
  const qc = useQueryClient();
  const { run, pending } = useRun();
  const toast = useToast();
  const [ring, setRing] = useState<number | null>(null);
  const [child, setChild] = useState('');
  const r = q.data;
  const ch = me.data?.character;
  if (!r || !ch || r.blocked || r.blockedMe) return null;
  const city = ch.cityId;
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['relationship', id] });
    qc.invalidateQueries({ queryKey: ['character', String(id)] });
  };
  const busy = !!me.data?.action || !!ch.jailedUntil;
  const wait = (iso: string | null) => (iso && new Date(iso).getTime() > Date.now() ? t('waitUntil', { time: duration(new Date(iso).getTime() - Date.now(), lang) }) : null);
  const act = async (path: string, body?: unknown, invalidate: string[] = ['me']) => {
    if (await run(() => api.post(`/relationships/${id}/${path}`, body), { success: t('relDone'), invalidate })) refresh();
  };
  // Takılmanın ruh hâli etkisi günde sınırlı: etkisiz kaldıysa oyuncuya söylenir
  const hangout = async () => {
    const res = await run(() => api.post<{ uplift?: boolean }>(`/relationships/${id}/hangout`), { invalidate: [] });
    if (!res) return;
    refresh();
    toast(res.uplift === false ? t('hangoutNoUplift') : t('relDone'));
  };
  const rings = (inv.data ?? []).filter((i) => ITEM_BY_ID[i.itemId]?.slot === 'ring' && !i.listed);
  const hangoutWait = wait(r.next.hangout);
  const flirtWait = wait(r.next.flirt);
  const dateWait = wait(r.next.date);
  const canFlirt = r.friendship >= FLIRT_MIN_FRIENDSHIP && !r.takenElsewhere;
  const engaged = r.stage === 'engaged';
  const married = r.stage === 'married';

  return (
    <>
      <Heading>{t('relationship')}</Heading>
      <Card>
        {r.stage !== 'none' ? <Strong color={c.pink} style={{ marginBottom: space.sm }}>{t(`stage_${r.stage}` as StringKey)}</Strong> : null}
        <TierMeter label={t('friendshipLevel')} scale="friendship" value={r.friendship} />
        {r.romance > 0 || canFlirt ? <TierMeter label={t('romanceLevel')} scale="romance" value={r.romance} /> : null}
        {!r.sameCity ? <Small style={{ marginTop: space.sm }}>{t('notSameCity')}</Small> : null}
        {r.takenElsewhere && r.stage === 'none' ? <Small style={{ marginTop: space.sm }}>{t('takenElsewhere')}</Small> : null}
      </Card>

      {r.sameCity ? (
        <View style={{ gap: space.sm, marginTop: space.md }}>
          <ActionLine title={t('hangout')} note={hangoutWait} disabled={busy || pending || !!hangoutWait} onPress={hangout} />
          {canFlirt || r.stage !== 'none' ? (
            <ActionLine title={t('flirt')} note={flirtWait} disabled={busy || pending || !!flirtWait || r.takenElsewhere} onPress={() => act('flirt', undefined, [])} />
          ) : null}
          {r.romance >= DATE_MIN_ROMANCE && city ? (
            <ActionLine title={t('dateAction')} note={dateWait} disabled={busy || pending || !!dateWait} onPress={() => act('date', { locationId: `${city}-restaurant` })} />
          ) : null}
          <FlingLine id={id} disabled={busy || pending} act={act} />
          {r.stage !== 'none' && r.romance >= 40 ? <FamilyTryLine id={id} disabled={busy || pending} act={act} /> : null}
        </View>
      ) : null}

      {r.proposal === 'incoming' ? (
        <Card style={{ marginTop: space.md, borderColor: c.pink }}>
          <Body>{`${name} 💍`}</Body>
          <Row style={{ marginTop: space.sm }}>
            <Button title={t('declineProposal')} small variant="ghost" disabled={pending} onPress={() => act('proposal', { accept: false }, [])} />
            <Button title={t('acceptProposal')} small disabled={pending} onPress={() => act('proposal', { accept: true }, ['me', 'inventory'])} />
          </Row>
        </Card>
      ) : null}
      {r.proposal === 'outgoing' ? (
        <Card style={{ marginTop: space.md }}>
          <Small>{t('proposalSent')}</Small>
          <Button title={t('cancelProposal')} small variant="ghost" style={{ alignSelf: 'flex-start', paddingHorizontal: 0 }} disabled={pending} onPress={async () => {
            if (await run(() => api.del(`/relationships/${id}/proposal`), { invalidate: [] })) refresh();
          }} />
        </Card>
      ) : null}

      {r.stage === 'dating' && !r.proposal && r.romance >= PROPOSE_MIN_ROMANCE ? (
        <View style={{ marginTop: space.md }}>
          <Strong>{t('propose')}</Strong>
          {rings.length ? (
            <>
              <Small style={{ marginVertical: space.xs }}>{t('chooseRing')}</Small>
              <Row style={{ flexWrap: 'wrap' }}>
                {rings.map((i) => (
                  <Button key={i.id} title={itemDisplayName(ITEM_BY_ID[i.itemId], p, i)} small variant={ring === i.id ? 'primary' : 'secondary'} onPress={() => setRing(i.id)} />
                ))}
              </Row>
              <Button title={t('propose')} small style={{ marginTop: space.sm, alignSelf: 'flex-start' }} disabled={!ring || pending || !r.sameCity} onPress={() => act('propose', { ringId: ring }, ['me', 'inventory'])} />
            </>
          ) : (
            <Small>{t('needRingHint')}</Small>
          )}
        </View>
      ) : null}

      {engaged && city ? (
        <Button title={t('wedding')} style={{ marginTop: space.md }} disabled={pending || busy || !r.sameCity} onPress={() => act('wedding', { locationId: `${city}-worship` })} />
      ) : null}

      {married && r.adoption ? (
        <Card style={{ marginTop: space.md }}>
          {r.adoption.by === 'me' ? (
            <Small>{t('adoptionPending', { name: r.adoption.name })}</Small>
          ) : (
            <>
              <Body>{t('adoptionIncoming', { name: r.adoption.name })}</Body>
              <Row style={{ marginTop: space.sm }}>
                <Button title={t('decline')} small variant="ghost" disabled={pending} onPress={() => act('adoption', { accept: false }, [])} />
                <Button title={t('acceptAdoption')} small disabled={pending} onPress={() => act('adoption', { accept: true })} />
              </Row>
            </>
          )}
        </Card>
      ) : null}
      {married && !r.adoption && city ? (
        <View style={{ marginTop: space.md }}>
          <Field label={t('childName')} hint={`${t('adopt')} · max ${MAX_CHILDREN}`} value={child} onChangeText={setChild} maxLength={24} />
          <Button title={t('adopt')} small variant="secondary" style={{ alignSelf: 'flex-start' }} disabled={!CHILD_NAME_RE.test(child.trim()) || pending || busy} onPress={async () => {
            if (await run(() => api.post(`/relationships/${id}/adopt`, { locationId: `${city}-city_hall`, name: child.trim() }), { success: t('relDone') })) {
              setChild('');
              refresh();
            }
          }} />
        </View>
      ) : null}

      {r.stage !== 'none' ? (
        <Button
          title={married ? t('divorce') : t('breakUp')}
          variant="ghost"
          small
          style={{ marginTop: space.md, alignSelf: 'flex-start', paddingHorizontal: 0 }}
          disabled={pending}
          onPress={() =>
            confirmThen(married ? t('divorce') : t('breakUp'), `${married ? t('divorce') : t('breakUp')}: ${name}?`, t('confirm'), t('cancel'), () =>
              act('break-up', married && city ? { locationId: `${city}-courthouse` } : {}),
            )
          }
        />
      ) : null}
    </>
  );
}

function ActionLine({ title, note, disabled, onPress }: { title: string; note: string | null; disabled: boolean; onPress: () => void }) {
  return (
    <Row style={{ alignItems: 'center' }}>
      <Button title={title} small variant="secondary" disabled={disabled} onPress={onPress} />
      {note ? <Small>{note}</Small> : null}
    </Row>
  );
}

/** Profilin altındaki ziyaretçi defteri */
export function Guestbook({ id, canSign }: { id: number; canSign: boolean }) {
  const { t, locale } = useI18n();
  const c = useColors();
  const qc = useQueryClient();
  const { run, pending } = useRun();
  const [text, setText] = useState('');
  const q = useQuery({
    queryKey: ['guestbook', id],
    queryFn: () => api.get<{ entries: GuestbookEntryDto[] }>(`/characters/${id}/guestbook`).then((r) => r.entries),
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ['guestbook', id] });
  return (
    <>
      <Heading>{t('guestbook')}</Heading>
      {canSign ? (
        <View style={{ marginBottom: space.md }}>
          <Field label={t('guestbookPlaceholder')} value={text} onChangeText={setText} maxLength={1000} multiline />
          <Button title={t('sign')} small variant="secondary" style={{ alignSelf: 'flex-start' }} disabled={!text.trim() || pending} onPress={async () => {
            if (await run(() => api.post(`/characters/${id}/guestbook`, { text: text.trim() }), { invalidate: [] })) {
              setText('');
              refresh();
            }
          }} />
        </View>
      ) : null}
      {q.data?.length ? (
        q.data.map((e) => (
          <View key={e.id} style={{ flexDirection: 'row', gap: space.sm, paddingVertical: space.sm, borderBottomWidth: 1, borderBottomColor: c.line }}>
            <Avatar name={e.author.name} color={e.author.avatarColor} uri={e.author.avatarUrl} size={32} />
            <View style={{ flex: 1 }}>
              <Row style={{ alignItems: 'baseline' }}>
                <Pressable onPress={() => router.push(`/character/${e.author.characterId}`)} accessibilityRole="link">
                  <Strong>{e.author.name}</Strong>
                </Pressable>
                <Small>{dateTime(e.createdAt, locale)}</Small>
              </Row>
              <Body>{e.text}</Body>
              <Row>
                {e.canDelete ? (
                  <Button title={t('remove')} small variant="ghost" style={{ paddingHorizontal: 0 }} onPress={async () => {
                    if (await run(() => api.del(`/guestbook/${e.id}`), { invalidate: [] })) refresh();
                  }} />
                ) : null}
                <Button title={t('report')} small variant="ghost" style={{ paddingHorizontal: 0 }} onPress={() =>
                  confirmThen(t('report'), t('report'), t('confirm'), t('cancel'), () => {
                    run(() => api.post('/reports', { kind: 'guestbook', targetId: e.id, text: '' }), { success: t('reported'), invalidate: [] });
                  })
                } />
              </Row>
            </View>
          </View>
        ))
      ) : (
        <Empty text={t('noGuestbook')} />
      )}
    </>
  );
}

/** Tek gecelik macera: aynı bar, kulüp ya da otelde; karşılıklı onay (metinler imalı). Korunma tercihi iki tarafta da sorulur. */
function FlingLine({ id, disabled, act }: { id: number; disabled: boolean; act: (path: string, body?: unknown, invalidate?: string[]) => Promise<void> }) {
  const { t } = useI18n();
  const q = useQuery({ queryKey: ['fling', id], queryFn: () => api.get<FlingState>(`/relationships/${id}/fling`) });
  const qc = useQueryClient();
  const [prot, setProt] = useState(true);
  const done = async (path: string, body?: unknown) => {
    await act(path, body, ['me', 'inventory']);
    qc.invalidateQueries({ queryKey: ['fling', id] });
  };
  const protChoice = (
    <Choice
      options={[
        { value: 'yes', label: t('protectedYes'), hint: t('protectedHint') },
        { value: 'no', label: t('protectedNo') },
      ]}
      value={prot ? 'yes' : 'no'}
      onChange={(v) => setProt(v === 'yes')}
    />
  );
  if (q.data?.incoming) {
    return (
      <View style={{ gap: space.xs }}>
        <Small>{t('flingIncoming')}</Small>
        {protChoice}
        <Row>
          <Button small variant="ghost" title={t('decline')} disabled={disabled} onPress={() => done('fling/decline')} />
          <Button small title={t('accept')} disabled={disabled} onPress={() => done('fling/accept', { protected: prot })} />
        </Row>
      </View>
    );
  }
  return (
    <View style={{ gap: space.xs }}>
      {!q.data?.outgoing ? protChoice : null}
      <ActionLine title={t('flingOffer')} note={q.data?.outgoing ? t('flingPending') : t('flingHint')} disabled={disabled || !!q.data?.outgoing} onPress={() => done('fling', { protected: prot })} />
    </View>
  );
}

interface FlingState {
  incoming: boolean;
  outgoing: boolean;
  familyIncoming: { carrierIsMe: boolean } | null;
  familyOutgoing: boolean;
}

/** Sevgili ya da evli çift: "çocuk sahibi olmayı dene" (iki tarafın da aile ayarı açık olmalı; taşıyan çiftçe seçilir) */
function FamilyTryLine({ id, disabled, act }: { id: number; disabled: boolean; act: (path: string, body?: unknown, invalidate?: string[]) => Promise<void> }) {
  const { t } = useI18n();
  const q = useQuery({ queryKey: ['fling', id], queryFn: () => api.get<FlingState>(`/relationships/${id}/fling`) });
  const qc = useQueryClient();
  const [carrier, setCarrier] = useState<'me' | 'them'>('me');
  const done = async (path: string, body?: unknown) => {
    await act(path, body, ['me', 'family']);
    qc.invalidateQueries({ queryKey: ['fling', id] });
  };
  const inc = q.data?.familyIncoming;
  if (inc) {
    return (
      <View style={{ gap: space.xs }}>
        <Small>{inc.carrierIsMe ? t('familyIncomingMe') : t('familyIncomingThem')}</Small>
        <Row>
          <Button small variant="ghost" title={t('decline')} disabled={disabled} onPress={() => done('family-try/decline')} />
          <Button small title={t('accept')} disabled={disabled} onPress={() => done('family-try/accept')} />
        </Row>
      </View>
    );
  }
  return (
    <View style={{ gap: space.xs }}>
      <Choice
        options={[
          { value: 'me', label: t('carrierMe') },
          { value: 'them', label: t('carrierThem') },
        ]}
        value={carrier}
        onChange={setCarrier}
      />
      <ActionLine title={t('familyTry')} note={q.data?.familyOutgoing ? t('flingPending') : t('familyTryHint')} disabled={disabled || !!q.data?.familyOutgoing} onPress={() => done('family-try', { carrier })} />
    </View>
  );
}

/** Kendi profilinde: aile planlaması ayarı ve süren hamilelik */
export function FamilySettings() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const { run, pending } = useRun();
  const q = useQuery({ queryKey: ['family'], queryFn: () => api.get<{ familyOpen: boolean; pregnancy: { carrier: boolean; otherName: string | null; dueDays: number } | null }>('/family') });
  if (!q.data) return null;
  const set = async (open: boolean) => {
    if (await run(() => api.post('/family/open', { open }))) qc.invalidateQueries({ queryKey: ['family'] });
  };
  return (
    <View style={{ marginTop: space.md, gap: space.xs }}>
      <Heading>{t('familyPlanning')}</Heading>
      <Small>{t('familyPlanningHint')}</Small>
      <Choice
        options={[
          { value: 'off', label: t('familyClosed') },
          { value: 'on', label: t('familyOpen') },
        ]}
        value={q.data.familyOpen ? 'on' : 'off'}
        onChange={(v) => !pending && set(v === 'on')}
      />
      {q.data.pregnancy ? (
        <Small>{q.data.pregnancy.carrier ? t('expectingSelf', { n: q.data.pregnancy.dueDays }) : t('expectingOther', { name: q.data.pregnancy.otherName ?? '', n: q.data.pregnancy.dueDays })}</Small>
      ) : null}
    </View>
  );
}

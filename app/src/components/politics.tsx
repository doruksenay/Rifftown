// Seçimler ve makamlar: belediye ve emniyet müdürlüğü ekranlarında gösterilir.

import { type CivicResponse, type CivicType, OFFICES, OFFICE_BY_ID, unmetRequirement } from '@rifftown/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { VipUpsell, requirementText } from '@/components/careers';
import { Avatar, Body, Button, Card, Field, Heading, ListRow, Row, Small, Strong } from '@/components/ui';
import { api } from '@/lib/api';
import { duration, money } from '@/lib/format';
import { useRun } from '@/lib/hooks';
import { useI18n } from '@/lib/i18n';
import { useIsVip, useMe } from '@/lib/session';
import { space, useColors } from '@/theme';

export function useCivic(cityId: string | null | undefined) {
  return useQuery({
    queryKey: ['civic', cityId],
    queryFn: () => api.get<CivicResponse>(`/civic/${cityId}`),
    enabled: !!cityId,
    refetchInterval: 30000,
  });
}

export function Politics({ cityId, zone }: { cityId: string; zone: CivicType }) {
  const { t, p, lang } = useI18n();
  const c = useColors();
  const me = useMe();
  const vip = useIsVip();
  const civic = useCivic(cityId);
  const qc = useQueryClient();
  const { run, pending } = useRun();
  const [platform, setPlatform] = useState('');
  const [note, setNote] = useState<string | null>(null);
  const ch = me.data!.character!;
  const offices = OFFICES.filter((o) => o.zone === zone);
  if (!offices.length) return null;
  const refresh = () => qc.invalidateQueries({ queryKey: ['civic', cityId] });

  return (
    <View>
      <Heading>{t('politics')}</Heading>
      {!vip ? <VipUpsell text={t('votingVipOnly')} /> : null}
      {offices.map((office) => {
        const holder = civic.data?.holders.find((h) => h.office === office.id);
        const election = civic.data?.elections.find((e) => e.office === office.id);
        const isHolder = holder?.characterId === ch.id;
        const unmet = unmetRequirement(office, ch.skills);
        return (
          <Card key={office.id} style={{ marginTop: space.md }}>
            <Strong>{p(office.name)}</Strong>
            <Small>{p(office.about)}</Small>
            <Small style={{ marginTop: space.xs }}>{t('salaryPerDay', { money: money(office.salaryPerDay) })}</Small>
            <Small color={unmet ? c.danger : c.inkSoft}>{t('needs', { list: requirementText(office.requires, t, p, lang) })}</Small>
            {holder ? (
              <ListRow
                left={<Avatar name={holder.name} color={holder.avatarColor} uri={holder.avatarUrl} size={32} />}
                title={t('officeHolder', { name: holder.name })}
                onPress={() => router.push(`/character/${holder.characterId}`)}
                last
              />
            ) : (
              <Body color={c.inkSoft} style={{ marginTop: space.sm }}>{t('officeVacant')}</Body>
            )}

            {isHolder && office.id === 'mayor' ? (
              <View style={{ marginTop: space.md }}>
                <Field
                  label={t('editAnnouncement')}
                  value={note ?? holder?.announcement ?? ''}
                  onChangeText={setNote}
                  placeholder={t('announcementPlaceholder')}
                  maxLength={300}
                  multiline
                />
                <Button
                  title={t('publish')}
                  small
                  variant="secondary"
                  disabled={pending || note === null}
                  onPress={async () => {
                    await run(() => api.post('/offices/announcement', { cityId, text: note ?? '' }), { success: t('published'), invalidate: [] });
                    setNote(null);
                    refresh();
                  }}
                />
              </View>
            ) : null}

            {election ? (
              <View style={{ marginTop: space.lg }}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Strong>{t('election', { office: p(OFFICE_BY_ID[office.id].name) })}</Strong>
                </Row>
                <Small>{t('electionEnds', { time: duration(new Date(election.endsAt).getTime() - Date.now(), lang) })}</Small>
                {election.candidates.length ? (
                  election.candidates.map((k, i) => (
                    <ListRow
                      key={k.characterId}
                      left={<Avatar name={k.name} color={k.avatarColor} size={32} />}
                      title={k.name}
                      subtitle={k.platform || undefined}
                      onPress={() => router.push(`/character/${k.characterId}`)}
                      right={
                        <View style={{ alignItems: 'flex-end', gap: 2 }}>
                          {k.votes !== null ? <Small>{t('votes', { n: k.votes })}</Small> : null}
                          {election.myVote === k.characterId ? (
                            <Small color={c.blue}>{t('voted')}</Small>
                          ) : election.myVote === null && vip && ch.cityId === cityId ? (
                            <Button
                              title={t('voteFor')}
                              small
                              variant="secondary"
                              disabled={pending}
                              onPress={async () => {
                                await run(() => api.post(`/elections/${election.id}/vote`, { candidateId: k.characterId }), { invalidate: [] });
                                refresh();
                              }}
                            />
                          ) : null}
                        </View>
                      }
                      last={i === election.candidates.length - 1}
                    />
                  ))
                ) : (
                  <Body color={c.inkSoft} style={{ marginTop: space.sm }}>{t('noCandidates')}</Body>
                )}
                {vip && !election.amCandidate && !unmet ? (
                  <View style={{ marginTop: space.md }}>
                    <Field label={t('runForOffice')} value={platform} onChangeText={setPlatform} placeholder={t('platformPlaceholder')} maxLength={200} />
                    <Button
                      title={t('runForOffice')}
                      small
                      disabled={pending}
                      onPress={async () => {
                        await run(() => api.post(`/elections/${election.id}/run`, { platform }), { invalidate: [] });
                        setPlatform('');
                        refresh();
                      }}
                    />
                  </View>
                ) : null}
              </View>
            ) : null}
          </Card>
        );
      })}
    </View>
  );
}

/** Şehir sayfasının başında gösterilen belediye başkanı duyurusu */
export function MayorAnnouncement({ cityId }: { cityId: string }) {
  const { t } = useI18n();
  const c = useColors();
  const civic = useCivic(cityId);
  const mayor = civic.data?.holders.find((h) => h.office === 'mayor');
  if (!mayor?.announcement) return null;
  return (
    <Card style={{ marginTop: space.md, borderColor: c.pink }}>
      <Small>{t('announcement')}</Small>
      <Body style={{ marginTop: space.xs }}>{mayor.announcement}</Body>
      <Small style={{ marginTop: space.xs }}>{mayor.name}</Small>
    </Card>
  );
}

// /me ucunun verisi tek sorguda (playtest O-10). Eskiden ~16 ayrı sorgu sırayla gidiyordu; 250 eşzamanlı oyuncuda havuz
// (PG_POOL_MAX 10) sıraya girip p50 2,6 saniyeyi buluyordu. Bu sorgu aynı alanları döndürür; dönüşümler eski yardımcılarla
// (homeOf, hotelOf, businessOf, storedMoodlets, officesOf, achievementPoints, unreadMessages...) birebir aynıdır.

import { ACHIEVEMENT_BY_ID, CITY_BY_ID, HOME_BY_ID, type HomeDto, type HomeId, type MoodletDto, rentFor } from '@rifftown/shared';
import { type Db, one } from '../db';
import type { CharacterRow } from './common';

/** Sorgunun eklediği sütunlar karakter satırından ayrılsın diye öneki */
const X = 'x__';

const SQL = `
SELECT c.*,
  a.id AS ${X}a_id, a.kind AS ${X}a_kind, a.params AS ${X}a_params, a.location_id AS ${X}a_location_id,
  a.started_at AS ${X}a_started_at, a.ends_at AS ${X}a_ends_at, a.status AS ${X}a_status, a.result AS ${X}a_result,
  m.band_id AS ${X}band_id, m.role AS ${X}band_role, b.leader_id AS ${X}band_leader, b.name AS ${X}band_name, b.genre AS ${X}band_genre,
  h.home_id AS ${X}home_id, h.city_id AS ${X}home_city, h.paid_until AS ${X}home_paid_until,
  ht.city_id AS ${X}hotel_city, ht.until AS ${X}hotel_until,
  (SELECT count(*)::int FROM notifications n WHERE n.character_id = c.id AND NOT n.read) AS ${X}unread,
  (SELECT count(*)::int FROM band_invites i WHERE i.character_id = c.id AND i.status = 'pending') AS ${X}invites,
  (SELECT count(*)::int FROM direct_messages d WHERE d.to_id = c.id AND NOT d.read) AS ${X}dms,
  (SELECT count(*)::int FROM trades t WHERE t.to_id = c.id AND t.status = 'open') AS ${X}trades,
  EXISTS (SELECT 1 FROM cases k WHERE k.suspect_id = c.id AND k.status = 'pending') AS ${X}custody,
  (SELECT coalesce(array_agg(o.city_id || ':' || o.office), '{}') FROM office_holders o WHERE o.character_id = c.id) AS ${X}offices,
  (SELECT coalesce(array_agg(ca.achievement_id), '{}') FROM character_achievements ca WHERE ca.character_id = c.id) AS ${X}achievements,
  (SELECT bz.location_id FROM businesses bz WHERE bz.owner_id = c.id LIMIT 1) AS ${X}biz_owner,
  (SELECT s.location_id FROM business_staff s WHERE s.character_id = c.id AND s.status = 'hired' LIMIT 1) AS ${X}biz_staff,
  (SELECT coalesce(json_agg(json_build_object('kind', ml.kind, 'value', ml.value, 'expires_at', ml.expires_at) ORDER BY ml.expires_at DESC), '[]')
     FROM moodlets ml WHERE ml.character_id = c.id AND ml.expires_at > now()) AS ${X}moodlets
FROM characters c
LEFT JOIN actions a ON a.character_id = c.id AND a.status = 'active'
LEFT JOIN band_members m ON m.character_id = c.id
LEFT JOIN bands b ON b.id = m.band_id
LEFT JOIN homes h ON h.character_id = c.id
LEFT JOIN hotel_stays ht ON ht.character_id = c.id AND ht.until > now()
WHERE c.id = $1`;

export interface MeSnapshot {
  ch: CharacterRow;
  action: Record<string, unknown> | null;
  band: { id: number; name: string; genre: string; role: string; leaderId: number } | null;
  offices: { cityId: string; office: string }[];
  inCustody: boolean;
  achievementPoints: number;
  home: HomeDto | null;
  hotel: { cityId: string; until: string } | null;
  business: { locationId: string; role: 'owner' | 'staff' } | null;
  moodlets: MoodletDto[];
  unreadNotifications: number;
  pendingInvites: number;
  unreadMessages: number;
  pendingTrades: number;
}

export async function meSnapshot(db: Db, characterId: number): Promise<MeSnapshot | null> {
  const r = await one<Record<string, any>>(db, SQL, [characterId]);
  if (!r) return null;
  const ch = Object.fromEntries(Object.entries(r).filter(([k]) => !k.startsWith(X))) as unknown as CharacterRow;
  const g = (k: string) => r[X + k];
  const homeId = g('home_id') as string | null;
  return {
    ch,
    action:
      g('a_id') == null
        ? null
        : {
            id: g('a_id'),
            kind: g('a_kind'),
            params: g('a_params'),
            location_id: g('a_location_id'),
            started_at: g('a_started_at'),
            ends_at: g('a_ends_at'),
            status: g('a_status'),
            result: g('a_result'),
          },
    band:
      g('band_id') == null
        ? null
        : { id: Number(g('band_id')), name: g('band_name'), genre: g('band_genre'), role: g('band_role'), leaderId: Number(g('band_leader')) },
    offices: (g('offices') as string[]).map((x) => {
      const i = x.indexOf(':');
      return { cityId: x.slice(0, i), office: x.slice(i + 1) };
    }),
    inCustody: !!g('custody'),
    achievementPoints: (g('achievements') as string[]).reduce((sum, id) => sum + (ACHIEVEMENT_BY_ID[id]?.points ?? 0), 0),
    home:
      homeId && HOME_BY_ID[homeId]
        ? {
            homeId: homeId as HomeId,
            cityId: g('home_city'),
            paidUntil: (g('home_paid_until') as Date).toISOString(),
            rent: rentFor(HOME_BY_ID[homeId], CITY_BY_ID[g('home_city')]?.costMult ?? 1),
          }
        : null,
    hotel: g('hotel_city') ? { cityId: g('hotel_city'), until: (g('hotel_until') as Date).toISOString() } : null,
    business: g('biz_owner')
      ? { locationId: g('biz_owner'), role: 'owner' }
      : g('biz_staff')
        ? { locationId: g('biz_staff'), role: 'staff' }
        : null,
    moodlets: (g('moodlets') as { kind: string; value: number; expires_at: string }[]).map((m) => ({
      id: m.kind,
      effect: m.value,
      endsAt: new Date(m.expires_at).toISOString(),
    })),
    unreadNotifications: g('unread'),
    pendingInvites: g('invites'),
    unreadMessages: g('dms'),
    pendingTrades: g('trades'),
  };
}

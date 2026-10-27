// Bildirimleri Expo push servisi üzerinden telefonlara gönderir.

import { ACHIEVEMENT_BY_ID,
  TITLE_BY_ID, CITY_BY_ID, CRIME_BY_ID, LOCATION_BY_ID, OFFICE_BY_ID, PROFESSION_BY_ID, SKILL_BY_ID, type Lang, gainText, levelUpText, pick, tierName } from '@rifftown/shared';

const skillName = (id: string, l: Lang) => (SKILL_BY_ID[id] ? pick(SKILL_BY_ID[id].name, l) : id);
import { config } from './config';
import { many, pool } from './db';

type Tpl = (d: any, lang: Lang) => { title: string; body: string } | null;

const T = (lang: Lang, tr: string, en: string) => (lang === 'en' ? en : tr);

const ACTION_TEXT: Record<string, Tpl> = {
  study: (d, l) => ({
    title: d.learned ? T(l, 'Yeni beceri!', 'New skill!') : T(l, 'Çalışma bitti', 'Practice finished'),
    body: d.learned
      ? T(l, `${skillName(d.skill, l)} öğrenmeye başladın.`, `You started learning ${skillName(d.skill, l)}.`)
      : `${skillName(d.skill, l)}: ${gainText(d.gain, l)}.`,
  }),
  work: (d, l) => ({ title: T(l, 'Mesai bitti', 'Shift finished'), body: T(l, `${d.pay} $ kazandın`, `You earned $${d.pay}`) }),
  rest: (_d, l) => ({ title: T(l, 'Dinlendin', 'Rested'), body: T(l, 'Ruh hâlin yerine geldi.', 'Your mood is back up.') }),
  busk: (d, l) => ({
    title: T(l, 'Sokak müziği bitti', 'Busking finished'),
    body: T(l, `Şapkada ${d.pay} $ birikti.`, `You collected $${d.pay} in tips.`),
  }),
  treat: (_d, l) => ({ title: T(l, 'Tedavi bitti', 'Treatment finished'), body: T(l, 'Sağlığın düzeldi.', 'Your health improved.') }),
  write_song: (d, l) => ({ title: T(l, 'Yeni şarkı!', 'New song!'), body: T(l, `"${d.title}" hazır: ${tierName('quality', d.quality, l)} bir şarkı`, `"${d.title}" is ready: a ${tierName('quality', d.quality, l)} song`) }),
  rehearse: (d, l) => ({ title: T(l, 'Prova bitti', 'Rehearsal finished'), body: T(l, `Artık şarkıyı ${tierName('familiarity', d.familiarity, l)}.`, `You now: ${tierName('familiarity', d.familiarity, l)}.`) }),
  travel: (d, l) => {
    const city = CITY_BY_ID[d.to];
    return { title: T(l, 'Vardın', 'You arrived'), body: city ? pick(city.name, l) : '' };
  },
  record: (d, l) =>
    d.songRemoved || d.cancelled
      ? null
      : {
          title: T(l, 'Kayıt bitti', 'Recording finished'),
          body: T(l, `"${d.title}": ${tierName('quality', d.quality, l)} bir kayıt`, `"${d.title}": a ${tierName('quality', d.quality, l)} recording`),
        },
  crime: (d, l) =>
    d.cancelled || !d.success
      ? null // yakalanma ayrıca 'arrested' bildirimiyle gelir
      : { title: T(l, 'İş tamam', 'Job done'), body: T(l, `Kimse görmedi. Cebinde ${d.loot} $ var.`, `Nobody saw a thing. $${d.loot} in your pocket.`) },
  investigate: (d, l) =>
    d.cancelled
      ? null
      : {
          title: T(l, 'Soruşturma bitti', 'Investigation finished'),
          body: d.solved
            ? T(l, `Faili buldun ve tutukladın! İkramiye: ${d.bonus} $`, `You found and arrested the culprit! Bonus: $${d.bonus}`)
            : T(l, 'Bu sefer iz bulamadın.', 'No leads this time.'),
        },
};

const TEMPLATES: Record<string, Tpl> = {
  action_done: (d, l) => ACTION_TEXT[d.kind]?.(d, l) ?? null,
  achievement: (d, l) => {
    const a = ACHIEVEMENT_BY_ID[d.id];
    return a ? { title: T(l, 'Başarım açıldı!', 'Achievement unlocked!'), body: `${pick(a.name, l)} · +${a.points}` } : null;
  },
  title_earned: (d, l) => {
    const t = TITLE_BY_ID[d.titleId];
    return t ? { title: T(l, 'Yeni ünvan!', 'New title!'), body: pick(t.name, l) } : null;
  },
  release_out: (d, l) => ({ title: T(l, 'Yeni yayın!', 'New release!'), body: `${d.bandName} · "${d.title}"` }),
  sales_report: (d, l) => ({
    title: T(l, 'Haftalık satışlar', 'Weekly sales'),
    body:
      T(l, `"${d.title}" bu hafta ${d.units} adet sattı, payın ${d.share} $.`, `"${d.title}" sold ${d.units} copies this week, your share is $${d.share}.`) +
      (d.position && CITY_BY_ID[d.cityId] ? T(l, ` ${pick(CITY_BY_ID[d.cityId].name, l)} listesinde ${d.position}. sırada!`, ` #${d.position} in ${pick(CITY_BY_ID[d.cityId].name, l)}!`) : ''),
  }),
  arrested: (d, l) => {
    const crime = CRIME_BY_ID[d.crime];
    return {
      title: T(l, 'Tutuklandın!', 'You were arrested!'),
      body: d.caught
        ? T(l, `${crime ? pick(crime.name, l) : ''} sırasında suç üstü yakalandın. Mahkemeyi bekliyorsun.`, `Caught in the act${crime ? ` (${pick(crime.name, l)})` : ''}. You are awaiting trial.`)
        : T(l, `Polis ${d.officer} seni buldu. Mahkemeyi bekliyorsun.`, `Officer ${d.officer} tracked you down. You are awaiting trial.`),
    };
  },
  convicted: (d, l) => ({
    title: T(l, 'Hüküm giydin', 'Convicted'),
    body: T(l, `${d.sentenceHours} saat hapis cezası.${d.fine ? ` ${d.fine} $ geri alındı.` : ''}`, `${d.sentenceHours} hours in prison.${d.fine ? ` $${d.fine} confiscated.` : ''}`),
  }),
  acquitted: (_d, l) => ({ title: T(l, 'Beraat ettin!', 'Acquitted!'), body: T(l, 'Yargıç seni suçsuz buldu. Özgürsün.', 'The judge found you not guilty. You are free.') }),
  evicted: (d, l) => ({
    title: T(l, 'Evden çıkarıldın', 'You were evicted'),
    body: T(l, `Kirayı (${d.rent} $) ödeyemedin. Emlakçıdan yeni bir ev tutabilirsin.`, `You couldn't pay the rent ($${d.rent}). You can rent a new place at the estate agent.`),
  }),
  released: (_d, l) => ({ title: T(l, 'Tahliye', 'Released'), body: T(l, 'Cezan bitti, özgürsün.', 'Your sentence is over. You are free.') }),
  gig_booked: (d, l) => ({
    title: T(l, 'Yeni konser', 'New gig'),
    body: `${d.bandName} · ${LOCATION_BY_ID[d.locationId] ? pick(LOCATION_BY_ID[d.locationId].name, l) : ''}`,
  }),
  gig_cancelled: (d, l) => ({ title: T(l, 'Konser iptal', 'Gig cancelled'), body: d.bandName }),
  gig_done: (d, l) => ({
    title: d.legendary ? T(l, 'EFSANEVİ bir gece!', 'A LEGENDARY night!') : T(l, 'Konser bitti', 'Gig finished'),
    body: d.present
      ? d.review?.[l] ?? T(l, `${d.attendance} kişi, ${tierName('quality', d.quality, l)} bir konser.`, `${d.attendance} people, a ${tierName('quality', d.quality, l)} show.`)
      : T(l, 'Konsere katılamadın!', 'You missed the gig!'),
  }),
  band_invite: (d, l) => ({ title: T(l, 'Grup daveti', 'Band invite'), body: d.bandName }),
  member_joined: (d, l) => ({ title: T(l, 'Gruba yeni üye', 'New band member'), body: d.name }),
  member_left: (d, l) => ({ title: T(l, 'Üye ayrıldı', 'Member left'), body: d.name }),
  skill_up: (d, l) => ({
    title: T(l, 'Seviye atladın!', 'Level up!'),
    body: levelUpText(d.skill, d.level, l),
  }),
  fame_up: (d, l) => {
    const city = CITY_BY_ID[d.cityId];
    const name = city ? pick(city.name, l) : '';
    return {
      title: T(l, 'Şöhretiniz arttı!', 'Your fame grew!'),
      body: T(l, `${d.bandName} ${name} şehrinde artık ${tierName('fame', d.fame, l)}`, `${d.bandName} in ${name}: ${tierName('fame', d.fame, l)}`),
    };
  },
  promotion: (d, l) => {
    const prof = PROFESSION_BY_ID[d.profession];
    return prof
      ? { title: T(l, 'Terfi ettin!', 'Promoted!'), body: T(l, `Artık ${pick(prof.ranks[d.rank], l)}`, `You are now ${pick(prof.ranks[d.rank], l)}`) }
      : null;
  },
  election_won: (d, l) => {
    const o = OFFICE_BY_ID[d.office];
    const city = CITY_BY_ID[d.cityId];
    return o && city
      ? { title: T(l, 'Seçimi kazandın!', 'You won the election!'), body: `${pick(city.name, l)}: ${pick(o.name, l)}` }
      : null;
  },
  election_lost: (d, l) => {
    const o = OFFICE_BY_ID[d.office];
    return o ? { title: T(l, 'Seçim sonuçlandı', 'Election result'), body: T(l, `${pick(o.name, l)} seçimini kaybettin.`, `You lost the ${pick(o.name, l)} election.`) } : null;
  },
  office_lost: (d, l) => {
    const o = OFFICE_BY_ID[d.office];
    return o ? { title: T(l, 'Görevin sona erdi', 'Your term ended'), body: pick(o.name, l) } : null;
  },
  money_received: (d, l) => ({ title: T(l, 'Para geldi', 'Money received'), body: T(l, `${d.from} sana ${d.amount} $ gönderdi.`, `${d.from} sent you $${d.amount}.`) }),
  kicked: (d, l) => ({ title: T(l, 'Gruptan çıkarıldın', 'Removed from band'), body: d.bandName }),
  message: (d, l) => ({ title: d.from, body: d.preview ?? T(l, 'Yeni mesaj', 'New message') }),
  friend_request: (d, l) => ({ title: T(l, 'Arkadaşlık isteği', 'Friend request'), body: T(l, `${d.from} seni arkadaş olarak eklemek istiyor.`, `${d.from} wants to be friends.`) }),
  proposal: (d, l) => ({ title: T(l, 'Evlilik teklifi!', 'A proposal!'), body: T(l, `${d.from} sana evlilik teklif etti.`, `${d.from} proposed to you.`) }),
  proposal_accepted: (d, l) => ({ title: T(l, 'Evet dedi!', 'They said yes!'), body: T(l, `${d.from} ile nişanlandınız.`, `You are engaged to ${d.from}.`) }),
  gift: (d, l) => ({ title: T(l, 'Hediye geldi', 'You got a gift'), body: `${d.from}${d.name ? `: ${pick(d.name, l)}` : ''}` }),
  item_sold: (d, l) => ({ title: T(l, 'Eşyan satıldı', 'Item sold'), body: T(l, `Pazarda sattığın eşya için ${d.earned} $ aldın.`, `You received $${d.earned} for your market item.`) }),
  job_offer: (d, l) => ({ title: T(l, 'İş teklifi', 'Job offer'), body: T(l, `${d.name}: saati ${d.wage} $`, `${d.name}: $${d.wage} an hour`) }),
  business_seized: (d, l) => ({ title: T(l, 'İşletmeni kaybettin', 'Business lost'), body: T(l, `${d.name} giderleri ödenemediği için elinden alındı.`, `${d.name} was taken over because of unpaid costs.`) }),
  trade_offer: (d, l) => ({ title: T(l, 'Takas teklifi', 'Trade offer'), body: T(l, `${d.from} sana takas teklif etti.`, `${d.from} offered you a trade.`) }),
  trade_accepted: (d, l) => ({ title: T(l, 'Takas tamam', 'Trade done'), body: T(l, `${d.from} takası kabul etti.`, `${d.from} accepted your trade.`) }),
  hospitalized: (_d, l) => ({ title: T(l, 'Hastaneye kaldırıldın', 'Taken to hospital'), body: T(l, 'Sağlığın çok düştü; seni hastaneye götürdüler.', 'Your health dropped too low and you were taken to hospital.') }),
  scandal: (_d, l) => ({ title: T(l, 'Skandal!', 'Scandal!'), body: T(l, 'Grubun kötü bir haberle gazetelerde.', 'Your band is in the papers for the wrong reasons.') }),
  addicted: (_d, l) => ({ title: T(l, 'Bağımlı oldun', 'You are hooked'), body: T(l, 'Aşırı harcamalar bağımlılık yaptı. Hastanede tedavi olabilirsin.', 'Overindulging got you hooked. The hospital can help.') }),
  festival_selected: (d, l) => ({ title: T(l, 'Festivale seçildiniz!', 'You made the festival!'), body: T(l, `${d.slot}. sıradasınız.`, `You play slot ${d.slot}.`) }),
};

export function renderNotification(kind: string, data: any, lang: Lang) {
  return TEMPLATES[kind]?.(data, lang) ?? null;
}

/** Gönderilmemiş bildirimleri toplu olarak Expo'ya iletir. */
export async function sendPendingPushes(fetchImpl: typeof fetch = fetch): Promise<number> {
  const rows = await many(
    pool,
    `SELECT n.id, n.kind, n.data, u.push_token, u.lang
       FROM notifications n
       JOIN characters c ON c.id = n.character_id
       JOIN users u ON u.id = c.user_id
      WHERE NOT n.pushed ORDER BY n.id LIMIT 100`,
  );
  if (rows.length === 0) return 0;
  const messages = [];
  for (const r of rows) {
    if (!r.push_token) continue;
    const msg = renderNotification(r.kind, r.data, r.lang);
    if (!msg) continue;
    messages.push({ to: r.push_token, sound: 'default', title: msg.title, body: msg.body, data: { kind: r.kind, ...r.data } });
  }
  // Önce işaretle: gönderim hata verse bile aynı bildirimi tekrar tekrar göndermeyelim.
  await pool.query('UPDATE notifications SET pushed = TRUE WHERE id = ANY($1::bigint[])', [rows.map((r) => r.id)]);
  if (!config.pushEnabled || messages.length === 0) return 0;
  for (let i = 0; i < messages.length; i += 100) {
    const res = await fetchImpl('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        ...(config.expoAccessToken ? { authorization: `Bearer ${config.expoAccessToken}` } : {}),
      },
      body: JSON.stringify(messages.slice(i, i + 100)),
    }).catch((e) => {
      console.error('push gönderilemedi', e);
      return null;
    });
    if (res && !res.ok) console.error('push hatası', res.status, await res.text().catch(() => ''));
  }
  return messages.length;
}

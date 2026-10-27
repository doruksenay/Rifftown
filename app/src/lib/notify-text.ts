import {
  ACHIEVEMENT_BY_ID,
  TITLE_BY_ID,
  CITY_BY_ID,
  OFFICE_BY_ID,
  PROFESSION_BY_ID,
  type L,
  type Lang,
  type NotificationDto,
  SKILL_BY_ID,
  gainText,
  levelUpText,
  tierName,
} from '@rifftown/shared';
import { money } from './format';
import type { StringKey } from './strings';

type T = (key: StringKey, vars?: Record<string, string | number>) => string;

/** Bildirimi tek satırlık okunur metne çevirir. Sayılar yerine kelimeler kullanılır. */
export function notificationText(n: NotificationDto, t: T, p: (l: L) => string, lang: Lang): string {
  const d = n.data as Record<string, any>;
  const skillName = (id: string) => (SKILL_BY_ID[id] ? p(SKILL_BY_ID[id].name) : id);
  switch (n.kind) {
    case 'welcome':
      return t('n_welcome');
    case 'action_done':
      if (d.kind === 'lesson' && d.skill) return t('n_study', { skill: skillName(d.skill), gain: gainText(d.gain, lang) });
      if (d.kind === 'study') {
        return d.learned ? t('learnedSkill', { skill: skillName(d.skill) }) : t('n_study', { skill: skillName(d.skill), gain: gainText(d.gain, lang) });
      }
      if (d.kind === 'write_song' && d.title) {
        const base = `${t('n_action_done', { action: t('action_write_song') })}: "${d.title}", ${tierName('quality', d.quality, lang)}`;
        const withInspo = d.inspirationBonus ? `${base}. ${t('n_song_inspired', { n: d.inspirationBonus })}` : base;
        return d.fatigued ? `${withInspo}. ${t('n_song_fatigued')}` : withInspo;
      }
      if (d.kind === 'record' && d.title) return t('n_record', { title: d.title, q: tierName('quality', d.quality, lang) });
      if (d.kind === 'crime' && d.success) return t('n_crime_ok', { money: `$${Number(d.loot).toLocaleString('en-US')}` });
      if (d.kind === 'investigate' && !d.cancelled) {
        return d.solved ? t('n_investigate_solved', { money: `$${Number(d.bonus).toLocaleString('en-US')}` }) : t('n_investigate_none');
      }
      if (d.kind === 'video' && typeof d.quality === 'number') return t('n_video_done', { q: tierName('quality', d.quality, lang) });
      if (d.kind === 'travel' && d.breakdown) return d.usedKit ? t('n_breakdown_kit') : t('n_breakdown');
      if (d.kind === 'press' && !d.cancelled) return d.defused ? t('n_press_defused') : d.success ? t('n_press_ok') : t('n_press_bad');
      if (d.kind === 'write_article' && d.title) return t('n_article_published', { title: d.title });
      if (d.kind === 'rehearse' && typeof d.familiarity === 'number') {
        return `${t('n_action_done', { action: t('action_rehearse') })}: ${tierName('familiarity', d.familiarity, lang)}`;
      }
      return t('n_action_done', { action: t(`action_${d.kind}` as StringKey) });
    case 'gig_booked':
      return t('n_gig_booked', { band: d.bandName });
    case 'gig_cancelled':
      return t('n_gig_cancelled', { band: d.bandName });
    case 'gig_done':
      if (!d.present) return t('n_gig_missed', { band: d.bandName });
      if (d.legendary) return t('n_gig_legendary', { band: d.bandName });
      return d.review?.[lang] ? `${d.bandName}: ${d.review[lang]}` : t('n_gig_done', { band: d.bandName, n: d.attendance, q: tierName('quality', d.quality, lang) });
    case 'skill_up':
      return levelUpText(d.skill, d.level, lang);
    case 'fame_up':
      return t('n_fame_up', {
        band: d.bandName,
        city: CITY_BY_ID[d.cityId] ? p(CITY_BY_ID[d.cityId].name) : '',
        tier: tierName('fame', d.fame, lang),
      });
    case 'band_invite':
      return t('n_band_invite', { band: d.bandName });
    case 'member_joined':
      return t('n_member_joined', { name: d.name });
    case 'member_left':
      return t('n_member_left', { name: d.name });
    case 'kicked':
      return t('n_kicked', { band: d.bandName });
    case 'money_received':
      return t('n_money_received', { from: d.from, money: `$${Number(d.amount).toLocaleString('en-US')}` });
    case 'promotion': {
      const prof = PROFESSION_BY_ID[d.profession];
      return t('n_promotion', { rank: prof ? p(prof.ranks[d.rank] ?? prof.ranks[0]) : '' });
    }
    case 'election_won':
      return t('n_election_won', {
        city: CITY_BY_ID[d.cityId] ? p(CITY_BY_ID[d.cityId].name) : '',
        office: OFFICE_BY_ID[d.office] ? p(OFFICE_BY_ID[d.office].name).toLocaleLowerCase(lang === 'en' ? 'en' : 'tr') : '',
      });
    case 'election_lost':
      return t('n_election_lost', { office: OFFICE_BY_ID[d.office] ? p(OFFICE_BY_ID[d.office].name) : '' });
    case 'office_lost':
      return t('n_office_lost', { office: OFFICE_BY_ID[d.office] ? p(OFFICE_BY_ID[d.office].name) : '' });
    case 'achievement': {
      const a = ACHIEVEMENT_BY_ID[d.id];
      return a ? t('n_achievement', { name: p(a.name), points: a.points }) : n.kind;
    }
    case 'lesson_given':
      return t('n_lesson_given', { student: d.student ?? '', skill: skillName(d.skill) });
    case 'lesson_invite':
      return t('n_lesson_invite', { from: d.from ?? '', skill: skillName(d.skill) });
    case 'title_earned': {
      const ti = TITLE_BY_ID[d.titleId];
      return ti ? t('n_title_earned', { name: p(ti.name) }) : n.kind;
    }
    case 'release_out':
      return t('n_release_out', { band: d.bandName, title: d.title });
    case 'sales_report': {
      const base = t('n_sales_report', { title: d.title, n: d.units, money: `$${Number(d.share).toLocaleString('en-US')}` });
      return d.position && CITY_BY_ID[d.cityId] ? `${base} ${t('n_sales_chart', { city: p(CITY_BY_ID[d.cityId].name), pos: d.position })}` : base;
    }
    case 'arrested':
      return d.caught ? t('n_arrested_caught') : t('n_arrested', { officer: d.officer ?? '' });
    case 'convicted':
      return t('n_convicted', { h: d.sentenceHours });
    case 'acquitted':
      return t('n_acquitted');
    case 'released':
      return t('n_released');
    case 'rent_paid':
      return t('n_rent_paid', { money: `$${Number(d.rent).toLocaleString('en-US')}` });
    case 'evicted':
      return t('n_evicted');
    case 'message':
    case 'friend_request':
    case 'friend_accepted':
    case 'guestbook':
    case 'hangout':
    case 'flirt':
    case 'date':
    case 'proposal':
    case 'proposal_accepted':
    case 'proposal_declined':
    case 'broke_up':
    case 'divorced':
      return t(`n_${n.kind}` as StringKey, { from: d.from ?? '' });
    case 'gift':
      return t('n_gift', { from: d.from ?? '', item: d.name ? p(d.name) : '' });
    case 'wedding':
      return t('n_wedding');
    case 'adoption_request':
    case 'adoption_done':
      return t(`n_${n.kind}` as StringKey, { name: d.name ?? '' });
    case 'item_sold':
      return t('n_item_sold', { money: money(d.earned ?? 0) });
    case 'job_offer':
      return t('n_job_offer', { name: d.name ?? '', money: money(d.wage ?? 0) });
    case 'job_accepted':
    case 'job_declined':
      return t(`n_${n.kind}` as StringKey, { name: d.name ?? '' });
    case 'job_lost':
      return t('n_job_lost');
    case 'business_seized':
      return t('n_business_seized', { name: d.name ?? '' });
    case 'trade_offer':
    case 'trade_accepted':
    case 'trade_declined':
      return t(`n_${n.kind}` as StringKey, { from: d.from ?? '' });
    case 'trade_failed':
      return t('n_trade_failed');
    case 'crew_quit':
    case 'label_counter':
    case 'label_declined':
    case 'label_signed':
      return t(`n_${n.kind}` as StringKey);
    case 'tour_done':
    case 'tour_failed':
      return t(`n_${n.kind}` as StringKey, { name: d.name ?? '', n: d.played ?? 0, total: d.total ?? 0 });
    case 'video_chart':
      return t('n_video_chart', { pos: d.position ?? '' });
    case 'label_offer':
      return t('n_label_offer', { label: d.label ?? '' });
    case 'label_closed':
      return t('n_label_closed', { name: d.name ?? '' });
    case 'press_article':
      return t('n_press_article', { by: d.by ?? '', title: d.title ?? '' });
    case 'scandal':
      return t('n_scandal', { kind: t(`scandal_${d.kind}` as StringKey), city: CITY_BY_ID[d.cityId] ? p(CITY_BY_ID[d.cityId].name) : '' });
    case 'addicted':
    case 'recovered':
    case 'hospitalized':
      return t(`n_${n.kind}` as StringKey);
    case 'member_died':
    case 'partner_died':
      return t(`n_${n.kind}` as StringKey, { name: d.name ?? '' });
    case 'festival_selected':
      return t('n_festival_selected', { slot: d.slot ?? '' });
    default:
      return n.kind;
  }
}

/** Bildirime dokununca gidilecek ekran */
export function notificationHref(n: NotificationDto, myId?: number): string | null {
  const d = n.data as Record<string, any>;
  if (n.kind.startsWith('gig_') && d.gigId) return `/gig/${d.gigId}`;
  if (n.kind === 'band_invite' || n.kind.startsWith('member_') || n.kind === 'fame_up') return '/band';
  if (n.kind === 'skill_up') return '/skills';
  if (n.kind === 'promotion') return '/careers';
  if ((n.kind === 'election_won' || n.kind === 'election_lost' || n.kind === 'office_lost') && d.cityId) return `/location/${d.cityId}-city_hall`;
  if (n.kind === 'action_done' && d.kind === 'write_song') return '/me';
  if (n.kind === 'achievement') return '/achievements';
  if (n.kind === 'lesson_invite' && d.fromId) return `/character/${d.fromId}`;
  if ((n.kind === 'evicted' || n.kind === 'rent_paid') && d.cityId) return `/location/${d.cityId}-real_estate`;
  if (n.kind === 'release_out' || n.kind === 'sales_report' || (n.kind === 'action_done' && d.kind === 'record')) return '/releases';
  if (n.kind === 'arrested' || n.kind === 'convicted' || n.kind === 'acquitted') return '/';
  if (['message'].includes(n.kind) && d.fromId) return `/messages/${d.fromId}`;
  if (n.kind === 'guestbook') return myId ? `/character/${myId}` : null;
  if (['friend_request', 'friend_accepted'].includes(n.kind)) return '/friends';
  if (['hangout', 'flirt', 'date', 'proposal', 'proposal_accepted', 'proposal_declined', 'broke_up', 'divorced', 'gift', 'wedding', 'adoption_request'].includes(n.kind) && d.fromId)
    return `/character/${d.fromId}`;
  if (n.kind.startsWith('job_') && d.locationId) return `/location/${d.locationId}`;
  if (n.kind === 'item_sold') return '/me';
  if (n.kind.startsWith('trade_')) return '/trades';
  if (n.kind.startsWith('label_')) return '/label';
  if (n.kind.startsWith('tour_') || n.kind === 'crew_quit') return '/tour';
  if (n.kind === 'video_chart') return '/charts';
  if (n.kind === 'hospitalized' && d.cityId) return `/location/${d.cityId}-hospital`;
  if (n.kind === 'scandal' || n.kind === 'member_died') return '/band';
  if (n.kind === 'festival_selected' && d.cityId) return `/location/${d.cityId}-festival`;
  return null;
}

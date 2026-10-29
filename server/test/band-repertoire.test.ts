// Grup varken yazılan şarkı kendiliğinden repertuvara girer (playtest O-1). Gruba katılmadan önce yazılanlar elle eklenir;
// repertuvardan çıkarmak eskisi gibi çalışır.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { pool } from '../src/db';
import { advance, newPlayer, setup, teardown } from './helpers';

beforeAll(setup);
afterAll(teardown);

const bandSongs = async (c: Awaited<ReturnType<typeof newPlayer>>['c']) =>
  ((await c.get('/api/bands/mine')).body.band.songs as { id: number; title: string }[]).map((s) => s.title).sort();

describe('grup repertuvarı', () => {
  it('kurucunun grup kurulduktan sonra yazdığı şarkı repertuvara girer, bildirim söyler', async () => {
    const a = await newPlayer();
    await a.c.post('/api/actions', { kind: 'write_song', title: 'Önce', genre: 'rock' });
    await advance();
    expect((await a.c.post('/api/bands', { name: 'Repertuvar', genre: 'rock', role: 'guitar' })).status).toBe(200);
    await a.c.post('/api/actions', { kind: 'write_song', title: 'Sonra', genre: 'rock' });
    await advance();
    expect(await bandSongs(a.c)).toEqual(['Sonra', 'Önce'].sort());
    const n = (await a.c.get('/api/notifications')).body.notifications.find((x: { kind: string; data: { title?: string } }) => x.kind === 'action_done' && x.data.title === 'Sonra');
    expect(n.data.addedToBand).toBe(true);
  });

  it('üyenin gruba katılmadan önceki şarkıları girmez, sonra yazdıkları girer; çıkarılan şarkı geri gelmez', async () => {
    const lead = await newPlayer();
    const mem = await newPlayer({ instrument: 'drums' });
    await mem.c.post('/api/actions', { kind: 'write_song', title: 'Eski', genre: 'rock' });
    await advance();
    await lead.c.post('/api/bands', { name: 'Katılım', genre: 'rock', role: 'guitar' });
    await lead.c.post('/api/bands/mine/invites', { name: mem.character.name, role: 'drums' });
    const inv = (await pool.query(`SELECT id FROM band_invites WHERE character_id = $1 AND status = 'pending'`, [mem.character.id])).rows[0].id;
    expect((await mem.c.post(`/api/invites/${inv}/accept`)).status).toBe(200);
    expect(await bandSongs(lead.c)).toEqual([]);
    await mem.c.post('/api/actions', { kind: 'write_song', title: 'Yeni', genre: 'rock' });
    await advance();
    expect(await bandSongs(lead.c)).toEqual(['Yeni']);
    // Eski şarkı elle eklenir
    const old = (await pool.query(`SELECT id FROM songs WHERE author_id = $1 AND title = 'Eski'`, [mem.character.id])).rows[0].id;
    expect((await mem.c.post('/api/bands/mine/songs', { songId: Number(old) })).status).toBe(200);
    expect(await bandSongs(lead.c)).toEqual(['Eski', 'Yeni']);
    // Lider çıkarır; kendiliğinden geri gelmez
    const yeni = (await pool.query(`SELECT id FROM songs WHERE title = 'Yeni' AND author_id = $1`, [mem.character.id])).rows[0].id;
    expect((await lead.c.del(`/api/bands/mine/songs/${yeni}`)).status).toBe(200);
    expect(await bandSongs(lead.c)).toEqual(['Eski']);
  });

  it('grubu olmayanın şarkısı hiçbir repertuvara girmez', async () => {
    const p = await newPlayer();
    await p.c.post('/api/actions', { kind: 'write_song', title: 'Yalnız', genre: 'pop' });
    await advance();
    const sid = (await pool.query(`SELECT id FROM songs WHERE author_id = $1`, [p.character.id])).rows[0].id;
    expect((await pool.query('SELECT count(*)::int AS n FROM band_songs WHERE song_id = $1', [sid])).rows[0].n).toBe(0);
  });
});

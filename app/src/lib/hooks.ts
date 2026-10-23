import type {
  BandDetailDto,
  CityResponse,
  InventoryItemDto,
  InviteDto,
  NotificationDto,
  SongDto,
} from '@rifftown/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { useToast } from '@/components/ui';
import { api } from './api';
import { useI18n } from './i18n';
import { useSession } from './session';

export function useBand() {
  const { token } = useSession();
  return useQuery({
    queryKey: ['band'],
    queryFn: () => api.get<{ band: BandDetailDto | null }>('/bands/mine').then((r) => r.band),
    enabled: !!token,
    refetchInterval: 30000,
  });
}

export function useSongs() {
  return useQuery({ queryKey: ['songs'], queryFn: () => api.get<{ songs: SongDto[] }>('/songs/mine').then((r) => r.songs) });
}

export function useInventory() {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: () => api.get<{ items: InventoryItemDto[] }>('/inventory').then((r) => r.items),
  });
}

export function useInvites() {
  return useQuery({ queryKey: ['invites'], queryFn: () => api.get<{ invites: InviteDto[] }>('/invites').then((r) => r.invites) });
}

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get<{ notifications: NotificationDto[] }>('/notifications').then((r) => r.notifications),
    refetchInterval: 15000,
  });
}

export function useCity(cityId: string | null | undefined) {
  return useQuery({
    queryKey: ['city', cityId],
    queryFn: () => api.get<CityResponse>(`/cities/${cityId}`),
    enabled: !!cityId,
    refetchInterval: 60000,
  });
}

/** Sunucuya değişiklik gönderir; hatayı kısa bildirimle gösterir, ilgili verileri yeniler. */
export function useRun() {
  const qc = useQueryClient();
  const toast = useToast();
  const { err } = useI18n();
  const [pending, setPending] = useState(false);
  const run = useCallback(
    async <T>(fn: () => Promise<T>, opts: { success?: string; invalidate?: string[] } = {}): Promise<T | null> => {
      setPending(true);
      try {
        const r = await fn();
        if (opts.success) toast(opts.success);
        return r;
      } catch (e) {
        toast(err(e), 'error');
        return null;
      } finally {
        setPending(false);
        const keys = opts.invalidate ?? ['me'];
        await Promise.all(keys.map((k) => qc.invalidateQueries({ queryKey: [k] })));
      }
    },
    [qc, toast, err],
  );
  return { run, pending };
}

import type { AuthResponse, ConfigResponse, MeResponse } from '@rifftown/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, setToken, setUnauthorizedHandler } from './api';
import { syncPurchasesUser } from './purchases';
import { useI18n } from './i18n';
import { storage } from './storage';

interface Session {
  ready: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [token, setTok] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const qc = useQueryClient();
  const { lang } = useI18n();

  const apply = useCallback(
    async (t: string | null) => {
      setToken(t);
      setTok(t);
      await storage.set('token', t);
      if (!t) qc.clear();
    },
    [qc],
  );

  useEffect(() => {
    storage.get('token').then((t) => {
      setToken(t);
      setTok(t);
      setReady(true);
    });
    setUnauthorizedHandler(() => apply(null));
  }, [apply]);

  const value = useMemo<Session>(
    () => ({
      ready,
      token,
      login: async (email, password) => {
        const r = await api.post<AuthResponse>('/auth/login', { email, password });
        await apply(r.token);
      },
      register: async (email, password) => {
        const r = await api.post<AuthResponse>('/auth/register', { email, password, lang, acceptTerms: true });
        await apply(r.token);
      },
      logout: async () => {
        await api.post('/auth/logout').catch(() => {});
        await syncPurchasesUser(null);
        await apply(null);
      },
    }),
    [ready, token, apply, lang],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession() {
  const v = useContext(Ctx);
  if (!v) throw new Error('SessionProvider eksik');
  return v;
}

/** Karakter, süren eylem ve özet bilgiler. Eylem sürerken sık yenilenir. */
export function useMe() {
  const { token } = useSession();
  return useQuery({
    queryKey: ['me'],
    queryFn: () => api.get<MeResponse>('/me'),
    enabled: !!token,
    refetchInterval: (q) => (q.state.data?.action ? 5000 : 20000),
  });
}

export function useConfig() {
  return useQuery({
    queryKey: ['config'],
    queryFn: () => api.get<ConfigResponse>('/config'),
    staleTime: 10 * 60 * 1000,
  });
}

/** Oyun hızı (1 = gerçek zaman); yüklenene kadar 1 kabul edilir. */
export function useGameSpeed() {
  return useConfig().data?.gameSpeed ?? 1;
}

/** VIP üye mi? (VIP'e özel gösterimler ve kilitler için) */
export function useIsVip() {
  return !!useMe().data?.user.isVip;
}

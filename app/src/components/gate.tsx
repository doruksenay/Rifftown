import { Redirect } from 'expo-router';
import type { ReactElement } from 'react';
import { ErrorView, Loading } from '@/components/ui';
import { useMe, useSession } from '@/lib/session';

/** Oturum ve karakter yüklenene kadar ekranı bekletir.
 *  Doğrudan bağlantıyla (bildirim, web'de yenileme) açılan ekranlar için gerekli. */
export function useGate(): ReactElement | null {
  const { ready, token } = useSession();
  const me = useMe();
  if (!ready) return <Loading />;
  if (!token) return <Redirect href="/login" />;
  if (me.isLoading) return <Loading />;
  if (!me.data) return <ErrorView error={me.error} onRetry={() => me.refetch()} />;
  if (!me.data.character) return <Redirect href="/create-character" />;
  return null;
}

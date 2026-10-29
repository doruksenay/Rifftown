// Kullanım şartları, gizlilik politikası, iletişim ve hesap silme (mağaza kuralları).

import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, View } from 'react-native';
import { Body, Button, Field, Heading, Row, useToast } from '@/components/ui';
import { API_URL, api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { useConfig, useSession } from '@/lib/session';
import { useQueryClient } from '@tanstack/react-query';
import { space, useColors } from '@/theme';

export function LegalLinks() {
  const { t } = useI18n();
  return (
    <Row style={{ flexWrap: 'wrap', gap: space.md }}>
      <Button title={t('terms')} variant="ghost" small style={{ paddingHorizontal: 0 }} onPress={() => Linking.openURL(`${API_URL}/legal/terms`)} />
      <Button title={t('privacy')} variant="ghost" small style={{ paddingHorizontal: 0 }} onPress={() => Linking.openURL(`${API_URL}/legal/privacy`)} />
    </Row>
  );
}

/** Ayarlar bölümünde: yasal bağlantılar, iletişim, hesabı silme */
export function AccountSettings() {
  const { t, err } = useI18n();
  const c = useColors();
  const cfg = useConfig();
  const toast = useToast();
  const qc = useQueryClient();
  const { logout } = useSession();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const email = (cfg.data as { contactEmail?: string } | undefined)?.contactEmail;

  const remove = async () => {
    setBusy(true);
    try {
      await api.post('/auth/delete-account', { password });
      toast(t('accountDeleted'));
      await logout().catch(() => {});
      qc.clear();
      router.replace('/login');
    } catch (e) {
      toast(err(e), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ marginTop: space.lg }}>
      <LegalLinks />
      {email ? (
        <Button title={t('contact', { email })} variant="ghost" small style={{ paddingHorizontal: 0, alignSelf: 'flex-start' }} onPress={() => Linking.openURL(`mailto:${email}`)} />
      ) : null}
      <Button title={t('changePassword')} variant="ghost" small style={{ alignSelf: 'flex-start', paddingHorizontal: 0 }} onPress={() => router.push('/change-password')} />
      <Heading>{t('deleteAccount')}</Heading>
      {!open ? (
        <Button title={t('deleteAccount')} variant="ghost" small style={{ alignSelf: 'flex-start', paddingHorizontal: 0 }} onPress={() => setOpen(true)} />
      ) : (
        <View>
          <Body color={c.danger} style={{ marginBottom: space.md }}>{t('deleteAccountIntro')}</Body>
          <Field label={t('deleteAccountConfirm')} value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password" />
          <Row>
            <Button title={t('cancel')} variant="secondary" small onPress={() => setOpen(false)} />
            <Button title={t('deleteForever')} variant="danger" small loading={busy} disabled={!password} onPress={remove} />
          </Row>
        </View>
      )}
    </View>
  );
}

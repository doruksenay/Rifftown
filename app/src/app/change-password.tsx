// Şifre değiştirme (playtest Y-6). Değişince bu cihaz dışındaki bütün oturumlar sunucuda kapanır.

import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { Body, Button, Field, Screen, useToast } from '@/components/ui';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { space, useColors } from '@/theme';

/** Sunucudaki kural: yeni şifre en az 8 karakter */
const MIN_PASSWORD = 8;

export default function ChangePassword() {
  const { t, err } = useI18n();
  const c = useColors();
  const toast = useToast();
  const [oldPassword, setOld] = useState('');
  const [newPassword, setNew] = useState('');
  const [repeat, setRepeat] = useState('');
  const [busy, setBusy] = useState(false);
  const tooShort = newPassword.length > 0 && newPassword.length < MIN_PASSWORD;
  const mismatch = repeat.length > 0 && repeat !== newPassword;
  const ready = !!oldPassword && newPassword.length >= MIN_PASSWORD && repeat === newPassword;

  const submit = async () => {
    setBusy(true);
    try {
      await api.post('/auth/change-password', { oldPassword, newPassword });
      toast(t('passwordChanged'));
      router.back();
    } catch (e) {
      toast(err(e), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: t('changePassword') }} />
      <Body color={c.inkSoft} style={{ marginTop: space.lg, marginBottom: space.lg }}>
        {t('changePasswordIntro')}
      </Body>
      <Field label={t('currentPassword')} value={oldPassword} onChangeText={setOld} secureTextEntry autoComplete="current-password" />
      <Field
        label={t('newPassword')}
        hint={tooShort ? t('passwordTooShort', { n: MIN_PASSWORD }) : undefined}
        value={newPassword}
        onChangeText={setNew}
        secureTextEntry
        autoComplete="new-password"
      />
      <Field
        label={t('newPasswordRepeat')}
        hint={mismatch ? t('passwordMismatch') : undefined}
        value={repeat}
        onChangeText={setRepeat}
        secureTextEntry
        autoComplete="new-password"
      />
      <Button title={t('changePassword')} loading={busy} disabled={!ready} onPress={submit} />
    </Screen>
  );
}

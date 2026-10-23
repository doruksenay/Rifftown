import type { Lang } from '@rifftown/shared';
import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native';
import { LegalLinks } from '@/components/legal';
import { BrandLogo } from '@/components/brand';
import { Body, Button, Choice, Field, Screen, Small, useToast } from '@/components/ui';
import { useI18n } from '@/lib/i18n';
import { useSession } from '@/lib/session';
import { fonts, space, type, useColors } from '@/theme';

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const { t, err, lang, setLang } = useI18n();
  const { login, register } = useSession();
  const toast = useToast();
  const c = useColors();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      if (mode === 'login') await login(email.trim(), password);
      else await register(email.trim(), password);
    } catch (e) {
      toast(err(e), 'error');
    } finally {
      setBusy(false);
    }
  };

  const motto = { fontFamily: fonts.display, fontSize: type.lead, lineHeight: type.lead * 1.3 };
  const canSubmit = email.includes('@') && password.length >= (mode === 'register' ? 8 : 1) && (mode === 'login' || accepted);

  return (
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ alignItems: 'flex-end', paddingTop: space.lg }}>
          <Choice<Lang>
            options={[
              { value: 'tr', label: 'Türkçe' },
              { value: 'en', label: 'English' },
            ]}
            value={lang}
            onChange={setLang}
          />
        </View>
        <View style={{ paddingTop: space.xl, paddingBottom: space.xl, alignItems: 'center' }}>
          <BrandLogo width={240} />
          <View
            accessible
            accessibilityRole="header"
            accessibilityLabel={`${t('brandLine1')} ${t('brandLine2')}`}
            style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'baseline', columnGap: 6, marginTop: space.md }}
          >
            <Text style={[motto, { color: c.ink }]}>{t('brandLine1')}</Text>
            <Text style={[motto, { color: c.pink }]}>{t('brandLine2')}</Text>
          </View>
          <Body style={{ marginTop: space.xs, maxWidth: 320, textAlign: 'center' }} color={c.inkSoft}>
            {t('tagline')}
          </Body>
        </View>
        <Field
          label={t('email')}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          inputMode="email"
        />
        <Field
          label={t('password')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          hint={mode === 'register' ? t('passwordHint') : undefined}
          onSubmitEditing={canSubmit ? submit : undefined}
        />
        {mode === 'register' ? (
          <View style={{ marginBottom: space.lg, gap: space.xs }}>
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: accepted }}
              onPress={() => setAccepted((a) => !a)}
              style={{ flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' }}
            >
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 4,
                  borderWidth: 1.5,
                  borderColor: accepted ? c.blue : c.line,
                  backgroundColor: accepted ? c.blue : 'transparent',
                  marginTop: 2,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {accepted ? <Small color={c.onBlue}>✓</Small> : null}
              </View>
              <Small color={c.ink} style={{ flex: 1 }}>{t('acceptTermsText')}</Small>
            </Pressable>
            <LegalLinks />
          </View>
        ) : null}
        <Button title={mode === 'login' ? t('login') : t('register')} onPress={submit} loading={busy} disabled={!canSubmit} />
        <Link href={mode === 'login' ? '/register' : '/login'} replace asChild>
          <Pressable style={{ paddingVertical: space.lg }} accessibilityRole="link">
            <Small color={c.blue}>{mode === 'login' ? t('noAccount') : t('haveAccount')}</Small>
          </Pressable>
        </Link>
      </KeyboardAvoidingView>
    </Screen>
  );
}

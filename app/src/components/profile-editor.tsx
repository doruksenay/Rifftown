// Profil düzenleme: fotoğraf, başlık ve açıklama.

import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Avatar, Button, Field, Heading, Row, Small, useToast } from '@/components/ui';
import { api } from '@/lib/api';
import { useRun } from '@/lib/hooks';
import { useI18n } from '@/lib/i18n';
import { useMe } from '@/lib/session';
import { space } from '@/theme';

const SIZE = 512;

/** Galeriden fotoğraf seçer, kare kırpar, 512 piksele küçültüp JPEG olarak base64 verir. */
async function pickSquareJpeg(): Promise<string | null | 'denied'> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return 'denied';
  const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 1 });
  if (res.canceled || !res.assets[0]) return null;
  const a = res.assets[0];
  const side = Math.min(a.width || SIZE, a.height || SIZE);
  const ctx = ImageManipulator.manipulate(a.uri);
  // Düzenleme ekranı olmayan yerlerde (web) ortadan kare kırp
  if (a.width && a.height && a.width !== a.height) {
    ctx.crop({ originX: Math.floor((a.width - side) / 2), originY: Math.floor((a.height - side) / 2), width: side, height: side });
  }
  ctx.resize({ width: SIZE, height: SIZE });
  const img = await ctx.renderAsync();
  const out = await img.saveAsync({ format: SaveFormat.JPEG, compress: 0.8, base64: true });
  return out.base64 ?? null;
}

export function ProfileEditor() {
  const { t } = useI18n();
  const me = useMe();
  const toast = useToast();
  const { run, pending } = useRun();
  const ch = me.data!.character!;
  const [headline, setHeadline] = useState(ch.headline);
  const [bio, setBio] = useState(ch.bio);
  useEffect(() => setHeadline(ch.headline), [ch.headline]);
  useEffect(() => setBio(ch.bio), [ch.bio]);
  const dirty = headline !== ch.headline || bio !== ch.bio;

  const choose = async () => {
    let data: string | null | 'denied' = null;
    try {
      data = await pickSquareJpeg();
    } catch {
      toast(t('err_invalid_image'), 'error');
      return;
    }
    if (data === 'denied') return toast(t('photoPermission'), 'error');
    if (!data) return;
    await run(() => api.post('/character/avatar', { data }), { success: t('photoUpdated'), invalidate: ['me'] });
  };

  return (
    <View>
      <Heading>{t('editProfile')}</Heading>
      <Row style={{ gap: space.lg, marginBottom: space.lg }}>
        <Avatar name={ch.name} color={ch.avatarColor} uri={ch.avatarUrl} size={72} />
        <View style={{ flex: 1, gap: space.sm }}>
          <Row style={{ flexWrap: 'wrap' }}>
            <Button title={ch.avatarUrl ? t('changePhoto') : t('choosePhoto')} small variant="secondary" loading={pending} onPress={choose} />
            {ch.avatarUrl ? (
              <Button
                title={t('removePhoto')}
                small
                variant="ghost"
                disabled={pending}
                onPress={() => run(() => api.del('/character/avatar'), { success: t('photoRemoved'), invalidate: ['me'] })}
              />
            ) : null}
          </Row>
          <Small>{t('photoRules')}</Small>
        </View>
      </Row>
      <Field label={t('headline')} hint={t('headlineHint')} value={headline} onChangeText={setHeadline} placeholder={t('headlinePlaceholder')} maxLength={80} />
      <Field
        label={t('bio')}
        value={bio}
        onChangeText={setBio}
        placeholder={t('bioPlaceholder')}
        multiline
        maxLength={1000}
        style={{ minHeight: 110, textAlignVertical: 'top' }}
      />
      <Button
        title={t('save')}
        variant="secondary"
        disabled={!dirty || pending}
        onPress={() => run(() => api.patch('/character', { headline, bio }), { success: t('saved') })}
      />
    </View>
  );
}

// Marka öğeleri: Rifftown logosu ve degrade başlık.

import { LinearGradient } from 'expo-linear-gradient';
import { Image, Text, View, useColorScheme } from 'react-native';
import { brand, fonts, gradients } from '@/theme';

const LOGO = require('../../assets/images/logo.png');
const LOGO_DARK = require('../../assets/images/logo-dark.png');
const PICK = require('../../assets/images/pick.png');

/** Penalı tam logo; karanlık temada "Riff" yazısı beyaz olan sürüm kullanılır. */
export function BrandLogo({ width = 260 }: { width?: number }) {
  const dark = useColorScheme() === 'dark';
  return (
    <Image
      source={dark ? LOGO_DARK : LOGO}
      accessibilityRole="image"
      accessibilityLabel="Rifftown"
      style={{ width, height: width * (1005 / 1105) }}
      resizeMode="contain"
    />
  );
}

/** Sadece pena simgesi */
export function BrandMark({ size = 48 }: { size?: number }) {
  return <Image source={PICK} accessibilityElementsHidden importantForAccessibility="no" style={{ width: size, height: size }} resizeMode="contain" />;
}

/** Büyük, degrade zeminli başlık rozeti (VIP sayfası gibi) */
export function GradientBadge({ text, size = 64 }: { text: string; size?: number }) {
  return (
    <View accessible accessibilityRole="header" accessibilityLabel={text} style={{ alignSelf: 'flex-start', borderRadius: size * 0.35, overflow: 'hidden' }}>
      <LinearGradient colors={gradients.epic} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingHorizontal: size * 0.4, paddingVertical: size * 0.1 }}>
        <Text style={{ fontFamily: fonts.display, fontSize: size, lineHeight: size * 1.2, color: brand.offWhite }}>{text}</Text>
      </LinearGradient>
    </View>
  );
}

// Ekran başlıklarında kenardan kenara resimler.

import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Avatar, Display, Small } from '@/components/ui';
import { space, useColors } from '@/theme';
import { CitySkyline } from './skyline';

/** Ekranın yan boşluklarını aşan, kenardan kenara resim alanı */
export function Bleed({ children, top = 0 }: { children: ReactNode; top?: number }) {
  return <View style={{ marginHorizontal: -space.lg, marginTop: top, overflow: 'hidden' }}>{children}</View>;
}

/** Ana ekran: bulunduğun şehrin gecesi ve önünde sen */
export function CityHero({
  cityId,
  name,
  color,
  avatarUrl,
  lines,
}: {
  cityId: string | null;
  name: string;
  color: string;
  avatarUrl?: string | null;
  lines: string[];
}) {
  const c = useColors();
  const size = 76;
  return (
    <View>
      <Bleed>
        {/* Yoldayken: adı olmayan bir şehrin ışıkları */}
        <CitySkyline cityId={cityId ?? 'on-the-road'} height={150} />
      </Bleed>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: space.md, marginTop: -size / 2 }}>
        <View style={{ borderRadius: size, borderWidth: 4, borderColor: c.paper, backgroundColor: c.paper }}>
          <Avatar name={name} color={color} uri={avatarUrl} size={size} />
        </View>
        <View style={{ flex: 1, paddingBottom: 2 }}>
          <Display numberOfLines={1}>{name}</Display>
        </View>
      </View>
      <View style={{ marginTop: space.xs }}>
        {lines.map((l) => (
          <Small key={l}>{l}</Small>
        ))}
      </View>
    </View>
  );
}

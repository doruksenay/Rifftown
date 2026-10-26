// Eşya çıkartmaları: gitar kutusuna yapıştırılmış çıkartma gibi, beyaz kenarlı.
// Enstrüman, kıyafet, araç ve sprey boyalar boyandıkları renkte çizilir.

import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, Line, LinearGradient, Path, Polygon, Rect, Stop } from 'react-native-svg';
import { ITEM_BY_ID, PAINT_COLORS, type PaintColor } from '@rifftown/shared';
import { night, shade } from './seed';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

const TIER_BG: Record<number, [string, string]> = {
  1: ['#2A1868', '#3B1F86'],
  2: ['#1D3A7A', '#3B82FF'],
  3: [night.purple, night.pink],
  4: ['#B8860B', '#FF8A3D'],
};

/** Boyanmamış eşyanın fabrika rengi */
const FACTORY: Record<string, string> = {
  guitar: '#D7263D',
  bass: '#0E6FBF',
  drums: '#8A2BFF',
  keys: '#1B1B1E',
  vocals: '#A7ADB8',
  outfit: '#3B82FF',
  vehicle: '#E8E9F3',
};

const WOOD = '#8B5A2B';
const DARK = '#0F0830';

export function Guitar({ c, bass }: { c: string; bass?: boolean }) {
  const neckTop = bass ? 2 : 6;
  return (
    <G transform="rotate(32 32 34)">
      <Rect x={30.2} y={neckTop} width={3.6} height={30} fill={WOOD} />
      <Rect x={28.6} y={neckTop - 4} width={6.8} height={8} rx={1.5} fill={DARK} />
      {[0, 1, 2].map((i) => (
        <Circle key={i} cx={i % 2 ? 36.5 : 27.5} cy={neckTop - 2 + i * 2.6} r={1} fill={night.paper} />
      ))}
      <Circle cx={32} cy={47} r={12} fill={c} />
      <Circle cx={bass ? 33 : 32} cy={34} r={bass ? 8 : 9} fill={c} />
      <Rect x={26} y={36} width={12} height={10} fill={c} />
      <Path d="M24 50 a12 12 0 0 0 16 0" stroke={shade(c, -0.35)} strokeWidth={2} fill="none" />
      <Rect x={28} y={38} width={8} height={2.4} rx={1} fill={DARK} />
      <Rect x={28} y={43} width={8} height={2.4} rx={1} fill={DARK} />
      <Rect x={27} y={50} width={10} height={2} rx={1} fill={DARK} />
      {(bass ? [30.9, 31.7, 32.5, 33.3] : [30.8, 31.4, 32, 32.6, 33.2]).map((x) => (
        <Line key={x} x1={x} y1={neckTop} x2={x} y2={51} stroke={night.paper} strokeWidth={0.3} opacity={0.9} />
      ))}
      <Path d="M24 30 a9 9 0 0 1 6 -5" stroke="#FFFFFF" strokeWidth={1.4} opacity={0.45} fill="none" />
    </G>
  );
}

export function Drums({ c }: { c: string }) {
  return (
    <G>
      <Line x1={50} y1={22} x2={50} y2={54} stroke={night.paper} strokeWidth={1} />
      <Ellipse cx={50} cy={21} rx={10} ry={2.2} fill={night.lamp} />
      <Line x1={13} y1={28} x2={13} y2={54} stroke={night.paper} strokeWidth={1} />
      <Ellipse cx={13} cy={28} rx={7} ry={1.8} fill={night.lamp} />
      <Ellipse cx={13} cy={30} rx={7} ry={1.8} fill={night.lamp} opacity={0.8} />
      <Rect x={20} y={23} width={11} height={9} fill={c} />
      <Ellipse cx={25.5} cy={23} rx={5.5} ry={2} fill={night.paper} />
      <Rect x={33} y={22} width={12} height={10} fill={c} />
      <Ellipse cx={39} cy={22} rx={6} ry={2} fill={night.paper} />
      <Circle cx={32} cy={42} r={14} fill={c} />
      <Circle cx={32} cy={42} r={11} fill={night.paper} />
      <Circle cx={32} cy={42} r={11} fill="none" stroke={shade(c, -0.3)} strokeWidth={1.4} />
      <Path d="M24 42 h16" stroke={c} strokeWidth={3} strokeLinecap="round" />
      <Path d="M18 56 l4 -4 M46 56 l-4 -4" stroke={night.paper} strokeWidth={1.4} />
    </G>
  );
}

export function Keys({ c }: { c: string }) {
  return (
    <G transform="rotate(-8 32 34)">
      <Rect x={5} y={22} width={54} height={22} rx={3} fill={c} />
      <Rect x={5} y={22} width={54} height={4} rx={2} fill="#FFFFFF" opacity={0.2} />
      {[12, 18, 24].map((x) => (
        <Circle key={x} cx={x} cy={27} r={1.4} fill={night.cyan} />
      ))}
      <Rect x={36} y={25} width={18} height={4} rx={1} fill={night.pink} opacity={0.8} />
      <Rect x={8} y={31} width={48} height={11} fill={night.paper} />
      {Array.from({ length: 11 }).map((_, i) => (
        <Line key={i} x1={8 + (i + 1) * 4.36} y1={31} x2={8 + (i + 1) * 4.36} y2={42} stroke="#A7ADB8" strokeWidth={0.5} />
      ))}
      {[1, 2, 4, 5, 6, 8, 9].map((i) => (
        <Rect key={i} x={8 + i * 4.36 - 1.3} y={31} width={2.6} height={6.5} fill={DARK} />
      ))}
    </G>
  );
}

export function Mic({ c }: { c: string }) {
  return (
    <G transform="rotate(-28 32 32)">
      <Polygon points="27.5,30 36.5,30 34.5,58 29.5,58" fill={c} />
      <Rect x={27} y={28} width={10} height={4} rx={1} fill={shade(c, -0.35)} />
      <Circle cx={32} cy={18} r={11} fill="#C9CCD6" />
      {[-6, -2, 2, 6].map((d) => (
        <Line key={`v${d}`} x1={32 + d} y1={8} x2={32 + d} y2={28} stroke="#7A7F8C" strokeWidth={0.7} />
      ))}
      {[-6, -2, 2, 6].map((d) => (
        <Line key={`h${d}`} x1={22} y1={18 + d} x2={42} y2={18 + d} stroke="#7A7F8C" strokeWidth={0.7} />
      ))}
      <Circle cx={28} cy={13} r={3} fill="#FFFFFF" opacity={0.6} />
      <Rect x={30.5} y={40} width={3} height={6} rx={1} fill={night.pink} />
    </G>
  );
}

export function Jacket({ c }: { c: string }) {
  const d = shade(c, -0.3);
  return (
    <G>
      <Path d="M20 12 L26 9 Q32 14 38 9 L44 12 L54 20 L50 34 L46 32 L46 56 L18 56 L18 32 L14 34 L10 20 z" fill={c} />
      <Path d="M26 9 L32 30 L38 9 Q32 14 26 9" fill={DARK} />
      <Path d="M26 9 L22 22 L32 30 z M38 9 L42 22 L32 30 z" fill={d} />
      <Line x1={32} y1={30} x2={32} y2={56} stroke={d} strokeWidth={1.2} />
      {[36, 42, 48].map((y) => (
        <Circle key={y} cx={34.5} cy={y} r={1} fill={night.lamp} />
      ))}
      <Rect x={21} y={42} width={7} height={1.6} fill={d} />
    </G>
  );
}

export function Car({ c }: { c: string }) {
  return (
    <G>
      <Path d="M6 42 L10 32 Q12 28 18 27 L24 20 Q26 18 30 18 L42 18 Q46 18 48 21 L53 27 Q58 28 59 32 L59 42 z" fill={c} />
      <Path d="M26 22 L22 27 L36 27 L36 21 L30 21 Q27 21 26 22 z M39 21 L39 27 L50 27 L46 22 Q45 21 43 21 z" fill={night.cyan} opacity={0.75} />
      <Rect x={6} y={36} width={53} height={2} fill={shade(c, -0.3)} />
      <Circle cx={18} cy={44} r={6} fill={DARK} />
      <Circle cx={18} cy={44} r={2.5} fill="#A7ADB8" />
      <Circle cx={47} cy={44} r={6} fill={DARK} />
      <Circle cx={47} cy={44} r={2.5} fill="#A7ADB8" />
      <Rect x={55} y={31} width={4} height={3} fill={night.lamp} />
    </G>
  );
}

export function Spray({ c }: { c: string }) {
  return (
    <G>
      <Rect x={22} y={18} width={20} height={38} rx={4} fill={c} />
      <Rect x={22} y={26} width={20} height={14} fill={night.paper} opacity={0.9} />
      <Rect x={25} y={29} width={14} height={8} rx={2} fill={c} />
      <Rect x={27} y={12} width={10} height={7} rx={2} fill="#A7ADB8" />
      <Rect x={29} y={8} width={6} height={5} rx={1} fill={DARK} />
      <Circle cx={45} cy={8} r={1.6} fill={c} />
      <Circle cx={49} cy={12} r={1.2} fill={c} />
      <Circle cx={47} cy={4} r={1} fill={c} />
      <Rect x={24} y={44} width={3} height={10} rx={1.5} fill="#FFFFFF" opacity={0.35} />
    </G>
  );
}

const ICON_BY_ID: Record<string, IconName> = {
  moto_1: 'motorbike',
  van_1: 'van-utility',
  pet_cat: 'cat',
  pet_bengal: 'cat',
  pet_dog: 'dog',
  pet_parrot: 'bird',
  fx_smoke: 'weather-fog',
  fx_confetti: 'party-popper',
  fx_lights: 'spotlight-beam',
  fx_pyro: 'fire',
  mat_wood: 'tree',
  mat_strings: 'guitar-pick',
  mat_pickup: 'magnet',
  mat_drumhead: 'circle-double',
  mat_circuit: 'chip',
  mat_keys: 'piano',
  mat_capsule: 'microphone',
  mat_fabric: 'tshirt-crew-outline',
  mat_sequins: 'diamond-stone',
};
const ICON_BY_SLOT: Record<string, IconName> = {
  art: 'image-frame',
  ring: 'ring',
  pet: 'paw',
  fx: 'spotlight-beam',
  material: 'cube-outline',
  vehicle: 'car-side',
};

/** Bir eşyanın çıkartması. color: boya rengi (yoksa fabrika rengi). */
export function ItemArt({ itemId, color, legendary, size = 48 }: { itemId: string; color?: string | null; legendary?: boolean; size?: number }) {
  const def = ITEM_BY_ID[itemId];
  const slot = def?.slot ?? 'material';
  const tier = Math.min(4, Math.max(1, def?.tier ?? 1));
  const [a, b] = TIER_BG[tier];
  const paint = color && PAINT_COLORS[color as PaintColor] ? PAINT_COLORS[color as PaintColor].hex : null;
  const sprayColor = (def as { color?: PaintColor } | undefined)?.color;
  const c = paint ?? (slot === 'spray' && sprayColor ? PAINT_COLORS[sprayColor].hex : FACTORY[slot] ?? night.paper);
  const gid = `ia-${itemId}-${tier}-${legendary ? 1 : 0}`;
  let drawing: ReactNode = null;
  let icon: IconName | null = ICON_BY_ID[itemId] ?? null;
  if (!icon) {
    if (slot === 'guitar') drawing = <Guitar c={c} />;
    else if (slot === 'bass') drawing = <Guitar c={c} bass />;
    else if (slot === 'drums') drawing = <Drums c={c} />;
    else if (slot === 'keys') drawing = <Keys c={c} />;
    else if (slot === 'vocals') drawing = <Mic c={c} />;
    else if (slot === 'outfit') drawing = <Jacket c={c} />;
    else if (slot === 'vehicle') drawing = <Car c={c} />;
    else if (slot === 'spray') drawing = <Spray c={c} />;
    else icon = ICON_BY_SLOT[slot] ?? 'star-four-points';
  }
  const ring = legendary ? night.lamp : '#FFFFFF';
  return (
    <View style={{ width: size, height: size }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width={size} height={size} viewBox="0 0 64 64" style={{ position: 'absolute' }}>
        <Defs>
          <LinearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={a} />
            <Stop offset="1" stopColor={b} />
          </LinearGradient>
        </Defs>
        <Rect x={2} y={2} width={60} height={60} rx={16} fill={`url(#${gid})`} stroke={ring} strokeWidth={legendary ? 4 : 3} />
        <Path d="M10 6 h30 a40 40 0 0 0 -32 26 v-18 a8 8 0 0 1 2 -8" fill="#FFFFFF" opacity={0.1} />
        {drawing}
        {legendary ? (
          <G>
            <Path d="M52 4 l2.4 5.6 l5.6 2.4 l-5.6 2.4 l-2.4 5.6 l-2.4 -5.6 l-5.6 -2.4 l5.6 -2.4 z" fill={night.lamp} stroke={DARK} strokeWidth={0.8} />
          </G>
        ) : null}
      </Svg>
      {icon ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <MaterialCommunityIcons name={icon} size={size * 0.52} color={paint ?? '#FFFFFF'} />
        </View>
      ) : null}
    </View>
  );
}

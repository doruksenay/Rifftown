// Mekân sahneleri: her mekân geceleyin ışıkları yanan bir vitrin ya da sahne.
// Konser mekânlarında seyirci kalabalığı istenen doluluğa göre çizilir.

import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, Line, LinearGradient, Path, Polygon, RadialGradient, Rect, Stop } from 'react-native-svg';
import type { LocationType } from '@rifftown/shared';
import { Car, Guitar, Jacket, Keys, Spray } from './items';
import { night, rng, shade } from './seed';
import { NightSky, SCENE_H, SCENE_W, SkylineLayers } from './skyline';
import { ArtImage, hasArt } from './asset';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export const PLACE_ICON: Record<LocationType, IconName> = {
  bar: 'glass-cocktail',
  club: 'party-popper',
  hall: 'theater',
  stadium: 'stadium-variant',
  festival: 'tent',
  school: 'school',
  studio: 'speaker',
  recording_studio: 'record-rec',
  work: 'briefcase',
  hospital: 'hospital-building',
  music_store: 'guitar-electric',
  boutique: 'tshirt-crew',
  gallery: 'palette-outline',
  bookstore: 'book-open-page-variant',
  car_dealer: 'car-sports',
  pet_shop: 'paw',
  hardware: 'hammer-wrench',
  stage_shop: 'spotlight-beam',
  flea_market: 'store-outline',
  real_estate: 'home-city',
  bank: 'bank',
  hotel: 'bed',
  restaurant: 'silverware-fork-knife',
  gym: 'dumbbell',
  tattoo: 'needle',
  city_hall: 'town-hall',
  police: 'police-badge',
  courthouse: 'gavel',
  plaza: 'fountain',
  newspaper: 'newspaper-variant',
  worship: 'candle',
  university: 'school-outline',
  park: 'pine-tree',
  prison: 'shield-star',
};

type Group = 'stage' | 'learning' | 'shop' | 'living' | 'lifestyle' | 'civic' | 'work' | 'outdoor';

const GROUP_OF: Record<LocationType, Group> = {
  bar: 'stage',
  club: 'stage',
  hall: 'stage',
  stadium: 'stage',
  festival: 'stage',
  school: 'learning',
  university: 'learning',
  studio: 'learning',
  recording_studio: 'learning',
  bookstore: 'learning',
  music_store: 'shop',
  boutique: 'shop',
  gallery: 'shop',
  car_dealer: 'shop',
  pet_shop: 'shop',
  hardware: 'shop',
  stage_shop: 'shop',
  flea_market: 'shop',
  hospital: 'living',
  real_estate: 'living',
  bank: 'living',
  hotel: 'living',
  restaurant: 'lifestyle',
  gym: 'lifestyle',
  tattoo: 'lifestyle',
  city_hall: 'civic',
  police: 'civic',
  courthouse: 'civic',
  newspaper: 'work',
  worship: 'civic',
  work: 'work',
  park: 'outdoor',
  plaza: 'outdoor',
  prison: 'civic',
};

/** Grup renkleri: cephe ve vurgu (neon) */
export const GROUP_COLORS: Record<Group, { facade: string; accent: string; badge: [string, string] }> = {
  stage: { facade: '#3A1630', accent: night.pink, badge: [night.pink, night.purple] },
  learning: { facade: '#22336E', accent: night.sky, badge: [night.sky, night.purple] },
  shop: { facade: '#3B1A5E', accent: night.pink, badge: [night.purple, night.pink] },
  living: { facade: '#183A5C', accent: night.cyan, badge: [night.cyan, night.sky] },
  lifestyle: { facade: '#4A1838', accent: night.lamp, badge: ['#FF7A59', night.pink] },
  civic: { facade: '#2A2160', accent: night.paper, badge: ['#5B4BC4', night.indigo] },
  work: { facade: '#262A4A', accent: night.lamp, badge: ['#5A6290', '#2B2F5A'] },
  outdoor: { facade: '#163B33', accent: night.cyan, badge: ['#1BB58B', '#127368'] },
};

export const placeGroup = (t: LocationType) => GROUP_OF[t] ?? 'shop';

// ---------- Sahne mekânları ----------

function Person({ x, y, s = 1, fill, rim, guitar, mic }: { x: number; y: number; s?: number; fill: string; rim: string; guitar?: boolean; mic?: boolean }) {
  return (
    <G>
      <Circle cx={x} cy={y - 30 * s} r={5 * s} fill={fill} />
      <Path d={`M${x - 7 * s} ${y - 22 * s} L${x + 7 * s} ${y - 22 * s} L${x + 5 * s} ${y - 6 * s} L${x - 5 * s} ${y - 6 * s} z`} fill={fill} />
      <Path d={`M${x - 4 * s} ${y - 6 * s} L${x - 6 * s} ${y} M${x + 4 * s} ${y - 6 * s} L${x + 6 * s} ${y}`} stroke={fill} strokeWidth={3 * s} />
      <Path d={`M${x - 7 * s} ${y - 22 * s} L${x + 7 * s} ${y - 22 * s}`} stroke={rim} strokeWidth={1} opacity={0.9} />
      {guitar ? (
        <G>
          <Ellipse cx={x - 2 * s} cy={y - 12 * s} rx={6 * s} ry={4.5 * s} fill={rim} transform={`rotate(-25 ${x - 2 * s} ${y - 12 * s})`} />
          <Line x1={x + 2 * s} y1={y - 14 * s} x2={x + 15 * s} y2={y - 22 * s} stroke={rim} strokeWidth={1.6 * s} />
        </G>
      ) : null}
      {mic ? (
        <G>
          <Line x1={x + 9 * s} y1={y} x2={x + 9 * s} y2={y - 26 * s} stroke={fill} strokeWidth={1.4} />
          <Circle cx={x + 9 * s} cy={y - 27 * s} r={1.8 * s} fill={rim} />
        </G>
      ) : null}
    </G>
  );
}

function Crowd({ seed, count, y0, color, phones }: { seed: string; count: number; y0: number; color: string; phones?: boolean }) {
  const r = rng(seed);
  const out: ReactNode[] = [];
  const rows = count > 40 ? 3 : count > 14 ? 2 : 1;
  for (let row = 0; row < rows; row++) {
    const n = Math.max(1, Math.round(count / rows));
    for (let i = 0; i < n; i++) {
      const x = ((i + r() * 0.8) / n) * SCENE_W;
      const y = y0 + row * 8 + r() * 3;
      const s = 0.8 + row * 0.18;
      out.push(<Circle key={`h${row}-${i}`} cx={x} cy={y} r={4.2 * s} fill={color} />);
      out.push(<Rect key={`b${row}-${i}`} x={x - 6 * s} y={y + 3 * s} width={12 * s} height={20} rx={4} fill={color} />);
      const v = r();
      if (v < 0.22) out.push(<Line key={`a${row}-${i}`} x1={x + 4 * s} y1={y + 4} x2={x + 7 * s} y2={y - 10 * s} stroke={color} strokeWidth={2.4 * s} strokeLinecap="round" />);
      if (phones && v > 0.9) out.push(<Circle key={`p${row}-${i}`} cx={x + 7 * s} cy={y - 11 * s} r={1.3} fill={night.cyan} />);
    }
  }
  return <G>{out}</G>;
}

function Beams({ seed, n, from, to }: { seed: string; n: number; from: [number, number]; to: [number, number] }) {
  const r = rng(seed);
  return (
    <G>
      {Array.from({ length: n }).map((_, i) => {
        const sx = from[0] + (i / Math.max(1, n - 1)) * (from[1] - from[0]);
        const tx = to[0] + r() * (to[1] - to[0]);
        const col = i % 2 ? night.cyan : night.pink;
        return <Polygon key={i} points={`${sx - 3},4 ${sx + 3},4 ${tx + 22},118 ${tx - 22},118`} fill={col} opacity={0.13} />;
      })}
      {Array.from({ length: n }).map((_, i) => {
        const sx = from[0] + (i / Math.max(1, n - 1)) * (from[1] - from[0]);
        return <Circle key={`l${i}`} cx={sx} cy={5} r={3} fill={i % 2 ? night.cyan : night.pink} />;
      })}
    </G>
  );
}

function StageScene({ venue, id, crowd }: { venue: 'bar' | 'club' | 'hall' | 'stadium' | 'festival'; id: string; crowd: number }) {
  const crowdColor = '#07031C';
  const capacity = { bar: 10, club: 22, hall: 46, stadium: 70, festival: 60 }[venue];
  const count = Math.max(venue === 'bar' ? 3 : 6, Math.round(capacity * Math.max(0.15, crowd)));
  if (venue === 'stadium') {
    return (
      <G>
        <NightSky id={`st-${id}`} warm={0.35} />
        <Ellipse cx={180} cy={150} rx={240} ry={90} fill="#1B0D4A" />
        <Ellipse cx={180} cy={152} rx={200} ry={66} fill="#25125E" />
        {Array.from({ length: 5 }).map((_, row) => (
          <Ellipse key={row} cx={180} cy={152} rx={196 - row * 14} ry={62 - row * 5} fill="none" stroke={night.paper} strokeOpacity={0.05 + crowd * 0.12} strokeWidth={4} strokeDasharray="1.5 3" />
        ))}
        {[24, 336].map((x) => (
          <G key={x}>
            <Rect x={x - 1.5} y={20} width={3} height={110} fill="#2E1A6E" />
            <Rect x={x - 12} y={14} width={24} height={9} rx={2} fill={night.paper} />
            <Polygon points={`${x - 12},23 ${x + 12},23 ${x === 24 ? 220 : 140},140 ${x === 24 ? 120 : 40},140`} fill={night.paper} opacity={0.07} />
          </G>
        ))}
        <Rect x={130} y={64} width={100} height={46} rx={3} fill="#120838" stroke={night.cyan} strokeWidth={1.4} />
        <Rect x={136} y={70} width={88} height={34} fill={night.purple} opacity={0.55} />
        <Rect x={120} y={112} width={120} height={8} fill="#2E1A6E" />
        <Rect x={120} y={112} width={120} height={1.4} fill={night.cyan} />
        <Beams seed={`sb-${id}`} n={6} from={[134, 226]} to={[60, 300]} />
        <Crowd seed={`sc-${id}`} count={count} y0={128} color={crowdColor} phones />
      </G>
    );
  }
  if (venue === 'festival') {
    return (
      <G>
        <Defs>
          <LinearGradient id={`fs-${id}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#2A1470" />
            <Stop offset="0.6" stopColor={night.pink} />
            <Stop offset="1" stopColor={night.lamp} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={SCENE_W} height={SCENE_H} fill={`url(#fs-${id})`} />
        <Circle cx={70} cy={92} r={26} fill={night.lamp} opacity={0.9} />
        {[[10, 60], [280, 70]].map(([x, w]) => (
          <G key={x}>
            <Polygon points={`${x},120 ${x + w / 2},84 ${x + w},120`} fill="#3B1A5E" />
            <Polygon points={`${x + w / 2},84 ${x + w / 2 + 8},120 ${x + w / 2 - 8},120`} fill={night.paper} opacity={0.75} />
          </G>
        ))}
        <Path d="M90 40 L270 40" stroke="#1A0E4B" strokeWidth={4} />
        <Rect x={92} y={40} width={4} height={78} fill="#1A0E4B" />
        <Rect x={264} y={40} width={4} height={78} fill="#1A0E4B" />
        <Rect x={96} y={44} width={168} height={70} fill="#170B3F" />
        <Path d="M0 18 Q90 32 180 18 T360 18" stroke={night.paper} strokeWidth={0.8} fill="none" opacity={0.7} />
        {Array.from({ length: 14 }).map((_, i) => (
          <Polygon key={i} points={`${i * 26 + 8},${21 + Math.sin(i) * 3} ${i * 26 + 18},${21 + Math.sin(i) * 3} ${i * 26 + 13},${31 + Math.sin(i) * 3}`} fill={[night.cyan, night.pink, night.lamp, night.purple][i % 4]} />
        ))}
        <Beams seed={`fb-${id}`} n={5} from={[110, 250]} to={[110, 250]} />
        <Person x={150} y={112} fill="#07031C" rim={night.cyan} guitar />
        <Person x={186} y={112} fill="#07031C" rim={night.pink} mic />
        <Person x={220} y={112} fill="#07031C" rim={night.lamp} guitar />
        <Rect x={90} y={112} width={180} height={8} fill="#1A0E4B" />
        <Crowd seed={`fc-${id}`} count={count} y0={128} color={crowdColor} />
      </G>
    );
  }
  const backdrop =
    venue === 'bar' ? (
      <G>
        <Rect x={0} y={0} width={SCENE_W} height={SCENE_H} fill="#3A1630" />
        {Array.from({ length: 13 }).map((_, row) =>
          Array.from({ length: 13 }).map((__, col) => (
            <Rect key={`${row}-${col}`} x={col * 30 - (row % 2) * 15} y={row * 10} width={27} height={7.5} rx={1} fill="#4A1D3C" />
          )),
        )}
        <Rect x={124} y={16} width={112} height={34} rx={17} fill="none" stroke={night.pink} strokeWidth={3} />
        <Rect x={124} y={16} width={112} height={34} rx={17} fill="none" stroke={night.pink} strokeWidth={9} opacity={0.18} />
        <Path d="M146 26 v14 h10 M164 26 v14 M172 26 l6 14 l6 -14 M194 26 v14 h11 M194 26 h11 M194 33 h8" stroke={night.cyan} strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </G>
    ) : venue === 'club' ? (
      <G>
        <Rect x={0} y={0} width={SCENE_W} height={SCENE_H} fill="#120838" />
        {Array.from({ length: 16 }).map((_, i) => (
          <Line key={i} x1={i % 2 ? 0 : SCENE_W} y1={8} x2={40 + i * 19} y2={118} stroke={i % 3 ? night.cyan : night.pink} strokeWidth={0.8} opacity={0.55} />
        ))}
        <Circle cx={180} cy={22} r={13} fill="#A7ADB8" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Line key={i} x1={167} y1={14 + i * 4} x2={193} y2={14 + i * 4} stroke="#E8E9F3" strokeWidth={0.7} />
        ))}
        <Line x1={180} y1={0} x2={180} y2={9} stroke="#A7ADB8" />
      </G>
    ) : (
      <G>
        <Rect x={0} y={0} width={SCENE_W} height={SCENE_H} fill="#1A0838" />
        {[0, 1].map((side) => (
          <G key={side}>
            <Path d={side ? 'M360 0 L290 0 Q300 70 330 120 L360 120 z' : 'M0 0 L70 0 Q60 70 30 120 L0 120 z'} fill="#5A1272" />
            {Array.from({ length: 4 }).map((_, i) => (
              <Path key={i} d={side ? `M${300 + i * 15} 0 Q${308 + i * 13} 60 ${334 + i * 7} 120` : `M${60 - i * 15} 0 Q${52 - i * 13} 60 ${26 - i * 7} 120`} stroke="#3A0B4D" strokeWidth={2} fill="none" />
            ))}
          </G>
        ))}
        <Path d="M0 0 H360 V10 Q270 22 180 12 Q90 22 0 10 z" fill="#6E1A8A" />
        <Path d="M40 62 Q180 44 320 62" stroke={night.lamp} strokeWidth={1} strokeDasharray="2 5" fill="none" opacity={0.6} />
      </G>
    );
  return (
    <G>
      {backdrop}
      {venue !== 'bar' ? <Beams seed={`b-${id}`} n={venue === 'hall' ? 6 : 4} from={[90, 270]} to={[120, 240]} /> : null}
      <Defs>
        <RadialGradient id={`spot-${id}`} cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor={night.lamp} stopOpacity={0.45} />
          <Stop offset="1" stopColor={night.lamp} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Ellipse cx={180} cy={110} rx={110} ry={30} fill={`url(#spot-${id})`} />
      {venue === 'bar' ? (
        <G>
          <Rect x={210} y={88} width={26} height={22} rx={2} fill="#1A0E4B" />
          <Circle cx={223} cy={99} r={7} fill="#2E1A6E" />
        </G>
      ) : (
        <G>
          <Ellipse cx={180} cy={102} rx={16} ry={9} fill="#2E1A6E" />
          <Circle cx={163} cy={92} r={6} fill="none" stroke={night.lamp} strokeWidth={1.4} />
          <Circle cx={198} cy={92} r={6} fill="none" stroke={night.lamp} strokeWidth={1.4} />
        </G>
      )}
      <Person x={venue === 'bar' ? 150 : 132} y={112} fill="#07031C" rim={night.cyan} guitar />
      <Person x={venue === 'bar' ? 186 : 228} y={112} fill="#07031C" rim={night.pink} mic />
      {venue !== 'bar' ? <Person x={262} y={112} fill="#07031C" rim={night.lamp} guitar /> : null}
      <Rect x={venue === 'bar' ? 100 : 60} y={112} width={venue === 'bar' ? 160 : 240} height={10} fill="#0F0830" />
      <Rect x={venue === 'bar' ? 100 : 60} y={112} width={venue === 'bar' ? 160 : 240} height={1.4} fill={night.cyan} opacity={0.9} />
      <Crowd seed={`c-${id}`} count={count} y0={128} color={crowdColor} phones={venue === 'hall'} />
    </G>
  );
}

// ---------- Binalar ----------

function Lamp({ x }: { x: number }) {
  return (
    <G>
      <Circle cx={x} cy={96} r={16} fill={night.lamp} opacity={0.12} />
      <Rect x={x - 1} y={96} width={2} height={54} fill="#120838" />
      <Path d={`M${x - 5} 96 h10 l-2 -6 h-6 z`} fill="#120838" />
      <Circle cx={x} cy={97} r={2.6} fill={night.lamp} />
    </G>
  );
}

/** Dükkân ve mekân vitrini: tente, neon tabela, ışıklı vitrin (ikon üstüne yerleşir) */
function Storefront({ id, facade, accent, upper = 2, display }: { id: string; facade: string; accent: string; upper?: number; display?: ReactNode }) {
  const r = rng(`sf-${id}`);
  const top = 150 - 62 - upper * 22;
  return (
    <G>
      <Rect x={70} y={top} width={220} height={150 - top} fill={facade} />
      <Rect x={70} y={top} width={220} height={4} fill={shade(facade, 0.25)} />
      {Array.from({ length: upper }).map((_, row) =>
        Array.from({ length: 5 }).map((__, col) => {
          const on = r() < 0.6;
          return <Rect key={`${row}-${col}`} x={86 + col * 40} y={top + 12 + row * 22} width={22} height={13} rx={1} fill={on ? night.lamp : shade(facade, -0.45)} opacity={on ? 0.85 : 1} />;
        }),
      )}
      <Rect x={98} y={top + upper * 22 + 6} width={164} height={18} rx={4} fill="#0F0830" />
      <Rect x={101} y={top + upper * 22 + 9} width={158} height={12} rx={3} fill="none" stroke={accent} strokeWidth={1.6} />
      <Rect x={101} y={top + upper * 22 + 9} width={158} height={12} rx={3} fill="none" stroke={accent} strokeWidth={5} opacity={0.2} />
      {Array.from({ length: 8 }).map((_, i) => (
        <Path key={i} d={`M${84 + i * 24} 90 h24 v6 a12 6 0 0 1 -24 0 z`} fill={i % 2 ? night.paper : accent} opacity={i % 2 ? 0.92 : 1} />
      ))}
      <Defs>
        <LinearGradient id={`win-${id}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={night.lamp} stopOpacity={0.95} />
          <Stop offset="1" stopColor={accent} stopOpacity={0.55} />
        </LinearGradient>
      </Defs>
      <Rect x={96} y={102} width={126} height={40} rx={2} fill={`url(#win-${id})`} />
      {display}
      <Rect x={96} y={102} width={126} height={40} rx={2} fill="none" stroke="#0F0830" strokeWidth={3} />
      <Rect x={234} y={104} width={30} height={46} rx={2} fill="#0F0830" />
      <Rect x={238} y={108} width={22} height={30} fill={accent} opacity={0.35} />
      <Circle cx={256} cy={128} r={1.4} fill={night.lamp} />
    </G>
  );
}

/** Kamu binası: basamaklar, sütunlar, alınlık ve bayrak */
function Civic({ id, facade, kind }: { id: string; facade: string; kind: 'columns' | 'dome' | 'police' | 'prison' }) {
  if (kind === 'prison') {
    return (
      <G>
        <Rect x={0} y={80} width={SCENE_W} height={70} fill="#2A2546" />
        {Array.from({ length: 18 }).map((_, i) => (
          <Rect key={i} x={i * 20} y={80} width={1.5} height={70} fill="#1C1836" />
        ))}
        <Path d={Array.from({ length: 36 }).map((_, i) => `${i ? 'L' : 'M'}${i * 10} ${i % 2 ? 72 : 78}`).join(' ')} stroke="#A7ADB8" strokeWidth={1} fill="none" />
        <Rect x={250} y={30} width={26} height={120} fill="#1C1836" />
        <Rect x={244} y={24} width={38} height={12} fill="#2A2546" />
        <Polygon points="262,36 360,120 360,150 330,150" fill={night.paper} opacity={0.1} />
        <Circle cx={262} cy={36} r={4} fill={night.lamp} />
        {[60, 120, 180].map((x) => (
          <G key={x}>
            <Rect x={x} y={100} width={30} height={26} fill="#0F0830" />
            {[0, 1, 2, 3].map((i) => (
              <Rect key={i} x={x + 4 + i * 7} y={100} width={2} height={26} fill="#A7ADB8" />
            ))}
          </G>
        ))}
      </G>
    );
  }
  if (kind === 'police') {
    return (
      <G>
        <Rect x={80} y={56} width={200} height={94} fill={facade} />
        <Rect x={150} y={44} width={60} height={12} rx={3} fill="#0F0830" />
        <Rect x={153} y={47} width={26} height={6} rx={2} fill={night.sky} />
        <Rect x={181} y={47} width={26} height={6} rx={2} fill={night.pink} />
        <Polygon points="166,50 60,0 120,0" fill={night.sky} opacity={0.12} />
        <Polygon points="194,50 300,0 240,0" fill={night.pink} opacity={0.12} />
        {Array.from({ length: 3 }).map((_, row) =>
          Array.from({ length: 6 }).map((__, col) => (
            <Rect key={`${row}-${col}`} x={92 + col * 31} y={66 + row * 20} width={18} height={11} fill={(row + col) % 3 ? night.lamp : shade(facade, -0.4)} opacity={0.8} />
          )),
        )}
        <Rect x={160} y={120} width={40} height={30} fill="#0F0830" />
        <Rect x={164} y={124} width={32} height={26} fill={night.sky} opacity={0.35} />
      </G>
    );
  }
  return (
    <G>
      {kind === 'dome' ? (
        <G>
          <Path d="M130 70 a50 50 0 0 1 100 0 z" fill={shade(facade, 0.12)} />
          <Rect x={178} y={8} width={4} height={14} fill={night.lamp} />
          <Circle cx={180} cy={22} r={3} fill={night.lamp} />
        </G>
      ) : (
        <G>
          <Polygon points="80,62 180,26 280,62" fill={shade(facade, 0.12)} />
          <Polygon points="100,58 180,32 260,58" fill="none" stroke={night.paper} strokeOpacity={0.25} />
          <Rect x={268} y={6} width={2} height={40} fill="#A7ADB8" />
          <Path d="M270 8 h22 l-4 6 l4 6 h-22 z" fill={night.pink} />
        </G>
      )}
      <Rect x={80} y={62} width={200} height={8} fill={shade(facade, 0.2)} />
      <Rect x={84} y={70} width={192} height={64} fill={shade(facade, -0.3)} />
      {Array.from({ length: 6 }).map((_, i) => (
        <G key={i}>
          <Rect x={94 + i * 33} y={70} width={12} height={64} fill={shade(facade, 0.35)} />
          <Rect x={92 + i * 33} y={70} width={16} height={4} fill={shade(facade, 0.45)} />
        </G>
      ))}
      <Path d="M168 134 v-30 a12 12 0 0 1 24 0 v30 z" fill={night.lamp} opacity={0.75} />
      {[0, 1, 2].map((i) => (
        <Rect key={i} x={74 - i * 6} y={134 + i * 5} width={212 + i * 12} height={5} fill={shade(facade, 0.15 - i * 0.08)} />
      ))}
    </G>
  );
}

/** Modern bina: kat kat pencereler, çatıda ikon tabelası */
function Tower({ id, facade, accent }: { id: string; facade: string; accent: string }) {
  const r = rng(`tw-${id}`);
  return (
    <G>
      <Rect x={100} y={20} width={160} height={130} fill={facade} />
      <Rect x={100} y={20} width={4} height={130} fill={shade(facade, 0.2)} />
      {Array.from({ length: 6 }).map((_, row) =>
        Array.from({ length: 7 }).map((__, col) => {
          const on = r() < 0.55;
          return <Rect key={`${row}-${col}`} x={112 + col * 20.5} y={56 + row * 13} width={12} height={8} fill={on ? (r() < 0.2 ? night.cyan : night.lamp) : shade(facade, -0.45)} opacity={on ? 0.8 : 1} />;
        }),
      )}
      <Rect x={128} y={-2} width={104} height={44} rx={6} fill="#0F0830" />
      <Rect x={131} y={1} width={98} height={38} rx={5} fill="none" stroke={accent} strokeWidth={2} />
      <Rect x={131} y={1} width={98} height={38} rx={5} fill="none" stroke={accent} strokeWidth={7} opacity={0.18} />
      <Rect x={160} y={132} width={40} height={18} fill="#0F0830" />
      <Rect x={163} y={134} width={34} height={16} fill={accent} opacity={0.4} />
    </G>
  );
}

function Outdoor({ id, kind }: { id: string; kind: 'park' | 'plaza' }) {
  const r = rng(`od-${id}`);
  if (kind === 'park') {
    return (
      <G>
        <Path d="M0 118 Q90 104 180 116 T360 112 V160 H0 z" fill="#123A30" />
        {Array.from({ length: 7 }).map((_, i) => {
          const x = 20 + i * 52 + r() * 16;
          const h = 26 + r() * 22;
          return (
            <G key={i}>
              <Rect x={x - 2} y={124 - 10} width={4} height={20} fill="#0B2620" />
              <Circle cx={x} cy={124 - h / 2 - 8} r={h / 2} fill={i % 2 ? '#1BB58B' : '#178F72'} opacity={0.85} />
              <Circle cx={x - 5} cy={124 - h / 2 - 12} r={h / 4} fill="#22D3A0" opacity={0.25} />
            </G>
          );
        })}
        <Rect x={150} y={130} width={60} height={4} fill="#4A2A1A" />
        <Rect x={150} y={124} width={60} height={3} fill="#4A2A1A" />
        <Lamp x={110} />
        <Lamp x={250} />
      </G>
    );
  }
  return (
    <G>
      <Rect x={0} y={118} width={SCENE_W} height={42} fill="#221A4E" />
      {Array.from({ length: 10 }).map((_, i) => (
        <Line key={i} x1={i * 40} y1={118} x2={i * 40 - 30} y2={160} stroke="#2E2566" />
      ))}
      <Ellipse cx={180} cy={128} rx={60} ry={10} fill="#2E2566" />
      <Ellipse cx={180} cy={126} rx={52} ry={7} fill={night.cyan} opacity={0.35} />
      <Rect x={176} y={88} width={8} height={38} fill="#3A3080" />
      {[-1, 1].map((s) => (
        <Path key={s} d={`M180 90 q${s * 26} -18 ${s * 40} 34`} stroke={night.cyan} strokeWidth={2} fill="none" opacity={0.7} />
      ))}
      <Path d="M180 88 q0 -22 0 -26" stroke={night.cyan} strokeWidth={2} opacity={0.8} />
      <Lamp x={60} />
      <Lamp x={300} />
    </G>
  );
}

/** Vitrinde ne var: kendi çizimlerimiz (enstrüman, ceket, araba, sprey...) */
function windowDisplay(type: LocationType): ReactNode | null {
  const at = (x: number, s: number, node: ReactNode, y = 104) => <G transform={`translate(${x} ${y}) scale(${s})`}>{node}</G>;
  switch (type) {
    case 'music_store':
      return (
        <G>
          {at(100, 0.58, <Guitar c="#D7263D" />)}
          {at(136, 0.58, <Keys c="#1B1B1E" />)}
          {at(176, 0.58, <Guitar c="#0E6FBF" bass />)}
        </G>
      );
    case 'boutique':
      return (
        <G>
          {at(102, 0.56, <Jacket c={night.pink} />)}
          {at(141, 0.56, <Jacket c="#1B1B1E" />)}
          {at(180, 0.56, <Jacket c={night.cyan} />)}
        </G>
      );
    case 'car_dealer':
      return at(124, 0.98, <Car c={night.pink} />, 96);
    case 'hardware':
      return (
        <G>
          {at(106, 0.55, <Spray c={night.pink} />)}
          {at(138, 0.55, <Spray c={night.cyan} />)}
          {at(170, 0.55, <Spray c="#D4A72C" />)}
        </G>
      );
    case 'gallery':
      return (
        <G>
          {[
            [106, night.pink, 26],
            [142, night.cyan, 34],
            [184, night.purple, 24],
          ].map(([x, col, w]) => (
            <G key={String(x)}>
              <Rect x={x as number} y={108} width={w as number} height={22} fill="#D4A72C" />
              <Rect x={(x as number) + 3} y={111} width={(w as number) - 6} height={16} fill={col as string} />
              <Circle cx={(x as number) + (w as number) / 2} cy={119} r={4} fill={night.paper} opacity={0.7} />
            </G>
          ))}
        </G>
      );
    case 'bookstore':
      return (
        <G>
          {[112, 128].map((y) => (
            <G key={y}>
              <Rect x={100} y={y + 12} width={118} height={2} fill="#4A2A1A" />
              {Array.from({ length: 16 }).map((_, i) => (
                <Rect key={i} x={102 + i * 7.2} y={y + (i % 3) * 1.5} width={5.5} height={12 - (i % 3) * 1.5} fill={[night.pink, night.sky, night.lamp, night.purple, night.cyan][i % 5]} />
              ))}
            </G>
          ))}
        </G>
      );
    default:
      return null;
  }
}

/** Aynı gruptaki dükkânlar birbirinin aynısı olmasın: türe göre cephe tonu */
function facadeFor(type: LocationType, base: string): string {
  const r = rng(`fc-${type}`);
  return shade(base, (r() - 0.5) * 0.35);
}

// ---------- Dışa açık bileşenler ----------

const ASPECT = SCENE_W / SCENE_H;

/** Mekânın büyük resmi (ekranın üstünde). crowd: konser mekânlarında doluluk (0–1) */
export function PlaceArt({ type, id, cityId, crowd }: { type: LocationType; id: string; cityId?: string | null; crowd?: number }) {
  // Üretilmiş görsel: konser raporunda doluluğa göre boş / yarı / dolu hali, yoksa mekânın kendi resmi
  const level = crowd === undefined ? null : crowd < 0.25 ? 'empty' : crowd < 0.7 ? 'half' : 'full';
  const artId = level && hasArt(`crowd/${type}.${level}`) ? `crowd/${type}.${level}` : `place/${type}`;
  if (hasArt(artId)) {
    return (
      <View style={{ width: '100%', aspectRatio: 1600 / 700, overflow: 'hidden' }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <ArtImage id={artId} style={{ width: '100%', height: '100%' }} />
      </View>
    );
  }
  return <PlaceArtFallback type={type} id={id} cityId={cityId} crowd={crowd ?? 0.5} />;
}

function PlaceArtFallback({ type, id, cityId, crowd }: { type: LocationType; id: string; cityId?: string | null; crowd: number }) {
  const group = placeGroup(type);
  const colors = GROUP_COLORS[group];
  const isStage = group === 'stage';
  // Vitrin ikonunun sahnedeki yeri (yüzde olarak)
  let icon: { x: number; y: number; size: number; color: string } | null = null;
  let body: ReactNode = null;
  if (isStage) {
    body = <StageScene venue={type as 'bar'} id={id} crowd={crowd} />;
  } else if (type === 'park' || type === 'plaza') {
    body = <Outdoor id={id} kind={type} />;
  } else if (type === 'prison') {
    body = <Civic id={id} facade={colors.facade} kind="prison" />;
  } else if (type === 'police') {
    body = <Civic id={id} facade="#1F2C5C" kind="police" />;
  } else if (['city_hall', 'courthouse', 'bank', 'university', 'worship'].includes(type)) {
    body = <Civic id={id} facade={colors.facade} kind={type === 'worship' ? 'dome' : 'columns'} />;
  } else if (['work', 'newspaper', 'hotel', 'hospital', 'school', 'studio', 'recording_studio', 'gym'].includes(type)) {
    body = <Tower id={id} facade={colors.facade} accent={colors.accent} />;
    icon = { x: 180, y: 20, size: 26, color: colors.accent };
  } else {
    const display = windowDisplay(type);
    body = <Storefront id={id} facade={facadeFor(type, colors.facade)} accent={colors.accent} display={display} />;
    if (!display) icon = { x: 159, y: 122, size: 30, color: '#0F0830' };
  }
  return (
    <View style={{ width: '100%', aspectRatio: ASPECT, overflow: 'hidden' }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width="100%" height="100%" viewBox={`0 0 ${SCENE_W} ${SCENE_H}`} preserveAspectRatio="xMidYMid slice">
        {isStage ? null : <NightSky id={`p-${id}`} warm={0.4} />}
        {isStage || !cityId ? null : <SkylineLayers cityId={cityId} dim />}
        {body}
        {isStage ? null : <Rect x={0} y={150} width={SCENE_W} height={10} fill={night.deep} />}
        {isStage || type === 'park' || type === 'plaza' ? null : <Lamp x={40} />}
      </Svg>
      {icon ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: `${(icon.x / SCENE_W) * 100}%`,
            top: `${(icon.y / SCENE_H) * 100}%`,
            transform: [{ translateX: -icon.size / 2 }, { translateY: -icon.size / 2 }],
          }}
        >
          <MaterialCommunityIcons name={PLACE_ICON[type]} size={icon.size} color={icon.color} />
        </View>
      ) : null}
    </View>
  );
}

/** Listelerde küçük yuvarlak mekân rozeti */
export function PlaceIcon({ type, size = 36 }: { type: LocationType; size?: number }) {
  if (hasArt(`icon/place/${type}`)) return <ArtImage id={`icon/place/${type}`} style={{ width: size, height: size }} cover={false} />;
  const [a, b] = GROUP_COLORS[placeGroup(type)].badge;
  const gid = `pi-${type}`;
  return (
    <View style={{ width: size, height: size }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width={size} height={size} viewBox="0 0 40 40" style={{ position: 'absolute' }}>
        <Defs>
          <LinearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={a} />
            <Stop offset="1" stopColor={b} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={40} height={40} rx={12} fill={`url(#${gid})`} />
        <Rect x={1} y={1} width={38} height={18} rx={11} fill="#FFFFFF" opacity={0.12} />
      </Svg>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <MaterialCommunityIcons name={PLACE_ICON[type]} size={size * 0.55} color="#FFFFFF" />
      </View>
    </View>
  );
}

/** Beceri kategorisi rozeti */
const SKILL_ICON: Record<string, [IconName, string, string]> = {
  instruments: ['guitar-electric', night.pink, night.purple],
  music: ['music-note', night.sky, night.purple],
  stage: ['spotlight-beam', night.lamp, night.pink],
  genres: ['album', night.cyan, night.sky],
  career: ['briefcase', '#5A6290', '#2B2F5A'],
  social: ['account-heart', night.pink, '#FF7A59'],
  sports: ['run', '#1BB58B', '#127368'],
  crafts: ['hand-saw', '#FF7A59', night.lamp],
  crime: ['incognito', '#3A3080', night.indigo],
};

export function SkillCategoryIcon({ category, size = 28 }: { category: string; size?: number }) {
  if (hasArt(`icon/skill/${category}`)) return <ArtImage id={`icon/skill/${category}`} style={{ width: size, height: size }} cover={false} />;
  const [icon, a, b] = SKILL_ICON[category] ?? ['star-four-points', night.purple, night.pink];
  const gid = `sk-${category}`;
  return (
    <View style={{ width: size, height: size }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width={size} height={size} viewBox="0 0 40 40" style={{ position: 'absolute' }}>
        <Defs>
          <LinearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={a} />
            <Stop offset="1" stopColor={b} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={40} height={40} rx={11} fill={`url(#${gid})`} />
      </Svg>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <MaterialCommunityIcons name={icon} size={size * 0.58} color="#FFFFFF" />
      </View>
    </View>
  );
}

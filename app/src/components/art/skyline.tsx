// Şehir silüeti: gece göğü, üç kat bina, yanan pencereler ve şehrin simge yapısı.
// Aynı şehir her zaman aynı silüeti verir (tohumlu).

import { Fragment, type ReactNode } from 'react';
import Svg, { Circle, Defs, G, LinearGradient, Path, Polygon, Rect, Stop } from 'react-native-svg';
import { night, rng } from './seed';

export const SCENE_W = 360;
export const SCENE_H = 160;
const GROUND = 150;

type Landmark = (x: number, g: number, fill: string, rim: string) => ReactNode;

/** Simge yapılar: tabanı (x, g) noktasında, yukarı doğru çizilir */
const LANDMARKS: Record<string, Landmark> = {
  // Galata Kulesi ve bir cami kubbesiyle iki minare
  istanbul: (x, g, f, rim) => (
    <G>
      <Rect x={x} y={g - 78} width={20} height={78} fill={f} />
      <Rect x={x - 3} y={g - 84} width={26} height={7} fill={f} />
      <Polygon points={`${x - 2},${g - 84} ${x + 10},${g - 112} ${x + 22},${g - 84}`} fill={f} />
      {[0, 1, 2].map((i) => (
        <Rect key={i} x={x + 4 + i * 5} y={g - 74} width={2.5} height={6} fill={night.lamp} opacity={0.9} />
      ))}
      <Path d={`M${x + 50} ${g - 30} a26 26 0 0 1 52 0 z`} fill={f} />
      <Rect x={x + 46} y={g - 30} width={60} height={30} fill={f} />
      <Rect x={x + 38} y={g - 80} width={5} height={80} fill={f} />
      <Polygon points={`${x + 37},${g - 80} ${x + 40.5},${g - 96} ${x + 44},${g - 80}`} fill={f} />
      <Rect x={x + 110} y={g - 80} width={5} height={80} fill={f} />
      <Polygon points={`${x + 109},${g - 80} ${x + 112.5},${g - 96} ${x + 116},${g - 80}`} fill={f} />
      <Path d={`M${x - 2} ${g - 84} L${x + 10} ${g - 112}`} stroke={rim} strokeWidth={1} opacity={0.8} />
    </G>
  ),
  // Atakule
  ankara: (x, g, f, rim) => (
    <G>
      <Rect x={x + 8} y={g - 95} width={8} height={95} fill={f} />
      <Path d={`M${x - 6} ${g - 95} q18 -16 36 0 z`} fill={f} />
      <Rect x={x - 6} y={g - 96} width={36} height={5} fill={f} />
      <Rect x={x + 11} y={g - 125} width={2} height={20} fill={f} />
      <Rect x={x - 4} y={g - 95} width={32} height={1.5} fill={rim} opacity={0.9} />
    </G>
  ),
  // Saat Kulesi
  izmir: (x, g, f) => (
    <G>
      <Rect x={x} y={g - 20} width={30} height={20} fill={f} />
      <Rect x={x + 4} y={g - 50} width={22} height={30} fill={f} />
      <Rect x={x + 7} y={g - 72} width={16} height={22} fill={f} />
      <Path d={`M${x + 7} ${g - 72} a8 8 0 0 1 16 0 z`} fill={f} />
      <Circle cx={x + 15} cy={g - 40} r={5} fill={night.lamp} opacity={0.85} />
    </G>
  ),
  // Televizyon kulesi
  berlin: (x, g, f, rim) => (
    <G>
      <Polygon points={`${x + 7},${g} ${x + 10},${g - 92} ${x + 14},${g - 92} ${x + 17},${g}`} fill={f} />
      <Circle cx={x + 12} cy={g - 100} r={11} fill={f} />
      <Rect x={x + 3} y={g - 101} width={18} height={2} fill={rim} opacity={0.9} />
      <Rect x={x + 11} y={g - 135} width={2} height={26} fill={f} />
      <Circle cx={x + 12} cy={g - 136} r={1.6} fill={night.pink} />
    </G>
  ),
  // Elbphilharmonie: tuğla gövde, dalgalı cam çatı
  hamburg: (x, g, f, rim) => (
    <G>
      <Rect x={x} y={g - 40} width={90} height={40} fill={f} />
      <Path d={`M${x} ${g - 40} L${x} ${g - 62} Q${x + 15} ${g - 80} ${x + 30} ${g - 64} Q${x + 45} ${g - 86} ${x + 60} ${g - 66} Q${x + 75} ${g - 84} ${x + 90} ${g - 60} L${x + 90} ${g - 40} z`} fill={f} />
      <Path d={`M${x} ${g - 62} Q${x + 15} ${g - 80} ${x + 30} ${g - 64} Q${x + 45} ${g - 86} ${x + 60} ${g - 66} Q${x + 75} ${g - 84} ${x + 90} ${g - 60}`} stroke={rim} strokeWidth={1.2} fill="none" />
      {Array.from({ length: 8 }).map((_, i) => (
        <Rect key={i} x={x + 5 + i * 11} y={g - 54} width={6} height={3} fill={night.lamp} opacity={0.75} />
      ))}
    </G>
  ),
  // Frauenkirche: soğan kubbeli iki kule
  munich: (x, g, f) => (
    <G>
      <Rect x={x} y={g - 30} width={60} height={30} fill={f} />
      {[0, 36].map((d) => (
        <Fragment key={d}>
          <Rect x={x + d} y={g - 90} width={24} height={60} fill={f} />
          <Path d={`M${x + d - 1} ${g - 90} q13 -26 26 0 z`} fill={f} />
          <Rect x={x + d + 11} y={g - 112} width={2} height={8} fill={f} />
        </Fragment>
      ))}
    </G>
  ),
  // Big Ben
  london: (x, g, f, rim) => (
    <G>
      <Rect x={x} y={g - 100} width={22} height={100} fill={f} />
      <Rect x={x - 2} y={g - 106} width={26} height={8} fill={f} />
      <Polygon points={`${x - 2},${g - 106} ${x + 11},${g - 140} ${x + 24},${g - 106}`} fill={f} />
      <Circle cx={x + 11} cy={g - 88} r={7} fill={night.lamp} opacity={0.9} />
      <Path d={`M${x + 11} ${g - 88} l0 -5 M${x + 11} ${g - 88} l4 0`} stroke={f} strokeWidth={1.4} />
      <Rect x={x + 30} y={g - 40} width={70} height={40} fill={f} />
      <Path d={`M${x + 11} ${g - 140} L${x + 24} ${g - 106}`} stroke={rim} strokeWidth={1} />
    </G>
  ),
  // Beetham Tower
  manchester: (x, g, f, rim) => (
    <G>
      <Rect x={x} y={g - 120} width={16} height={120} fill={f} />
      <Rect x={x - 4} y={g - 80} width={20} height={4} fill={f} />
      <Rect x={x + 15} y={g - 120} width={1.4} height={120} fill={rim} opacity={0.8} />
      <Rect x={x + 26} y={g - 46} width={26} height={46} fill={f} />
    </G>
  ),
  // Royal Liver Building
  liverpool: (x, g, f) => (
    <G>
      <Rect x={x} y={g - 50} width={80} height={50} fill={f} />
      {[6, 56].map((d) => (
        <Fragment key={d}>
          <Rect x={x + d} y={g - 82} width={18} height={32} fill={f} />
          <Path d={`M${x + d} ${g - 82} a9 9 0 0 1 18 0 z`} fill={f} />
          <Circle cx={x + d + 9} cy={g - 70} r={4} fill={night.lamp} opacity={0.85} />
          <Rect x={x + d + 8} y={g - 100} width={2} height={10} fill={f} />
        </Fragment>
      ))}
    </G>
  ),
  // Eyfel Kulesi
  paris: (x, g, f, rim) => (
    <G>
      <Path
        d={`M${x} ${g} L${x + 18} ${g - 50} L${x + 22} ${g - 95} L${x + 25} ${g - 135} L${x + 28} ${g - 95} L${x + 32} ${g - 50} L${x + 50} ${g} L${x + 40} ${g} Q${x + 25} ${g - 30} ${x + 10} ${g} z`}
        fill={f}
      />
      <Rect x={x + 12} y={g - 52} width={26} height={4} fill={f} />
      <Rect x={x + 17} y={g - 96} width={16} height={3} fill={f} />
      <Path d={`M${x + 25} ${g - 135} L${x + 32} ${g - 50} L${x + 50} ${g}`} stroke={rim} strokeWidth={1} fill="none" opacity={0.85} />
      <Circle cx={x + 25} cy={g - 137} r={1.6} fill={night.lamp} />
    </G>
  ),
  // Fourvière bazilikası tepede
  lyon: (x, g, f) => (
    <G>
      <Path d={`M${x - 30} ${g} Q${x + 30} ${g - 50} ${x + 100} ${g} z`} fill={f} />
      <Rect x={x + 10} y={g - 58} width={44} height={24} fill={f} />
      {[8, 22, 36, 50].map((d) => (
        <Rect key={d} x={x + d} y={g - 70} width={6} height={14} fill={f} />
      ))}
      {[16, 30, 44].map((d) => (
        <Rect key={d} x={x + d} y={g - 50} width={3} height={6} fill={night.lamp} opacity={0.8} />
      ))}
    </G>
  ),
  // Notre-Dame de la Garde tepede
  marseille: (x, g, f) => (
    <G>
      <Path d={`M${x - 40} ${g} Q${x + 20} ${g - 60} ${x + 90} ${g} z`} fill={f} />
      <Rect x={x + 4} y={g - 62} width={36} height={22} fill={f} />
      <Rect x={x + 16} y={g - 98} width={12} height={40} fill={f} />
      <Rect x={x + 20} y={g - 110} width={4} height={12} fill={f} />
      <Circle cx={x + 22} cy={g - 113} r={3} fill={night.lamp} />
    </G>
  ),
  // Empire State
  newyork: (x, g, f, rim) => (
    <G>
      <Rect x={x} y={g - 70} width={40} height={70} fill={f} />
      <Rect x={x + 6} y={g - 100} width={28} height={30} fill={f} />
      <Rect x={x + 12} y={g - 118} width={16} height={18} fill={f} />
      <Rect x={x + 16} y={g - 128} width={8} height={10} fill={f} />
      <Rect x={x + 19} y={g - 148} width={2} height={20} fill={f} />
      <Rect x={x + 33} y={g - 100} width={1.2} height={100} fill={rim} opacity={0.8} />
      {Array.from({ length: 6 }).map((_, i) => (
        <Rect key={i} x={x + 4 + (i % 3) * 12} y={g - 60 + Math.floor(i / 3) * 18} width={4} height={6} fill={night.lamp} opacity={0.8} />
      ))}
    </G>
  ),
  // Tepeler ve palmiyeler
  losangeles: (x, g, f) => (
    <G>
      <Path d={`M${x - 60} ${g} Q${x} ${g - 50} ${x + 50} ${g - 20} Q${x + 100} ${g - 45} ${x + 150} ${g} z`} fill={f} opacity={0.75} />
      {[0, 30, 70].map((d, i) => (
        <G key={d}>
          <Path d={`M${x + d} ${g} q${4 + i} -40 ${2 - i} -${70 - i * 8}`} stroke={f} strokeWidth={4} fill="none" />
          {[-1, 1].map((s) => (
            <Path key={s} d={`M${x + d + 2 - i} ${g - 70 + i * 8} q${s * 12} -6 ${s * 22} 4 q${s * -10} -2 ${s * -22} -4`} fill={f} />
          ))}
          <Path d={`M${x + d + 2 - i} ${g - 70 + i * 8} q-4 -12 -14 -14 q8 6 14 14 q4 -12 14 -14 q-8 6 -14 14`} fill={f} />
        </G>
      ))}
    </G>
  ),
  // "Batman" binası: iki sivri kule
  nashville: (x, g, f, rim) => (
    <G>
      <Rect x={x} y={g - 90} width={40} height={90} fill={f} />
      <Polygon points={`${x},${g - 90} ${x + 4},${g - 130} ${x + 8},${g - 90}`} fill={f} />
      <Polygon points={`${x + 32},${g - 90} ${x + 36},${g - 130} ${x + 40},${g - 90}`} fill={f} />
      <Path d={`M${x + 8} ${g - 90} Q${x + 20} ${g - 104} ${x + 32} ${g - 90}`} fill={f} />
      <Rect x={x + 6} y={g - 86} width={28} height={2} fill={rim} opacity={0.9} />
    </G>
  ),
};

/** Bir bina katmanı: tohumlu yükseklikler, istenirse yanan pencereler */
function Layer({ seed, fill, minH, maxH, windows, top = GROUND, gap = 0 }: { seed: string; fill: string; minH: number; maxH: number; windows?: number; top?: number; gap?: number }) {
  const r = rng(seed);
  const out: ReactNode[] = [];
  let x = -10;
  let i = 0;
  while (x < SCENE_W + 10) {
    const w = 16 + Math.floor(r() * 30);
    const h = minH + Math.floor(r() * (maxH - minH));
    const roof = r();
    out.push(<Rect key={`b${i}`} x={x} y={top - h} width={w} height={h} fill={fill} />);
    if (roof > 0.82) out.push(<Rect key={`a${i}`} x={x + w / 2 - 1} y={top - h - 10} width={1.6} height={10} fill={fill} />);
    else if (roof > 0.7) out.push(<Polygon key={`p${i}`} points={`${x},${top - h} ${x + w / 2},${top - h - 8} ${x + w},${top - h}`} fill={fill} />);
    if (windows) {
      for (let wy = top - h + 6; wy < top - 8; wy += 9) {
        for (let wx = x + 4; wx < x + w - 5; wx += 7) {
          const v = r();
          if (v < windows) {
            out.push(<Rect key={`w${i}-${wx}-${wy}`} x={wx} y={wy} width={3} height={4} fill={v < windows * 0.25 ? night.cyan : night.lamp} opacity={0.55 + v} />);
          }
        }
      }
    }
    x += w + gap;
    i++;
  }
  return <G>{out}</G>;
}

/** Gökyüzü: tepede gece, ufukta neon pembe */
export function NightSky({ id, warm = 0.55 }: { id: string; warm?: number }) {
  const r = rng(`stars-${id}`);
  return (
    <G>
      <Defs>
        <LinearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={night.deep} />
          <Stop offset="0.55" stopColor="#3A1782" />
          <Stop offset="1" stopColor="#B4248F" stopOpacity={warm} />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={SCENE_W} height={SCENE_H} fill={night.deep} />
      <Rect x={0} y={0} width={SCENE_W} height={SCENE_H} fill={`url(#sky-${id})`} />
      {Array.from({ length: 26 }).map((_, i) => (
        <Circle key={i} cx={r() * SCENE_W} cy={r() * 70} r={r() < 0.15 ? 1.2 : 0.6} fill={night.paper} opacity={0.35 + r() * 0.6} />
      ))}
    </G>
  );
}

/** Bir şehrin arka plan silüeti (sahnelerin arkasında da kullanılır) */
export function SkylineLayers({ cityId, dim = false }: { cityId: string; dim?: boolean }) {
  const r = rng(`lm-${cityId}`);
  const lm = LANDMARKS[cityId];
  const lx = 150 + Math.floor(r() * 90);
  return (
    <G opacity={dim ? 0.55 : 1}>
      <Layer seed={`far-${cityId}`} fill={night.far} minH={30} maxH={70} gap={2} />
      <Layer seed={`mid-${cityId}`} fill={night.mid} minH={18} maxH={44} windows={dim ? 0 : 0.28} gap={6} />
      {/* Simge yapı orta katmanın önünde: şehri ilk bakışta tanıtan şey */}
      {lm ? lm(lx, GROUND, '#1B0C4C', night.pink) : null}
      <Layer seed={`front-${cityId}`} fill={night.ink} minH={8} maxH={30} windows={dim ? 0 : 0.18} gap={14} />
    </G>
  );
}

/** Şehir başlığı: ay, yıldızlar, silüet ve ışıklı sokak */
export function CitySkyline({ cityId, height = 150 }: { cityId: string; height?: number }) {
  return (
    <Svg width="100%" height={height} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`} preserveAspectRatio="xMidYMax slice" accessibilityElementsHidden>
      <NightSky id={cityId} />
      <Circle cx={300} cy={34} r={13} fill={night.paper} opacity={0.92} />
      <Circle cx={306} cy={30} r={12} fill="#2A1470" />
      <SkylineLayers cityId={cityId} />
      <Rect x={0} y={GROUND} width={SCENE_W} height={SCENE_H - GROUND} fill={night.deep} />
      <Rect x={0} y={GROUND} width={SCENE_W} height={1.2} fill={night.pink} opacity={0.7} />
      <Rect x={0} y={GROUND + 4} width={SCENE_W} height={0.8} fill={night.cyan} opacity={0.35} />
    </Svg>
  );
}

export const hasLandmark = (cityId: string) => !!LANDMARKS[cityId];

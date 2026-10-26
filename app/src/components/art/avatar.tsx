// Çizim avatar: fotoğraf yüklemeyen her oyuncuya isminden türeyen, hep aynı kalan bir portre.
// Gömlek oyuncunun seçtiği avatar rengindedir.

import { View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, Path, Rect } from 'react-native-svg';
import { hash, pick, rng, shade } from './seed';

const SKIN = ['#F6D7BC', '#EAC09A', '#D29A6E', '#A9704A', '#7A4B2C', '#5A3520'];
const HAIR = ['#1B1B1E', '#2E1C12', '#5B3A1E', '#9A6A35', '#D4A72C', '#E8E9F3', '#FF2EB6', '#00E5FF', '#8A2BFF', '#C0392B'];
const STYLES = ['short', 'long', 'mohawk', 'afro', 'bun', 'buzz', 'cap', 'side', 'long', 'short'] as const;

export function IllustratedAvatar({ name, color, size = 40 }: { name: string; color: string; size?: number }) {
  const r = rng(`av-${name}`);
  const skin = pick(r, SKIN);
  const hair = pick(r, HAIR);
  const style = pick(r, STYLES);
  const shades = r() < 0.18;
  const beard = r() < 0.2;
  const earring = r() < 0.3;
  const brow = shade(hair, -0.2);
  const cid = `avc-${hash(name)}-${size}`;
  const bg = shade(color, -0.45);
  const shirt = color;
  return (
    <View style={{ width: size, height: size }} accessibilityLabel={name} accessible>
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Defs>
          <ClipPath id={cid}>
            <Circle cx={32} cy={32} r={32} />
          </ClipPath>
        </Defs>
        <G clipPath={`url(#${cid})`}>
          <Rect x={0} y={0} width={64} height={64} fill={bg} />
          <Circle cx={50} cy={12} r={18} fill={shade(color, -0.25)} opacity={0.6} />
          {/* Arkadaki saç (uzun saç) */}
          {style === 'long' ? <Path d="M16 30 Q14 54 20 62 L44 62 Q50 54 48 30 Q32 14 16 30" fill={hair} /> : null}
          {style === 'afro' ? <Circle cx={32} cy={26} r={20} fill={hair} /> : null}
          {/* Gövde */}
          <Path d="M8 64 Q10 46 32 45 Q54 46 56 64 z" fill={shirt} />
          <Path d="M24 46 L32 54 L40 46" fill="none" stroke={shade(shirt, -0.35)} strokeWidth={2} />
          <Rect x={27} y={38} width={10} height={9} fill={shade(skin, -0.12)} />
          {/* Kafa */}
          <Ellipse cx={32} cy={28} rx={12} ry={14} fill={skin} />
          <Ellipse cx={20.5} cy={29} rx={2.2} ry={3} fill={skin} />
          <Ellipse cx={43.5} cy={29} rx={2.2} ry={3} fill={skin} />
          {earring ? <Circle cx={43.6} cy={33.4} r={1.3} fill="#FFD36E" /> : null}
          {beard ? <Path d="M21 30 Q22 44 32 44 Q42 44 43 30 Q40 38 32 38 Q24 38 21 30" fill={hair} /> : null}
          {/* Yüz */}
          {shades ? (
            <G>
              <Rect x={22} y={24.5} width={9} height={5} rx={2} fill="#0F0830" />
              <Rect x={33} y={24.5} width={9} height={5} rx={2} fill="#0F0830" />
              <Rect x={30} y={25.5} width={4} height={1.4} fill="#0F0830" />
              <Rect x={23.5} y={25.5} width={3} height={1.2} fill="#00E5FF" opacity={0.8} />
              <Rect x={34.5} y={25.5} width={3} height={1.2} fill="#FF2EB6" opacity={0.8} />
            </G>
          ) : (
            <G>
              <Ellipse cx={27} cy={27} rx={1.5} ry={1.9} fill="#1B1B1E" />
              <Ellipse cx={37} cy={27} rx={1.5} ry={1.9} fill="#1B1B1E" />
              <Path d="M24.5 23 q2.5 -1.6 5 0 M34.5 23 q2.5 -1.6 5 0" stroke={brow} strokeWidth={1.3} fill="none" strokeLinecap="round" />
            </G>
          )}
          <Path d="M31.5 29 q-1 3 1 3.4" stroke={shade(skin, -0.3)} strokeWidth={1} fill="none" strokeLinecap="round" />
          <Path d={r() < 0.5 ? 'M28 35 Q32 38.5 36 35' : 'M28.5 35.5 Q32 37 35.5 35.5'} stroke="#7A2E3A" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          {/* Ön saç */}
          {style === 'short' ? <Path d="M20 26 Q20 12 32 12 Q44 12 44 26 Q40 18 32 19 Q25 18 20 26" fill={hair} /> : null}
          {style === 'side' ? <Path d="M20 28 Q18 11 34 12 Q46 13 44 24 Q36 16 22 26 z" fill={hair} /> : null}
          {style === 'buzz' ? <Path d="M20.5 24 Q21 13 32 13 Q43 13 43.5 24 Q38 17 32 17 Q26 17 20.5 24" fill={hair} opacity={0.85} /> : null}
          {style === 'long' ? <Path d="M19 30 Q18 12 32 12 Q46 12 45 30 Q42 18 32 18 Q24 18 19 30" fill={hair} /> : null}
          {style === 'afro' ? <Path d="M19 24 Q22 14 32 15 Q42 14 45 24 Q38 19 32 20 Q26 19 19 24" fill={hair} /> : null}
          {style === 'mohawk' ? <Path d="M28 22 L28 8 Q32 2 36 8 L36 22 Q32 18 28 22" fill={hair} /> : null}
          {style === 'bun' ? (
            <G>
              <Circle cx={32} cy={9} r={6} fill={hair} />
              <Path d="M20 25 Q20 13 32 13 Q44 13 44 25 Q40 17 32 17 Q24 17 20 25" fill={hair} />
            </G>
          ) : null}
          {style === 'cap' ? (
            <G>
              <Path d="M19 22 Q19 10 32 10 Q45 10 45 22 z" fill={shade(color, 0.25)} />
              <Path d="M19 22 L50 22 Q50 25 44 25 L19 25 z" fill={shade(color, -0.2)} />
              <Circle cx={32} cy={11} r={1.4} fill={shade(color, -0.3)} />
            </G>
          ) : null}
        </G>
      </Svg>
    </View>
  );
}

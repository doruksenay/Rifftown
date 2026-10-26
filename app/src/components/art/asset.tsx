// Üretilmiş görsellerin (app/assets/art) gösterimi. Hangi görselin var olduğunu
// otomatik üretilen kayıt dosyası söyler (npm run art:sync). Görsel yoksa çağıran
// bileşen eski görünümüne döner; bu dosya hiçbir şey uydurmaz.

import { Image, type ImageStyle, type StyleProp, View } from 'react-native';
import { ART, PAINTABLE } from '@/lib/art-registry';

/** Varlık kimliği → paketlenmiş görsel (yoksa null) */
export const artSource = (id: string): number | null => ART[id] ?? null;
export const hasArt = (id: string) => id in ART;

/** Sprey boyaların hepsi tek görseli paylaşır */
export const itemArtId = (itemId: string) => (itemId.startsWith('spray_') ? 'item/spray' : `item/${itemId}`);

/** Basit görsel: verilen kimlik yoksa hiçbir şey çizmez */
export function ArtImage({ id, style, cover = true }: { id: string; style: StyleProp<ImageStyle>; cover?: boolean }) {
  const src = artSource(id);
  if (!src) return null;
  return <Image source={src} style={style} resizeMode={cover ? 'cover' : 'contain'} accessibilityIgnoresInvertColors />;
}

/**
 * Boyanabilen eşya: asıl görsel (boyanacak yüzey nötr gri) + maske, boya renginde ve "multiply" karışımıyla.
 * Gri yüzeyin gölgesi ve parlaması korunur; metal, tel, cam maskeye girmediği için değişmez.
 * paint verilmezse eşyanın fabrika rengi kullanılır.
 */
export function PaintedItemImage({ id, paint, size }: { id: string; paint?: string | null; size: number }) {
  const src = artSource(id);
  if (!src) return null;
  const p = PAINTABLE[id];
  const mask = p ? artSource(p.mask) : null;
  const color = paint ?? p?.defaultPaint;
  return (
    <View style={{ width: size, height: size, isolation: 'isolate' }}>
      <Image source={src} style={{ width: size, height: size }} resizeMode="contain" />
      {mask && color ? (
        <Image
          source={mask}
          style={{ position: 'absolute', left: 0, top: 0, width: size, height: size, tintColor: color, mixBlendMode: 'multiply' }}
          resizeMode="contain"
        />
      ) : null}
    </View>
  );
}

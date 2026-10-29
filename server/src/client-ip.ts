// İstemci adresi: kayıt sınırı (REGISTER_PER_IP_DAY) ve istek sınırı bu adrese göre sayılır.
//
// Güvenlik kuralı: istemcinin kendisi her başlığı yazabilir. Bu yüzden hiçbir başlığa varsayılan olarak güvenilmez.
//  - CLIENT_IP_HEADER (ör. cf-connecting-ip) yalnızca açıkça ayarlandığında okunur. Bu başlık, önümüzdeki kenar
//    sunucusunun (Cloudflare) istemciden geleni silip kendisi yazdığı bir başlık olmalıdır.
//  - TRUST_PROXY_HOPS = n: Fastify'ın trustProxy ayarı. X-Forwarded-For'un sağından n atlama güvenilir; istemcinin
//    sola eklediği sahte değerler okunmaz. 0 ise bağlantının kendi adresi kullanılır.
//  - Render'da (RENDER=true ortam değişkenini Render kendisi koyar) varsayılan: cf-connecting-ip + 1 atlama. Render'ın
//    vekili X-Forwarded-For'a istemcinin gönderdiğini silmeden ekler; trafik Cloudflare'den geçtiği için
//    cf-connecting-ip kenarda yazılır. Başlık yoksa ya da geçerli bir adres değilse req.ip'e (sağdan 1 atlama) düşülür:
//    sahtelenemez, en kötü durumda kaba (birkaç istemci aynı kovada).
// IPv6'da adresin ilk 64 biti (bir ev ya da cihazın bütün adresleri) tek kova sayılır.

import { isIP } from 'node:net';
import type { FastifyRequest } from 'fastify';
import { config } from './config';

/**
 * Fastify'ın trustProxy ayarı (proxy-addr güven fonksiyonu): bağlantıdan başlayarak ilk TRUST_PROXY_HOPS atlama güvenilir.
 * 0 iken hiçbir vekile güvenilmez ve req.ip bağlantının kendi adresidir. Uygulama kurulurken bir kez okunur.
 */
export function trustProxySetting(): (address: string, hop: number) => boolean {
  const hops = config.trustProxyHops;
  return (_address, hop) => hop < hops;
}

const normalize = (ip: string) => ip.trim().replace(/^::ffff:(?=\d+\.\d+\.\d+\.\d+$)/i, '');

/** İsteğin istemci adresi (yapılandırmaya göre güvenilir kaynaktan) */
export function clientAddress(req: FastifyRequest): string {
  const name = config.clientIpHeader;
  if (name) {
    const raw = req.headers[name];
    const v = normalize(String(Array.isArray(raw) ? raw[0] : (raw ?? '')));
    if (v && isIP(v)) return v;
  }
  return normalize(req.ip || 'unknown');
}

/** Sınırların sayıldığı kova: IPv4 adresinin kendisi, IPv6'da /64 bloğu */
export function addressBucket(ip: string): string {
  const a = normalize(ip);
  if (isIP(a) !== 6) return a;
  // IPv6: kısaltmayı aç, ilk dört grubu al
  const [head, tail = ''] = a.toLowerCase().split('::');
  const h = head ? head.split(':') : [];
  const t = tail ? tail.split(':') : [];
  const full = [...h, ...Array(Math.max(0, 8 - h.length - t.length)).fill('0'), ...t];
  return `${full
    .slice(0, 4)
    .map((g) => g.replace(/^0+(?=.)/, ''))
    .join(':')}::/64`;
}

export const clientBucket = (req: FastifyRequest) => addressBucket(clientAddress(req));

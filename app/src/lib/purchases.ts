// VIP satın alma: RevenueCat, App Store ve Google Play satın alımlarını tek bir arayüzde toplar.
//
// Akış: oyuncu bir paket satın alır → mağaza ödemeyi alır → RevenueCat sunucumuzdaki
// /api/webhooks/revenuecat adresine bildirim gönderir → sunucu VIP süresini uzatır.
// VIP'i sunucu verir; uygulama sadece satın almayı başlatır ve ardından profili yeniler.
//
// Gerekenler (README'de adım adım):
//   EXPO_PUBLIC_REVENUECAT_IOS_KEY, EXPO_PUBLIC_REVENUECAT_ANDROID_KEY  (RevenueCat → API keys)
//   Gerçek satın alma bir geliştirme ya da mağaza derlemesi ister; Expo Go'da kütüphane taklit moduna geçer.

import { VIP_PLANS } from '@rifftown/shared';
import { Platform } from 'react-native';
import Purchases, { type PurchasesPackage } from 'react-native-purchases';

const KEY = Platform.select({
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
  default: undefined,
});

/** Bu cihazda mağaza satın alımı yapılabilir mi? */
export const storeAvailable = Platform.OS !== 'web' && !!KEY;

let configuredFor: string | null = null;

/** Oturum açan oyuncuyla RevenueCat'i eşler. Kullanıcı kimliği = oyundaki kullanıcı numarası. */
export async function syncPurchasesUser(userId: number | null) {
  if (!storeAvailable) return;
  try {
    if (userId === null) {
      if (configuredFor) await Purchases.logOut().catch(() => {});
      configuredFor = null;
      return;
    }
    const id = String(userId);
    if (configuredFor === id) return;
    if (!(await Purchases.isConfigured())) Purchases.configure({ apiKey: KEY!, appUserID: id });
    else await Purchases.logIn(id);
    configuredFor = id;
  } catch (e) {
    console.warn('RevenueCat ayarlanamadı', e);
  }
}

export interface VipOffer {
  productId: string;
  days: number;
  /** Mağazanın yerel fiyatı (ör. "₺99,99"); mağazaya ulaşılamazsa null */
  price: string | null;
  pkg: PurchasesPackage | null;
}

/** Google Play abonelik kimlikleri "urun:temel-plan" biçiminde gelebilir. */
const matches = (storeId: string, productId: string) => storeId === productId || storeId.startsWith(`${productId}:`);

/** Mağazadaki VIP paketleri; mağaza yoksa sabit plan listesi (fiyatsız) döner. */
export async function loadVipOffers(): Promise<VipOffer[]> {
  const fallback = VIP_PLANS.map((p) => ({ productId: p.productId, days: p.days, price: null, pkg: null }));
  if (!storeAvailable || !configuredFor) return fallback;
  try {
    const offerings = await Purchases.getOfferings();
    const pkgs = offerings.current?.availablePackages ?? [];
    return VIP_PLANS.map((p) => {
      const pkg = pkgs.find((x) => matches(x.product.identifier, p.productId)) ?? null;
      return { productId: p.productId, days: p.days, price: pkg?.product.priceString ?? null, pkg };
    });
  } catch (e) {
    console.warn('Mağaza paketleri alınamadı', e);
    return fallback;
  }
}

export type PurchaseOutcome = 'purchased' | 'cancelled' | 'unavailable' | 'failed';

export async function buyVip(offer: VipOffer): Promise<PurchaseOutcome> {
  if (!storeAvailable || !offer.pkg) return 'unavailable';
  try {
    await Purchases.purchasePackage(offer.pkg);
    return 'purchased';
  } catch (e) {
    if ((e as { userCancelled?: boolean | null })?.userCancelled) return 'cancelled';
    console.warn('Satın alma başarısız', e);
    return 'failed';
  }
}

/** Telefon değiştiren ya da uygulamayı yeniden kuran oyuncular için. */
export async function restoreVip(): Promise<boolean> {
  if (!storeAvailable) return false;
  try {
    await Purchases.restorePurchases();
    return true;
  } catch (e) {
    console.warn('Satın almalar geri yüklenemedi', e);
    return false;
  }
}

import { type L, type Lang, pick } from '@rifftown/shared';
import { getLocales } from 'expo-localization';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ApiError } from './api';
import { storage } from './storage';
import { type StringKey, en, tr } from './strings';

type Vars = Record<string, string | number>;

interface I18n {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: StringKey, vars?: Vars) => string;
  /** İki dilli oyun içeriği (şehir, mekân, beceri adları) */
  p: (l: L) => string;
  /** Hata nesnesini okunur mesaja çevirir */
  err: (e: unknown) => string;
  locale: string;
}

const Ctx = createContext<I18n | null>(null);

const deviceLang = (): Lang => (getLocales()[0]?.languageCode === 'tr' ? 'tr' : 'en');

function fill(s: string, vars?: Vars) {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? String(vars[k]) : `{${k}}`));
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(deviceLang());
  useEffect(() => {
    storage.get('lang').then((l) => {
      if (l === 'tr' || l === 'en') setLangState(l);
    });
  }, []);
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    storage.set('lang', l);
  }, []);
  const value = useMemo<I18n>(() => {
    const dict = lang === 'en' ? en : tr;
    const t = (key: StringKey, vars?: Vars) => fill(dict[key] ?? tr[key] ?? key, vars);
    return {
      lang,
      setLang,
      t,
      p: (l: L) => pick(l, lang),
      err: (e: unknown) => {
        const code = e instanceof ApiError ? e.code : 'unknown';
        const key = `err_${code}` as StringKey;
        return key in dict ? t(key) : t('err_unknown');
      },
      locale: lang === 'en' ? 'en-GB' : 'tr-TR',
    };
  }, [lang, setLang]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const v = useContext(Ctx);
  if (!v) throw new Error('I18nProvider eksik');
  return v;
}

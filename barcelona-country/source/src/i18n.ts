import { createContext, useContext } from 'react';
import es from './data/lang/es.json';
import ca from './data/lang/ca.json';
import en from './data/lang/en.json';
import fr from './data/lang/fr.json';
import it from './data/lang/it.json';
import de from './data/lang/de.json';

const data = { es, ca, en, fr, it, de };

export const LANGS = ['es', 'ca', 'en', 'fr', 'it', 'de'] as const;
export type Lang = (typeof LANGS)[number];
export type Copy = (typeof data)['es'];
export const T = data as Record<Lang, Copy>;

export const LANG_KEY = 'barcelona-country-language';

export function initialLang(): Lang {
  try {
    const stored = window.localStorage.getItem(LANG_KEY);
    if (stored && (LANGS as readonly string[]).includes(stored)) return stored as Lang;
  } catch {
    /* storage blocked: keep default */
  }
  return 'es';
}

type LangState = { lang: Lang; t: Copy; setLang: (next: Lang) => void };
export const LangContext = createContext<LangState>({ lang: 'es', t: T.es, setLang: () => undefined });
export const useLang = () => useContext(LangContext);

export const res = (path: string) => `resources/${path}`;

export type Artist = { name: string; role: string; body?: string; img: string; ig?: string; gallery: string[] };

// Figures shown in the festival block, as on the production site.
export const STATS = { days: '3', artists: '17', dancers: '+3000' };

const gal = (slug: string, n: number) => Array.from({ length: n }, (_, i) => `gal/${slug}/${String(i).padStart(2, '0')}.webp`);

const META: Record<string, Omit<Artist, 'name' | 'role' | 'body'>> = {
  'Pol F. Ryan': { img: 'pol', ig: 'https://www.instagram.com/polfryann/', gallery: gal('pol-f-ryan', 1) },
  'Algaly Fofana': { img: 'algaly', ig: 'https://www.instagram.com/algalyfofana/', gallery: gal('algaly-fofana', 5) },
  'David Villellas': { img: 'david-villellas', ig: 'https://www.instagram.com/david.villellas/', gallery: gal('david-villellas', 1) },
  'Sofía Balzano': { img: 'sofia', ig: 'https://www.instagram.com/sofiabalzanoo_/', gallery: gal('sofia-balzano', 1) },
  'Montse Moscardó': { img: 'montse', ig: 'https://www.instagram.com/montse.moscardo/', gallery: gal('montse-moscardo', 1) },
  Johnny: { img: 'johnny', ig: 'https://www.instagram.com/learnwithjohnny/', gallery: gal('johnny', 5) },
  'David Prestor': { img: 'david-prestor', gallery: gal('david-prestor', 10) },
  'Laura Jones': { img: 'laura-jones', gallery: gal('laura-jones', 5) },
  'Silvia Denise': { img: 'silvia-denise', gallery: gal('silvia-denise', 1) },
  'Virginie Barjaud': { img: 'virginie', gallery: gal('virginie-barjaud', 5) },
  'Silvia Calsina': { img: 'silvia-calsina', gallery: gal('silvia-calsina', 5) },
  'Neus Lloveras': { img: 'neus', gallery: gal('neus-lloveras', 5) },
  'Edu Roldos': { img: 'edu-roldos', gallery: gal('edu-roldos', 1) },
  'Jonathan Jones': { img: 'jonathan', ig: 'https://www.instagram.com/jonathan_jones_music/', gallery: gal('jonathan-jones', 5) },
  'Steve Frapolli': { img: 'steve', ig: 'https://www.instagram.com/steve_frapolli/', gallery: gal('steve-frapolli', 5) },
  'DJ Lu': { img: 'dj-lu', gallery: gal('dj-lu', 5) },
  Antoine: { img: 'antoine', gallery: gal('antoine', 5) }
};

export const artistsFor = (t: Copy): Artist[] => t.artists.map((a) => ({ ...a, ...META[a.name] }));

/** Display casing for copy stored in capitals: 'DETALLES DEL FESTIVAL' -> 'Detalles del festival'. */
export const sentence = (text: string, lang: string) => {
  const lower = text.toLocaleLowerCase(lang);
  return lower.charAt(0).toLocaleUpperCase(lang) + lower.slice(1);
};

export const pad = (n: number) => String(n).padStart(2, '0');

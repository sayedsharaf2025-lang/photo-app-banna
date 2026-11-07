// The fonts bundled in the app (see scripts/gen-fonts.mjs and src/styles/fonts.css).
import { saveFile } from './export.ts';
import { containsArabic, hasAnyNumerals } from './arabicUtils.ts';

export type Script = 'ar' | 'en';
export type FontStyleGroup = 'kufi' | 'naskh' | 'ruqaa' | 'sans' | 'display' | 'latin-sans' | 'latin-serif' | 'latin-display';

export interface FontDef {
  name: string;
  script: Script;
  weight: 400 | 700;
  pkg: string;
  categoryAr: string;
  styleGroup: FontStyleGroup;
}

export const FONT_DEFS: FontDef[] = [
  { name: 'Cairo', script: 'ar', weight: 700, pkg: 'cairo', categoryAr: 'كوفي معاصر', styleGroup: 'kufi' },
  { name: 'Tajawal', script: 'ar', weight: 700, pkg: 'tajawal', categoryAr: 'حديث متوازن', styleGroup: 'sans' },
  { name: 'Almarai', script: 'ar', weight: 700, pkg: 'almarai', categoryAr: 'عصري واضح', styleGroup: 'sans' },
  { name: 'Amiri', script: 'ar', weight: 700, pkg: 'amiri', categoryAr: 'نسخ مطبعي أصيل', styleGroup: 'naskh' },
  { name: 'Noto Kufi Arabic', script: 'ar', weight: 700, pkg: 'noto-kufi-arabic', categoryAr: 'كوفي كلاسيكي', styleGroup: 'kufi' },
  { name: 'Reem Kufi', script: 'ar', weight: 700, pkg: 'reem-kufi', categoryAr: 'كوفي بسيط', styleGroup: 'kufi' },
  { name: 'El Messiri', script: 'ar', weight: 700, pkg: 'el-messiri', categoryAr: 'فني / واجهات', styleGroup: 'display' },
  { name: 'Changa', script: 'ar', weight: 700, pkg: 'changa', categoryAr: 'هندسي سميك', styleGroup: 'kufi' },
  { name: 'Noto Naskh Arabic', script: 'ar', weight: 700, pkg: 'noto-naskh-arabic', categoryAr: 'نسخ مقروء', styleGroup: 'naskh' },
  { name: 'IBM Plex Sans Arabic', script: 'ar', weight: 700, pkg: 'ibm-plex-sans-arabic', categoryAr: 'تقني حديث', styleGroup: 'sans' },
  { name: 'Vazirmatn', script: 'ar', weight: 700, pkg: 'vazirmatn', categoryAr: 'شاشات وقراءة', styleGroup: 'sans' },
  { name: 'Markazi Text', script: 'ar', weight: 700, pkg: 'markazi-text', categoryAr: 'صحفي / كتب', styleGroup: 'naskh' },
  { name: 'Aref Ruqaa', script: 'ar', weight: 700, pkg: 'aref-ruqaa', categoryAr: 'رقعة تراثي', styleGroup: 'ruqaa' },
  { name: 'Lateef', script: 'ar', weight: 700, pkg: 'lateef', categoryAr: 'نسخ انسيابي', styleGroup: 'naskh' },
  { name: 'Lalezar', script: 'ar', weight: 400, pkg: 'lalezar', categoryAr: 'عريض / ملصقات', styleGroup: 'display' },
  { name: 'Rakkas', script: 'ar', weight: 400, pkg: 'rakkas', categoryAr: 'زخرفي / إعلانات', styleGroup: 'display' },
  { name: 'Roboto', script: 'en', weight: 700, pkg: 'roboto', categoryAr: 'لاتيني قياسي', styleGroup: 'latin-sans' },
  { name: 'Montserrat', script: 'en', weight: 700, pkg: 'montserrat', categoryAr: 'لاتيني هندسي', styleGroup: 'latin-sans' },
  { name: 'Poppins', script: 'en', weight: 700, pkg: 'poppins', categoryAr: 'لاتيني دائري', styleGroup: 'latin-sans' },
  { name: 'Playfair Display', script: 'en', weight: 700, pkg: 'playfair-display', categoryAr: 'لاتيني بسيريف', styleGroup: 'latin-serif' },
  { name: 'Oswald', script: 'en', weight: 700, pkg: 'oswald', categoryAr: 'لاتيني مضغوط', styleGroup: 'latin-display' },
  { name: 'Inter', script: 'en', weight: 700, pkg: 'inter', categoryAr: 'لاتيني واجهات UI', styleGroup: 'latin-sans' },
  { name: 'Merriweather', script: 'en', weight: 700, pkg: 'merriweather', categoryAr: 'لاتيني مقروء', styleGroup: 'latin-serif' },
  { name: 'Lobster', script: 'en', weight: 400, pkg: 'lobster', categoryAr: 'لاتيني مائل مزخرف', styleGroup: 'latin-display' },
  { name: 'Bebas Neue', script: 'en', weight: 400, pkg: 'bebas-neue', categoryAr: 'لاتيني عريض ضخم', styleGroup: 'latin-display' },
  { name: 'Pacifico', script: 'en', weight: 400, pkg: 'pacifico', categoryAr: 'لاتيني يدوي', styleGroup: 'latin-display' },
  { name: 'Anton', script: 'en', weight: 400, pkg: 'anton', categoryAr: 'لاتيني إعلاني', styleGroup: 'latin-display' },
];

export const FONTS = FONT_DEFS.map((f) => f.name);
export const isArabic = (s: string): boolean => containsArabic(s) || /[\u0600-\u06FF]/.test(s);
export const scriptOf = (text: string): Script => (isArabic(text) || (!/[A-Za-z]/.test(text) && hasAnyNumerals(text)) ? 'ar' : 'en');

export const fontDefOf = (name: string): FontDef => FONT_DEFS.find((f) => f.name === name) ?? FONT_DEFS[0];
const weightOf = (name: string): number => fontDefOf(name).weight;

/** CSS font shorthand for a bundled font at `px` size. */
export const fontCss = (name: string, px: number): string => `${weightOf(name)} ${px}px "${name}", sans-serif`;

/** Fonts that can draw `text`: Arabic text & numerals -> Arabic fonts (which include numbers and Latin); otherwise -> Latin fonts. */
export const fontsFor = (text: string, forceIncludeArabic = false): string[] => {
  const needsArabic = forceIncludeArabic || isArabic(text) || (!/[A-Za-z]/.test(text) && hasAnyNumerals(text));
  return FONT_DEFS.filter((f) => (needsArabic ? f.script === 'ar' : f.script === 'en')).map((f) => f.name);
};

/** Loads both the Arabic and Latin parts of a font (they are separate files selected by unicode-range). */
export async function loadFont(name: string): Promise<void> {
  const css = fontCss(name, 32);
  await Promise.all([document.fonts.load(css, 'A'), document.fonts.load(css, '\u0627'), document.fonts.load(css, '1'), document.fonts.load(css, '\u0661')]);
}

/** Downloads the chosen font file (.woff2) locally to the user device. */
export async function downloadFontFile(name: string): Promise<{ success: boolean; filename: string }> {
  const f = fontDefOf(name);
  const subset = f.script === 'ar' ? 'arabic' : 'latin';
  const url = `/node_modules/@fontsource/${f.pkg}/files/${f.pkg}-${subset}-${f.weight}-normal.woff2`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      const fallbackUrl = `/node_modules/@fontsource/${f.pkg}/files/${f.pkg}-latin-${f.weight}-normal.woff2`;
      const resFallback = await fetch(fallbackUrl);
      if (!resFallback.ok) throw new Error(`Could not load font file for ${name}`);
      const blob = await resFallback.blob();
      const filename = `${f.name.replace(/\s+/g, '_')}-${f.weight}.woff2`;
      await saveFile(blob, filename);
      return { success: true, filename };
    }
    const blob = await res.blob();
    const filename = `${f.name.replace(/\s+/g, '_')}-${f.weight}.woff2`;
    await saveFile(blob, filename);
    return { success: true, filename };
  } catch (err) {
    console.error('downloadFontFile failed:', err);
    throw err;
  }
}

/** Returns the official Google Fonts specimen page for TTF/OTF download or glyph inspection. */
export function getGoogleFontsUrl(name: string): string {
  return `https://fonts.google.com/specimen/${encodeURIComponent(name.replace(/\s+/g, '+'))}`;
}

// Arabic text, typography, and numeral conversion utilities

const EASTERN_ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

const DIGIT_TO_EASTERN: Record<string, string> = {
  '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤',
  '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩'
};

const EASTERN_TO_WESTERN: Record<string, string> = {
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
  '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
  '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
  '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
};

/** Converts Western digits (0-9) to Eastern Arabic numerals (٠-٩). */
export function toEasternArabicNumerals(text: string): string {
  return text.replace(/[0-9]/g, (d) => DIGIT_TO_EASTERN[d] ?? d);
}

/** Converts Eastern Arabic (٠-٩) and Persian (۰-۹) numerals to Western digits (0-9). */
export function toWesternArabicNumerals(text: string): string {
  return text.replace(/[\u0660-\u0669\u06F0-\u06F9]/g, (d) => EASTERN_TO_WESTERN[d] ?? d);
}

/** Checks whether a string contains Eastern Arabic or Persian digits. */
export function hasEasternNumerals(text: string): boolean {
  return /[\u0660-\u0669\u06F0-\u06F9]/.test(text);
}

/** Checks whether a string contains Western digits (0-9). */
export function hasWesternNumerals(text: string): boolean {
  return /[0-9]/.test(text);
}

/** Checks whether a string contains any digits. */
export function hasAnyNumerals(text: string): boolean {
  return /[0-9\u0660-\u0669\u06F0-\u06F9]/.test(text);
}

/** Checks whether text contains Arabic script letters or signs. */
export function containsArabic(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFC]/.test(text);
}

/** Normalizes punctuation between Arabic and Western standards. */
export function normalizePunctuation(text: string, toArabic = true): string {
  if (toArabic) {
    return text.replace(/,/g, '،').replace(/;/g, '؛').replace(/\?/g, '؟').replace(/%/g, '٪');
  }
  return text.replace(/،/g, ',').replace(/؛/g, ';').replace(/؟/g, '?').replace(/٪/g, '%');
}

/** Formats numbers within mixed text to Eastern or Western format. */
export function convertTextNumerals(text: string, target: 'eastern' | 'western'): string {
  return target === 'eastern' ? toEasternArabicNumerals(text) : toWesternArabicNumerals(text);
}

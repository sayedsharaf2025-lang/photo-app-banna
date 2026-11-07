import { toGray, inkMask, normalizeInk, rankFonts, type RankedFont } from './fontMatch.ts';
import { fontsFor, fontCss, isArabic, loadFont, fontDefOf } from './fonts.ts';
import { containsArabic, hasAnyNumerals } from './arabicUtils.ts';

export interface Sel { x0: number; y0: number; x1: number; y1: number }

function renderShape(font: string, text: string) {
  const px = 90, lh = px * 1.3, lines = text.split('\n');
  const probe = document.createElement('canvas').getContext('2d')!;
  probe.font = fontCss(font, px);
  const w = Math.ceil(Math.max(...lines.map((l) => probe.measureText(l).width))) + 60, h = Math.ceil(lh * lines.length) + 40;
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#000'; ctx.font = fontCss(font, px); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.direction = containsArabic(text) || (!/[A-Za-z]/.test(text) && hasAnyNumerals(text)) ? 'rtl' : 'ltr';
  lines.forEach((l, i) => ctx.fillText(l, w / 2, 20 + lh * i + lh / 2));
  return normalizeInk(inkMask(toGray(ctx.getImageData(0, 0, w, h).data, w * h), w, h), w, h);
}

/** Copies the selected rectangle out of an RGBA image. */
export function cropSel(rgba: Uint8ClampedArray, W: number, sel: Sel) {
  const H = Math.max(1, Math.floor(rgba.length / (W * 4)));
  const x0 = Math.max(0, Math.min(W - 1, Math.floor(Math.min(sel.x0, sel.x1))));
  const y0 = Math.max(0, Math.min(H - 1, Math.floor(Math.min(sel.y0, sel.y1))));
  const x1 = Math.max(x0 + 1, Math.min(W, Math.ceil(Math.max(sel.x0, sel.x1))));
  const y1 = Math.max(y0 + 1, Math.min(H, Math.ceil(Math.max(sel.y0, sel.y1))));
  const w = x1 - x0, h = y1 - y0;
  const crop = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    const sy = y0 + y;
    for (let x = 0; x < w; x++) {
      const sx = x0 + x;
      const s = (sy * W + sx) * 4, d = (y * w + x) * 4, a = (rgba[s + 3] ?? 255) / 255;
      crop[d] = Math.round(rgba[s] * a + 255 * (1 - a));
      crop[d + 1] = Math.round(rgba[s + 1] * a + 255 * (1 - a));
      crop[d + 2] = Math.round(rgba[s + 2] * a + 255 * (1 - a));
      crop[d + 3] = 255;
    }
  }
  return { crop, w, h };
}

/** Returns the bundled fonts ordered by how closely `text` drawn in them matches the selected area. Empty if the area has no readable shape. */
export async function findFonts(rgba: Uint8ClampedArray, W: number, sel: Sel, text: string): Promise<RankedFont[]> {
  const { crop, w, h } = cropSel(rgba, W, sel);
  const query = normalizeInk(inkMask(toGray(crop, w * h), w, h), w, h);
  if (!query) return [];
  const names = fontsFor(text);
  await Promise.all(names.map((f) => loadFont(f)));
  const cands = names
    .map((font) => {
      const def = fontDefOf(font);
      return {
        font,
        shape: renderShape(font, text),
        categoryAr: def.categoryAr,
        weight: def.weight,
      };
    })
    .filter((c): c is { font: string; shape: NonNullable<ReturnType<typeof renderShape>>; categoryAr: string; weight: 400 | 700 } => c.shape !== null);
  const ranked = rankFonts(query, cands);

  // If the query text is predominantly numbers, dates, or card codes, prioritize modern Kufi and Sans fonts
  // over flowing cursive/calligraphy scripts like Lateef or Aref Ruqaa which are never used on official cards.
  const isNumeric = hasAnyNumerals(text) && !/[\u0621-\u064A]{4,}/.test(text);
  if (isNumeric) {
    for (const r of ranked) {
      const def = fontDefOf(r.font);
      if (def.styleGroup === 'kufi' || def.styleGroup === 'sans') {
        r.score = Math.min(0.99, r.score * 1.08 + 0.05);
      } else if (def.styleGroup === 'ruqaa' || def.name === 'Lateef' || def.styleGroup === 'display') {
        r.score = r.score * 0.88;
      }
    }
    ranked.sort((a, b) => b.score - a.score);
  }

  return ranked;
}


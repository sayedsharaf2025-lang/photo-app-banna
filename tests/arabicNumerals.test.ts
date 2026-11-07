import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  toEasternArabicNumerals,
  toWesternArabicNumerals,
  hasEasternNumerals,
  hasWesternNumerals,
  hasAnyNumerals,
  containsArabic,
  convertTextNumerals
} from '../src/lib/arabicUtils.ts';

test('converts western digits to eastern arabic numerals', () => {
  assert.equal(toEasternArabicNumerals('1234567890'), '١٢٣٤٥٦٧٨٩٠');
  assert.equal(toEasternArabicNumerals('السعر: 150 ريال'), 'السعر: ١٥٠ ريال');
  assert.equal(toEasternArabicNumerals('عام 2024 م'), 'عام ٢٠٢٤ م');
});

test('converts eastern arabic numerals to western digits', () => {
  assert.equal(toWesternArabicNumerals('١٢٣٤٥٦٧٨٩٠'), '1234567890');
  assert.equal(toWesternArabicNumerals('رقم الهاتف: ٠٥٥١٢٣٤٥٦٧'), 'رقم الهاتف: 0551234567');
  assert.equal(toWesternArabicNumerals('القيمة: ٥٠٫٥ ٪'), 'القيمة: 50٫5 ٪');
});

test('detects eastern and western numerals accurately', () => {
  assert.equal(hasEasternNumerals('١٢٣'), true);
  assert.equal(hasEasternNumerals('123'), false);
  assert.equal(hasWesternNumerals('123'), true);
  assert.equal(hasWesternNumerals('١٢٣'), false);
  assert.equal(hasAnyNumerals('لا توجد أرقام'), false);
  assert.equal(hasAnyNumerals('رقم ٥'), true);
  assert.equal(hasAnyNumerals('item 4'), true);
});

test('detects arabic script', () => {
  assert.equal(containsArabic('مرحبا بالعالم'), true);
  assert.equal(containsArabic('Hello World'), false);
  assert.equal(containsArabic('١٢٣'), true);
});

test('convertTextNumerals targets correctly', () => {
  assert.equal(convertTextNumerals('خصم 20% لفترة محدودة', 'eastern'), 'خصم ٢٠% لفترة محدودة');
  assert.equal(convertTextNumerals('خصم ٢٠% لفترة محدودة', 'western'), 'خصم 20% لفترة محدودة');
});

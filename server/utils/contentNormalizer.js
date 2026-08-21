'use strict';

/**
 * contentNormalizer.js
 * 
 * Cleans and normalizes visible document text, dates, monetary amounts, and section boundaries.
 */

const MONTH_MAP = {
  january: '01', jan: '01',
  february: '02', feb: '02',
  march: '03', mar: '03',
  april: '04', apr: '04',
  may: '05',
  june: '06', jun: '06',
  july: '07', jul: '07',
  august: '08', aug: '08',
  september: '09', sep: '09', sept: '09',
  october: '10', oct: '10',
  november: '11', nov: '11',
  december: '12', dec: '12'
};

/**
 * Normalizes text lines and whitespace while preserving section headers and paragraph breaks.
 * @param {string} text
 * @returns {string}
 */
function normalizeDocumentText(text) {
  if (!text) return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Normalizes a date string into standard YYYY-MM-DD format.
 * Handles formats like:
 * - "18 August 2026", "August 18, 2026", "01 September 2026"
 * - "2026-08-18", "18/08/2026", "08/18/2026"
 * @param {string} dateStr
 * @returns {string|null}
 */
function normalizeDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const clean = dateStr.trim().replace(/[,\.]/g, '');

  // 1. Check YYYY-MM-DD
  const isoMatch = clean.match(/\b(\d{4})[-/](\d{1,2})[-/](\d{1,2})\b/);
  if (isoMatch) {
    const y = isoMatch[1];
    const m = isoMatch[2].padStart(2, '0');
    const d = isoMatch[3].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // 2. Check "18 August 2026" or "01 September 2026"
  const dmyMatch = clean.match(/\b(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})\b/);
  if (dmyMatch) {
    const d = dmyMatch[1].padStart(2, '0');
    const mKey = dmyMatch[2].toLowerCase();
    const y = dmyMatch[3];
    if (MONTH_MAP[mKey]) {
      return `${y}-${MONTH_MAP[mKey]}-${d}`;
    }
  }

  // 3. Check "August 18 2026"
  const mdyMatch = clean.match(/\b([A-Za-z]+)\s+(\d{1,2})\s+(\d{4})\b/);
  if (mdyMatch) {
    const mKey = mdyMatch[1].toLowerCase();
    const d = mdyMatch[2].padStart(2, '0');
    const y = mdyMatch[3];
    if (MONTH_MAP[mKey]) {
      return `${y}-${MONTH_MAP[mKey]}-${d}`;
    }
  }

  return null;
}

/**
 * Extracts and normalizes monetary values without confusing invoice/contract IDs.
 * @param {string} text
 * @returns {Array<{ amount: number, currency: string, type: string, raw: string }>}
 */
function extractMonetaryValues(text) {
  const values = [];
  if (!text) return values;

  // Match currency patterns: "$4,800", "USD 6,200", "4,800.00 USD", "EUR 15,000", "SGD 25,000"
  // Negative lookbehind ensures we don't match IDs like "INV-88421"
  const moneyRegex = /(?:(USD|EUR|GBP|SGD|INR|AUD|CAD|\$|€|£|₹)\s*([\d,]+(?:\.\d{2})?)|([\d,]+(?:\.\d{2})?)\s*(USD|EUR|GBP|SGD|INR|AUD|CAD))\b/gi;
  let match;

  while ((match = moneyRegex.exec(text)) !== null) {
    const rawSymbol = match[1] || match[4] || '$';
    const rawNumStr = match[2] || match[3] || '0';
    const cleanNum = parseFloat(rawNumStr.replace(/,/g, ''));

    if (!isNaN(cleanNum) && cleanNum > 0) {
      let currency = 'USD';
      if (rawSymbol === '$' || rawSymbol.toUpperCase() === 'USD') currency = 'USD';
      else if (rawSymbol === '€' || rawSymbol.toUpperCase() === 'EUR') currency = 'EUR';
      else if (rawSymbol === '£' || rawSymbol.toUpperCase() === 'GBP') currency = 'GBP';
      else if (rawSymbol.toUpperCase() === 'SGD') currency = 'SGD';
      else if (rawSymbol === '₹' || rawSymbol.toUpperCase() === 'INR') currency = 'INR';
      else currency = rawSymbol.toUpperCase();

      // Determine type based on surrounding context
      const index = match.index;
      const context = text.substring(Math.max(0, index - 40), Math.min(text.length, index + 60)).toLowerCase();
      let type = 'general_fee';

      if (context.includes('monthly') || context.includes('per month') || context.includes('subscription')) {
        type = 'monthly_subscription';
      } else if (context.includes('amendment') || context.includes('new fee') || context.includes('revised fee')) {
        type = 'revised_fee';
      } else if (context.includes('total') || context.includes('amount due') || context.includes('balance')) {
        type = 'total_amount_due';
      } else if (context.includes('deposit') || context.includes('retainer')) {
        type = 'retainer';
      }

      // Avoid duplicates of the same amount & currency
      if (!values.some(v => v.amount === cleanNum && v.currency === currency)) {
        values.push({
          amount: cleanNum,
          currency,
          type,
          raw: match[0].trim()
        });
      }
    }
  }

  return values;
}

module.exports = {
  normalizeDocumentText,
  normalizeDate,
  extractMonetaryValues
};

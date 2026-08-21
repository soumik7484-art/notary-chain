/**
 * Strict Contracting Party & Entity Validator for NotaryChain
 * Rejects sentence fragments, clauses, boilerplate, and non-entity text.
 */

const FORBIDDEN_VERBS_AND_PHRASES = [
  /\b(?:this|the)\s+(?:mutual\s+)?(?:non[- ]disclosure\s+)?(?:agreement|contract|amendment|document|memorandum)\b/i,
  /\b(?:is|are|was|were)\s+entered\s+into\b/i,
  /\bby\s+and\s+between\b/i,
  /\bhereinafter\b/i,
  /\breferred\s+to\s+as\b/i,
  /\bparties\s+hereto\b/i,
  /\bthe\s+undersigned\b/i,
  /\beach\s+party\b/i,
  /\bboth\s+parties\b/i,
  /\bshall\s+(?:be|agree|maintain)\b/i,
  /\bagrees?\s+to\b/i,
  /\bexecuted\s+by\b/i,
  /\bwitnesseth\b/i,
  /\bwhereas\b/i,
  /\bnow,\s*therefore\b/i,
  /\bstatement\s+of\s+work\b/i
];

/**
 * Clean, sanitize, and validate a single contracting party name
 */
function sanitizeContractingParty(rawName) {
  if (!rawName || typeof rawName !== 'string') return null;
  let str = rawName.trim();

  // 1. Strip introductory boilerplate phrases
  str = str.replace(/^(?:This\s+(?:Mutual\s+)?(?:Non[- ]Disclosure\s+)?Agreement\s*(?:\([^)]*\))?\s*(?:is\s+)?(?:entered\s+into\s+)?(?:by\s+(?:and\s+between\s+)?)?|By\s+and\s+Between:?|Parties:?|Between:?|Entered\s+into\s+by:?|Party\s*[AB]:?|Client:?|Service\s*Provider:?|Seller:?|Buyer:?|Company:?)\s*/i, '').trim();

  // 2. Strip leading "by", "between", "and", "for"
  str = str.replace(/^(?:by|between|and|for)\s+/i, '').trim();

  // 3. Strip trailing legal parentheticals / qualifications
  str = str.replace(/,?\s*(?:a\s+[A-Za-z\s]+(?:corporation|company|limited\s+liability\s+company|entity)|an\s+[A-Za-z\s]+(?:corporation|company))$/i, '').trim();
  str = str.replace(/\s*\((?:the\s+)?["']?(?:Company|Client|Provider|Buyer|Seller|Party\s*[AB]|Disclosing\s*Party|Receiving\s*Party)["']?\)/i, '').trim();
  str = str.replace(/\s*\(hereinafter[^\)]*\)/i, '').trim();

  // 4. Remove trailing/leading punctuation
  str = str.replace(/^[,;:\-\s"']+|[,;:\-\s"']+$/g, '').trim();

  // 5. Length check
  if (str.length < 3 || str.length > 90) return null;

  // 6. Check forbidden sentence patterns and verbs
  for (const pat of FORBIDDEN_VERBS_AND_PHRASES) {
    if (pat.test(str)) return null;
  }

  // 7. Must contain at least one uppercase letter (proper noun)
  if (!/[A-Z]/.test(str)) return null;

  return str;
}

/**
 * Filter, split compound parties, clean, and deduplicate an array of party objects or strings
 */
function sanitizePartiesList(parties) {
  if (!Array.isArray(parties)) return [];
  const rawCandidates = [];

  for (const p of parties) {
    const rawVal = typeof p === 'string' ? p : (p.value || p.name || '');
    if (!rawVal) continue;

    // Check if string contains multiple compound parties joined by " and " or " & "
    if (/\s+(?:and|And|&)\s+/.test(rawVal) && !/Pte|Ltd|Inc|LLC|Corp/i.test(rawVal.split(/\s+(?:and|And|&)\s+/)[0])) {
      const parts = rawVal.split(/\s+(?:and|And|&)\s+/);
      parts.forEach(part => rawCandidates.push({ val: part, obj: p }));
    } else if (rawVal.includes(' and ') && rawVal.length > 40) {
      const parts = rawVal.split(/\s+(?:and|And|&)\s+/);
      parts.forEach(part => rawCandidates.push({ val: part, obj: p }));
    } else {
      rawCandidates.push({ val: rawVal, obj: p });
    }
  }

  const cleanMap = new Map();

  for (const item of rawCandidates) {
    const cleanName = sanitizeContractingParty(item.val);
    if (!cleanName) continue;

    const lowerKey = cleanName.toLowerCase();
    
    // If we already have a shorter version of this entity name, replace with the longer full one
    let shouldAdd = true;
    for (const [existingKey, existingObj] of cleanMap.entries()) {
      if (existingKey === lowerKey) {
        shouldAdd = false;
        break;
      }
      if (lowerKey.startsWith(existingKey) && lowerKey.length > existingKey.length) {
        cleanMap.delete(existingKey);
      } else if (existingKey.startsWith(lowerKey) && existingKey.length > lowerKey.length) {
        shouldAdd = false;
        break;
      }
    }

    if (shouldAdd) {
      cleanMap.set(lowerKey, {
        value: cleanName,
        name: cleanName,
        type: typeof item.obj === 'object' && item.obj.type ? item.obj.type : 'organization',
        source_page: typeof item.obj === 'object' && item.obj.source_page ? item.obj.source_page : 1,
        confidence: typeof item.obj === 'object' && item.obj.confidence ? item.obj.confidence : 0.98
      });
    }
  }

  return Array.from(cleanMap.values());
}

module.exports = {
  FORBIDDEN_VERBS_AND_PHRASES,
  sanitizeContractingParty,
  sanitizePartiesList
};

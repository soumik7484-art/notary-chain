/**
 * Utility for local storage management of Scanned Document History & Verification Records
 */

export const getUserHistoryKey = (user) => {
  const userId = user?._id || user?.id || user?.email || 'guest';
  return `documentHistory_${userId}`;
};

export const getDocumentHistory = (user) => {
  try {
    const key = getUserHistoryKey(user);
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
    // Check fallback legacy key
    const legacyKey = `notary_docs_${user?._id || user?.id || user?.email || 'guest'}`;
    const legacyStored = localStorage.getItem(legacyKey);
    return legacyStored ? JSON.parse(legacyStored) : [];
  } catch (err) {
    console.warn('Failed to load local document history:', err);
    return [];
  }
};

export const saveDocumentHistory = (user, uploadResult, formTitle = '', formCategory = 'contract') => {
  if (!uploadResult) return [];

  try {
    const key = getUserHistoryKey(user);
    const legacyKey = `notary_docs_${user?._id || user?.id || user?.email || 'guest'}`;
    const existingHistory = getDocumentHistory(user);

    const doc = uploadResult.document || {};
    const bundle = uploadResult.bundle_result || null;
    const isBundle = bundle?.document_mode === 'BUNDLE' && Array.isArray(bundle?.documents) && bundle.documents.length > 1;
    const ai = isBundle ? (bundle.documents[0]?.analysis || uploadResult.aiAnalysis || {}) : (uploadResult.aiAnalysis || {});

    const docTitle = doc.title || formTitle || doc.originalFileName || (isBundle ? bundle.bundle_title : 'Untitled Document');
    const categoryName = doc.category || formCategory || (isBundle ? 'Multi-Document Bundle' : 'Contract & Agreement');
    const docHash = doc.hash || bundle?.bundle_sha256 || null;

    // Trust Score resolution
    let trustScore = null;
    if (typeof ai.trust_score === 'number') {
      trustScore = ai.trust_score;
    } else if (typeof ai.trustScore === 'number') {
      trustScore = ai.trustScore;
    } else if (isBundle && bundle.documents?.[0]?.analysis?.trust_score !== undefined) {
      trustScore = bundle.documents[0].analysis.trust_score;
    }

    // Risk level resolution
    const rawRisk = isBundle 
      ? (bundle.highest_risk || 'LOW') 
      : (ai.risk_level || 'LOW');
    const riskLevel = (rawRisk === 'NOT_APPLICABLE' || !rawRisk) ? 'LOW' : rawRisk.toUpperCase();

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ' • ' + now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const newItem = {
      id: docHash || `hist_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      title: docTitle,
      category: categoryName,
      scannedAt: formattedDate,
      timestamp: now.toISOString(),
      trustScore: typeof trustScore === 'number' ? trustScore : (riskLevel === 'HIGH' ? 30 : (riskLevel === 'MEDIUM' ? 80 : 98)),
      riskLevel: riskLevel,
      status: 'Analyzed & Verified',
      hash: docHash,
      isBundle: !!isBundle,
      totalDocuments: isBundle ? bundle.total_documents : 1,
      totalPages: isBundle ? bundle.total_pages : (uploadResult.document_content?.pages?.length || 1),
      bundleResult: bundle,
      aiAnalysis: ai,
      documents: isBundle ? bundle.documents : null,
      contractingParties: ai.contracting_parties || ai.parties || [],
      signatories: ai.signatories || [],
      dates: ai.dates || [],
      monetaryValues: ai.monetary_values || [],
      riskFactors: ai.risk_factors || ai.risk_flags || [],
      contradictions: ai.contradictions || [],
      summary: ai.clauses?.[0]?.summary || ai.summary || doc.description || (isBundle ? `Multi-document bundle containing ${bundle.total_documents} verified instruments.` : 'AI document analysis completed successfully.'),
      technicalMetadata: uploadResult.technical_metadata || null,
      aiError: uploadResult.aiError || null
    };

    // Deduplicate by SHA-256 hash or title
    const filtered = existingHistory.filter(item => {
      if (docHash && item.hash) {
        return item.hash !== docHash;
      }
      return item.title !== docTitle;
    });

    const updated = [newItem, ...filtered].slice(0, 50);
    localStorage.setItem(key, JSON.stringify(updated));
    localStorage.setItem(legacyKey, JSON.stringify(updated));
    
    // Dispatch storage event so other components immediately update
    window.dispatchEvent(new Event('storage'));

    return updated;
  } catch (err) {
    console.warn('Failed to save document history to localStorage:', err);
    return [];
  }
};

export const removeDocumentHistoryItem = (user, itemId) => {
  try {
    const key = getUserHistoryKey(user);
    const legacyKey = `notary_docs_${user?._id || user?.id || user?.email || 'guest'}`;
    const existingHistory = getDocumentHistory(user);
    const updated = existingHistory.filter(item => item.id !== itemId);
    localStorage.setItem(key, JSON.stringify(updated));
    localStorage.setItem(legacyKey, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    return updated;
  } catch (err) {
    console.warn('Failed to remove history item:', err);
    return [];
  }
};

export const clearDocumentHistory = (user) => {
  try {
    const key = getUserHistoryKey(user);
    const legacyKey = `notary_docs_${user?._id || user?.id || user?.email || 'guest'}`;
    localStorage.removeItem(key);
    localStorage.removeItem(legacyKey);
    window.dispatchEvent(new Event('storage'));
    return [];
  } catch (err) {
    console.warn('Failed to clear history:', err);
    return [];
  }
};

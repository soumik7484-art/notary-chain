/**
 * Utility for local storage management of Scanned Document History
 */

export const getUserHistoryKey = (user) => {
  const userId = user?._id || user?.id || user?.email || 'guest';
  return `documentHistory_${userId}`;
};

export const getDocumentHistory = (user) => {
  try {
    const key = getUserHistoryKey(user);
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.warn('Failed to load local document history:', err);
    return [];
  }
};

export const saveDocumentHistory = (user, uploadResult, formTitle = '', formCategory = 'contract') => {
  if (!uploadResult) return [];

  try {
    const key = getUserHistoryKey(user);
    const existingHistory = getDocumentHistory(user);

    const doc = uploadResult.document || {};
    const ai = uploadResult.aiAnalysis || {};

    const docTitle = doc.title || formTitle || doc.originalFileName || 'Untitled Document';
    const categoryName = doc.category || formCategory || 'Contract & Agreement';
    const docHash = doc.hash || null;
    const trustScore = typeof ai.trustScore === 'number' ? ai.trustScore : null;
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
      trustScore,
      status: 'Analyzed',
      hash: docHash,
      summary: ai.summary || doc.description || 'AI document analysis completed successfully.',
      keyTerms: ai.keyTerms || [],
      riskFlags: ai.riskFlags || [],
      documentType: ai.documentType || 'Legal Document',
      aiError: uploadResult.aiError || null
    };

    // Deduplicate by SHA-256 hash or title + category
    const filtered = existingHistory.filter(item => {
      if (docHash && item.hash) {
        return item.hash !== docHash;
      }
      return !(item.title === docTitle && item.category === categoryName);
    });

    const updated = [newItem, ...filtered];
    localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to save document history to localStorage:', err);
    return [];
  }
};

export const removeDocumentHistoryItem = (user, itemId) => {
  try {
    const key = getUserHistoryKey(user);
    const existingHistory = getDocumentHistory(user);
    const updated = existingHistory.filter(item => item.id !== itemId);
    localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to remove history item:', err);
    return [];
  }
};

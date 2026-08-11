import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Clock,
  ShieldCheck,
  Trash2,
  Sparkles,
  AlertTriangle,
  X,
  Info,
  CheckCircle2,
  Layers,
  Search
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getDocumentHistory, removeDocumentHistoryItem } from '../../utils/documentHistory';
import toast from 'react-hot-toast';

const SEV = {
  high:   { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',    dot: 'bg-red-400'    },
  medium: { bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700',  dot: 'bg-amber-400'  },
  low:    { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', dot: 'bg-yellow-400' },
  info:   { bg: 'bg-emerald-50',border: 'border-emerald-200',text: 'text-emerald-700',dot: 'bg-emerald-400'},
};

const DocumentHistory = () => {
  const { user } = useAuth();
  const [historyItems, setHistoryItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadHistory = () => {
    const data = getDocumentHistory(user);
    setHistoryItems(data);
  };

  useEffect(() => {
    loadHistory();

    // Listen for storage events (if user uploads in another tab)
    const handleStorage = () => loadHistory();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [user]);

  const handleDelete = (e, item) => {
    e.stopPropagation();
    const updated = removeDocumentHistoryItem(user, item.id);
    setHistoryItems(updated);
    if (selectedItem?.id === item.id) setSelectedItem(null);
    toast.success(`Removed "${item.title}" from history`);
  };

  const filteredItems = historyItems.filter(item =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full space-y-4">
      {/* Search & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7B746E]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search scanned history..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#E8E2DA] text-[#2E2A26] placeholder-[#7B746E] rounded-xl text-xs focus:outline-none focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/15 transition-all shadow-xs"
          />
        </div>
        <div className="text-xs text-[#7B746E] font-medium flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#2D6A4F]" />
          <span>{historyItems.length} Scanned Record{historyItems.length === 1 ? '' : 's'} Stored Locally</span>
        </div>
      </div>

      {/* History List or Empty State */}
      {filteredItems.length === 0 ? (
        <div className="bg-white border border-[#E8E2DA] rounded-2xl p-10 text-center shadow-card">
          <div className="w-12 h-12 mx-auto bg-[#F0FAF5] border border-[#B3E4CC] rounded-2xl flex items-center justify-center mb-3 text-[#2D6A4F]">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#2E2A26]">No documents scanned yet.</h3>
          <p className="text-xs text-[#7B746E] mt-1 max-w-sm mx-auto">
            Upload and analyze a document with NotaryChain AI to store your local analysis history here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredItems.map((item, index) => {
              const score = item.trustScore ?? 90;
              const isHighTrust = score >= 85;
              const isMedTrust = score >= 60;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.04 }}
                  onClick={() => setSelectedItem(item)}
                  className="bg-white border border-[#E8E2DA] hover:border-[#2D6A4F] rounded-2xl p-4 shadow-card hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="space-y-3">
                    {/* Top Row: Category & Status */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#55504B] bg-[#F6F3EE] px-2.5 py-1 rounded-lg border border-[#E8E2DA]">
                        <Layers className="w-3 h-3 text-[#2D6A4F]" />
                        {item.category || 'Contract & Agreement'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2D6A4F] bg-[#F0FAF5] px-2 py-0.5 rounded-full border border-[#B3E4CC]">
                          <CheckCircle2 className="w-3 h-3" />
                          {item.status || 'Analyzed'}
                        </span>
                        <button
                          onClick={(e) => handleDelete(e, item)}
                          title="Remove from history"
                          className="p-1 text-[#9B9490] hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Document Title */}
                    <div>
                      <h4 className="font-display font-bold text-sm text-[#2E2A26] group-hover:text-[#2D6A4F] transition-colors line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-[#7B746E] mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#9B9490]" />
                        <span>Scanned {item.scannedAt}</span>
                      </p>
                    </div>

                    {/* Summary Snippet if available */}
                    {item.summary && (
                      <p className="text-xs text-[#55504B] line-clamp-2 leading-relaxed bg-[#FFFDF9] p-2.5 rounded-xl border border-[#E8E2DA]/60">
                        {item.summary}
                      </p>
                    )}
                  </div>

                  {/* Footer Row: Trust Score */}
                  <div className="mt-4 pt-3 border-t border-[#E8E2DA]/60 flex items-center justify-between text-xs">
                    <span className="text-[#7B746E] font-medium">Trust Score:</span>
                    <span className={`font-bold px-2 py-0.5 rounded-full border text-[11px] ${
                      isHighTrust ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      isMedTrust  ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                    'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {score}/100
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Detail Modal for Selected History Item */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2E2A26]/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-2xl bg-white border border-[#E8E2DA] rounded-2xl shadow-card-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-[#E8E2DA] flex justify-between items-center bg-[#F6F3EE] shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#2D6A4F] text-white flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-[#2E2A26]">{selectedItem.title}</h3>
                    <p className="text-[10px] text-[#7B746E]">
                      Saved Analysis · Scanned {selectedItem.scannedAt}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-1.5 text-[#7B746E] hover:text-[#2E2A26] hover:bg-[#E8E2DA]/50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-5 flex-1">
                {/* Meta Banner */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[#F0FAF5] border border-[#B3E4CC] rounded-xl text-xs">
                  <div>
                    <span className="text-[#52796F] font-semibold">Category: </span>
                    <span className="text-[#2D6A4F] font-bold">{selectedItem.category}</span>
                  </div>
                  <div className={`px-2.5 py-0.5 rounded-full border font-bold ${
                    (selectedItem.trustScore ?? 90) >= 85 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    (selectedItem.trustScore ?? 90) >= 60 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                            'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    Trust Score: {selectedItem.trustScore ?? 90}/100
                  </div>
                  {selectedItem.hash && (
                    <div className="w-full pt-1 border-t border-[#B3E4CC]/50 text-[10px] font-mono text-[#52796F]">
                      SHA-256: {selectedItem.hash}
                    </div>
                  )}
                </div>

                {/* Summary */}
                {selectedItem.summary && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-bold text-[#2E2A26] uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#2D6A4F]" /> Executive Summary
                    </p>
                    <p className="text-xs text-[#55504B] leading-relaxed bg-[#FFFDF9] p-3.5 rounded-xl border border-[#E8E2DA]">
                      {selectedItem.summary}
                    </p>
                  </div>
                )}

                {/* Key Terms */}
                {selectedItem.keyTerms && selectedItem.keyTerms.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-[#2E2A26] uppercase tracking-wider flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-[#2D6A4F]" /> Extracted Key Terms
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedItem.keyTerms.map((term, i) => (
                        <div key={i} className="p-2.5 bg-[#F6F3EE] rounded-xl border border-[#E8E2DA] text-xs">
                          <span className="font-bold text-[#2E2A26] block">{term.term || term}</span>
                          {term.definition && <span className="text-[#7B746E] text-[11px] mt-0.5 block">{term.definition}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Risk Flags */}
                {selectedItem.riskFlags && selectedItem.riskFlags.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-[#2E2A26] uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Detected Risk Flags
                    </p>
                    <div className="space-y-2">
                      {selectedItem.riskFlags.map((flag, i) => {
                        const s = SEV[flag.severity] || SEV.info;
                        return (
                          <div key={i} className={`p-3 rounded-xl border ${s.bg} ${s.border}`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-xs font-bold ${s.text}`}>{flag.title || flag.flag || 'Risk Item'}</span>
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${s.bg} ${s.text} border ${s.border}`}>
                                {flag.severity || 'info'}
                              </span>
                            </div>
                            <p className="text-xs text-[#55504B]">{flag.description || flag.detail}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-[#E8E2DA] bg-[#F6F3EE] flex justify-end shrink-0">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 bg-[#2D6A4F] text-white rounded-xl text-xs font-semibold hover:bg-[#245741] transition-colors"
                >
                  Close Saved Analysis
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocumentHistory;

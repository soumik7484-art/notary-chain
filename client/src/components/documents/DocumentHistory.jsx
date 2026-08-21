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
  Search,
  Building,
  User,
  Calendar,
  DollarSign,
  ShieldAlert,
  ArrowRight,
  FileCode,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getDocumentHistory, removeDocumentHistoryItem, clearDocumentHistory } from '../../utils/documentHistory';
import RiskMeter from './RiskMeter';
import toast from 'react-hot-toast';

const SEV = {
  high:   { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',    dot: 'bg-red-500' },
  medium: { bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700',  dot: 'bg-amber-500' },
  low:    { bg: 'bg-emerald-50',border: 'border-emerald-200',text: 'text-emerald-700',dot: 'bg-emerald-500'},
  info:   { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700',   dot: 'bg-blue-500' },
};

const DocumentHistory = () => {
  const { user } = useAuth();
  const [historyItems, setHistoryItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeSubDocIndex, setActiveSubDocIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTechnicalMeta, setShowTechnicalMeta] = useState(false);

  const loadHistory = () => {
    const data = getDocumentHistory(user);
    setHistoryItems(data);
  };

  useEffect(() => {
    loadHistory();

    // Listen for storage events (e.g. upload completed)
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

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all scanned document history?')) {
      clearDocumentHistory(user);
      setHistoryItems([]);
      setSelectedItem(null);
      toast.success('Document history cleared');
    }
  };

  const filteredItems = historyItems.filter(item =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.hash && item.hash.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="w-full space-y-4">
      {/* Search & Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7B746E]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, category, or SHA-256..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#E8E2DA] text-[#2E2A26] placeholder-[#7B746E] rounded-xl text-xs focus:outline-none focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/15 transition-all shadow-xs"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-xs text-[#7B746E] font-medium flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#2D6A4F]" />
            <span>{historyItems.length} Verification Record{historyItems.length === 1 ? '' : 's'}</span>
          </div>

          {historyItems.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs text-[#7B746E] hover:text-red-600 transition-colors font-medium cursor-pointer"
            >
              Clear History
            </button>
          )}
        </div>
      </div>

      {/* History List or Empty State */}
      {filteredItems.length === 0 ? (
        <div className="bg-white border border-[#E8E2DA] rounded-2xl p-10 text-center shadow-card">
          <div className="w-12 h-12 mx-auto bg-[#F0FAF5] border border-[#B3E4CC] rounded-2xl flex items-center justify-center mb-3 text-[#2D6A4F]">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#2E2A26]">No documents in verification history.</h3>
          <p className="text-xs text-[#7B746E] mt-1 max-w-sm mx-auto">
            Upload and analyze a contract, bundle, or ID document to store cryptographic verification audits here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredItems.map((item, index) => {
              const score = item.trustScore ?? 95;
              const isHighTrust = score >= 80;
              const isMedTrust = score >= 50;
              const isBundle = item.isBundle || item.documents?.length > 1;

              return (
                <motion.div
                  key={item.id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => {
                    setSelectedItem(item);
                    setActiveSubDocIndex(0);
                    setShowTechnicalMeta(false);
                  }}
                  className="bg-white border border-[#E8E2DA] hover:border-[#2D6A4F] rounded-2xl p-4.5 shadow-card hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="space-y-3">
                    {/* Top Row: Category & Status */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#55504B] bg-[#F6F3EE] px-2.5 py-1 rounded-lg border border-[#E8E2DA]">
                        <Layers className="w-3 h-3 text-[#2D6A4F]" />
                        {isBundle ? `Bundle (${item.totalDocuments || item.documents?.length} Docs)` : (item.category || 'Contract')}
                      </span>
                      
                      <div className="flex items-center gap-1.5">
                        <RiskMeter
                          size="compact"
                          trustScore={score}
                          riskLevel={item.riskLevel || 'LOW'}
                        />
                        
                        <button
                          onClick={(e) => handleDelete(e, item)}
                          title="Remove from history"
                          className="p-1 text-[#9B9490] hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
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
                        <span>{item.scannedAt}</span>
                      </p>
                    </div>

                    {/* Canonical Hash pill */}
                    {item.hash && (
                      <div className="bg-[#F6F3EE] px-2.5 py-1 rounded-lg border border-[#E8E2DA]/60 flex items-center justify-between text-[10px] font-mono text-[#7B746E]">
                        <span>SHA-256:</span>
                        <span className="text-[#2E2A26] font-semibold">{item.hash.substring(0, 14)}…</span>
                      </div>
                    )}

                    {/* Summary / Clauses preview */}
                    {item.summary && (
                      <p className="text-xs text-[#55504B] line-clamp-2 leading-relaxed bg-[#FFFDF9] p-2.5 rounded-xl border border-[#E8E2DA]/60">
                        {item.summary}
                      </p>
                    )}

                    {/* Contracting parties tags */}
                    {item.contractingParties?.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {item.contractingParties.slice(0, 2).map((p, i) => (
                          <span key={i} className="text-[10px] bg-white border border-[#E8E2DA] text-[#2E2A26] px-2 py-0.5 rounded-md font-medium truncate max-w-[140px]">
                            🏢 {p.value || p}
                          </span>
                        ))}
                        {item.contractingParties.length > 2 && (
                          <span className="text-[10px] text-[#7B746E] px-1 py-0.5">
                            +{item.contractingParties.length - 2} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer Row: Trust Score */}
                  <div className="mt-4 pt-3 border-t border-[#E8E2DA]/60 flex items-center justify-between text-xs">
                    <span className="text-[#7B746E] font-medium">Trust Score:</span>
                    <span className={`font-bold px-2.5 py-0.5 rounded-full border text-[11px] font-mono ${
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
        {selectedItem && (() => {
          const isBundle = selectedItem.isBundle || selectedItem.documents?.length > 1;
          const subDocs = isBundle ? (selectedItem.documents || selectedItem.bundleResult?.documents || []) : [];
          const currentDoc = isBundle && subDocs[activeSubDocIndex] ? subDocs[activeSubDocIndex] : null;
          const ai = isBundle ? (currentDoc?.analysis || currentDoc) : (selectedItem.aiAnalysis || selectedItem);
          const tech = selectedItem.technicalMetadata || selectedItem.bundleResult?.technical_metadata;
          const score = typeof ai?.trust_score === 'number' ? ai.trust_score : (typeof selectedItem.trustScore === 'number' ? selectedItem.trustScore : 95);

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2E2A26]/40 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="w-full max-w-3xl bg-white border border-[#E8E2DA] rounded-2xl shadow-card-lg overflow-hidden flex flex-col max-h-[92vh]"
              >
                {/* Modal Header */}
                <div className="p-5 border-b border-[#E8E2DA] flex justify-between items-center bg-[#F6F3EE] shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#2D6A4F] text-white flex items-center justify-center">
                      {isBundle ? <Layers className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                    </div>
                    <div>
                      <h3 className="font-display text-base font-bold text-[#2E2A26]">{selectedItem.title}</h3>
                      <p className="text-[10px] text-[#7B746E]">
                        Cryptographic Verification Audit · Scanned {selectedItem.scannedAt}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="p-1.5 text-[#7B746E] hover:text-[#2E2A26] hover:bg-[#E8E2DA]/50 rounded-lg transition-colors cursor-pointer"
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

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase ${
                        (ai?.risk_level || selectedItem.riskLevel || 'LOW') === 'HIGH' ? 'bg-red-100 text-red-800 border-red-300' :
                        (ai?.risk_level || selectedItem.riskLevel || 'LOW') === 'MEDIUM' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                        'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}>
                        {ai?.risk_level || selectedItem.riskLevel || 'LOW'} RISK
                      </span>

                      <div className={`px-2.5 py-0.5 rounded-full border font-bold font-mono ${
                        score >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        score >= 50 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                      'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        Trust Score: {score}/100
                      </div>
                    </div>

                    {selectedItem.hash && (
                      <div className="w-full pt-2 mt-1 border-t border-[#B3E4CC]/50 text-[10px] font-mono text-[#52796F] flex items-center justify-between">
                        <span>Canonical SHA-256 Hash:</span>
                        <span className="text-[#2D6A4F] font-bold select-all">{selectedItem.hash}</span>
                      </div>
                    )}
                  </div>

                  {/* Prominent Risk Meter (Out of 10) */}
                  <RiskMeter
                    trustScore={score}
                    riskLevel={ai?.risk_level || selectedItem.riskLevel || 'LOW'}
                    size="card"
                    showSegments={true}
                  />

                  {/* Multi-Document Bundle Switcher */}
                  {isBundle && subDocs.length > 0 && (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-[#2E2A26]">
                        <span>DETECTED INSTRUMENTS IN BUNDLE ({subDocs.length})</span>
                        <span className="text-[10px] text-[#7B746E]">Click to inspect document audit</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {subDocs.map((doc, idx) => {
                          const subScore = doc.analysis?.trust_score ?? 90;
                          const subRisk = doc.analysis?.risk_level || 'LOW';
                          const isSelected = idx === activeSubDocIndex;

                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setActiveSubDocIndex(idx)}
                              className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                                isSelected
                                  ? 'border-[#2D6A4F] bg-[#F0FAF5] ring-2 ring-[#2D6A4F]/20'
                                  : 'border-[#E8E2DA] bg-white hover:border-[#2D6A4F]/40'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="w-5 h-5 rounded bg-[#E8E2DA] text-[#2E2A26] font-mono text-[10px] font-bold flex items-center justify-center">
                                  {String(doc.document_index || idx + 1).padStart(2, '0')}
                                </span>
                                <div>
                                  <p className="text-xs font-bold text-[#2E2A26] line-clamp-1">{doc.title}</p>
                                  <p className="text-[9px] text-[#7B746E]">{doc.category || 'Instrument'}</p>
                                </div>
                              </div>

                              <RiskMeter
                                size="compact"
                                trustScore={subScore}
                                riskLevel={subRisk}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Document Title / Clause Summary */}
                  <div className="p-4 bg-[#F6F3EE] rounded-xl border border-[#E8E2DA] space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#7B746E] uppercase tracking-wider">
                      <span>{currentDoc ? currentDoc.title : selectedItem.title}</span>
                      <span>Category: {currentDoc ? currentDoc.category : selectedItem.category}</span>
                    </div>
                    {(ai?.clauses?.[0]?.summary || selectedItem.summary) && (
                      <p className="text-xs text-[#2E2A26] leading-relaxed">
                        {ai?.clauses?.[0]?.summary || selectedItem.summary}
                      </p>
                    )}
                  </div>

                  {/* Contracting Parties */}
                  {(ai?.contracting_parties?.length > 0 || selectedItem.contractingParties?.length > 0) && (
                    <div>
                      <p className="text-[11px] font-bold text-[#7B746E] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5" /> Contracting Parties
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(ai?.contracting_parties || selectedItem.contractingParties).map((party, i) => (
                          <div key={i} className="flex items-center justify-between py-2 px-3 bg-white border border-[#E8E2DA] rounded-lg text-xs">
                            <span className="font-semibold text-[#2E2A26]">{party.value || party}</span>
                            <span className="text-[10px] text-[#7B746E] uppercase font-mono">{party.type || 'ORG'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Signatories & Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(ai?.signatories?.length > 0 || selectedItem.signatories?.length > 0) && (
                      <div>
                        <p className="text-[11px] font-bold text-[#7B746E] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" /> Signatories
                        </p>
                        <div className="space-y-1.5">
                          {(ai?.signatories || selectedItem.signatories).map((sig, i) => (
                            <div key={i} className="py-2 px-3 bg-white border border-[#E8E2DA] rounded-lg text-xs">
                              <p className="font-semibold text-[#2E2A26]">{sig.value || sig}</p>
                              <p className="text-[10px] text-[#7B746E]">{sig.role || 'Authorized Signatory'}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(ai?.dates?.length > 0 || selectedItem.dates?.length > 0) && (
                      <div>
                        <p className="text-[11px] font-bold text-[#7B746E] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" /> Critical Dates
                        </p>
                        <div className="space-y-1.5">
                          {(ai?.dates || selectedItem.dates).map((d, i) => (
                            <div key={i} className="flex items-center justify-between py-2 px-3 bg-white border border-[#E8E2DA] rounded-lg text-xs">
                              <span className="text-[10px] text-[#7B746E] uppercase">{d.label || d.type?.replace(/_/g, ' ') || 'Date'}</span>
                              <span className="font-semibold text-[#2E2A26]">{d.value || d}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Risk Factors / Contradictions */}
                  {((ai?.risk_factors?.length > 0 || selectedItem.riskFactors?.length > 0) || (ai?.contradictions?.length > 0 || selectedItem.contradictions?.length > 0)) && (
                    <div>
                      <p className="text-[11px] font-bold text-[#7B746E] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> Risk Audit Findings
                      </p>
                      <div className="space-y-2">
                        {(ai?.risk_factors || selectedItem.riskFactors || []).map((rf, i) => (
                          <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl border bg-amber-50 border-amber-200 text-xs">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold uppercase tracking-wider text-amber-700 text-[10px]">{rf.code || 'RISK'}</span>
                                {rf.impact && <span className="font-mono text-amber-800 font-bold text-[10px]">{rf.impact} pts</span>}
                              </div>
                              <p className="text-[#2E2A26] mt-0.5">{rf.explanation || rf.flag || rf}</p>
                            </div>
                          </div>
                        ))}
                        {(ai?.contradictions || selectedItem.contradictions || []).map((c, i) => (
                          <div key={`c-${i}`} className="flex items-start gap-2.5 p-3 rounded-xl border bg-red-50 border-red-200 text-xs">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                            <div className="flex-1">
                              <span className="font-bold uppercase tracking-wider text-red-700 text-[10px]">CONTRADICTION</span>
                              <p className="text-[#2E2A26] mt-0.5">{typeof c === 'string' ? c : c.explanation}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Technical Metadata Isolation */}
                  {tech && (
                    <div className="border border-[#E8E2DA] rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setShowTechnicalMeta(!showTechnicalMeta)}
                        className="w-full px-4 py-3 bg-[#F6F3EE] flex items-center justify-between text-xs font-semibold text-[#7B746E] hover:text-[#2E2A26] cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <FileCode className="w-4 h-4 text-[#7B746E]" />
                          <span>Technical Metadata & Provenance (Isolated)</span>
                        </div>
                        {showTechnicalMeta ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      {showTechnicalMeta && (
                        <div className="p-4 bg-[#FFFDF9] space-y-2 text-xs border-t border-[#E8E2DA]">
                          <div className="grid grid-cols-2 gap-2 text-[#7B746E]">
                            <div>PDF Producer: <span className="text-[#2E2A26] font-mono">{tech.pdf_producer || 'N/A'}</span></div>
                            <div>PDF Creator: <span className="text-[#2E2A26] font-mono">{tech.pdf_creator || 'N/A'}</span></div>
                            <div>C2PA Status: <span className="text-[#2E2A26] font-mono">{tech.c2pa?.detected ? 'Manifest Detected' : 'None'}</span></div>
                            <div>Certificate Authority: <span className="text-[#2E2A26] font-mono">{tech.certificates?.issuer || 'None'}</span></div>
                          </div>
                          <p className="text-[10px] text-[#7B746E] pt-1 border-t border-[#E8E2DA]/50">
                            ℹ️ Technical provenance metadata is strictly separated and not interpreted as legal contracting parties or signatories.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-[#E8E2DA] bg-[#F6F3EE] flex justify-end shrink-0">
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="px-4 py-2 bg-[#2D6A4F] text-white rounded-xl text-xs font-semibold hover:bg-[#245741] transition-colors cursor-pointer"
                  >
                    Close Verification Audit
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
};

export default DocumentHistory;


import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud, FileText, X, AlertTriangle, CheckCircle2,
  RefreshCw, Sparkles, ChevronDown, ChevronUp, ShieldCheck,
  Building, User, Calendar, FileCode, Layers, ArrowRight, ShieldAlert
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import { formatFileSize } from '../../utils/formatters';
import Button from '../common/Button';
import { saveDocumentHistory } from '../../utils/documentHistory';
import RiskMeter from './RiskMeter';

const SEV = {
  high:   { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',    dot: 'bg-red-500' },
  medium: { bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700',  dot: 'bg-amber-500' },
  low:    { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700',   dot: 'bg-blue-500' },
  info:   { bg: 'bg-emerald-50',border: 'border-emerald-200',text: 'text-emerald-700',dot: 'bg-emerald-500' },
};

const DocumentUpload = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();

  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('contract');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeDocIndex, setActiveDocIndex] = useState(0);
  const [showTechnicalMeta, setShowTechnicalMeta] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles?.length) {
      setFile(acceptedFiles[0]);
      if (!title) {
        setTitle(acceptedFiles[0].name.replace(/\.[^/.]+$/, ''));
      }
    }
  }, [title]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      'application/pdf':            ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword':         ['.doc'],
      'text/plain':                 ['.txt'],
      'image/jpeg':                 ['.jpg', '.jpeg'],
      'image/png':                  ['.png'],
    }
  });

  const handleUpload = async () => {
    if (!file) return toast.error('Please select a file first');

    setUploading(true);
    const toastId = toast.loading('Uploading & analyzing document…');

    try {
      const formData = new FormData();
      formData.append('file',        file);
      formData.append('title',       title || file.name);
      formData.append('category',    category);

      // Client-side text read for all document types (plain text, markdown, and pure PDF streams)
      try {
        const clientRaw = await file.text();
        if (clientRaw && clientRaw.trim()) {
          if (file.type?.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
            formData.append('extractedText', clientRaw.trim().substring(0, 50000));
          } else if (file.name.endsWith('.pdf') || file.type === 'application/pdf') {
            // Extract text chunks from PDF streams directly in the browser
            const chunks = [];
            const tjLit = /\(([^)\\]*(?:\\.[^)\\]*)*)\)\s*Tj/g;
            let m;
            while ((m = tjLit.exec(clientRaw)) !== null) {
              const cleaned = m[1].replace(/\\([()\\])/g, '$1').trim();
              if (cleaned.length > 0 && !/^[\x00-\x1F]+$/.test(cleaned)) chunks.push(cleaned);
            }
            if (chunks.length > 0) {
              formData.append('extractedText', chunks.join('\n').substring(0, 50000));
            }
          }
        }
      } catch {}

      const res = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000
      });

      const data = res.data?.data || res.data;
      setResult(data);
      setActiveDocIndex(0);

      saveDocumentHistory(user, data, title, category);

      if (data.bundle_result?.document_mode === 'BUNDLE') {
        toast.success(`Bundle detected: ${data.bundle_result.total_documents} documents analyzed!`, { id: toastId });
      } else if (data.aiAnalysis) {
        toast.success('Document uploaded & AI analysis complete!', { id: toastId });
      } else {
        toast.success('Document uploaded!', { id: toastId });
        if (data.aiError) toast.error(`AI: ${data.aiError}`, { duration: 5000 });
      }

      if (typeof onSuccess === 'function') onSuccess(data.document);
    } catch (err) {
      toast.dismiss(toastId);
      const msg = err.response?.data?.message || 'Upload failed. Please try again.';
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setTitle('');
    setCategory('contract');
    setResult(null);
    setActiveDocIndex(0);
    setShowTechnicalMeta(false);
    onClose();
  };

  if (!isOpen) return null;

  const bundle = result?.bundle_result || result?.bundleResult || result?.data?.bundle_result || result?.data?.bundleResult;
  const isBundle = Boolean(bundle?.document_mode === 'BUNDLE' && Array.isArray(bundle?.documents) && bundle.documents.length > 1);

  // Active document for detailed view
  const currentDocObj = isBundle ? bundle.documents[activeDocIndex] : null;
  const ai = isBundle ? (currentDocObj?.analysis || currentDocObj) : (result?.aiAnalysis || result?.data?.aiAnalysis || result?.ai_analysis);
  const tech = result?.technical_metadata || result?.technicalMetadata || result?.data?.technical_metadata;

  const trustScoreNum = typeof ai?.trust_score === 'number' 
    ? ai.trust_score 
    : (typeof ai?.trustScore === 'number' ? ai.trustScore : null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2E2A26]/40 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-3xl bg-white border border-[#E8E2DA] rounded-2xl shadow-card-lg overflow-hidden flex flex-col max-h-[94vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#E8E2DA] flex justify-between items-center bg-[#F6F3EE] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2D6A4F] text-white flex items-center justify-center">
              {isBundle ? <Layers className="w-4 h-4" /> : <UploadCloud className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-[#2E2A26]">
                {isBundle ? 'Document Bundle Analysis' : 'Upload Document'}
              </h2>
              <p className="text-[10px] text-[#7B746E]">
                {isBundle ? `Multi-Document Intelligence (${bundle.total_documents} detected)` : 'Cryptographic AI Document Analysis'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-[#7B746E] hover:text-[#2E2A26] hover:bg-[#E8E2DA]/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          <AnimatePresence mode="wait">

            {/* ── UPLOAD FORM (before result) ───────────────── */}
            {!result && (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6 space-y-5"
              >
                {/* Drop zone */}
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                    isDragActive
                      ? 'border-[#2D6A4F] bg-[#F0FAF5]'
                      : 'border-[#E8E2DA] bg-[#FFFDF9] hover:border-[#2D6A4F] hover:bg-[#F0FAF5]/50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="w-14 h-14 mx-auto bg-[#F0FAF5] border border-[#B3E4CC] rounded-2xl flex items-center justify-center mb-3 text-[#2D6A4F]">
                    <FileText className="w-7 h-7" />
                  </div>
                  {file ? (
                    <div>
                      <p className="text-[#2E2A26] font-bold text-sm">{file.name}</p>
                      <p className="text-[#7B746E] text-xs mt-0.5">{formatFileSize(file.size)}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[#2E2A26] font-semibold text-sm">Drag & drop your document or bundle here</p>
                      <p className="text-[#7B746E] text-xs mt-1">Supports multi-document PDF test suites, single contracts, DOCX, TXT up to 50MB</p>
                    </div>
                  )}
                </div>

                {/* Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#2E2A26] mb-1.5 uppercase tracking-wider">
                      Document / Bundle Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. NotaryChain AI Verification Test Suite"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white text-[#2E2A26] border border-[#E8E2DA] focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/15 outline-none text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#2E2A26] mb-1.5 uppercase tracking-wider">
                      Expected Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white text-[#2E2A26] border border-[#E8E2DA] focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/15 outline-none text-sm transition-all"
                    >
                      <option value="contract">Contract & Agreement</option>
                      <option value="bundle">Multi-Document Test Suite / Bundle</option>
                      <option value="identity">Identity Document</option>
                      <option value="financial">Financial Record</option>
                      <option value="amendment">Contract Amendment</option>
                      <option value="other">General / Technical Specification</option>
                    </select>
                  </div>
                </div>

                {/* Feature notice */}
                <div className="flex items-start gap-3 p-3.5 bg-[#F0FAF5] border border-[#B3E4CC] rounded-xl">
                  <Sparkles className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#2D6A4F] leading-relaxed">
                    <strong>NotaryChain AI Engine</strong> automatically detects multi-document bundles, extracts visible page text, isolates PDF metadata, and calculates deterministic risk audits per document.
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── RESULT VIEW (after upload) ────────────────── */}
            {result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 space-y-5"
              >
                {/* Upload success banner */}
                <div className="flex items-center gap-3 p-4 bg-[#F0FAF5] border border-[#B3E4CC] rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-[#2D6A4F] shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-[#2D6A4F]">
                      {isBundle ? `Document Bundle Detected (${bundle.total_documents} Documents)` : 'Document uploaded successfully'}
                    </p>
                    <p className="text-xs text-[#52796F]">{result.document?.originalFileName || file?.name}</p>
                  </div>
                  {result.document?.hash && (
                    <div className="ml-auto text-right">
                      <p className="text-[10px] text-[#7B746E] font-mono">Canonical Bundle SHA-256</p>
                      <p className="text-[10px] font-mono text-[#2E2A26]">{result.document.hash.substring(0, 16)}…</p>
                    </div>
                  )}
                </div>

                {/* ── MULTI-DOCUMENT BUNDLE SELECTOR CARDS ── */}
                {isBundle && (
                  <div className="space-y-3">
                    {/* Bundle Summary Banner */}
                    <div className="p-3.5 bg-[#F6F3EE] rounded-xl border border-[#E8E2DA] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-[#2E2A26]">BUNDLE SUMMARY</span>
                        <span className="text-xs text-[#7B746E]">
                          <strong>{bundle.total_documents}</strong> documents • <strong>{bundle.total_pages}</strong> total pages
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          bundle.highest_risk === 'HIGH' ? 'bg-red-100 text-red-800' :
                          bundle.highest_risk === 'MEDIUM' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          HIGHEST RISK: {bundle.highest_risk}
                        </span>
                        <span className="text-[10px] font-bold text-[#7B746E]">
                          ({bundle.documents_requiring_review} need review)
                        </span>
                      </div>
                    </div>

                    {/* Document Cards */}
                    <div className="grid grid-cols-1 gap-2">
                      {bundle.documents.map((docItem, idx) => {
                        const subAi = docItem.analysis;
                        const isSelected = idx === activeDocIndex;
                        const riskLevel = subAi?.risk_level || 'LOW';

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveDocIndex(idx)}
                            className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? 'border-[#2D6A4F] bg-[#F0FAF5] ring-2 ring-[#2D6A4F]/20'
                                : 'border-[#E8E2DA] bg-white hover:border-[#2D6A4F]/50 hover:bg-[#F6F3EE]'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-lg bg-[#E8E2DA] text-[#2E2A26] font-mono text-xs font-bold flex items-center justify-center">
                                {String(docItem.document_index).padStart(2, '0')}
                              </span>
                              <div>
                                <p className="text-xs font-bold text-[#2E2A26]">{docItem.title}</p>
                                <p className="text-[10px] text-[#7B746E]">
                                  {docItem.category} • Pages {docItem.pages.join(', ')}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <RiskMeter
                                size="compact"
                                trustScore={subAi?.trust_score}
                                riskLevel={riskLevel}
                              />
                              <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'text-[#2D6A4F] translate-x-0.5' : 'text-[#7B746E]'}`} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── SELECTED DOCUMENT DETAILED ANALYSIS ── */}
                {ai && ai.status !== 'EXTRACTION_INSUFFICIENT' && (
                  <div className="space-y-4 pt-2 border-t border-[#E8E2DA]">
                    {/* Header row */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#2E2A26]">
                          {isBundle ? `Document ${String(currentDocObj.document_index).padStart(2, '0')} Analysis: ${currentDocObj.title}` : 'AI Document Analysis'}
                        </p>
                        <p className="text-[10px] text-[#7B746E]">NotaryChain AI · document content</p>
                      </div>
                      {/* Trust score & Risk badge */}
                      <div className="ml-auto flex items-center gap-2">
                        {ai.legal_applicability === 'NOT_APPLICABLE' && trustScoreNum === null ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                            GENERAL DOCUMENT
                          </span>
                        ) : (
                          <>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              (ai.risk_level || 'LOW') === 'LOW' ? 'bg-emerald-100 text-emerald-800' :
                              (ai.risk_level || 'LOW') === 'MEDIUM' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {ai.risk_level || 'ANALYSIS'} RISK
                            </span>
                            <div className={`px-3 py-1 rounded-full border text-xs font-bold ${
                              typeof trustScoreNum === 'number'
                                ? trustScoreNum >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : trustScoreNum >= 50 ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-gray-50 text-gray-700 border-gray-200'
                            }`}>
                              {typeof trustScoreNum === 'number' ? `Trust ${trustScoreNum}/100` : 'Verified'}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Prominent Risk Meter (Out of 10) */}
                    <RiskMeter
                      trustScore={trustScoreNum}
                      riskLevel={ai.risk_level || 'LOW'}
                      size="card"
                      showSegments={true}
                    />

                    {/* Summary / Clauses */}
                    {ai.document && (
                      <div className="p-4 bg-[#F6F3EE] rounded-xl border border-[#E8E2DA] space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold text-[#7B746E] uppercase tracking-wider">
                          <span>{ai.document.title || title}</span>
                          <span>Category: {ai.document.category || category}</span>
                        </div>
                        {ai.clauses?.length > 0 && (
                          <p className="text-xs text-[#2E2A26] leading-relaxed pt-1">
                            {ai.clauses[0].summary || ai.clauses[0].title}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Contracting Parties */}
                    {ai.contracting_parties?.length > 0 && (
                      <div>
                        <p className="text-[11px] font-bold text-[#7B746E] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5" /> Contracting Parties
                        </p>
                        <div className="grid grid-cols-1 gap-1.5">
                          {ai.contracting_parties.map((party, i) => (
                            <div key={i} className="flex items-center justify-between py-2 px-3 bg-white border border-[#E8E2DA] rounded-lg">
                              <span className="text-xs text-[#2E2A26] font-semibold">{party.value}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-[#7B746E] uppercase">{party.type}</span>
                                {party.source_page && (
                                  <span className="text-[9px] bg-[#F6F3EE] text-[#7B746E] px-1.5 py-0.5 rounded">p. {party.source_page}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Monetary Values (Invoices / Amendments) */}
                    {ai.monetary_values?.length > 0 && (
                      <div>
                        <p className="text-[11px] font-bold text-[#7B746E] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5" /> Financial Terms
                        </p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {ai.monetary_values.map((m, i) => (
                            <div key={i} className="flex items-center justify-between py-2 px-3 bg-white border border-[#E8E2DA] rounded-lg">
                              <span className="text-[10px] text-[#7B746E] uppercase">{m.type || 'Amount'}</span>
                              <span className="text-xs text-[#2E2A26] font-mono font-bold">{m.currency || 'USD'} {m.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Signatories & Critical Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {ai.signatories?.length > 0 && (
                        <div>
                          <p className="text-[11px] font-bold text-[#7B746E] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" /> Signatories
                          </p>
                          <div className="space-y-1.5">
                            {ai.signatories.map((sig, i) => (
                              <div key={i} className="py-2 px-3 bg-white border border-[#E8E2DA] rounded-lg">
                                <p className="text-xs text-[#2E2A26] font-semibold">{sig.value}</p>
                                <p className="text-[10px] text-[#7B746E]">{sig.role || 'Authorized Signatory'}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {ai.dates?.length > 0 && (
                        <div>
                          <p className="text-[11px] font-bold text-[#7B746E] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" /> Critical Dates
                          </p>
                          <div className="space-y-1.5">
                            {ai.dates.map((d, i) => (
                              <div key={i} className="flex items-center justify-between py-2 px-3 bg-white border border-[#E8E2DA] rounded-lg">
                                <span className="text-[10px] text-[#7B746E] font-medium uppercase tracking-tight">{d.label || d.type?.replace(/_/g, ' ')}</span>
                                <span className="text-xs text-[#2E2A26] font-semibold">{d.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Risk Factors / Contradictions */}
                    {(ai.risk_factors?.length > 0 || ai.contradictions?.length > 0 || ai.risk_flags?.length > 0) && (
                      <div>
                        <p className="text-[11px] font-bold text-[#7B746E] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> Risk Audit Findings
                        </p>
                        <div className="space-y-2">
                          {ai.risk_factors?.map((rf, i) => (
                            <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl border bg-amber-50 border-amber-200">
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">{rf.code || 'RISK'}</span>
                                  <span className="text-[10px] font-mono text-amber-800 font-bold">{rf.impact} pts</span>
                                </div>
                                <p className="text-xs text-[#2E2A26] mt-0.5">{rf.explanation}</p>
                              </div>
                            </div>
                          ))}
                          {ai.contradictions?.map((c, i) => (
                            <div key={`c-${i}`} className="flex items-start gap-2.5 p-3 rounded-xl border bg-red-50 border-red-200">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                              <div className="flex-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-red-700">CONTRADICTION</span>
                                <p className="text-xs text-[#2E2A26] mt-0.5">{typeof c === 'string' ? c : c.explanation}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── TECHNICAL METADATA (ISOLATED) ── */}
                {tech && (
                  <div className="border border-[#E8E2DA] rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setShowTechnicalMeta(!showTechnicalMeta)}
                      className="w-full px-4 py-3 bg-[#F6F3EE] flex items-center justify-between text-xs font-semibold text-[#7B746E] hover:text-[#2E2A26]"
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

                {/* Upload another */}
                <button
                  onClick={() => { setFile(null); setTitle(''); setResult(null); }}
                  className="flex items-center gap-2 text-xs text-[#2D6A4F] hover:underline font-semibold"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Upload another document
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E8E2DA] bg-[#F6F3EE] flex justify-end gap-2.5 shrink-0">
          <Button variant="secondary" onClick={handleClose} disabled={uploading}>
            {result ? 'Close' : 'Cancel'}
          </Button>
          {!result && (
            <Button
              variant="primary"
              onClick={handleUpload}
              disabled={uploading || !file}
            >
              {uploading ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Analyzing Document Content…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Upload & Analyse
                </span>
              )}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DocumentUpload;

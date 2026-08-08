import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, X, Sparkles, CheckCircle2, AlertTriangle, Info, RefreshCw, ShieldCheck } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import Button from '../common/Button';
import api from '../../api/axios';

/* ─── Risk severity colours ───────────────────────────────────── */
const SEV = {
  high:   { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',    dot: 'bg-red-400'    },
  medium: { bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700',  dot: 'bg-amber-400'  },
  low:    { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', dot: 'bg-yellow-400' },
  info:   { bg: 'bg-emerald-50',border: 'border-emerald-200',text: 'text-emerald-700',dot: 'bg-emerald-400'},
};

const DocumentUpload = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile]           = useState(null);
  const [title, setTitle]         = useState('');
  const [category, setCategory]   = useState('contract');
  const [uploading, setUploading] = useState(false);
  const [result, setResult]       = useState(null);   // { document, aiAnalysis, aiError }

  const onDrop = (acceptedFiles) => {
    const f = acceptedFiles[0];
    setFile(f);
    setResult(null);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ''));
  };

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
    const toastId = toast.loading('Uploading & analysing with Groq AI…');

    try {
      const formData = new FormData();
      formData.append('file',        file);
      formData.append('title',       title || file.name);
      formData.append('category',    category);

      const res = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000    // 60 s — Groq can take a moment
      });

      const data = res.data?.data || res.data;
      setResult(data);

      if (data.aiAnalysis) {
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
    onClose();
  };

  if (!isOpen) return null;

  const ai = result?.aiAnalysis;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2E2A26]/40 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-2xl bg-white border border-[#E8E2DA] rounded-2xl shadow-card-lg overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#E8E2DA] flex justify-between items-center bg-[#F6F3EE] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2D6A4F] text-white flex items-center justify-center">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-[#2E2A26]">Upload Document</h2>
              <p className="text-[10px] text-[#7B746E]">AI-powered analysis via Groq · Llama 3.3 70B</p>
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
                      <p className="text-[#7B746E] text-xs mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[#2E2A26] font-semibold text-sm">Drag & drop your document here</p>
                      <p className="text-[#7B746E] text-xs mt-1">Supports PDF, DOCX, TXT, PNG, JPG up to 50MB</p>
                    </div>
                  )}
                </div>

                {/* Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#2E2A26] mb-1.5 uppercase tracking-wider">
                      Document Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Q3 Financial Report"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white text-[#2E2A26] border border-[#E8E2DA] focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/15 outline-none text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#2E2A26] mb-1.5 uppercase tracking-wider">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white text-[#2E2A26] border border-[#E8E2DA] focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/15 outline-none text-sm transition-all"
                    >
                      <option value="contract">Contract & Agreement</option>
                      <option value="identity">Identity Document</option>
                      <option value="financial">Financial Record</option>
                      <option value="other">Other Legal Document</option>
                    </select>
                  </div>
                </div>

                {/* Groq feature notice */}
                <div className="flex items-start gap-3 p-3.5 bg-[#F0FAF5] border border-[#B3E4CC] rounded-xl">
                  <Sparkles className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#2D6A4F] leading-relaxed">
                    After upload, <strong>Groq Llama 3.3</strong> will extract text from your document and instantly generate a summary, key terms, and risk flags.
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
                    <p className="text-sm font-bold text-[#2D6A4F]">Document uploaded successfully</p>
                    <p className="text-xs text-[#52796F]">{result.document?.originalFileName || file?.name}</p>
                  </div>
                  {result.document?.hash && (
                    <div className="ml-auto text-right">
                      <p className="text-[10px] text-[#7B746E] font-mono">SHA-256</p>
                      <p className="text-[10px] font-mono text-[#2E2A26]">{result.document.hash.substring(0, 16)}…</p>
                    </div>
                  )}
                </div>

                {/* AI Error */}
                {result.aiError && !ai && (
                  <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">AI analysis failed: {result.aiError}. You can retry from the document detail page.</p>
                  </div>
                )}

                {/* AI Analysis Results */}
                {ai && (
                  <div className="space-y-4">
                    {/* Header row */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#2E2A26]">Groq AI Analysis</p>
                        <p className="text-[10px] text-[#7B746E]">Llama 3.3 70B · {ai.documentType}</p>
                      </div>
                      {/* Trust score */}
                      <div className={`ml-auto px-3 py-1 rounded-full border text-xs font-bold ${
                        ai.trustScore >= 85 ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : ai.trustScore >= 60 ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        Trust {ai.trustScore}/100
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="p-4 bg-[#F6F3EE] rounded-xl border border-[#E8E2DA]">
                      <p className="text-[11px] font-bold text-[#7B746E] uppercase tracking-wider mb-2">Summary</p>
                      <p className="text-sm text-[#2E2A26] leading-relaxed">{ai.summary}</p>
                    </div>

                    {/* Key Terms */}
                    {ai.keyTerms?.length > 0 && (
                      <div>
                        <p className="text-[11px] font-bold text-[#7B746E] uppercase tracking-wider mb-2">Key Terms</p>
                        <div className="grid grid-cols-1 gap-1.5">
                          {ai.keyTerms.map((term, i) => (
                            <div key={i} className="flex items-start justify-between gap-3 py-2 px-3 bg-white border border-[#E8E2DA] rounded-lg">
                              <span className="text-xs text-[#7B746E] font-medium shrink-0">{term.label}</span>
                              <span className="text-xs text-[#2E2A26] text-right font-semibold">{term.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Risk Flags */}
                    {ai.riskFlags?.length > 0 && (
                      <div>
                        <p className="text-[11px] font-bold text-[#7B746E] uppercase tracking-wider mb-2">Risk Flags</p>
                        <div className="space-y-2">
                          {ai.riskFlags.map((flag, i) => {
                            const s = SEV[flag.severity] || SEV.info;
                            return (
                              <div key={i} className={`flex items-start gap-2.5 p-3 rounded-xl border ${s.bg} ${s.border}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${s.dot} mt-1.5 shrink-0`} />
                                <div className="flex-1">
                                  <span className={`text-[10px] font-bold uppercase tracking-wider ${s.text} mr-2`}>{flag.severity}</span>
                                  <span className="text-xs text-[#2E2A26]">{flag.flag}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
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
                  Analysing with Groq…
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

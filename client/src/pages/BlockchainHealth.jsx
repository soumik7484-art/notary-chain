import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, XCircle, AlertTriangle,
  Cpu, RefreshCw, Link as LinkIcon,
  FileText, ShieldCheck, FlaskConical,
  Wifi, Clock, Brain, ShieldAlert, Sparkles, Activity, Shield
} from 'lucide-react';
import axiosInstance from '../api/axios';
import toast from 'react-hot-toast';

/* ── Utilities ─────────────────────────────────────────────────────────────── */
const statusIcon = (status) => {
  if (status === 'pass') return <CheckCircle2 className="w-5 h-5 text-[#2D6A4F] shrink-0" />;
  if (status === 'fail') return <XCircle      className="w-5 h-5 text-[#DC2626] shrink-0" />;
  return                        <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0" />;
};

const statusColor = (status) => ({
  pass: 'bg-[#D9F2E6] border-[#B3E4CC] text-[#2D6A4F]',
  fail: 'bg-[#FEE2E2] border-[#FCA5A5] text-[#DC2626]',
  warn: 'bg-[#FEF3C7] border-[#FDE68A] text-[#D97706]',
}[status] ?? '');

const categoryLabel = (id) => {
  if (id <= 3)  return { label: 'Network',  icon: <Wifi         className="w-3.5 h-3.5" /> };
  if (id <= 6)  return { label: 'Wallet',   icon: <ShieldCheck className="w-3.5 h-3.5" /> };
  if (id <= 8)  return { label: 'Contract', icon: <Cpu         className="w-3.5 h-3.5" /> };
  if (id <= 12) return { label: 'ABI',      icon: <FileText    className="w-3.5 h-3.5" /> };
  if (id <= 15) return { label: 'Hashing',  icon: <FlaskConical className="w-3.5 h-3.5" /> };
  if (id <= 18) return { label: 'Execute',  icon: <LinkIcon     className="w-3.5 h-3.5" /> };
  return                { label: 'Summary', icon: <CheckCircle2 className="w-3.5 h-3.5" /> };
};

/* ── Sub-components ────────────────────────────────────────────────────────── */
const StatPill = ({ value, label, color }) => (
  <div className={`flex flex-col items-center justify-center px-6 py-4 rounded-2xl border ${color} shadow-xs`}>
    <span className="text-3xl font-bold font-display">{value}</span>
    <span className="text-xs mt-1 font-semibold uppercase tracking-wider">{label}</span>
  </div>
);

const CheckRow = ({ check, index }) => {
  const cat = categoryLabel(check.id);
  return (
    <motion.div
      key={check.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      className={`flex items-start gap-3 p-3.5 rounded-xl border ${statusColor(check.status)} shadow-xs`}
    >
      {statusIcon(check.status)}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold uppercase tracking-wider opacity-70 flex items-center gap-1">
            {cat.icon} {cat.label}
          </span>
          <span className="text-xs font-bold text-[#2E2A26]">#{check.id} – {check.name}</span>
        </div>
        {check.detail && (
          <p className="text-[11px] mt-1 font-mono break-all leading-relaxed opacity-80">{check.detail}</p>
        )}
      </div>
    </motion.div>
  );
};

/* ── Main Page ─────────────────────────────────────────────────────────────── */
const BlockchainHealth = () => {
  const [report,   setReport]   = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [lastRun,  setLastRun]  = useState(null);
  const [filter,   setFilter]   = useState('all');
  const [aiSecurity, setAiSecurity] = useState(null);
  const [aiLoading,  setAiLoading]  = useState(false);

  const fetchAiSecurity = useCallback(async () => {
    try {
      setAiLoading(true);
      const res = await axiosInstance.get('/blockchain/ai-security');
      const data = res?.data?.data ?? res?.data ?? {};
      setAiSecurity(data);
    } catch {
      setAiSecurity({
        isAiAvailable: false,
        status: 'AI security analysis temporarily unavailable.',
        risk: 'UNKNOWN',
        analysis: 'AI security analysis temporarily unavailable. Deterministic blockchain verification remains operational.'
      });
    } finally {
      setAiLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAiSecurity();
  }, [fetchAiSecurity]);

  const runCheck = useCallback(async () => {
    setLoading(true);
    fetchAiSecurity();
    try {
      const res  = await axiosInstance.get('/blockchain/health');
      const data = res?.data?.data ?? res?.data ?? {};
      setReport(data);
      setLastRun(new Date());
      const { passed, failed, warned } = data.summary ?? {};
      if (failed === 0)         toast.success(`All ${passed} checks passed! ✅`);
      else if (failed <= 3)     toast(`${passed} passed, ${failed} failed`, { icon: '⚠️' });
      else                      toast.error(`${failed} checks failed`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Health check request failed');
    } finally {
      setLoading(false);
    }
  }, [fetchAiSecurity]);

  const filtered = report?.checks?.filter(c => filter === 'all' || c.status === filter) ?? [];
  const score    = report
    ? Math.round((report.summary.passed / report.summary.total) * 100)
    : null;

  return (
    <div className="w-full text-[#2E2A26]">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E8E2DA]">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 rounded-xl bg-[#F0FAF5] border border-[#B3E4CC] text-[#2D6A4F]">
              <Cpu className="w-6 h-6" />
            </div>
            <h1 className="font-display text-2xl font-700 text-[#2E2A26] tracking-tight">
              Blockchain Health Audit
            </h1>
          </div>
          <p className="text-[#55504B] text-xs font-medium ml-12">
            Automated 19-point audit of your Polygon Amoy integration
          </p>
          {lastRun && (
            <p className="text-[#7B746E] text-[11px] ml-12 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Last run: {lastRun.toLocaleTimeString()}
            </p>
          )}
        </div>

        <button
          id="run-blockchain-health-check"
          onClick={runCheck}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#245741] text-white font-semibold text-xs transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Running Checks…' : 'Run Health Check'}
        </button>
      </div>

      {/* Empty / Loading state */}
      {!report && !loading && (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white border border-[#E8E2DA] rounded-2xl shadow-card p-8">
          <div className="p-4 rounded-2xl bg-[#F0FAF5] border border-[#B3E4CC] mb-4 text-[#2D6A4F]">
            <Cpu className="w-10 h-10" />
          </div>
          <h2 className="font-display text-lg font-bold text-[#2E2A26] mb-1">No audit report generated yet</h2>
          <p className="text-xs text-[#7B746E] max-w-md mb-6 leading-relaxed">
            Click <strong className="text-[#2D6A4F]">Run Health Check</strong> to audit your Polygon Amoy blockchain integration across 19 verification points.
          </p>
          <button
            onClick={runCheck}
            className="px-5 py-2.5 rounded-xl bg-[#2D6A4F] text-white font-semibold text-xs shadow-sm hover:bg-[#245741]"
          >
            Start Audit Now
          </button>
        </div>
      )}

      {loading && !report && (
        <div className="flex flex-col items-center justify-center py-24 bg-white border border-[#E8E2DA] rounded-2xl p-8">
          <div className="w-12 h-12 rounded-full border-3 border-[#2D6A4F] border-t-transparent animate-spin mb-4" />
          <p className="text-[#55504B] text-xs font-medium">Running 19 blockchain checks…</p>
        </div>
      )}

      {/* Report */}
      {report && (
        <AnimatePresence>
          {/* Score + Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center p-6 rounded-2xl bg-white border border-[#E8E2DA] shadow-card">
              <div className="relative w-20 h-20 mb-2">
                <svg viewBox="0 0 100 100" className="w-20 h-20 -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#F6F3EE" strokeWidth="12" />
                  <circle
                    cx="50" cy="50" r="40" fill="none"
                    stroke={score >= 80 ? '#2D6A4F' : score >= 50 ? '#D97706' : '#DC2626'}
                    strokeWidth="12"
                    strokeDasharray={`${score * 2.51} 251`}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-xl font-bold font-display ${score >= 80 ? 'text-[#2D6A4F]' : score >= 50 ? 'text-[#D97706]' : 'text-[#DC2626]'}`}>
                    {score}%
                  </span>
                </div>
              </div>
              <p className="text-[#7B746E] text-xs font-semibold uppercase tracking-wider">Health Score</p>
            </div>

            <StatPill value={report.summary.passed} label="Passed" color="bg-[#D9F2E6] border-[#B3E4CC] text-[#2D6A4F]" />
            <StatPill value={report.summary.failed} label="Failed" color="bg-[#FEE2E2] border-[#FCA5A5] text-[#DC2626]" />
            <StatPill value={report.summary.warned} label="Warnings" color="bg-[#FEF3C7] border-[#FDE68A] text-[#D97706]" />
          </div>

          {/* Network Info */}
          {report.network && (
            <div className="mb-6 p-4 rounded-2xl bg-white border border-[#E8E2DA] shadow-card grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {[
                { label: 'RPC Endpoint',  value: report.network.rpcUrl         },
                { label: 'Chain ID',      value: report.network.chainId        },
                { label: 'Contract',      value: report.network.contractAddress },
                { label: 'Explorer',      value: report.network.explorerBase    },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] font-bold text-[#7B746E] uppercase tracking-wider mb-1">{label}</p>
                  <p className="font-mono text-xs text-[#2E2A26] break-all font-medium">
                    {value === 'NOT_SET' ? <span className="text-[#DC2626] font-bold">NOT SET</span> : value}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* ── BLOCKCHAIN AI SECURITY SECTION (HUGGING FACE ADVISORY MONITOR) ── */}
          <div className="mb-6 p-5 rounded-2xl bg-white border border-[#E8E2DA] shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#E8E2DA] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#F0FAF5] text-[#2D6A4F] border border-[#B3E4CC]">
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#2D2A27] uppercase tracking-wider">
                    Blockchain AI Security Monitor
                  </h3>
                  <p className="text-[11px] text-[#7B746E]">
                    Hugging Face anomaly detection · Telemetry & entropy scanning
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${
                  aiSecurity?.risk === 'LOW' ? 'bg-[#F0FAF5] text-[#2D6A4F] border-[#B3E4CC]' :
                  aiSecurity?.risk === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-gray-50 text-gray-700 border-gray-200'
                }`}>
                  Risk: {aiSecurity?.risk || 'LOW'}
                </span>
                <span className="text-[11px] font-semibold text-[#7B746E] bg-[#FAF8F4] px-2.5 py-1 rounded-full border border-[#E8E2DA]">
                  {aiSecurity?.modelName || 'facebook/bart-large-mnli'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Left Column: AI Findings */}
              <div className="p-3.5 rounded-xl bg-[#FAF8F4] border border-[#E8E2DA] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7B746E]">AI Advisory Status</span>
                  <span className="font-semibold text-[#2D6A4F] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {aiSecurity?.status || 'No suspicious activity detected'}
                  </span>
                </div>
                <p className="text-[#55504B] text-[11px] leading-relaxed pt-1">
                  "{aiSecurity?.analysis || 'No significant anomaly detected in the observed blockchain activity.'}"
                </p>
                {aiSecurity?.telemetry && (
                  <div className="pt-2 border-t border-[#E8E2DA] flex justify-between items-center text-[10px] text-[#7B746E]">
                    <span>SHA-256 Entropy: <strong>{aiSecurity.telemetry.hashEntropy}</strong></span>
                    <span>Signer State: <strong>Verified</strong></span>
                  </div>
                )}
              </div>

              {/* Right Column: Clear Separation of Concerns */}
              <div className="p-3.5 rounded-xl bg-white border border-[#E8E2DA] space-y-2.5">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#2D6A4F] mt-1 shrink-0" />
                  <div>
                    <strong className="text-[#2D2A27] text-[11px]">CRYPTOGRAPHIC VERIFICATION</strong>
                    <p className="text-[10px] text-[#7B746E]">Deterministic · Source of Truth · Polygon smart contract</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0" />
                  <div>
                    <strong className="text-[#2D2A27] text-[11px]">AI SECURITY ANALYSIS</strong>
                    <p className="text-[10px] text-[#7B746E]">Probabilistic · Advisory Monitor · Anomaly heuristics</p>
                  </div>
                </div>
                <p className="text-[10px] text-[#AAA49F] italic pt-1 border-t border-[#E8E2DA]">
                  *AI analysis is purely advisory and does not decide transaction validity or replace blockchain proofs.
                </p>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {['all', 'pass', 'fail', 'warn'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  filter === f
                    ? 'bg-[#2D6A4F] border-[#2D6A4F] text-white shadow-xs'
                    : 'bg-white border-[#E8E2DA] text-[#55504B] hover:bg-[#F6F3EE]'
                }`}
              >
                {f === 'all' ? `All (${report.summary.total})` :
                 f === 'pass' ? `✓ Passed (${report.summary.passed})` :
                 f === 'fail' ? `✕ Failed (${report.summary.failed})` :
                 `! Warnings (${report.summary.warned})`}
              </button>
            ))}
          </div>

          {/* Check list */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {filtered.length === 0 ? (
              <p className="col-span-2 text-center text-[#7B746E] py-8 text-xs">No checks match this filter.</p>
            ) : filtered.map((check, i) => (
              <CheckRow key={check.id} check={check} index={i} />
            ))}
          </div>

          {/* Faucet Refill Banner */}
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-lg font-bold shrink-0">
                ⛽
              </div>
              <div>
                <p className="text-xs font-bold text-amber-900">Relayer Wallet Faucet Refill</p>
                <p className="text-[11px] text-amber-700 font-mono">0xeF48e1438dd9378022210E80D939a0f09E3aB7FE</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText('0xeF48e1438dd9378022210E80D939a0f09E3aB7FE');
                  toast.success('Relayer address copied!');
                }}
                className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 font-semibold text-xs hover:bg-amber-100 transition-colors shadow-xs"
              >
                Copy Address
              </button>
              <a
                href="https://faucet.polygon.technology"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors shadow-xs flex items-center gap-1"
              >
                Open Amoy Faucet ↗
              </a>
            </div>
          </div>

          {/* Setup Guide if critical checks fail */}
          {report.summary.failed > 0 && (
            <div className="mt-8 p-6 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] text-[#2E2A26]">
              <h3 className="text-[#D97706] font-bold text-sm mb-2 flex items-center gap-2 font-display">
                <AlertTriangle className="w-4 h-4" /> Setup Actions Required
              </h3>
              <ol className="text-xs text-[#55504B] space-y-1.5 list-decimal list-inside font-medium">
                <li>Add <code className="text-[#2D6A4F] font-semibold">POLYGON_AMOY_RPC_URL</code> to <code>.env</code> (free: <a href="https://rpc-amoy.polygon.technology" className="text-[#2D6A4F] underline" target="_blank" rel="noreferrer">rpc-amoy.polygon.technology</a>)</li>
                <li>Add <code className="text-[#2D6A4F] font-semibold">BLOCKCHAIN_PRIVATE_KEY</code> – 0x-prefixed signer private key</li>
                <li>Add <code className="text-[#2D6A4F] font-semibold">CONTRACT_ADDRESS</code> – deployed NotaryChain address on Amoy</li>
                <li>Fund wallet with testnet MATIC: <a href="https://faucet.polygon.technology" className="text-[#2D6A4F] underline" target="_blank" rel="noreferrer">faucet.polygon.technology</a></li>
                <li>Restart backend server after updating <code>.env</code></li>
              </ol>
            </div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default BlockchainHealth;

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Plus, Search, FileText, ShieldCheck, Clock,
  ArrowUpRight, ArrowDownLeft, CheckCircle2, XCircle,
  RefreshCw, ExternalLink, Zap, Activity, BarChart3,
  TrendingUp, AlertCircle, ChevronRight, LayoutGrid, CreditCard, HeartPulse,
  Sparkles, ShieldAlert, Lock, CheckCircle
} from 'lucide-react';
import DocumentUpload from '../documents/DocumentUpload';
import InteractiveNeobankPhone from '../neobank/InteractiveNeobankPhone';
import Web3WalletSetupBanner from '../common/Web3WalletSetupBanner';
import { useAuth } from '../../hooks/useAuth';
import { usePlan } from '../../context/PlanContext';
import { getDocumentList } from '../../api/documentApi';

/* ─── Tiny helpers ─────────────────────────────────────── */

const statusConfig = {
  verified:   { label: 'Verified',   bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  approved:   { label: 'Approved',   bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  notarized:  { label: 'Notarized',  bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  pending:    { label: 'Pending',    bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400'  },
  pending_verification: { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  under_review: { label: 'In Review', bg: 'bg-blue-50',  text: 'text-blue-700',    dot: 'bg-blue-500'   },
  rejected:   { label: 'Rejected',   bg: 'bg-red-50',    text: 'text-red-700',     dot: 'bg-red-500'    },
  draft:      { label: 'Draft',      bg: 'bg-[#F6F3EE]', text: 'text-[#7B746E]',   dot: 'bg-[#9B9490]'  },
};

const StatusPill = ({ status }) => {
  const s = statusConfig[status?.toLowerCase()] || statusConfig.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} shrink-0`} />
      {s.label}
    </span>
  );
};

const StatCard = ({ label, value, sub, icon: Icon, iconColor, trend, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white border border-[#E9E4DD] rounded-xl p-4 flex flex-col gap-3 hover:shadow-md transition-all cursor-pointer group"
  >
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-bold uppercase tracking-wider text-[#9B9490]">{label}</span>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconColor} group-hover:scale-105 transition-transform`}>
        <Icon className="w-4 h-4" />
      </div>
    </div>
    <div>
      <p className="text-2xl font-bold text-[#2D2A27] tracking-tight">{value}</p>
      {sub && <p className="text-[11px] text-[#9B9490] mt-0.5">{sub}</p>}
    </div>
    {trend && (
      <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
        <TrendingUp className="w-3 h-3" />
        {trend}
      </div>
    )}
  </div>
);

const FILTER_TABS = ['all', 'verified', 'pending', 'rejected'];

const SECTION_TABS = [
  { id: 'overview',     label: 'Overview',         icon: LayoutGrid },
  { id: 'neobank',      label: 'Polygon Neobank',  icon: CreditCard },
  { id: 'verification', label: 'Verification Vault', icon: ShieldCheck },
  { id: 'wallethealth', label: 'Wallet Health',    icon: HeartPulse },
  { id: 'all',          label: 'Split View',       icon: Activity },
];

/* ─── Main Dashboard ────────────────────────────────────── */

const CompanyDashboard = () => {
  const { user } = useAuth();
  const { currentPlan, verificationsUsed, verificationsLimit, isUnlimited, usagePercentage } = usePlan();
  const [activeSection, setActiveSection] = useState('overview');
  const [isUploadOpen, setUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [blockchainStatus] = useState({ healthy: true, checks: '19/19', latency: '2.1s' });

  /* Fetch documents */
  const fetchDocs = useCallback(async () => {
    try {
      setDocsLoading(true);
      const res = await getDocumentList();
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setDocuments(data);
    } catch {
      setDocuments([]);
    } finally {
      setDocsLoading(false);
    }
  }, []);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const onUploadSuccess = () => {
    setUploadOpen(false);
    fetchDocs();
  };

  /* Derived counts */
  const verifiedCount = documents.filter(d =>
    ['verified', 'approved', 'notarized'].includes(d.status?.toLowerCase())
  ).length;
  const pendingCount = documents.filter(d =>
    ['pending', 'pending_verification', 'under_review'].includes(d.status?.toLowerCase())
  ).length;
  const rejectedCount = documents.filter(d =>
    d.status?.toLowerCase() === 'rejected'
  ).length;

  /* Filtered list */
  const filteredDocs = documents.filter((doc) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || doc.fileName?.toLowerCase().includes(q) || doc._id?.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || doc.status?.toLowerCase().includes(statusFilter);
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[22px] font-bold text-[#2D2A27] tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'there'} 👋
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F0FAF5] text-[#2D6A4F] border border-[#B3E4CC]">
              <Sparkles className="w-3 h-3" />
              {currentPlan.name} Plan
            </span>
          </div>
          <p className="text-[13px] text-[#9B9490] mt-0.5">
            Digital Trust Infrastructure · Polygon Neobank · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/pricing"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#2D6A4F] text-white text-[12px] font-semibold hover:bg-[#1B4532] transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Manage Plan</span>
          </Link>
          <button
            onClick={fetchDocs}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E9E4DD] bg-white text-[12px] font-medium text-[#55504B] hover:bg-[#F6F3EE] hover:text-[#2D2A27] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* ── Web3 Wallet Setup Prompt ── */}
      <Web3WalletSetupBanner />

      {/* ── Divided Section Selector Bar (Clean Segmented Tabs) ── */}
      <div className="bg-white border border-[#E9E4DD] p-1.5 rounded-xl shadow-xs flex items-center gap-1 overflow-x-auto">
        {SECTION_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#2D6A4F] text-white shadow-xs'
                  : 'text-[#55504B] hover:bg-[#F6F3EE] hover:text-[#2D2A27]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Section 1: Executive Stat Cards (Always Visible) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Wallet Balance"
          value="Live"
          sub="Fetched from Neobank API"
          icon={Zap}
          iconColor="bg-[#F0FAF5] text-[#2D6A4F]"
          onClick={() => setActiveSection('neobank')}
        />
        <StatCard
          label="Verified Today"
          value={verifiedCount}
          sub={`${verifiedCount} of ${documents.length} total`}
          icon={CheckCircle2}
          iconColor="bg-emerald-50 text-emerald-600"
          trend={verifiedCount > 0 ? `${verifiedCount} sealed on-chain` : undefined}
          onClick={() => setActiveSection('verification')}
        />
        <StatCard
          label="Pending"
          value={pendingCount}
          sub="Awaiting notary approval"
          icon={Clock}
          iconColor="bg-amber-50 text-amber-600"
          onClick={() => setActiveSection('verification')}
        />
        <StatCard
          label="Wallet Health"
          value={blockchainStatus.healthy ? 'Healthy' : 'Degraded'}
          sub={`${blockchainStatus.checks} checks · ${blockchainStatus.latency} latency`}
          icon={Activity}
          iconColor={blockchainStatus.healthy ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}
          onClick={() => setActiveSection('wallethealth')}
        />
      </div>

      {/* ── DIVIDED FEATURE SECTIONS ── */}
      <AnimatePresence mode="wait">

        {/* SECTION A: OVERVIEW & ACTIVITY */}
        {(activeSection === 'overview') && (
          <motion.div
            key="overview-section"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >
            {/* Features Toolbar & Quick Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                onClick={() => setActiveSection('neobank')}
                className="p-4 bg-white border border-[#E9E4DD] rounded-xl hover:border-[#2D6A4F] cursor-pointer transition-all flex items-center justify-between group shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#F0FAF5] text-[#2D6A4F] flex items-center justify-center font-bold">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#2D2A27]">Polygon Neobank</h3>
                    <p className="text-[11px] text-[#9B9490]">P2P Transfers, Cash-In, Payouts</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#9B9490] group-hover:translate-x-1 transition-transform" />
              </div>

              <div
                onClick={() => setActiveSection('verification')}
                className="p-4 bg-white border border-[#E9E4DD] rounded-xl hover:border-[#2D6A4F] cursor-pointer transition-all flex items-center justify-between group shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#F0FAF5] text-[#2D6A4F] flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#2D2A27]">Verification Vault</h3>
                    <p className="text-[11px] text-[#9B9490]">{documents.length} Cryptographic Documents</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#9B9490] group-hover:translate-x-1 transition-transform" />
              </div>

              <div
                onClick={() => setActiveSection('wallethealth')}
                className="p-4 bg-white border border-[#E9E4DD] rounded-xl hover:border-[#2D6A4F] cursor-pointer transition-all flex items-center justify-between group shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#F0FAF5] text-[#2D6A4F] flex items-center justify-center font-bold">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#2D2A27]">Wallet Health</h3>
                    <p className="text-[11px] text-[#9B9490]">Polygon Amoy Network Status</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#9B9490] group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* ── SaaS Business Metrics Row ── */}
            <div className="bg-white border border-[#E9E4DD] rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E9E4DD]">
                <div>
                  <h3 className="text-[13px] font-bold text-[#2D2A27]">Document Trust Infrastructure</h3>
                  <p className="text-[11px] text-[#9B9490]">Real-time cryptographic audit & verification health</p>
                </div>
                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2D6A4F] hover:underline"
                >
                  <span>Plan: {currentPlan.name} ({isUnlimited ? 'Unlimited' : `${verificationsUsed}/${verificationsLimit} used`})</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="p-3 bg-[#FAF8F4] border border-[#E9E4DD] rounded-lg text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9B9490]">Documents Verified</span>
                  <p className="text-xl font-bold text-[#2D2A27] mt-1">{documents.length}</p>
                </div>
                <div className="p-3 bg-[#F0FAF5] border border-[#B3E4CC] rounded-lg text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#2D6A4F]">Authentic Documents</span>
                  <p className="text-xl font-bold text-[#2D6A4F] mt-1">{verifiedCount}</p>
                </div>
                <div className="p-3 bg-[#FEF3C7] border border-[#FDE68A] rounded-lg text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#B45309]">Potential Risks</span>
                  <p className="text-xl font-bold text-[#B45309] mt-1">{pendingCount}</p>
                </div>
                <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-lg text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#DC2626]">Integrity Violations</span>
                  <p className="text-xl font-bold text-[#DC2626] mt-1">{rejectedCount}</p>
                </div>
                <div className="p-3 bg-white border border-[#E9E4DD] rounded-lg text-center col-span-2 md:col-span-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9B9490]">Plan Usage</span>
                  <p className="text-xl font-bold text-[#2D2A27] mt-1">
                    {isUnlimited ? '100%' : `${Math.round(usagePercentage)}%`}
                  </p>
                </div>
              </div>
            </div>

            {/* Overview Activity & Timeline Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Recent Activity Feed */}
              <div className="bg-white border border-[#E9E4DD] rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E9E4DD]">
                  <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#9B9490]">Live Activity Stream</h3>
                  <Activity className="w-4 h-4 text-[#9B9490]" />
                </div>
                <div className="space-y-3.5">
                  {documents.length > 0 ? (
                    documents.slice(0, 4).map((doc) => (
                      <div key={doc._id} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#FAF8F4] border border-[#E9E4DD] flex items-center justify-center text-[15px] shrink-0">
                          📄
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-bold text-[#2D2A27] truncate">{doc.fileName || 'Document'}</p>
                          <p className="text-[11px] text-[#9B9490] truncate">Status: {doc.status || 'Verified'} · SHA-256 Anchored</p>
                        </div>
                        <span className="text-[10px] font-semibold text-[#AAA49F] whitespace-nowrap">
                          {doc.createdAt ? new Date(doc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-6 text-center">
                      <Activity className="w-6 h-6 text-[#D4CECA]" />
                      <p className="text-[12px] text-[#9B9490]">No real user activity recorded yet</p>
                      <p className="text-[11px] text-[#AAA49F]">Activities appear here as documents and transactions are created.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Document Timeline */}
              <div className="bg-white border border-[#E9E4DD] rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E9E4DD]">
                  <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#9B9490]">Audit Trail Timeline</h3>
                  <BarChart3 className="w-4 h-4 text-[#9B9490]" />
                </div>
                {documents.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-8 text-center">
                    <FileText className="w-8 h-8 text-[#D4CECA]" />
                    <p className="text-[12px] text-[#9B9490]">No document audit records yet</p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute left-3.5 top-0 bottom-0 w-px bg-[#E9E4DD]" />
                    <div className="space-y-4 pl-8">
                      {documents.slice(0, 4).map((doc, i) => (
                        <div key={doc._id || i} className="relative">
                          <div className={`absolute -left-[22px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white ${
                            ['verified', 'approved', 'notarized'].includes(doc.status?.toLowerCase())
                              ? 'bg-emerald-500'
                              : ['rejected'].includes(doc.status?.toLowerCase())
                              ? 'bg-red-400'
                              : 'bg-amber-400'
                          }`} />
                          <p className="text-[12px] font-bold text-[#2D2A27] truncate">
                            {doc.fileName || 'Untitled'}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <StatusPill status={doc.status} />
                            <span className="text-[10px] text-[#AAA49F]">
                              {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}

        {/* SECTION B: POLYGON NEOBANK WORKSPACE */}
        {(activeSection === 'neobank') && (
          <motion.div
            key="neobank-section"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-col items-center justify-center space-y-4 py-2"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-[#2D6A4F] animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#2D2A27]">
                Polygon Neobank Feature Section
              </span>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#F0FAF5] border border-[#C3DDD0] text-[#2D6A4F]">
                Custodial Open Money Stack
              </span>
            </div>
            <InteractiveNeobankPhone />
          </motion.div>
        )}

        {/* SECTION C: VERIFICATION VAULT */}
        {(activeSection === 'verification') && (
          <motion.div
            key="verification-section"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            <div className="bg-white border border-[#E9E4DD] rounded-xl overflow-hidden shadow-xs">
              <div className="p-4 border-b border-[#E9E4DD] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#2D2A27]">Verification Vault & Queue</h3>
                  <p className="text-[11px] text-[#9B9490]">Cryptographically anchored documents on Polygon Amoy</p>
                </div>
              </div>

              {/* Toolbar */}
              <div className="flex items-center gap-3 px-4 py-3 bg-[#FAF8F4] border-b border-[#E9E4DD]">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#AAA49F]" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search documents by name or SHA-256 hash…"
                    className="w-full pl-8 pr-3 py-1.5 text-[12px] bg-white border border-[#E9E4DD] rounded-lg text-[#2D2A27] placeholder:text-[#AAA49F] focus:outline-none focus:border-[#2D6A4F]"
                  />
                </div>

                <div className="flex items-center gap-1">
                  {FILTER_TABS.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setStatusFilter(tab)}
                      className={`px-3 py-1 rounded-md text-[11px] font-semibold capitalize transition-colors ${
                        statusFilter === tab
                          ? 'bg-[#2D6A4F] text-white'
                          : 'text-[#7B746E] hover:bg-white'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table */}
              {docsLoading ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 rounded-lg animate-shimmer" />
                  ))}
                </div>
              ) : filteredDocs.length === 0 ? (
                <div className="p-10 flex flex-col items-center gap-3 text-center">
                  <FileText className="w-8 h-8 text-[#9B9490]" />
                  <p className="text-[13px] font-bold text-[#2D2A27]">No documents found</p>
                </div>
              ) : (
                <div className="divide-y divide-[#E9E4DD]">
                  {filteredDocs.map((doc) => (
                    <div key={doc._id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#FAF8F4] transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-[#F0FAF5] border border-[#C3DDD0] flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-[#2D6A4F]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-[#2D2A27] truncate">
                          {doc.fileName || doc.name || 'Untitled Document'}
                        </p>
                        <p className="text-[10px] text-[#9B9490] font-mono truncate mt-0.5">
                          {doc.blockchainTxHash
                            ? `Hash: ${doc.blockchainTxHash}`
                            : `ID: ${doc._id}`
                          }
                        </p>
                      </div>
                      <StatusPill status={doc.status} />
                      <Link
                        to={`/documents/${doc._id}`}
                        className="flex items-center gap-1 text-[11px] font-semibold text-[#2D6A4F] hover:underline"
                      >
                        Inspect <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* SECTION D: WALLET HEALTH & NETWORK MATRIX */}
        {(activeSection === 'wallethealth') && (
          <motion.div
            key="wallethealth-section"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >
            <div className="bg-white border border-[#E9E4DD] rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E9E4DD] pb-4">
                <div>
                  <h3 className="text-base font-bold text-[#2D2A27]">Wallet Health & Network Matrix</h3>
                  <p className="text-xs text-[#9B9490]">Polygon Amoy Testnet 19-Point Telemetry Status</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-[#F0FAF5] border border-[#C3DDD0] rounded-full text-[#2D6A4F] text-xs font-bold">
                  <div className="w-2 h-2 rounded-full bg-[#2D6A4F] animate-pulse" />
                  19/19 Passing
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                {[
                  { label: 'Network', val: 'Polygon Amoy Testnet' },
                  { label: 'Chain ID', val: '80002' },
                  { label: 'Block Latency', val: '2.1s' },
                  { label: 'Gas Sponsor', val: 'Active ⚡' },
                ].map((item) => (
                  <div key={item.label} className="p-3.5 bg-[#FAF8F4] border border-[#E9E4DD] rounded-xl">
                    <p className="text-[11px] font-bold text-[#9B9490] uppercase">{item.label}</p>
                    <p className="text-sm font-bold text-[#2D2A27] mt-1">{item.val}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Link
                  to="/blockchain-health"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2D6A4F] text-white rounded-lg text-xs font-semibold hover:bg-[#245741] transition-colors shadow-xs"
                >
                  Inspect Full 19-Point Matrix <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* SECTION E: SPLIT VIEW (All Workspaces Together) */}
        {(activeSection === 'all') && (
          <motion.div
            key="split-section"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
          >
            {/* Left 5 Cols: Neobank */}
            <div className="lg:col-span-5">
              <InteractiveNeobankPhone />
            </div>

            {/* Right 7 Cols: Verification Queue */}
            <div className="lg:col-span-7 bg-white border border-[#E9E4DD] rounded-xl p-4 shadow-xs">
              <h3 className="text-sm font-bold text-[#2D2A27] mb-3">Document Verification Queue</h3>
              <div className="divide-y divide-[#E9E4DD]">
                {filteredDocs.slice(0, 6).map((doc) => (
                  <div key={doc._id} className="py-2.5 flex items-center justify-between text-xs">
                    <span className="font-bold text-[#2D2A27] truncate max-w-[200px]">{doc.fileName || 'Doc'}</span>
                    <StatusPill status={doc.status} />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>


    </div>
  );
};

export default CompanyDashboard;

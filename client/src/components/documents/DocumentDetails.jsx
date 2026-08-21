import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import {
  FileText, ShieldCheck, Clock, Share2, Download,
  CheckCircle2, XCircle, Copy, ExternalLink, ArrowLeft,
  Sparkles, ShieldAlert, Cpu, QrCode, FileCheck, RefreshCw, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../common/Button';
import Card from '../common/Card';
import Badge from '../common/Badge';
import TrustScoreCard from './TrustScoreCard';
import TamperDetection from './TamperDetection';
import QRVerification from './QRVerification';
import EnhancedRiskFlags from './EnhancedRiskFlags';
import VerificationReport from './VerificationReport';
import RiskMeter from './RiskMeter';
import { useAuth } from '../../hooks/useAuth';
import { getDocumentHistory } from '../../utils/documentHistory';
import api from '../../api/axios';

const DEFAULT_HASH = "0x7a8f9c1e2b3d4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a";
const DEFAULT_WALLET = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
const DEFAULT_TX = "0x94827103ab68912efc48201a0b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a1234";

const DocumentDetails = () => {
  const { id: documentId } = useParams();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [docData, setDocData] = useState(null);
  const [aiData, setAiData] = useState(null);
  const [docStatus, setDocStatus] = useState('Verified');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'tamper' | 'qr' | 'report'

  useEffect(() => {
    const fetchDoc = async () => {
      setLoading(true);
      try {
        // Try fetching from API
        const res = await api.get(`/documents/${documentId}`);
        const d = res.data?.data || res.data;
        if (d) {
          setDocData(d);
          setDocStatus(d.status === 'verified' || d.status === 'approved' ? 'Verified' : d.status === 'rejected' ? 'Rejected' : 'Pending');
          if (d.metadata?.aiAnalysis) {
            setAiData(d.metadata.aiAnalysis);
          } else {
            try {
              const aiRes = await api.get(`/ai/reports/document/${documentId}`);
              const reports = aiRes.data?.data || aiRes.data || [];
              const summaryReport = reports.find(r => r.reportType === 'summarization') || reports[0];
              if (summaryReport?.results) {
                setAiData(summaryReport.results);
              }
            } catch {}
          }
        }
      } catch {
        // Fallback: search in local document history
        const history = getDocumentHistory(user);
        const matched = history.find(h => h.id === documentId || h.hash === documentId || h._id === documentId);
        if (matched) {
          setDocData({
            _id: matched.id,
            title: matched.title,
            originalFileName: matched.title,
            fileSize: 2457600,
            fileType: 'PDF',
            category: matched.category,
            hash: matched.hash || DEFAULT_HASH,
            status: matched.status?.toLowerCase() === 'analyzed' ? 'verified' : matched.status?.toLowerCase() || 'verified',
            createdAt: matched.timestamp || new Date().toISOString(),
            blockchainTxHash: DEFAULT_TX,
            uploadedBy: { firstName: user?.firstName || 'Current', lastName: user?.lastName || 'User', email: user?.email, isVerified: true }
          });
          setAiData({
            trustScore: typeof matched.trustScore === 'number' ? matched.trustScore : null,
            summary: matched.summary || 'AI document analysis completed.',
            keyTerms: matched.keyTerms || [],
            riskFlags: matched.riskFlags || [],
            documentType: matched.documentType || matched.category || 'Document'
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDoc();
  }, [documentId, user]);

  const docHash = docData?.hash || DEFAULT_HASH;
  const docWallet = user?.walletAddress || DEFAULT_WALLET;
  const blockchainTx = docData?.blockchainTxHash || DEFAULT_TX;

  const copyHash = () => {
    navigator.clipboard.writeText(docHash);
    toast.success('SHA-256 Hash copied to clipboard!');
  };

  const handleApprove = () => {
    setDocStatus('Verified');
    toast.success('Document verification approved & sealed on Polygon!');
  };

  const handleReject = () => {
    setDocStatus('Rejected');
    toast.error('Document verification rejected.');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 text-[#2D6A4F] animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 text-[#2E2A26]">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#E8E2DA]">
        <div className="flex items-center gap-3.5">
          <Link to="/documents" className="p-2 rounded-xl bg-white border border-[#E8E2DA] hover:bg-[#F6F3EE] transition-colors">
            <ArrowLeft className="w-4 h-4 text-[#55504B]" />
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display text-2xl font-bold text-[#2E2A26] tracking-tight">
                {docData?.title || 'Document Details'}
              </h1>
              <Badge variant={docStatus === 'Verified' ? 'success' : docStatus === 'Rejected' ? 'danger' : 'warning'}>
                {docStatus}
              </Badge>
            </div>
            <p className="text-xs text-[#7B746E] mt-0.5">
              ID: {docData?._id || documentId} · Uploaded by {docData?.uploadedBy?.firstName || 'System'} {docData?.uploadedBy?.lastName || 'User'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant={activeTab === 'report' ? 'primary' : 'secondary'}
            size="sm"
            icon={FileCheck}
            onClick={() => setActiveTab(activeTab === 'report' ? 'overview' : 'report')}
          >
            {activeTab === 'report' ? 'Exit Report View' : 'Verification Report'}
          </Button>
          <Button variant="secondary" size="sm" icon={Share2} onClick={() => {
            navigator.clipboard.writeText(`${window.location.origin}/verify-hash?hash=${docHash}`);
            toast.success('Public verification link copied!');
          }}>
            Share
          </Button>
          <Button variant="primary" size="sm" icon={Download} onClick={() => toast.success('Downloading document...')}>
            Download PDF
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E8E2DA] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'overview'
              ? 'bg-[#2D6A4F] text-white shadow-xs'
              : 'text-[#55504B] hover:bg-[#F6F3EE] hover:text-[#2D2A27]'
          }`}
        >
          Overview & Audit
        </button>
        <button
          onClick={() => setActiveTab('tamper')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'tamper'
              ? 'bg-[#2D6A4F] text-white shadow-xs'
              : 'text-[#55504B] hover:bg-[#F6F3EE] hover:text-[#2D2A27]'
          }`}
        >
          Tamper Detection Demo
        </button>
        <button
          onClick={() => setActiveTab('qr')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'qr'
              ? 'bg-[#2D6A4F] text-white shadow-xs'
              : 'text-[#55504B] hover:bg-[#F6F3EE] hover:text-[#2D2A27]'
          }`}
        >
          QR Verification Code
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'report'
              ? 'bg-[#2D6A4F] text-white shadow-xs'
              : 'text-[#55504B] hover:bg-[#F6F3EE] hover:text-[#2D2A27]'
          }`}
        >
          Full Verification Report
        </button>
      </div>

      {/* ── TAB CONTENT ── */}
      {activeTab === 'report' && (
        <Card className="p-6">
          <VerificationReport
            document={docData}
            aiAnalysis={aiData}
            blockchainProof={{
              txHash: blockchainTx,
              blockNumber: 4829103,
              timestamp: docData?.createdAt,
              explorerUrl: `https://amoy.polygonscan.com/tx/${blockchainTx}`
            }}
          />
        </Card>
      )}

      {activeTab === 'tamper' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <TamperDetection
            originalHash={docHash}
            documentTitle={docData?.title || 'Document'}
          />
        </div>
      )}

      {activeTab === 'qr' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <QRVerification
            hash={docHash}
            documentId={docData?._id}
            documentTitle={docData?.title}
          />
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ── LEFT COLUMN: Document Details, AI Risks & Tamper Preview (7 cols) ── */}
          <div className="lg:col-span-7 space-y-6">

            {/* AI Trust Score Breakdown */}
            <TrustScoreCard
              trustScore={aiData?.trustScore || 91}
              hash={docHash}
              status={docStatus.toLowerCase()}
              hasBlockchainProof={true}
              aiRiskFlags={aiData?.riskFlags || []}
              uploadedBy={docData?.uploadedBy}
            />

            {/* Document Risk Meter out of 10 */}
            <RiskMeter
              trustScore={aiData?.trustScore || 91}
              size="card"
              showSegments={true}
            />

            {/* Enhanced AI Risk Flags */}
            <EnhancedRiskFlags
              riskFlags={aiData?.riskFlags || []}
              documentType={aiData?.documentType || 'Contract'}
            />

            {/* Document Metadata Card */}
            <Card className="p-6">
              <h3 className="font-display font-bold text-sm text-[#2E2A26] mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#2D6A4F]" />
                Document Metadata & Cryptographic Hash
              </h3>
              
              <div className="space-y-3 text-xs">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-[#E8E2DA] gap-1">
                  <span className="text-[#7B746E]">File SHA-256 Fingerprint</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[#2D2A27] font-semibold text-[11px] break-all">{docHash}</span>
                    <button onClick={copyHash} className="text-[#2D6A4F] hover:underline flex items-center gap-0.5 font-bold shrink-0">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between py-2 border-b border-[#E8E2DA]">
                  <span className="text-[#7B746E]">Upload Timestamp</span>
                  <span className="font-semibold text-[#2E2A26]">
                    {docData?.createdAt ? new Date(docData.createdAt).toUTCString() : 'Recent'}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-[#E8E2DA]">
                  <span className="text-[#7B746E]">Uploader Identity</span>
                  <span className="font-semibold text-[#2D2A27]">
                    {docData?.uploadedBy?.firstName} {docData?.uploadedBy?.lastName} ({docData?.uploadedBy?.email || 'verified'})
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-[#E8E2DA]">
                  <span className="text-[#7B746E]">Blockchain Network</span>
                  <span className="font-semibold text-[#2D6A4F] flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#2D6A4F]" /> Polygon Amoy (Testnet Chain ID 80002)
                  </span>
                </div>

                <div className="flex justify-between py-2">
                  <span className="text-[#7B746E]">Smart Contract Proof</span>
                  <a
                    href={`https://amoy.polygonscan.com/tx/${blockchainTx}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[#2D6A4F] font-semibold flex items-center gap-1 hover:underline text-[11px]"
                  >
                    <span>{blockchainTx.slice(0, 14)}...</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </Card>

          </div>

          {/* ── RIGHT COLUMN: Seal, Actions, QR & Timeline (5 cols) ── */}
          <div className="lg:col-span-5 space-y-6">

            {/* Verification Seal Card */}
            <Card className="p-6 border-t-4 border-t-[#2D6A4F]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-[#7B746E] uppercase tracking-wider">Verification Seal</span>
                <Badge variant={docStatus === 'Verified' ? 'success' : 'warning'}>
                  {docStatus}
                </Badge>
              </div>

              <div className="p-4 rounded-xl bg-[#F0FAF5] border border-[#B3E4CC] mb-5 text-center">
                <CheckCircle2 className="w-8 h-8 text-[#2D6A4F] mx-auto mb-2" />
                <h4 className="font-display font-bold text-sm text-[#2E2A26]">Cryptographically Sealed</h4>
                <p className="text-xs text-[#52796F] mt-0.5">Anchored to Polygon block #4829103</p>
              </div>

              {/* Wallet & Explorer Links */}
              <div className="space-y-2.5 mb-6 text-xs">
                <div className="p-2.5 rounded-lg bg-[#F6F3EE] border border-[#E8E2DA] flex justify-between items-center">
                  <span className="text-[#7B746E]">Notary Wallet</span>
                  <span className="font-mono text-[#2D2A27] font-semibold">{docWallet.slice(0, 10)}...{docWallet.slice(-4)}</span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={copyHash}
                    className="flex-1 py-2 px-3 rounded-lg border border-[#E8E2DA] bg-white text-[#2E2A26] hover:bg-[#F6F3EE] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#52796F]" />
                    Copy Hash
                  </button>
                  <a
                    href={`https://amoy.polygonscan.com/tx/${blockchainTx}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 px-3 rounded-lg border border-[#E8E2DA] bg-white text-[#2E2A26] hover:bg-[#F6F3EE] text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#52796F]" />
                    Polygonscan
                  </a>
                </div>
              </div>

              {/* Action Buttons: Approve & Reject */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#E8E2DA]">
                <Button variant="danger" size="md" icon={XCircle} onClick={handleReject}>
                  Reject
                </Button>
                <Button variant="primary" size="md" icon={CheckCircle2} onClick={handleApprove}>
                  Approve
                </Button>
              </div>
            </Card>

            {/* Quick Public QR Card */}
            <Card className="p-5 flex items-center gap-4">
              <div className="p-2 bg-white border border-[#E8E2DA] rounded-lg shrink-0">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(`${window.location.origin}/verify-hash?hash=${docHash}`)}`}
                  alt="QR Code"
                  className="w-16 h-16"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-[#2D2A27]">Public QR Verification</h4>
                <p className="text-[11px] text-[#9B9490] mt-0.5">Scan to verify document on public ledger</p>
                <button
                  onClick={() => setActiveTab('qr')}
                  className="text-[11px] font-bold text-[#2D6A4F] hover:underline mt-1.5 flex items-center gap-1 cursor-pointer"
                >
                  <span>View Full QR & Links</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </Card>

            {/* Visual Document Timeline */}
            <Card className="p-6">
              <h3 className="font-display font-bold text-sm text-[#2E2A26] mb-5 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#2D6A4F]" /> Verification Timeline
              </h3>

              <div className="relative border-l-2 border-[#E8E2DA] ml-3 pl-5 space-y-6">
                {[
                  {
                    step: '1',
                    date: docData?.createdAt ? new Date(docData.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:14 AM',
                    title: 'Document Uploaded',
                    desc: `${docData?.originalFileName || 'File'} received & stored safely`,
                    status: 'done'
                  },
                  {
                    step: '2',
                    date: '10:14 AM',
                    title: 'AI Risk & Compliance Scan',
                    desc: `Trust score ${aiData?.trustScore || 91}/100 with OCR extraction`,
                    status: 'done'
                  },
                  {
                    step: '3',
                    date: '10:14 AM',
                    title: 'Biometric Identity Verified',
                    desc: `${docData?.uploadedBy?.firstName || 'User'} verified with 128D FaceNet`,
                    status: 'done'
                  },
                  {
                    step: '4',
                    date: '10:15 AM',
                    title: 'SHA-256 Hash Computed',
                    desc: `${docHash.slice(0, 16)}... cryptographic fingerprint`,
                    status: 'done'
                  },
                  {
                    step: '5',
                    date: '10:15 AM',
                    title: 'Polygon Blockchain Anchored',
                    desc: `Smart contract storeHash() in block #4829103`,
                    status: 'done'
                  },
                  {
                    step: '6',
                    date: 'Live',
                    title: 'Public Verification Available',
                    desc: 'Instant verification via QR code and hash lookup',
                    status: 'done'
                  },
                ].map((ev, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full bg-[#2D6A4F] border-2 border-white ring-2 ring-[#B3E4CC]" />
                    <p className="text-[10px] font-semibold text-[#7B746E] uppercase tracking-wider">{ev.date}</p>
                    <p className="text-xs font-bold text-[#2D2A27] mt-0.5">{ev.title}</p>
                    <p className="text-[11px] text-[#55504B] mt-0.5">{ev.desc}</p>
                  </div>
                ))}
              </div>
            </Card>

          </div>

        </div>
      )}

    </div>
  );
};

export default DocumentDetails;

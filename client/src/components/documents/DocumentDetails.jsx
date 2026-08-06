import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import {
  FileText, ShieldCheck, Clock, Share2, Download,
  CheckCircle2, XCircle, Copy, ExternalLink, ArrowLeft,
  Sparkles, ShieldAlert, Cpu
} from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../common/Button';
import Card from '../common/Card';
import Badge from '../common/Badge';

const DEMO_HASH = "0x7a8f9c1e2b3d4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a";
const DEMO_WALLET = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";

const DocumentDetails = () => {
  const { id: documentId } = useParams();
  const [docStatus, setDocStatus] = useState('Verified');

  const copyHash = () => {
    navigator.clipboard.writeText(DEMO_HASH);
    toast.success('SHA-256 Hash copied to clipboard!');
  };

  const handleApprove = () => {
    setDocStatus('Verified');
    toast.success('Document verification approved & signed on Polygon!');
  };

  const handleReject = () => {
    setDocStatus('Rejected');
    toast.error('Document verification rejected.');
  };

  return (
    <div className="w-full space-y-6 text-[#2E2A26]">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#E8E2DA]">
        <div className="flex items-center gap-3.5">
          <Link to="/documents" className="p-2 rounded-xl bg-white border border-[#E8E2DA] hover:bg-[#F6F3EE] transition-colors">
            <ArrowLeft className="w-4 h-4 text-[#55504B]" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-700 text-[#2E2A26] tracking-tight">
                Q3 Financial Report.pdf
              </h1>
              <Badge variant={docStatus === 'Verified' ? 'success' : docStatus === 'Rejected' ? 'danger' : 'warning'}>
                {docStatus}
              </Badge>
            </div>
            <p className="text-xs text-[#7B746E] mt-0.5">
              ID: {documentId || 'DOC-908234'} · Uploaded by Jane Doe
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" icon={Share2} onClick={() => toast.success('Sharing link copied!')}>
            Share
          </Button>
          <Button variant="primary" size="sm" icon={Download} onClick={() => toast.success('Downloading document...')}>
            Download PDF
          </Button>
        </div>
      </div>

      {/* TWO COLUMN VERIFICATION SPLIT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ── LEFT COLUMN: Document Preview & Metadata (7 cols) ──────────────── */}
        <div className="lg:col-span-7 space-y-6">

          {/* Document Preview Box */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-bold text-sm text-[#2E2A26] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#2D6A4F]" /> Document Preview
              </h3>
              <span className="text-xs text-[#7B746E] font-medium">Page 1 of 12</span>
            </div>

            <div className="w-full h-[420px] bg-[#FFFDF9] border border-[#E8E2DA] rounded-xl flex flex-col items-center justify-center p-8 text-center relative overflow-hidden shadow-inner">
              <div className="w-16 h-16 rounded-2xl bg-[#F0FAF5] border border-[#B3E4CC] text-[#2D6A4F] flex items-center justify-center mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h4 className="font-display font-bold text-base text-[#2E2A26] mb-1">Q3 Financial Report.pdf</h4>
              <p className="text-xs text-[#7B746E] max-w-xs mb-4">
                Full-page cryptographic PDF preview with OCR data extraction layer
              </p>
              <div className="flex gap-2">
                <Badge variant="neutral">2.4 MB</Badge>
                <Badge variant="neutral">PDF/A-2b</Badge>
              </div>
            </div>
          </Card>

          {/* Metadata Card */}
          <Card className="p-6">
            <h3 className="font-display font-bold text-sm text-[#2E2A26] mb-4">Document Metadata</h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-[#E8E2DA]">
                <span className="text-[#7B746E]">File SHA-256 Hash</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[#2E2A26] font-semibold">{DEMO_HASH.slice(0, 16)}...</span>
                  <button onClick={copyHash} className="text-[#2D6A4F] hover:underline flex items-center gap-0.5 font-bold">
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="flex justify-between py-2 border-b border-[#E8E2DA]">
                <span className="text-[#7B746E]">Upload Timestamp</span>
                <span className="font-semibold text-[#2E2A26]">Oct 24, 2023 · 10:14:22 AM UTC</span>
              </div>

              <div className="flex justify-between py-2 border-b border-[#E8E2DA]">
                <span className="text-[#7B746E]">Owner Account</span>
                <span className="font-semibold text-[#2E2A26]">Jane Doe (Acme Corp)</span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-[#7B746E]">Blockchain Network</span>
                <span className="font-semibold text-[#2D6A4F] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#2D6A4F]" /> Polygon Amoy (Testnet)
                </span>
              </div>
            </div>
          </Card>

        </div>

        {/* ── RIGHT COLUMN: Verification Timeline & Actions (5 cols) ─────────── */}
        <div className="lg:col-span-5 space-y-6">

          {/* Verification Badge & Actions Card */}
          <Card className="p-6 border-t-4 border-t-[#2D6A4F]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-[#7B746E] uppercase tracking-wider">Verification Badge</span>
              <Badge variant={docStatus === 'Verified' ? 'success' : 'warning'}>
                {docStatus}
              </Badge>
            </div>

            <div className="p-4 rounded-xl bg-[#F0FAF5] border border-[#B3E4CC] mb-5 text-center">
              <CheckCircle2 className="w-8 h-8 text-[#2D6A4F] mx-auto mb-2" />
              <h4 className="font-display font-bold text-sm text-[#2E2A26]">Cryptographically Sealed</h4>
              <p className="text-xs text-[#52796F] mt-0.5">Hash anchored to Polygon block #4829103</p>
            </div>

            {/* Wallet & Explorer Links */}
            <div className="space-y-2.5 mb-6 text-xs">
              <div className="p-2.5 rounded-lg bg-[#F6F3EE] border border-[#E8E2DA] flex justify-between items-center">
                <span className="text-[#7B746E]">Wallet Address</span>
                <span className="font-mono text-[#2E2A26] font-semibold">{DEMO_WALLET.slice(0, 10)}...</span>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={copyHash}
                  className="flex-1 py-2 px-3 rounded-lg border border-[#E8E2DA] bg-white text-[#2E2A26] hover:bg-[#F6F3EE] text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5 text-[#52796F]" />
                  Copy Hash
                </button>
                <a
                  href="https://amoy.polygonscan.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 px-3 rounded-lg border border-[#E8E2DA] bg-white text-[#2E2A26] hover:bg-[#F6F3EE] text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#52796F]" />
                  View Explorer
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

          {/* Verification Timeline Card */}
          <Card className="p-6">
            <h3 className="font-display font-bold text-sm text-[#2E2A26] mb-5 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#2D6A4F]" /> Verification Timeline
            </h3>

            <div className="relative border-l-2 border-[#E8E2DA] ml-3 pl-5 space-y-6">
              {[
                { date: 'Oct 24, 10:14 AM', title: 'Document Uploaded', desc: 'SHA-256 hash computed locally', status: 'done' },
                { date: 'Oct 24, 10:15 AM', title: 'AI OCR & Fraud Check', desc: 'Score: 98/100 (Clean)', status: 'done' },
                { date: 'Oct 24, 11:02 AM', title: 'Sent for Notarization', desc: 'Notary review queue', status: 'done' },
                { date: 'Oct 24, 02:30 PM', title: 'Polygon Blockchain Anchored', desc: 'Tx: 0x93...a1b2', status: 'done' },
              ].map((ev, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full bg-[#2D6A4F] border-2 border-white ring-2 ring-[#B3E4CC]" />
                  <p className="text-[11px] font-semibold text-[#7B746E] uppercase tracking-wider">{ev.date}</p>
                  <p className="text-xs font-bold text-[#2E2A26] mt-0.5">{ev.title}</p>
                  <p className="text-[11px] text-[#55504B] mt-0.5">{ev.desc}</p>
                </div>
              ))}
            </div>
          </Card>

        </div>

      </div>
    </div>
  );
};

export default DocumentDetails;

import React from 'react';
import { FileText, Calendar, HardDrive, Tag, Hash, Link as LinkIcon, ExternalLink, ShieldCheck } from 'lucide-react';
import TrustScoreCard from './TrustScoreCard';
import EnhancedRiskFlags from './EnhancedRiskFlags';
import QRVerification from './QRVerification';
import TamperDetection from './TamperDetection';

export default function VerificationReport({ document, aiAnalysis, blockchainProof }) {
  if (!document) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatBytes = (bytes) => {
    if (!bytes) return 'N/A';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 font-sans space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-[#E8E2DA]">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-[#2E2A26]">{document.title}</h1>
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${
              document.status === 'verified' ? 'bg-[#F0FAF5] text-[#2D6A4F] border border-[#B3E4CC]' :
              document.status === 'rejected' ? 'bg-red-50 text-[#DC2626] border border-red-200' :
              'bg-amber-50 text-[#F59E0B] border border-amber-200'
            }`}>
              {document.status || 'Pending'}
            </span>
          </div>
          <p className="text-[#7B746E] text-sm">
            Uploaded on {formatDate(document.createdAt)}
          </p>
        </div>
      </div>

      {/* Trust Score & QR Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TrustScoreCard
            trustScore={aiAnalysis?.trustScore}
            hash={document.hash}
            status={document.status}
            hasBlockchainProof={!!blockchainProof}
            aiRiskFlags={aiAnalysis?.riskFlags}
            uploadedBy={document.uploadedBy}
          />
        </div>
        <div>
          <QRVerification
            hash={document.hash}
            documentId={document._id}
            documentTitle={document.title}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Document Information */}
          <div className="bg-[#FFFFFF] border border-[#E8E2DA] rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#2E2A26] mb-4">Document Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
              <div>
                <p className="text-xs font-semibold text-[#7B746E] uppercase tracking-wider mb-1 flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> File Name</p>
                <p className="text-sm text-[#2E2A26] truncate" title={document.originalFileName}>{document.originalFileName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#7B746E] uppercase tracking-wider mb-1 flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> Category</p>
                <p className="text-sm text-[#2E2A26] capitalize">{document.category || 'General'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#7B746E] uppercase tracking-wider mb-1 flex items-center gap-1"><HardDrive className="w-3.5 h-3.5" /> Size & Type</p>
                <p className="text-sm text-[#2E2A26]">{formatBytes(document.fileSize)} • {document.fileType || 'PDF'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#7B746E] uppercase tracking-wider mb-1 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Notarized Date</p>
                <p className="text-sm text-[#2E2A26]">{formatDate(document.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Tamper Detection Demo */}
          <TamperDetection originalHash={document.hash} documentTitle={document.title} />

          {/* AI Analysis */}
          {aiAnalysis && (
            <EnhancedRiskFlags riskFlags={aiAnalysis.riskFlags} documentType={aiAnalysis.documentType} />
          )}
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Blockchain Proof */}
          <div className="bg-[#FFFFFF] border border-[#E8E2DA] rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#2E2A26] mb-4 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-[#2E2A26]" />
              Blockchain Proof
            </h3>
            {blockchainProof ? (
              <div className="space-y-4">
                <div className="p-3 bg-[#F0FAF5] border border-[#B3E4CC] rounded-lg flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#2D6A4F] shrink-0 mt-0.5" />
                  <p className="text-sm text-[#2D6A4F] font-medium">Verified on Ethereum Network</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#7B746E] uppercase tracking-wider mb-1">Transaction Hash</p>
                  <a href={blockchainProof.explorerUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-sm text-[#2D6A4F] hover:underline flex items-center gap-1 truncate break-all">
                    {blockchainProof.txHash}
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#7B746E] uppercase tracking-wider mb-1">Block Number</p>
                  <p className="text-sm text-[#2E2A26]">{blockchainProof.blockNumber}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#7B746E] uppercase tracking-wider mb-1">Timestamp</p>
                  <p className="text-sm text-[#2E2A26]">{formatDate(blockchainProof.timestamp)}</p>
                </div>
              </div>
            ) : (
              <div className="text-center p-4 bg-[#FAF8F4] rounded-lg border border-[#E8E2DA]">
                <p className="text-sm text-[#7B746E]">Blockchain notarization pending or unavailable.</p>
              </div>
            )}
          </div>

          {/* SHA-256 Hash */}
          <div className="bg-[#FFFFFF] border border-[#E8E2DA] rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#2E2A26] mb-4 flex items-center gap-2">
              <Hash className="w-5 h-5 text-[#2E2A26]" />
              Fingerprint
            </h3>
            <div>
              <p className="text-xs font-semibold text-[#7B746E] uppercase tracking-wider mb-2">SHA-256 Hash</p>
              <div className="bg-[#FAF8F4] p-3 rounded-lg border border-[#E8E2DA]">
                <p className="font-mono text-xs text-[#55504B] break-all">
                  {document.hash || 'Hash generation pending...'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

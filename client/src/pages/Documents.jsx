import React, { useState } from 'react';
import DocumentList from '../components/documents/DocumentList';
import DocumentHistory from '../components/documents/DocumentHistory';
import DocumentUpload from '../components/documents/DocumentUpload';
import { Plus, FileText, Clock } from 'lucide-react';

const Documents = () => {
  const [isUploadOpen, setUploadOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('vault'); // 'vault' | 'history'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-[#2D2A27] tracking-tight">Cryptographic Document Vault</h1>
          <p className="text-[13px] text-[#9B9490] mt-0.5">
            Manage, anchor, and inspect SHA-256 signatures stored on Polygon Amoy
          </p>
        </div>
        <button
          onClick={() => setUploadOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#2D6A4F] text-white text-[12px] font-semibold hover:bg-[#245741] transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E8E2DA] pb-1">
        <button
          onClick={() => setActiveTab('vault')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'vault'
              ? 'bg-[#2D6A4F] text-white shadow-xs'
              : 'bg-white text-[#55504B] border border-[#E8E2DA] hover:bg-[#F6F3EE]'
          }`}
        >
          <FileText className="w-4 h-4" />
          Vault Documents
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-[#2D6A4F] text-white shadow-xs'
              : 'bg-white text-[#55504B] border border-[#E8E2DA] hover:bg-[#F6F3EE]'
          }`}
        >
          <Clock className="w-4 h-4" />
          Scanned History
        </button>
      </div>

      {activeTab === 'vault' ? (
        <DocumentList />
      ) : (
        <DocumentHistory />
      )}

      <DocumentUpload isOpen={isUploadOpen} onClose={() => setUploadOpen(false)} />
    </div>
  );
};

export default Documents;

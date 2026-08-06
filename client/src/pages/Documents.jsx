import React, { useState } from 'react';
import DocumentList from '../components/documents/DocumentList';
import DocumentUpload from '../components/documents/DocumentUpload';
import { Plus } from 'lucide-react';

const Documents = () => {
  const [isUploadOpen, setUploadOpen] = useState(false);

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
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#2D6A4F] text-white text-[12px] font-semibold hover:bg-[#245741] transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      <DocumentList />
      <DocumentUpload isOpen={isUploadOpen} onClose={() => setUploadOpen(false)} />
    </div>
  );
};

export default Documents;

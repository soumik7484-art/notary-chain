import React, { useState } from 'react';
import { QrCode, Download, Copy, Check } from 'lucide-react';

export default function QRVerification({ hash, documentId, documentTitle }) {
  const [copied, setCopied] = useState(false);
  
  // Construct the verification URL based on the current origin if in browser, or a generic path
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://app.notarychain.com';
  const verifyUrl = `${baseUrl}/verify-hash?hash=${hash || ''}`;
  
  // Use QR Server API to generate the QR code
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verifyUrl)}&color=2E2A26&bgcolor=FAF8F4`;

  const handleCopy = () => {
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    // Open image in new tab to allow downloading
    window.open(qrImageUrl, '_blank');
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#E8E2DA] rounded-xl p-6 shadow-sm font-sans flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[#2E2A26] flex items-center gap-2">
          <QrCode className="w-5 h-5 text-[#2D6A4F]" />
          Verification QR
        </h3>
      </div>

      <div className="bg-[#FAF8F4] p-4 rounded-xl border border-[#E8E2DA] mb-4">
        <img src={qrImageUrl} alt="Verification QR Code" className="w-[160px] h-[160px]" />
      </div>

      <p className="text-[#55504B] text-sm font-medium mb-6 text-center">
        Scan to verify document authenticity
      </p>

      <div className="w-full space-y-3">
        <label className="block text-xs font-semibold text-[#7B746E] uppercase tracking-wider">Public Verification Link</label>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-[#FAF8F4] border border-[#E8E2DA] rounded-lg px-3 py-2 text-sm text-[#55504B] truncate">
            {verifyUrl}
          </div>
          <button
            onClick={handleCopy}
            className="p-2 text-[#55504B] border border-[#E8E2DA] rounded-lg hover:bg-[#FAF8F4] transition-colors shrink-0"
            title="Copy Link"
          >
            {copied ? <Check className="w-4 h-4 text-[#2D6A4F]" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        
        <button
          onClick={handleDownload}
          className="w-full mt-4 px-4 py-2 text-sm font-medium text-[#2D6A4F] bg-[#F0FAF5] border border-[#B3E4CC] rounded-lg hover:bg-green-50 flex items-center justify-center gap-2 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download QR Code
        </button>
      </div>
    </div>
  );
}

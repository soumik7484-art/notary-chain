import React from 'react';
import { motion } from 'framer-motion';
import { X, ExternalLink, QrCode, ShieldCheck, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PolygonscanQRModal({ txHash, contractAddress, onClose }) {
  const targetHash = txHash || '0x94827103ab68912efc48201a0b';
  const targetContract = contractAddress || '0x0000000000000000000000000000000000001010';
  const explorerUrl = txHash
    ? `https://amoy.polygonscan.com/tx/${targetHash}`
    : `https://amoy.polygonscan.com/address/${targetContract}`;

  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(explorerUrl)}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(explorerUrl);
    toast.success('Polygonscan link copied!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden p-5 space-y-4 text-center"
      >
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-gray-900">Polygonscan QR Verification</h3>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Code image */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl inline-block shadow-xs">
          <img src={qrApiUrl} alt="Polygonscan QR Code" className="w-40 h-40 mx-auto rounded-lg" />
        </div>

        <div>
          <p className="text-xs text-gray-500 font-medium">Scan with camera to view on-chain proof</p>
          <p className="font-mono text-[10px] text-gray-800 bg-gray-100 p-2 rounded-lg mt-2 break-all border border-gray-200">
            {explorerUrl}
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={copyUrl}
            className="flex-1 py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" /> Copy Link
          </button>
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Open
          </a>
        </div>
      </motion.div>
    </div>
  );
}

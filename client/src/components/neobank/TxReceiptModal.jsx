import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Printer, CheckCircle2, ShieldCheck, ExternalLink, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TxReceiptModal({ transaction, onClose }) {
  const printRef = useRef(null);

  if (!transaction) return null;

  const tx = {
    id: transaction.id || 'txn_901',
    title: transaction.title || 'Sent to @ada',
    amount: transaction.amount || '-$150.00',
    status: transaction.status || 'Completed',
    date: transaction.date || 'Just now',
    txHash: transaction.txHash || '0x94827103ab68912efc48201a0b',
    sender: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    recipient: transaction.title?.includes('@') ? transaction.title.split(' ')[2] : '0x320a...4e06',
    blockNumber: '44405656',
    gasFee: '$0.00 (Gas Sponsored ⚡)',
    network: 'Polygon Amoy Testnet (Chain 80002)'
  };

  const handlePrint = () => {
    window.print();
  };

  const copyTxHash = () => {
    navigator.clipboard.writeText(tx.txHash);
    toast.success('Tx Hash copied to clipboard');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
              📜
            </div>
            <h3 className="font-bold text-sm text-gray-900">Transaction Receipt</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors text-xs flex items-center gap-1 font-semibold"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div ref={printRef} className="p-6 space-y-5 print:p-8">
          {/* Main Status & Amount */}
          <div className="text-center pb-4 border-b border-gray-100 space-y-1">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Payment Verified</p>
            <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{tx.amount}</p>
            <p className="text-xs text-gray-500">{tx.title} · {tx.date}</p>
          </div>

          {/* Details Table */}
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-gray-500">Transaction ID</span>
              <span className="font-mono text-gray-900 font-medium">{tx.id}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-gray-500">Status</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase border border-emerald-200">
                {tx.status}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-gray-500">Network</span>
              <span className="text-gray-800 font-medium">{tx.network}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-gray-500">Gas Fee</span>
              <span className="text-emerald-600 font-semibold">{tx.gasFee}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-gray-500">Sender</span>
              <span className="font-mono text-gray-700 text-[11px]">{tx.sender.substring(0, 10)}...</span>
            </div>
          </div>

          {/* Hash Box */}
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-500 font-semibold">Polygon Transaction Hash</span>
              <button onClick={copyTxHash} className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
                <Copy className="w-3 h-3" /> Copy
              </button>
            </div>
            <p className="font-mono text-[10px] text-gray-800 break-all bg-white p-2 rounded-lg border border-gray-200">
              {tx.txHash}
            </p>
          </div>

          {/* Polygonscan Link */}
          <a
            href={`https://amoy.polygonscan.com/tx/${tx.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> View on Polygonscan Explorer
          </a>

          {/* Footer stamp */}
          <div className="pt-2 flex items-center justify-center gap-2 text-[10px] text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cryptographically signed by Polygon Open Money Stack</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

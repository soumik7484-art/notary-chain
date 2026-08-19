import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, AlertOctagon, CheckCircle2 } from 'lucide-react';

export default function TamperDetection({ originalHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', documentTitle = 'Document' }) {
  const [currentHash, setCurrentHash] = useState(originalHash);
  const [isTampered, setIsTampered] = useState(false);

  const handleTamper = () => {
    // Generate a slightly different hash to simulate tampering
    if (!originalHash || originalHash.length < 20) return;
    const tampered = originalHash.substring(0, 10) + 'f8a9d' + originalHash.substring(15, originalHash.length - 5) + '1b2c3';
    setCurrentHash(tampered);
    setIsTampered(true);
  };

  const handleReset = () => {
    setCurrentHash(originalHash);
    setIsTampered(false);
  };

  const isMatch = currentHash === originalHash;

  // Render characters with highlighting for differences
  const renderHash = (hashToRender, compareTo) => {
    if (!hashToRender) return null;
    return hashToRender.split('').map((char, index) => {
      const isDiff = char !== compareTo[index];
      return (
        <span
          key={index}
          className={`${isDiff ? 'bg-[#DC2626] text-white' : 'text-[#55504B]'} font-mono text-xs md:text-sm px-[1px]`}
        >
          {char}
        </span>
      );
    });
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#E8E2DA] rounded-xl p-6 shadow-sm font-sans">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-[#2E2A26]">Tamper Detection</h3>
        <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${isMatch ? 'bg-[#F0FAF5] text-[#2D6A4F] border border-[#B3E4CC]' : 'bg-red-50 text-[#DC2626] border border-red-200'}`}>
          {isMatch ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertOctagon className="w-3.5 h-3.5" />}
          {isMatch ? 'MATCH' : 'MISMATCH'}
        </div>
      </div>

      {!isMatch && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
        >
          <AlertOctagon className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-[#DC2626]">DOCUMENT INTEGRITY FAILED</h4>
            <p className="text-sm text-red-800 mt-1">
              The current document hash does not match the original hash recorded on the blockchain. This indicates the file has been modified, corrupted, or tampered with since it was notarized.
            </p>
          </div>
        </motion.div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-semibold text-[#7B746E] uppercase tracking-wider mb-2">Original Hash (Blockchain)</label>
          <div className="bg-[#FAF8F4] p-3 rounded-lg border border-[#E8E2DA] break-all">
            {renderHash(originalHash, currentHash)}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#7B746E] uppercase tracking-wider mb-2">Current Hash (Local File)</label>
          <div className={`p-3 rounded-lg border break-all transition-colors ${!isMatch ? 'bg-red-50 border-red-200' : 'bg-[#FAF8F4] border-[#E8E2DA]'}`}>
            {renderHash(currentHash, originalHash)}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={handleReset}
          disabled={isMatch}
          className="px-4 py-2 text-sm font-medium text-[#55504B] bg-white border border-[#E8E2DA] rounded-lg hover:bg-[#FAF8F4] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Reset
        </button>
        <button
          onClick={handleTamper}
          disabled={!isMatch}
          className="px-4 py-2 text-sm font-medium text-white bg-[#2E2A26] rounded-lg hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Simulate Tampering
        </button>
      </div>
    </div>
  );
}

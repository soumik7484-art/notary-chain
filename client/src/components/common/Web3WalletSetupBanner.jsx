import React, { useState } from 'react';
import { Wallet, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Web3WalletModal from './Web3WalletModal';

const Web3WalletSetupBanner = () => {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  const walletAddr = user?.walletAddress || localStorage.getItem('web3_connected_wallet') || '';

  if (walletAddr) return null;

  return (
    <>
      <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-300 text-amber-800 flex items-center justify-center font-bold shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-amber-950">Action Required: Link Polygon Web3 Wallet</h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/60 text-amber-900 uppercase tracking-wider">Setup Required</span>
            </div>
            <p className="text-xs text-amber-800 mt-0.5 max-w-2xl">
              Your account is not connected to a Web3 wallet. Connect your MetaMask wallet or paste your Polygon address to display your live balance and sign on-chain notarization proofs.
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm shrink-0"
        >
          <Wallet className="w-4 h-4" /> Link Web3 Wallet <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <Web3WalletModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};

export default Web3WalletSetupBanner;

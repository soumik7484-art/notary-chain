import React, { useState, useEffect } from 'react';
import { Wallet, RefreshCw, PlusCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Web3WalletModal, { getLivePolygonBalance } from './Web3WalletModal';

const Web3WalletBadge = () => {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [balance, setBalance] = useState({ balancePol: '0.0000', balanceUsdc: '0.00' });
  const [loading, setLoading] = useState(false);

  const walletAddr = user?.walletAddress || localStorage.getItem('web3_connected_wallet') || '';

  const loadBalance = async () => {
    if (!walletAddr) return;
    setLoading(true);
    const b = await getLivePolygonBalance(walletAddr);
    setBalance(b);
    setLoading(false);
  };

  useEffect(() => {
    if (walletAddr) {
      loadBalance();
    }
  }, [walletAddr]);

  if (!walletAddr) {
    return (
      <>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold transition-all shadow-2xs"
          title="Click to connect Web3 Wallet"
        >
          <Wallet className="w-3.5 h-3.5 text-amber-600" />
          <span className="hidden sm:inline">Connect Web3 Wallet</span>
          <span className="sm:hidden">Wallet</span>
          <PlusCircle className="w-3 h-3 text-amber-600" />
        </button>

        <Web3WalletModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSaveSuccess={() => {
            setModalOpen(false);
            loadBalance();
          }}
        />
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F0FAF5] hover:bg-[#E2F7ED] border border-[#B3E4CC] text-[#2D6A4F] text-xs font-semibold transition-all shadow-2xs group"
        title="View Web3 Wallet & Live Balance"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <code className="font-mono font-bold text-[11px] text-[#1B4332]">
          {walletAddr.substring(0, 6)}...{walletAddr.slice(-4)}
        </code>
        <span className="hidden md:inline text-[11px] font-bold px-1.5 py-0.5 rounded bg-white border border-[#B3E4CC]">
          {loading ? '...' : `${balance.balancePol} POL`}
        </span>
      </button>

      <Web3WalletModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaveSuccess={() => loadBalance()}
      />
    </>
  );
};

export default Web3WalletBadge;

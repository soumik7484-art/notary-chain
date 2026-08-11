import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { BalanceCard } from './Neobank';
import { getLivePolygonBalance } from '../components/common/Web3WalletModal';
import { Wallet as WalletIcon } from 'lucide-react';

const Wallet = () => {
  const { user } = useAuth();
  const [account, setAccount] = useState(null);
  const [liveBal, setLiveBal] = useState(null);
  const [syncing, setSyncing] = useState(false);

  const fetchRealBalance = async () => {
    setSyncing(true);
    try {
      const activeWallet = (window.ethereum && window.ethereum.selectedAddress) || user?.walletAddress || localStorage.getItem('web3_connected_wallet');
      if (activeWallet) {
        const bal = await getLivePolygonBalance(activeWallet);
        setLiveBal(bal);
      }
    } catch (e) {
      console.error('Wallet balance fetch error:', e);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchRealBalance();
    if (window.ethereum) {
      const handleAccounts = () => fetchRealBalance();
      window.ethereum.on('accountsChanged', handleAccounts);
      return () => window.ethereum.removeListener('accountsChanged', handleAccounts);
    }
  }, [user]);

  const handleConnectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        fetchRealBalance();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pt-2 pb-10">
      <div>
        <h1 className="text-[22px] font-bold text-[#2D2A27] tracking-tight flex items-center gap-2.5">
          <WalletIcon className="w-6 h-6 text-[#2D6A4F]" />
          Web3 Wallet Balance
        </h1>
        <p className="text-[13px] text-[#9B9490] mt-0.5">
          Live Web3 wallet balance, currency conversions, and cryptographic address details
        </p>
      </div>

      <div className="shadow-xs rounded-2xl overflow-hidden">
        <BalanceCard
          account={account}
          liveBal={liveBal}
          syncing={syncing}
          fetchRealBalance={fetchRealBalance}
          handleConnectWallet={handleConnectWallet}
        />
      </div>
    </div>
  );
};

export default Wallet;

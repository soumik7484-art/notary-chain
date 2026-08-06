import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import IPhoneFrame from '../components/neobank/IPhoneFrame';
import HomeScreen from '../components/neobank/HomeScreen';
import CashInScreen from '../components/neobank/CashInScreen';
import SendScreen from '../components/neobank/SendScreen';
import DepositScreen from '../components/neobank/DepositScreen';
import WithdrawScreen from '../components/neobank/WithdrawScreen';
import HistoryScreen from '../components/neobank/HistoryScreen';
import KycScreen from '../components/neobank/KycScreen';
import { getNeobankAccount } from '../api/neobankApi';

export default function Neobank() {
  const [activeTab, setActiveTab] = useState('home');
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAccount = async () => {
    try {
      const res = await getNeobankAccount();
      setAccount(res.data);
    } catch (err) {
      // Fallback state
      setAccount({
        balance: '2,450.00',
        walletAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
        customerId: 'cst_demo881',
        walletId: 'wlt_demo991',
        kycStatus: 'ACTIVE'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccount();
  }, []);

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen account={account} onNavigate={(tab) => setActiveTab(tab)} />;
      case 'cash-in':
        return <CashInScreen account={account} />;
      case 'send':
        return <SendScreen account={account} onComplete={() => { fetchAccount(); setActiveTab('home'); }} />;
      case 'deposit':
        return <DepositScreen account={account} />;
      case 'withdraw':
        return <WithdrawScreen account={account} />;
      case 'history':
        return <HistoryScreen />;
      case 'kyc':
        return <KycScreen account={account} onComplete={() => { fetchAccount(); setActiveTab('home'); }} />;
      default:
        return <HomeScreen account={account} onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F4] flex flex-col items-center justify-center p-4 text-[#2E2A26]">
      <div className="text-center max-w-lg mb-4">
        <h1 className="font-display text-2xl font-bold text-[#2E2A26] tracking-tight flex items-center justify-center gap-2">
          <span>Polygon Open Money Stack</span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#F0FAF5] text-[#2D6A4F] text-xs font-mono border border-[#B3E4CC]">
            v0.11 Sandbox
          </span>
        </h1>
        <p className="text-xs text-[#7B746E] mt-1 font-medium">
          Interactive Neobank • Custodial USDC Wallets • In-Person Cash-In • Instant P2P Transfers
        </p>
      </div>

      {/* iPhone Device Frame Container */}
      <IPhoneFrame activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2 }}
            className="flex-1"
          >
            {renderActiveScreen()}
          </motion.div>
        </AnimatePresence>
      </IPhoneFrame>
    </div>
  );
}

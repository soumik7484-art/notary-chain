import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import IPhoneFrame from './IPhoneFrame';
import HomeScreen from './HomeScreen';
import CashInScreen from './CashInScreen';
import SendScreen from './SendScreen';
import DepositScreen from './DepositScreen';
import WithdrawScreen from './WithdrawScreen';
import HistoryScreen from './HistoryScreen';
import KycScreen from './KycScreen';
import { getNeobankAccount } from '../../api/neobankApi';

export default function InteractiveNeobankPhone({ className = '' }) {
  const [activeTab, setActiveTab] = useState('home');
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch real account & balance from backend API
  const fetchAccount = async () => {
    try {
      setLoading(true);
      const res = await getNeobankAccount();
      if (res && res.data) {
        setAccount(res.data);
      }
    } catch (err) {
      console.warn('Unable to fetch live neobank account, using local session state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccount();
  }, []);

  // When any money transaction succeeds (Send, Cash-In, Payout)
  const handleTransactionCompleted = async () => {
    await fetchAccount();
    setActiveTab('home');
  };

  const renderActiveScreen = () => {
    if (loading && !account) {
      return (
        <div className="flex items-center justify-center h-full p-8 text-[#52796F]">
          <div className="w-8 h-8 border-3 border-[#2D6A4F] border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    switch (activeTab) {
      case 'home':
        return <HomeScreen account={account} onNavigate={(tab) => setActiveTab(tab)} />;
      case 'cash-in':
        return <CashInScreen account={account} onComplete={handleTransactionCompleted} />;
      case 'send':
        return <SendScreen account={account} onComplete={handleTransactionCompleted} />;
      case 'deposit':
        return <DepositScreen account={account} />;
      case 'withdraw':
        return <WithdrawScreen account={account} onComplete={handleTransactionCompleted} />;
      case 'history':
        return <HistoryScreen transactions={account?.transactions} />;
      case 'kyc':
        return <KycScreen account={account} onComplete={handleTransactionCompleted} />;
      default:
        return <HomeScreen account={account} onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className={`relative ${className}`}>
      <IPhoneFrame activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2 }}
            className="flex-1 min-h-[500px]"
          >
            {renderActiveScreen()}
          </motion.div>
        </AnimatePresence>
      </IPhoneFrame>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import IPhoneFrame from './IPhoneFrame';
import HomeScreen from './HomeScreen';
import { getNeobankAccount } from '../../api/neobankApi';

export default function InteractiveNeobankPhone({ className = '' }) {
  const navigate = useNavigate();
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
      console.warn('Unable to fetch live neobank account:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccount();
  }, []);

  const handleOpenNeobank = (actionOrEvent) => {
    let action = 'home';
    if (typeof actionOrEvent === 'string') {
      action = actionOrEvent;
    }
    navigate(`/neobank${action && action !== 'home' ? `?action=${action}` : ''}`);
  };

  return (
    <div
      onClick={() => handleOpenNeobank('home')}
      className={`relative cursor-pointer group transition-transform hover:scale-[1.01] active:scale-[0.99] ${className}`}
      title="Click to open Polygon Neobank"
    >
      <IPhoneFrame activeTab="home" onTabChange={(tab) => handleOpenNeobank(tab)}>
        <div className="flex-1 min-h-[500px]">
          <HomeScreen account={account} onNavigate={(screen) => handleOpenNeobank(screen)} />
        </div>
      </IPhoneFrame>
    </div>
  );
}

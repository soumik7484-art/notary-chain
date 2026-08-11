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

  const handleOpenNeobank = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    navigate('/neobank');
  };

  return (
    <div
      onClick={handleOpenNeobank}
      className={`relative cursor-pointer group transition-transform hover:scale-[1.01] active:scale-[0.99] ${className}`}
      title="Click to open Polygon Neobank"
    >
      <IPhoneFrame activeTab="home" onTabChange={handleOpenNeobank}>
        <div className="flex-1 min-h-[500px]">
          <HomeScreen account={account} onNavigate={handleOpenNeobank} />
        </div>
      </IPhoneFrame>
    </div>
  );
}

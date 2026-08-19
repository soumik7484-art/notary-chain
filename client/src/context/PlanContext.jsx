import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PLANS } from '../utils/planConfig';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';

const PlanContext = createContext(null);

function getUserStorageKey(user) {
  const uId = user?._id || user?.id || user?.email || 'guest';
  return `notarychain_user_quota_${uId}`;
}

export function PlanProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  
  const [quotaData, setQuotaData] = useState({
    plan: 'FREE',
    verificationCount: 0,
    verificationLimit: 3,
    remaining: 3,
    isUnlimited: false,
    isAtLimit: false,
    canVerify: true,
    currentPeriodStart: new Date().toISOString(),
    currentPeriodEnd: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  });
  const [loading, setLoading] = useState(false);

  // Fetch authoritative quota from server for this specific user account
  const fetchQuota = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setQuotaData({
        plan: 'FREE',
        verificationCount: 0,
        verificationLimit: 3,
        remaining: 3,
        isUnlimited: false,
        isAtLimit: false,
        canVerify: true,
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/users/quota');
      const data = res.data?.data || res.data;
      if (data) {
        setQuotaData(data);
        // Cache locally strictly scoped by user ID
        localStorage.setItem(getUserStorageKey(user), JSON.stringify(data));
      }
    } catch (err) {
      // Fallback to user-scoped local cache
      const cached = localStorage.getItem(getUserStorageKey(user));
      if (cached) {
        try {
          setQuotaData(JSON.parse(cached));
        } catch {}
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // When user changes (User A logs out, User B logs in), reload their specific quota
  useEffect(() => {
    fetchQuota();
  }, [fetchQuota]);

  const currentPlanKey = (quotaData.plan || 'FREE').toUpperCase();
  const currentPlan = PLANS[currentPlanKey] || PLANS.FREE;
  const verificationsUsed = quotaData.verificationCount || 0;
  const verificationsLimit = quotaData.verificationLimit ?? (currentPlanKey === 'FREE' ? 3 : -1);
  const isUnlimited = currentPlanKey !== 'FREE' || verificationsLimit === -1;
  const isAtLimit = !isUnlimited && verificationsUsed >= verificationsLimit;
  const usagePercentage = isUnlimited ? 0 : Math.min((verificationsUsed / verificationsLimit) * 100, 100);
  const remainingCount = isUnlimited ? 'Unlimited' : Math.max(0, verificationsLimit - verificationsUsed);

  const incrementUsage = useCallback(async () => {
    // Optimistic local update
    setQuotaData(prev => {
      const nextCount = prev.verificationCount + 1;
      const nextRemaining = prev.isUnlimited ? 'Unlimited' : Math.max(0, prev.verificationLimit - nextCount);
      const updated = {
        ...prev,
        verificationCount: nextCount,
        remaining: nextRemaining,
        isAtLimit: !prev.isUnlimited && nextCount >= prev.verificationLimit,
        canVerify: prev.isUnlimited || nextCount < prev.verificationLimit
      };
      if (user) {
        localStorage.setItem(getUserStorageKey(user), JSON.stringify(updated));
      }
      return updated;
    });
    // Sync with server
    await fetchQuota();
  }, [fetchQuota, user]);

  const canVerify = useCallback(() => {
    if (isUnlimited) return true;
    return verificationsUsed < verificationsLimit;
  }, [isUnlimited, verificationsUsed, verificationsLimit]);

  const upgradePlan = useCallback(async (planKey = 'PRO') => {
    const pKey = planKey.toUpperCase();
    try {
      const res = await api.post('/users/upgrade-plan', { plan: pKey });
      const data = res.data?.data || res.data;
      if (data) {
        setQuotaData(data);
        if (user) {
          localStorage.setItem(getUserStorageKey(user), JSON.stringify(data));
        }
      }
    } catch (err) {
      // Offline fallback for demo
      setQuotaData(prev => ({
        ...prev,
        plan: pKey,
        verificationLimit: pKey === 'FREE' ? 10 : -1,
        isUnlimited: pKey !== 'FREE',
        isAtLimit: false,
        canVerify: true,
        remaining: 'Unlimited'
      }));
    }
  }, [user]);

  const value = {
    currentPlan,
    currentPlanKey,
    verificationsUsed,
    verificationsLimit,
    remainingCount,
    isUnlimited,
    isAtLimit,
    canVerify,
    usagePercentage,
    resetDate: quotaData.currentPeriodEnd,
    incrementUsage,
    upgradePlan,
    fetchQuota,
    loading
  };

  return (
    <PlanContext.Provider value={value}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error('usePlan must be used within a PlanProvider');
  }
  return context;
}

export default PlanContext;

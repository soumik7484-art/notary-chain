import React from 'react';
import { motion } from 'framer-motion';
import { HiCheckCircle, HiArrowUpRight, HiArrowDownLeft, HiQrCode, HiOutlineBuildingLibrary } from 'react-icons/hi2';

import { useAuth } from '../../hooks/useAuth';

export default function HomeScreen({ account, onNavigate, liveBal }) {
  const { user } = useAuth();
  const activeAddr = user?.walletAddress || localStorage.getItem('web3_connected_wallet') || account?.walletAddress || '';
  const displayAddr = activeAddr ? `${activeAddr.substring(0, 6)}...${activeAddr.slice(-4)}` : 'Not Connected';

  const transactions = activeAddr
    ? (account?.web3Transactions || [])
    : (account?.transactions || []);

  return (
    <div className="p-4 space-y-5">
      {/* Header Profile Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-600 to-violet-500 flex items-center justify-center font-bold text-white shadow-md">
            {user?.name?.charAt(0) || 'NB'}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">{user?.name || 'Polygon Neobank'}</h2>
            <div className="flex items-center space-x-1 text-[11px] text-emerald-400">
              <HiCheckCircle className="w-3.5 h-3.5" />
              <span>{activeAddr ? `Web3 Connected · ${liveBal?.networkName || 'Polygon Testnet'}` : 'KYC Active • Custodial OMS'}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => onNavigate('kyc')}
          className="px-2.5 py-1 text-xs rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          KYC Info
        </button>
      </div>

      {/* Main Balance Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-900/90 via-slate-900 to-violet-950/90 p-5 border border-primary-500/30 shadow-xl"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between text-xs text-primary-200">
          <span>USD Balance (Settled in USDC)</span>
          <span className="px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-300 text-[10px] font-mono border border-primary-400/30">
            {liveBal?.networkName || 'Polygon Network'}
          </span>
        </div>

        <div className="mt-2 flex items-baseline space-x-1">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            ${activeAddr ? '0.00' : (account?.balance || '2,450.00')}
          </span>
          <span className="text-xs text-slate-400 font-mono">USD</span>
        </div>

        {/* Custodial / Web3 Wallet Details */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
          <div className="truncate max-w-[210px] font-mono text-slate-400">
            Addr: {displayAddr}
          </div>
          <span className="text-emerald-400 text-[10px] bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
            Gas Sponsored ⚡
          </span>
        </div>
      </motion.div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => onNavigate('send')}
          className="flex flex-col items-center p-3 rounded-xl bg-slate-900/80 border border-white/5 hover:border-primary-500/40 transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-primary-500/10 text-primary-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <HiArrowUpRight className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-medium text-slate-300 mt-1.5">Send</span>
        </button>

        <button
          onClick={() => onNavigate('cash-in')}
          className="flex flex-col items-center p-3 rounded-xl bg-slate-900/80 border border-white/5 hover:border-emerald-500/40 transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <HiQrCode className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-medium text-slate-300 mt-1.5">Cash-In</span>
        </button>

        <button
          onClick={() => onNavigate('deposit')}
          className="flex flex-col items-center p-3 rounded-xl bg-slate-900/80 border border-white/5 hover:border-violet-500/40 transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-violet-500/10 text-violet-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <HiOutlineBuildingLibrary className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-medium text-slate-300 mt-1.5">Top-Up</span>
        </button>

        <button
          onClick={() => onNavigate('withdraw')}
          className="flex flex-col items-center p-3 rounded-xl bg-slate-900/80 border border-white/5 hover:border-amber-500/40 transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <HiArrowDownLeft className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-medium text-slate-300 mt-1.5">Payout</span>
        </button>
      </div>

      {/* Virtual Account Bank Banner */}
      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-primary-500/20 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-primary-500/20 text-primary-400 flex items-center justify-center text-lg">
            🏦
          </div>
          <div>
            <div className="text-xs font-semibold text-white">US Bank Virtual Account</div>
            <div className="text-[10px] text-slate-400">ACH & Wire auto-converts to USDC</div>
          </div>
        </div>
        <button
          onClick={() => onNavigate('deposit')}
          className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-500 transition-colors"
        >
          View Info
        </button>
      </div>

      {/* Recent Activity Live Feed */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-slate-300">Recent Transactions</h3>
          <button onClick={() => onNavigate('history')} className="text-[11px] text-primary-400 hover:underline">
            View All
          </button>
        </div>

        <div className="space-y-2">
          {transactions.slice(0, 4).map((tx) => (
            <div key={tx.id} className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 text-base flex items-center justify-center">
                  {tx.icon === 'send' ? '💸' : tx.icon === 'cash' ? '🏪' : tx.icon === 'bank' ? '🏦' : '📥'}
                </div>
                <div>
                  <div className="text-xs font-medium text-white">{tx.title}</div>
                  <div className="text-[10px] text-slate-400">{tx.date}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-xs font-bold ${tx.amount.startsWith('+') ? 'text-emerald-400' : 'text-slate-200'}`}>
                  {tx.amount}
                </div>
                <div className="text-[10px] text-slate-400">{tx.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

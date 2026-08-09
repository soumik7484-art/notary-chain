import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HiArrowDownLeft, HiOutlineBuildingLibrary, HiCheck } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { withdrawToBank } from '../../api/neobankApi';

export default function WithdrawScreen({ account }) {
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!amount || !accountNumber) {
      toast.error('Please enter withdrawal amount and account details');
      return;
    }

    const availableBal = parseFloat((account?.balance || '0.00').toString().replace(/,/g, '')) || 0;
    const numAmount = parseFloat(amount) || 0;

    if (availableBal <= 0) {
      toast.error(`Insufficient balance. You have $${availableBal.toFixed(2)} available.`);
      return;
    }

    if (numAmount > availableBal) {
      toast.error(`Insufficient balance. You have $${availableBal.toFixed(2)} available.`);
      return;
    }

    setLoading(true);
    try {
      const res = await withdrawToBank(amount, accountNumber, routingNumber);
      setResult(res.data);
      toast.success(`Bank payout of $${amount} initiated!`);
      if (onComplete) onComplete(res.data);
    } catch (err) {
      toast.error('Payout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-lg">
          🏦
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Bank Payout / Cash-Out</h2>
          <p className="text-[10px] text-slate-400">Withdraw USDC to external US bank account</p>
        </div>
      </div>

      {!result ? (
        <form onSubmit={handleWithdraw} className="space-y-3.5">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-white/10 space-y-1">
            <label className="block text-xs font-medium text-slate-300">Bank Routing Number</label>
            <input
              type="text"
              placeholder="021000021 (9 digits)"
              value={routingNumber}
              onChange={(e) => setRoutingNumber(e.target.value)}
              required
              className="w-full py-1.5 bg-transparent text-white font-mono text-xs focus:outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-white/10 space-y-1">
            <label className="block text-xs font-medium text-slate-300">Bank Account Number</label>
            <input
              type="text"
              placeholder="Account Number (Checking/Savings)"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
              className="w-full py-1.5 bg-transparent text-white font-mono text-xs focus:outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-white/10 space-y-1">
            <div className="flex justify-between items-center text-xs">
              <label className="font-medium text-slate-300">Payout Amount (USD)</label>
              <span className="text-[10px] text-slate-400">Available: ${account?.balance || '0.00'}</span>
            </div>
            <div className="relative flex items-center">
              <span className="text-slate-400 text-lg font-bold mr-1.5">$</span>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="5"
                step="0.01"
                required
                className="w-full py-1 bg-transparent text-white font-extrabold text-2xl focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 text-white font-semibold text-xs shadow-lg shadow-amber-500/20 hover:opacity-95 transition-all flex items-center justify-center space-x-2"
          >
            <HiArrowDownLeft className="w-4 h-4" />
            <span>{loading ? 'Processing Payout...' : 'Initiate Bank Payout'}</span>
          </button>
        </form>
      ) : (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-5 rounded-2xl bg-slate-900 border border-amber-500/30 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-3xl mx-auto">
            ✓
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Bank Payout Initiated!</h3>
            <div className="text-2xl font-extrabold text-amber-400 mt-1">${result.amount} USD</div>
            <p className="text-xs text-slate-400 mt-1">Arriving via ACH to account ending in ****{accountNumber.slice(-4)}</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 text-left font-mono text-[11px] space-y-1 text-slate-400 border border-white/5">
            <div><span className="text-slate-500">Payout ID:</span> {result.payoutId || 'txn_payout_881'}</div>
            <div><span className="text-slate-500">Est. Arrival:</span> 1-2 Business Days</div>
            <div><span className="text-slate-500">Rail:</span> Polygon OMS Crypto-to-Fiat</div>
          </div>

          <button
            onClick={() => setResult(null)}
            className="w-full py-2.5 rounded-xl bg-slate-800 text-xs text-white hover:bg-slate-700 transition-colors"
          >
            Done
          </button>
        </motion.div>
      )}
    </div>
  );
}

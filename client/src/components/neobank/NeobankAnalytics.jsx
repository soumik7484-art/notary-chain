import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, TrendingUp, Calendar, Zap, ShieldCheck } from 'lucide-react';

const WEEKLY_DATA = [
  { day: 'Mon', in: 500,  out: 120 },
  { day: 'Tue', in: 0,    out: 45  },
  { day: 'Wed', in: 1200, out: 310 },
  { day: 'Thu', in: 250,  out: 85  },
  { day: 'Fri', in: 0,    out: 150 },
  { day: 'Sat', in: 600,  out: 90  },
  { day: 'Sun', in: 0,    out: 40  },
];

export default function NeobankAnalytics() {
  const [timeframe, setTimeframe] = useState('7d');
  const maxVal = 1300;

  const totalIn  = WEEKLY_DATA.reduce((acc, d) => acc + d.in, 0);
  const totalOut = WEEKLY_DATA.reduce((acc, d) => acc + d.out, 0);
  const netFlow  = totalIn - totalOut;

  return (
    <div className="p-6 bg-white space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Financial Analytics
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Polygon OMS Ledger · Inflows & Outflows</p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
          {['7d', '30d', '90d'].map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg uppercase transition-all ${
                timeframe === tf
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mb-1">
            <ArrowDownLeft className="w-3.5 h-3.5" /> Total Inflow
          </div>
          <p className="text-lg font-extrabold text-emerald-900">+${totalIn.toLocaleString()}.00</p>
          <span className="text-[10px] text-emerald-600 font-mono">7 transactions</span>
        </div>

        <div className="p-3.5 rounded-xl bg-red-50/70 border border-red-200">
          <div className="flex items-center gap-1.5 text-xs text-red-700 font-semibold mb-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Total Outflow
          </div>
          <p className="text-lg font-extrabold text-red-900">-${totalOut.toLocaleString()}.00</p>
          <span className="text-[10px] text-red-600 font-mono">5 transactions</span>
        </div>

        <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200">
          <div className="flex items-center gap-1.5 text-xs text-blue-700 font-semibold mb-1">
            <Zap className="w-3.5 h-3.5" /> Net Balance Growth
          </div>
          <p className="text-lg font-extrabold text-blue-900">+${netFlow.toLocaleString()}.00</p>
          <span className="text-[10px] text-blue-600 font-mono">Polygon Gas Free ⚡</span>
        </div>
      </div>

      {/* Visual Bar Chart */}
      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
          <span>Weekly Cash Flow Breakdown</span>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Inflow
            </span>
            <span className="flex items-center gap-1 text-red-700 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" /> Outflow
            </span>
          </div>
        </div>

        {/* Chart Bars */}
        <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-gray-200">
          {WEEKLY_DATA.map((d) => {
            const inPct  = Math.round((d.in / maxVal) * 100);
            const outPct = Math.round((d.out / maxVal) * 100);

            return (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                <div className="w-full flex items-end justify-center gap-1.5 h-full">
                  {/* Inflow bar */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(inPct, 4)}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="w-3.5 bg-emerald-500 rounded-t-md group-hover:bg-emerald-600 transition-colors relative"
                  >
                    {d.in > 0 && (
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1 rounded shadow-xs pointer-events-none whitespace-nowrap">
                        +${d.in}
                      </span>
                    )}
                  </motion.div>
                  {/* Outflow bar */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(outPct, 4)}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="w-3.5 bg-red-400 rounded-t-md group-hover:bg-red-500 transition-colors relative"
                  >
                    {d.out > 0 && (
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-red-700 bg-red-100 px-1 rounded shadow-xs pointer-events-none whitespace-nowrap">
                        -${d.out}
                      </span>
                    )}
                  </motion.div>
                </div>
                <span className="text-[10px] text-gray-500 font-semibold">{d.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security & Ledger status */}
      <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-gray-700">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>All transactions settled in USDC on Polygon Amoy testnet.</span>
        </div>
        <span className="text-[10px] font-mono text-gray-400">Chain ID: 80002</span>
      </div>
    </div>
  );
}

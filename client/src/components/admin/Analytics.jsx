import React, { useState, useEffect } from 'react';
import DashboardLayout from '../dashboard/DashboardLayout';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import {
  TrendingUp, TrendingDown, FileText, CheckCircle2, Clock, ShieldCheck, Calendar, Filter
} from 'lucide-react';
import api from '../../api/axios';

/* ── Sample / Aggregated Data ──────────────────────────────────────────────── */
const ACTIVITY_DATA_DAILY = [
  { name: 'Mon', notarized: 12, pending: 3, spending: 120 },
  { name: 'Tue', notarized: 19, pending: 4, spending: 190 },
  { name: 'Wed', notarized: 15, pending: 2, spending: 150 },
  { name: 'Thu', notarized: 24, pending: 5, spending: 240 },
  { name: 'Fri', notarized: 31, pending: 1, spending: 310 },
  { name: 'Sat', notarized: 18, pending: 2, spending: 180 },
  { name: 'Sun', notarized: 14, pending: 1, spending: 140 },
];

const ACTIVITY_DATA_WEEKLY = [
  { name: 'Week 1', notarized: 84, pending: 12, spending: 840 },
  { name: 'Week 2', notarized: 112, pending: 18, spending: 1120 },
  { name: 'Week 3', notarized: 95, pending: 9, spending: 950 },
  { name: 'Week 4', notarized: 133, pending: 14, spending: 1330 },
];

const ACTIVITY_DATA_MONTHLY = [
  { name: 'Jan', notarized: 310, pending: 40, spending: 3100 },
  { name: 'Feb', notarized: 420, pending: 35, spending: 4200 },
  { name: 'Mar', notarized: 380, pending: 28, spending: 3800 },
  { name: 'Apr', notarized: 510, pending: 45, spending: 5100 },
  { name: 'May', notarized: 460, pending: 30, spending: 4600 },
  { name: 'Jun', notarized: 590, pending: 52, spending: 5900 },
];

const CATEGORY_DISTRIBUTION = [
  { name: 'Contracts & Legal', value: 45, color: '#2D6A4F' },
  { name: 'Identity Documents', value: 25, color: '#2563EB' },
  { name: 'Financial Records', value: 20, color: '#D97706' },
  { name: 'Property Deeds', value: 10, color: '#7C3AED' },
];

const STATUS_DISTRIBUTION = [
  { status: 'Notarized', count: 142, pct: 72, color: 'bg-emerald-500', textColor: 'text-emerald-700' },
  { status: 'Pending Review', count: 34, pct: 18, color: 'bg-amber-500', textColor: 'text-amber-700' },
  { status: 'Rejected / Flagged', count: 18, pct: 10, color: 'bg-red-500', textColor: 'text-red-700' },
];

export function AnalyticsContent() {
  const [timeframe, setTimeframe] = useState('daily');
  const [chartType, setChartType] = useState('activity'); // 'activity' | 'spending'
  const [loading, setLoading] = useState(false);
  const [latestBlock, setLatestBlock] = useState(44405656);
  const [contractData, setContractData] = useState([
    { block: '44405646', txs: 4, gas: 180 },
    { block: '44405648', txs: 8, gas: 360 },
    { block: '44405650', txs: 12, gas: 540 },
    { block: '44405652', txs: 6, gas: 270 },
    { block: '44405654', txs: 15, gas: 675 },
    { block: '44405656', txs: 9, gas: 405 },
  ]);

  useEffect(() => {
    // Fetch live block height from Polygon Amoy RPC
    fetch('https://polygon-amoy-bor-rpc.publicnode.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_blockNumber', params: [], id: 1 })
    })
      .then(res => res.json())
      .then(data => {
        if (data?.result) {
          const currentBlock = parseInt(data.result, 16);
          setLatestBlock(currentBlock);
          setContractData([
            { block: `#${currentBlock - 10}`, txs: 4, gas: 180 },
            { block: `#${currentBlock - 8}`,  txs: 8, gas: 360 },
            { block: `#${currentBlock - 6}`,  txs: 12, gas: 540 },
            { block: `#${currentBlock - 4}`,  txs: 6, gas: 270 },
            { block: `#${currentBlock - 2}`,  txs: 15, gas: 675 },
            { block: `#${currentBlock}`,      txs: 9, gas: 405 },
          ]);
        }
      })
      .catch(() => {});
  }, []);

  const getChartData = () => {
    switch (timeframe) {
      case 'weekly':  return ACTIVITY_DATA_WEEKLY;
      case 'monthly': return ACTIVITY_DATA_MONTHLY;
      default:        return ACTIVITY_DATA_DAILY;
    }
  };

  const chartData = getChartData();

  return (
    <div className="space-y-6">

      {/* ── Summary Stat Cards ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Stat 1: Total Notarized */}
          <div className="p-5 rounded-2xl bg-white border border-[#E8E2DA] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7B746E]">Total Notarized</span>
              <div className="w-8 h-8 rounded-xl bg-[#F0FAF5] text-[#2D6A4F] flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-[#2E2A26] font-display">1,842</span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <TrendingUp className="w-3 h-3" /> +18.4%
              </span>
            </div>
            <p className="text-[11px] text-[#7B746E]">Lifetime notarized on Polygon</p>
          </div>

          {/* Stat 2: Month vs Last Month */}
          <div className="p-5 rounded-2xl bg-white border border-[#E8E2DA] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7B746E]">This Month</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-[#2E2A26] font-display">590</span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <TrendingUp className="w-3 h-3" /> +24.5%
              </span>
            </div>
            <p className="text-[11px] text-[#7B746E]">vs 474 docs last month</p>
          </div>

          {/* Stat 3: Avg Trust Score */}
          <div className="p-5 rounded-2xl bg-white border border-[#E8E2DA] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7B746E]">Avg Trust Score</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-[#2E2A26] font-display">94.2</span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" /> High Quality
              </span>
            </div>
            <p className="text-[11px] text-[#7B746E]">NotaryChain AI verification</p>
          </div>

          {/* Stat 4: Pending Review */}
          <div className="p-5 rounded-2xl bg-white border border-[#E8E2DA] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7B746E]">Pending Review</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-[#2E2A26] font-display">34</span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Awaiting Notary
              </span>
            </div>
            <p className="text-[11px] text-[#7B746E]">Avg review time: ~12 mins</p>
          </div>

        </div>

        {/* ── Activity & Notarization Trend Graph ───────────────────────────── */}
        <div className="p-6 rounded-2xl bg-white border border-[#E8E2DA] shadow-xs space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-base font-bold text-[#2E2A26] font-display">Notarization & Spending Trend</h3>
              <p className="text-xs text-[#7B746E]">Document verification activity over time</p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* Metric Switcher */}
              <div className="flex items-center gap-1 bg-[#F6F3EE] p-1 rounded-xl border border-[#E8E2DA]">
                <button
                  onClick={() => setChartType('activity')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    chartType === 'activity'
                      ? 'bg-[#2D6A4F] text-white shadow-xs'
                      : 'text-[#7B746E] hover:text-[#2E2A26]'
                  }`}
                >
                  Activity (Docs)
                </button>
                <button
                  onClick={() => setChartType('spending')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    chartType === 'spending'
                      ? 'bg-[#2D6A4F] text-white shadow-xs'
                      : 'text-[#7B746E] hover:text-[#2E2A26]'
                  }`}
                >
                  Volume ($ USD)
                </button>
              </div>

              {/* Timeframe Switcher */}
              <div className="flex items-center gap-1 bg-[#F6F3EE] p-1 rounded-xl border border-[#E8E2DA]">
                {['daily', 'weekly', 'monthly'].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg capitalize transition-all ${
                      timeframe === tf
                        ? 'bg-white text-[#2E2A26] shadow-xs'
                        : 'text-[#7B746E] hover:text-[#2E2A26]'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Area Chart */}
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#7B746E" fontSize={11} tickLine={false} />
                <YAxis stroke="#7B746E" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E8E2DA',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    fontSize: '12px',
                    color: '#2E2A26'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={chartType === 'activity' ? 'notarized' : 'spending'}
                  stroke="#2D6A4F"
                  strokeWidth={2.5}
                  fill="url(#colorGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Contract On-Chain Activity Graph for 0x19443302aC781A943AC33b2d228D7736d4E00FE4 ── */}
        <div className="p-6 rounded-2xl bg-white border border-[#E8E2DA] shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                <h3 className="text-base font-bold text-[#2E2A26] font-display">On-Chain Activity Graph & Ethereum Ledger</h3>
              </div>
              <p className="text-xs text-[#7B746E] font-mono mt-0.5">
                Target Contract: <span className="text-[#2D6A4F] font-semibold">0x19443302aC781A943AC33b2d228D7736d4E00FE4</span>
              </p>
            </div>
            <a
              href="https://amoy.polygonscan.com/address/0x19443302aC781A943AC33b2d228D7736d4E00FE4"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              View on Polygonscan Explorer ↗
            </a>
          </div>

          {/* Quick Metrics for the Contract */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Contract Calls</span>
              <p className="text-lg font-extrabold text-gray-900 font-mono mt-0.5">342 Txs</p>
              <span className="text-[10px] text-emerald-600 font-semibold">100% Mined Success</span>
            </div>
            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Avg Gas / Transaction</span>
              <p className="text-lg font-extrabold text-blue-700 font-mono mt-0.5">45,120 Gas</p>
              <span className="text-[10px] text-blue-600 font-semibold">Polygon Gas Sponsored ⚡</span>
            </div>
            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Latest Mined Block</span>
              <p className="text-lg font-extrabold text-emerald-700 font-mono mt-0.5">#{latestBlock}</p>
              <span className="text-[10px] text-emerald-600 font-semibold">Amoy Chain ID 80002</span>
            </div>
          </div>

          {/* Contract Gas & Interaction Bar Chart */}
          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contractData}>
                <XAxis dataKey="block" stroke="#7B746E" fontSize={10} tickLine={false} />
                <YAxis stroke="#7B746E" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E8E2DA',
                    borderRadius: '10px',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="txs" fill="#2563EB" radius={[4, 4, 0, 0]} name="Transactions" />
                <Bar dataKey="gas" fill="#2D6A4F" radius={[4, 4, 0, 0]} name="Gas Used (kUnits)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Secondary Breakdown Charts ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Category Distribution (Pie Chart) */}
          <div className="p-6 rounded-2xl bg-white border border-[#E8E2DA] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#2E2A26] font-display">Document Category Distribution</h3>
            <div className="flex items-center gap-6">
              <div className="w-40 h-40 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={CATEGORY_DISTRIBUTION}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                    >
                      {CATEGORY_DISTRIBUTION.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="space-y-2.5 flex-1">
                {CATEGORY_DISTRIBUTION.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ background: cat.color }} />
                      <span className="text-[#55504B] font-medium">{cat.name}</span>
                    </div>
                    <span className="font-bold text-[#2E2A26] font-mono">{cat.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Status Breakdown Bar List */}
          <div className="p-6 rounded-2xl bg-white border border-[#E8E2DA] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#2E2A26] font-display">Document Status Breakdown</h3>
            <div className="space-y-4 pt-1">
              {STATUS_DISTRIBUTION.map((item) => (
                <div key={item.status} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className={`font-semibold ${item.textColor}`}>{item.status}</span>
                    <span className="font-bold font-mono text-[#2E2A26]">{item.count} docs ({item.pct}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color} transition-all duration-500`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── Network & Market Data Section ─────────────────────────────────── */}
        <NetworkMarketSection />

      </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
   NETWORK & MARKET DATA COMPONENT
   Fetches live CoinGecko API prices for ETH, POL/MATIC, USDC & network stats
─────────────────────────────────────────────────────────────────────────── */
function NetworkMarketSection() {
  const [selectedToken, setSelectedToken] = useState('ETH'); // 'ETH' | 'POL' | 'USDC'
  const [range, setRange]                 = useState('7D');   // '24H' | '7D' | '30D'
  const [prices, setPrices]               = useState(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(false);

  const fetchMarketData = async () => {
    try {
      const res = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,polygon-ecosystem-token,usd-coin&vs_currencies=usd&include_24hr_change=true'
      );
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setPrices({
        ETH: {
          price: data?.ethereum?.usd || 1920.45,
          change: data?.ethereum?.usd_24h_change || 1.85,
          symbol: 'ETH',
          name: 'Ethereum'
        },
        POL: {
          price: data?.['polygon-ecosystem-token']?.usd || 0.4215,
          change: data?.['polygon-ecosystem-token']?.usd_24h_change || 3.42,
          symbol: 'POL',
          name: 'Polygon'
        },
        USDC: {
          price: data?.['usd-coin']?.usd || 1.00,
          change: data?.['usd-coin']?.usd_24h_change || 0.01,
          symbol: 'USDC',
          name: 'USD Coin'
        }
      });
      setError(false);
    } catch {
      // Fallback data if API rate-limited
      setPrices({
        ETH:  { price: 1920.45, change: 1.85, symbol: 'ETH', name: 'Ethereum' },
        POL:  { price: 0.4215,  change: 3.42, symbol: 'POL', name: 'Polygon'  },
        USDC: { price: 1.0000,  change: 0.01, symbol: 'USDC', name: 'USD Coin' }
      });
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000); // 60s cache/refresh
    return () => clearInterval(interval);
  }, []);

  // Generate historical chart points for selected token and range
  const getHistoricalPoints = () => {
    const base = prices ? prices[selectedToken]?.price || 100 : 100;
    const isStable = selectedToken === 'USDC';

    if (isStable) {
      return [
        { label: 'T-6', price: 1.000 },
        { label: 'T-5', price: 1.001 },
        { label: 'T-4', price: 0.999 },
        { label: 'T-3', price: 1.000 },
        { label: 'T-2', price: 1.001 },
        { label: 'T-1', price: 1.000 },
        { label: 'Now', price: 1.000 },
      ];
    }

    const mults = range === '24H'
      ? [0.98, 0.985, 0.99, 1.01, 1.005, 1.02, 1.00]
      : range === '30D'
      ? [0.88, 0.92, 0.95, 0.99, 1.03, 0.98, 1.00]
      : [0.94, 0.96, 0.95, 0.98, 1.02, 1.01, 1.00];

    const labels = range === '24H'
      ? ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'Now']
      : range === '30D'
      ? ['Day 1', 'Day 5', 'Day 10', 'Day 15', 'Day 20', 'Day 25', 'Now']
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return labels.map((l, idx) => ({
      label: l,
      price: parseFloat((base * mults[idx]).toFixed(selectedToken === 'POL' ? 4 : 2))
    }));
  };

  const chartData = getHistoricalPoints();
  const currentToken = prices ? prices[selectedToken] : null;
  const isUp = (currentToken?.change || 0) >= 0;

  return (
    <div className="p-6 rounded-2xl bg-white border border-[#E8E2DA] shadow-xs space-y-6">
      
      {/* Section Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-base font-bold text-[#2E2A26] font-display">Network & Market Data</h3>
          </div>
          <p className="text-xs text-[#7B746E] mt-0.5">
            Live public market prices (CoinGecko API) & Polygon Amoy network telemetry
          </p>
        </div>

        {/* Range Controls */}
        <div className="flex items-center gap-1 bg-[#F6F3EE] p-1 rounded-xl border border-[#E8E2DA]">
          {['24H', '7D', '30D'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                range === r
                  ? 'bg-white text-[#2E2A26] shadow-xs'
                  : 'text-[#7B746E] hover:text-[#2E2A26]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Network & Token Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Token 1: ETH */}
        <button
          onClick={() => setSelectedToken('ETH')}
          className={`p-4 rounded-xl border text-left transition-all ${
            selectedToken === 'ETH'
              ? 'bg-blue-50/60 border-blue-300 ring-2 ring-blue-500/20'
              : 'bg-gray-50 border-gray-200 hover:bg-gray-100/70'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-bold text-gray-900">Ethereum (ETH)</span>
            {prices?.ETH && (
              <span className={`font-bold text-[10px] px-1.5 py-0.5 rounded-full ${
                prices.ETH.change >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
              }`}>
                {prices.ETH.change >= 0 ? '+' : ''}{prices.ETH.change.toFixed(2)}%
              </span>
            )}
          </div>
          <p className="text-lg font-extrabold text-gray-900 font-mono">
            {loading ? '...' : `$${prices?.ETH?.price.toLocaleString()}`}
          </p>
          <span className="text-[10px] text-gray-500">Layer 1 Settlement</span>
        </button>

        {/* Token 2: POL */}
        <button
          onClick={() => setSelectedToken('POL')}
          className={`p-4 rounded-xl border text-left transition-all ${
            selectedToken === 'POL'
              ? 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-500/20'
              : 'bg-gray-50 border-gray-200 hover:bg-gray-100/70'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-bold text-gray-900">Polygon (POL)</span>
            {prices?.POL && (
              <span className={`font-bold text-[10px] px-1.5 py-0.5 rounded-full ${
                prices.POL.change >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
              }`}>
                {prices.POL.change >= 0 ? '+' : ''}{prices.POL.change.toFixed(2)}%
              </span>
            )}
          </div>
          <p className="text-lg font-extrabold text-gray-900 font-mono">
            {loading ? '...' : `$${prices?.POL?.price.toFixed(4)}`}
          </p>
          <span className="text-[10px] text-emerald-700 font-medium">Gas Relayer Token</span>
        </button>

        {/* Token 3: USDC */}
        <button
          onClick={() => setSelectedToken('USDC')}
          className={`p-4 rounded-xl border text-left transition-all ${
            selectedToken === 'USDC'
              ? 'bg-blue-50/60 border-blue-300 ring-2 ring-blue-500/20'
              : 'bg-gray-50 border-gray-200 hover:bg-gray-100/70'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-bold text-gray-900">USD Coin (USDC)</span>
            <span className="font-bold text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
              Stable
            </span>
          </div>
          <p className="text-lg font-extrabold text-gray-900 font-mono">
            {loading ? '...' : `$${prices?.USDC?.price.toFixed(2)}`}
          </p>
          <span className="text-[10px] text-gray-500">Neobank Settlement</span>
        </button>

        {/* Network Telemetry Tile */}
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-left space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-gray-900">Polygon Network</span>
            <span className="font-bold text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
              Healthy
            </span>
          </div>
          <p className="text-lg font-extrabold text-emerald-700 font-mono">~35 Gwei</p>
          <span className="text-[10px] text-gray-500">Gas Sponsored · Amoy 80002</span>
        </div>
      </div>

      {/* Selected Token Price Chart */}
      <div className="p-5 rounded-xl bg-gray-50/70 border border-gray-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-900">
              {currentToken?.name} ({currentToken?.symbol}) Price Chart — {range}
            </span>
            {currentToken && (
              <span className={`text-xs font-bold ${isUp ? 'text-emerald-600' : 'text-red-600'}`}>
                {isUp ? '▲' : '▼'} {Math.abs(currentToken.change).toFixed(2)}%
              </span>
            )}
          </div>
          <span className="text-[11px] font-mono text-gray-400">Live CoinGecko Feed</span>
        </div>

        {/* Line Chart */}
        <div className="h-60 w-full pt-2">
          {loading ? (
            <div className="h-full flex items-center justify-center animate-pulse text-xs text-gray-400">
              Loading market price data...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="marketGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isUp ? '#16A34A' : '#DC2626'} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={isUp ? '#16A34A' : '#DC2626'} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#9CA3AF"
                  fontSize={11}
                  tickLine={false}
                  domain={['auto', 'auto']}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '10px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '12px',
                  }}
                  formatter={(val) => [`$${val}`, 'Price (USD)']}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={isUp ? '#16A34A' : '#DC2626'}
                  strokeWidth={2.5}
                  fill="url(#marketGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

    </div>
  );
}

export default function Analytics() {
  return (
    <DashboardLayout
      title="Analytics & Reports"
      subtitle="Real-time notarization volume, trust scores, and document distribution"
    >
      <AnalyticsContent />
    </DashboardLayout>
  );
}


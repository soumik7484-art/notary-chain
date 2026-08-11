import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, CreditCard, QrCode, Building2, ArrowUpRight,
  ArrowDownLeft, History, ShieldCheck, Zap, CheckCircle2, XCircle,
  Copy, ChevronRight, TrendingUp, Eye, EyeOff, Check,
  Send, Wallet, Activity, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import IPhoneFrame from '../components/neobank/IPhoneFrame';
import HomeScreen from '../components/neobank/HomeScreen';
import CashInScreen from '../components/neobank/CashInScreen';
import SendScreen from '../components/neobank/SendScreen';
import DepositScreen from '../components/neobank/DepositScreen';
import WithdrawScreen from '../components/neobank/WithdrawScreen';
import HistoryScreen from '../components/neobank/HistoryScreen';
import KycScreen from '../components/neobank/KycScreen';
import NeobankAnalytics from '../components/neobank/NeobankAnalytics';
import TxReceiptModal from '../components/neobank/TxReceiptModal';
import { getNeobankAccount } from '../api/neobankApi';

/* ────────────────────────────────────────────────────────────────
   DESIGN TOKENS  ─ white/light base, green · red · blue accents
   Single source of truth. Change here → changes everywhere.
──────────────────────────────────────────────────────────────── */
const T = {
  /* ── Surfaces ─────────────────────────────────────────────── */
  pageBg:     '#F4F6F8',      // outermost page tint
  surface:    '#FFFFFF',      // cards, sidebar, header
  surfaceAlt: '#F7F8FA',      // inner tinted sections
  border:     '#E5E7EB',      // universal 1-px border
  borderFocus:'#3B82F6',      // focus ring / active state

  /* ── Typography ───────────────────────────────────────────── */
  textPrimary:   '#111827',   // headings, amounts, labels
  textSecondary: '#6B7280',   // dates, sub-labels
  textTertiary:  '#9CA3AF',   // placeholders, mono addresses

  /* ── GREEN — positive / success / primary CTA ─────────────── */
  green:         '#16A34A',
  greenLight:    '#F0FDF4',
  greenBorder:   '#BBF7D0',
  greenText:     '#15803D',

  /* ── RED — negative / alerts / outgoing amounts ───────────── */
  red:           '#DC2626',
  redLight:      '#FEF2F2',
  redBorder:     '#FECACA',
  redText:       '#B91C1C',

  /* ── BLUE — informational / neutral actions / Polygon ─────── */
  blue:          '#2563EB',
  blueLight:     '#EFF6FF',
  blueBorder:    '#BFDBFE',
  blueText:      '#1D4ED8',

  /* ── Elevation (light-mode drop shadows, NO glow) ─────────── */
  shadowXs: '0 1px 2px rgba(0,0,0,0.05)',
  shadowSm: '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)',
  shadowMd: '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
  shadowLg: '0 8px 24px rgba(0,0,0,0.09), 0 4px 8px rgba(0,0,0,0.04)',

  /* ── Radii (consistent across every card / pill / button) ─── */
  radiusSm: '8px',
  radiusMd: '12px',
  radiusLg: '16px',
  radiusXl: '20px',
  radiusFull: '9999px',
};

/* ────────────────────────────────────────────────────────────────
   NAV TABS
──────────────────────────────────────────────────────────────── */
const NAV_TABS = [
  { id: 'home',      label: 'Wallet',    icon: Wallet        },
  { id: 'cash-in',   label: 'Cash-In',   icon: QrCode        },
  { id: 'send',      label: 'Send',      icon: Send          },
  { id: 'deposit',   label: 'Top-Up',    icon: Building2     },
  { id: 'withdraw',  label: 'Payout',    icon: ArrowDownLeft },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp    },
  { id: 'history',   label: 'History',   icon: History       },
  { id: 'kyc',       label: 'KYC',       icon: ShieldCheck   },
];

/* ────────────────────────────────────────────────────────────────
   STATUS PILL
   variant: 'green' | 'red' | 'blue' | 'neutral'
──────────────────────────────────────────────────────────────── */
const StatusPill = ({ label, variant = 'green', className = '' }) => {
  const map = {
    green:   { bg: T.greenLight, border: T.greenBorder, text: T.greenText, dot: T.green   },
    red:     { bg: T.redLight,   border: T.redBorder,   text: T.redText,   dot: T.red     },
    blue:    { bg: T.blueLight,  border: T.blueBorder,  text: T.blueText,  dot: T.blue    },
    neutral: { bg: '#F9FAFB',    border: T.border,      text: T.textSecondary, dot: T.textTertiary },
  };
  const v = map[variant] || map.neutral;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${className}`}
      style={{
        background: v.bg,
        border: `1px solid ${v.border}`,
        color: v.text,
        borderRadius: T.radiusFull,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: v.dot }} />
      {label}
    </span>
  );
};

/* ────────────────────────────────────────────────────────────────
   BALANCE CARD
   Premium white card with green top-border accent stripe
──────────────────────────────────────────────────────────────── */
export const BalanceCard = ({ account, liveBal, syncing, fetchRealBalance, handleConnectWallet }) => {
  const { user } = useAuth();
  const [hidden, setHidden] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currency, setCurrency] = useState('USD');

  const addr = user?.walletAddress || localStorage.getItem('web3_connected_wallet') || account?.walletAddress || '';
  const isWalletConnected = !!addr && /^0x[a-fA-F0-9]{40}$/.test(addr.trim());
  const shortAddr = isWalletConnected ? `${addr.trim().slice(0, 8)}...${addr.trim().slice(-6)}` : 'Not Connected';

  const getFormattedBalance = () => {
    if (!isWalletConnected) return 'NaN';
    if (liveBal && liveBal.isSupported === false) return 'Unsupported Network';

    const rawBalance = liveBal
      ? parseFloat(liveBal.usd)
      : (account?.rawBalance !== undefined ? parseFloat(account.rawBalance) : 0);

    const val = isNaN(rawBalance) ? 0 : rawBalance;
    switch (currency) {
      case 'EUR': return `€${(val * 0.92).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'INR': return `₹${(val * 83.50).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'USDC': return `${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      default: return `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  const copyAddr = () => {
    if (!addr) return;
    navigator.clipboard.writeText(addr).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        background: T.surface,
        borderRadius: T.radiusXl,
        border: `1px solid ${T.border}`,
        boxShadow: T.shadowMd,
        overflow: 'hidden',
      }}
    >
      {/* Accent stripe */}
      <div style={{ height: '3px', background: `linear-gradient(90deg, ${T.green}, #4ADE80)` }} />

      <div style={{ padding: '20px' }}>
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: T.greenLight, border: `1px solid ${T.greenBorder}` }}
            >
              <span className="text-base">💳</span>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: T.greenText }}>
                Wallet Balance
              </p>
              <p className="text-[10px]" style={{ color: T.textTertiary }}>
                {isWalletConnected ? 'Live Web3 Wallet Balance' : 'Settled in USDC'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleConnectWallet}
              disabled={syncing}
              className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-[#F0FAF5] hover:bg-[#D9F2E6] border border-[#B3E4CC] text-[#2D6A4F] transition-all flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
              {isWalletConnected ? 'Sync Web3' : 'Connect Wallet'}
            </button>
            <button
              onClick={() => setHidden(h => !h)}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100"
              style={{ border: `1px solid ${T.border}` }}
            >
              {hidden
                ? <EyeOff className="w-3.5 h-3.5" style={{ color: T.textSecondary }} />
                : <Eye    className="w-3.5 h-3.5" style={{ color: T.textSecondary }} />
              }
            </button>
          </div>
        </div>

        {/* Currency Switcher Pill Bar */}
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-medium" style={{ color: T.textSecondary }}>
            Available Balance
          </p>
          <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg border border-gray-200">
            {['USD', 'USDC', 'EUR', 'INR'].map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase transition-all ${
                  currency === c
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Balance — dominant type */}
        <div className="flex items-baseline gap-2 mb-4">
          <span
            style={{
              fontSize: '34px',
              fontWeight: 800,
              lineHeight: 1,
              color: !isWalletConnected ? '#DC2626' : T.textPrimary,
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.02em',
            }}
          >
            {hidden ? '••••••' : getFormattedBalance()}
          </span>
          {isWalletConnected && (
            <span className="text-xs font-bold font-mono" style={{ color: T.textSecondary }}>{currency}</span>
          )}
        </div>

        {liveBal && isWalletConnected && (
          <div className={`mb-3 px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center justify-between ${
            liveBal.isSupported === false
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-[#F0FAF5] border-[#B3E4CC] text-[#2D6A4F]'
          }`}>
            <span>Network: {liveBal.networkName || 'Polygon Testnet'}</span>
            <span className="font-mono">{liveBal.isSupported === false ? 'Unsupported' : `${liveBal.pol} POL`}</span>
          </div>
        )}

        {/* Connection status */}
        <div className="flex items-center gap-2 mb-4">
          {isWalletConnected ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: liveBal?.isSupported === false ? '#D97706' : T.green }} />
              <p className="text-[11px] font-semibold" style={{ color: liveBal?.isSupported === false ? '#D97706' : T.greenText }}>
                {liveBal?.isSupported === false ? 'Unsupported Network · Switch to Polygon' : `Web3 Wallet Connected · ${liveBal?.networkName || 'Polygon Testnet'}`}
              </p>
            </>
          ) : (
            <>
              <XCircle className="w-3.5 h-3.5 shrink-0" style={{ color: '#DC2626' }} />
              <p className="text-[11px] font-semibold" style={{ color: '#DC2626' }}>
                Polygon Wallet Not Connected
              </p>
            </>
          )}
        </div>

        {/* Footer row: address + gas */}
        <div
          className="flex items-center justify-between gap-3 pt-3"
          style={{ borderTop: `1px solid ${T.border}` }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] font-mono font-semibold" style={{ color: T.textTertiary }}>ADDR</span>
            <span className="text-[11px] font-mono truncate" style={{ color: isWalletConnected ? T.textSecondary : '#DC2626' }}>{shortAddr}</span>
            {isWalletConnected && (
              <button
                onClick={copyAddr}
                className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-all hover:bg-gray-100"
                style={{ border: `1px solid ${T.border}` }}
              >
                {copied
                  ? <Check className="w-3 h-3" style={{ color: T.green }} />
                  : <Copy  className="w-3 h-3" style={{ color: T.textTertiary }} />
                }
              </button>
            )}
          </div>
          <div
            className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: T.blueLight, border: `1px solid ${T.blueBorder}` }}
          >
            <Zap className="w-3 h-3" style={{ color: T.blue }} />
            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: T.blueText }}>
              Gas Free
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────
   QUICK ACTIONS
   Unified strip · green = send (outgoing CTA), blue = info/neutral,
   red = payout (outgoing/debit)
──────────────────────────────────────────────────────────────── */
const QuickActions = ({ onNavigate }) => {
  /* Color semantics:
     Send     → green  (primary action)
     Cash-In  → blue   (informational inflow)
     Top-Up   → blue   (informational add-funds)
     Payout   → red    (outgoing / debit-coded)
  */
  const actions = [
    { id: 'send',    label: 'Send',    icon: Send,          bg: T.greenLight, iconColor: T.green,  border: T.greenBorder },
    { id: 'cash-in', label: 'Cash-In', icon: QrCode,        bg: T.blueLight,  iconColor: T.blue,   border: T.blueBorder  },
    { id: 'deposit', label: 'Top-Up',  icon: Building2,     bg: T.blueLight,  iconColor: T.blue,   border: T.blueBorder  },
    { id: 'withdraw',label: 'Payout',  icon: ArrowDownLeft, bg: T.redLight,   iconColor: T.red,    border: T.redBorder   },
  ];

  return (
    <div>
      <p
        className="text-[10px] font-bold uppercase tracking-widest mb-2.5"
        style={{ color: T.textTertiary }}
      >
        Quick Actions
      </p>
      {/* One unified card, buttons separated by 1px internal dividers */}
      <div
        style={{
          background: T.surface,
          borderRadius: T.radiusLg,
          border: `1px solid ${T.border}`,
          boxShadow: T.shadowSm,
          overflow: 'hidden',
        }}
      >
        <div className="grid grid-cols-4">
          {actions.map(({ id, label, icon: Icon, bg, iconColor, border: accentBorder }, idx) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className="group flex flex-col items-center gap-2.5 py-4 px-2 transition-all"
              style={{
                borderRight: idx < 3 ? `1px solid ${T.border}` : 'none',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = T.surfaceAlt; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.95)'; }}
              onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-105"
                style={{ background: bg, border: `1px solid ${accentBorder}` }}
              >
                <Icon className="w-4 h-4" strokeWidth={2.5} style={{ color: iconColor }} />
              </div>
              <span
                className="text-[11px] font-semibold"
                style={{ color: T.textSecondary }}
              >
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────
   VIRTUAL BANK CARD
──────────────────────────────────────────────────────────────── */
const VirtualBankCard = ({ onNavigate }) => (
  <div
    className="flex items-center gap-3 p-4"
    style={{
      background: T.surface,
      borderRadius: T.radiusLg,
      border: `1px solid ${T.border}`,
      boxShadow: T.shadowSm,
    }}
  >
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
      style={{ background: T.blueLight, border: `1px solid ${T.blueBorder}` }}
    >
      🏦
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[13px] font-bold" style={{ color: T.textPrimary }}>
        US Bank Virtual Account
      </p>
      <p className="text-[11px] mt-0.5" style={{ color: T.textSecondary }}>
        ACH & Wire → auto-converts to USDC
      </p>
    </div>
    <button
      onClick={() => onNavigate('deposit')}
      className="shrink-0 px-3.5 py-2 text-[11px] font-bold rounded-xl transition-all active:scale-95"
      style={{
        background: T.blueLight,
        border: `1px solid ${T.blueBorder}`,
        color: T.blueText,
        borderRadius: T.radiusMd,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = T.blue;
        e.currentTarget.style.color = '#fff';
        e.currentTarget.style.borderColor = T.blue;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = T.blueLight;
        e.currentTarget.style.color = T.blueText;
        e.currentTarget.style.borderColor = T.blueBorder;
      }}
    >
      View Info
    </button>
  </div>
);

/* ────────────────────────────────────────────────────────────────
   RECENT TRANSACTIONS
   +amounts → green · -amounts → red
──────────────────────────────────────────────────────────────── */
const RecentTxns = ({ account, onViewAll, onSelectTx }) => {
  const { user } = useAuth();
  const activeAddr = user?.walletAddress || localStorage.getItem('web3_connected_wallet') || '';

  // If a Web3 wallet is connected, only show real transactions (or empty array if no transactions for that wallet)
  const transactions = activeAddr
    ? (account?.web3Transactions || [])
    : (account?.transactions || []);

  /* icon visual: outgoing=red-tinted, incoming=green-tinted, bank=blue-tinted */
  const iconMeta = {
    send: { label: '↗', bg: T.redLight,   color: T.red   },
    cash: { label: '↙', bg: T.greenLight, color: T.green },
    bank: { label: '🏦', bg: T.blueLight, color: T.blue  },
  };

  if (transactions.length === 0) {
    return (
      <div
        style={{
          background: T.surface,
          borderRadius: T.radiusLg,
          border: `1px solid ${T.border}`,
          boxShadow: T.shadowSm,
          padding: '24px 16px',
          textAlign: 'center'
        }}
      >
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2 text-base">
          📜
        </div>
        <p className="text-xs font-bold" style={{ color: T.textPrimary }}>No Transactions Yet</p>
        <p className="text-[11px] mt-1" style={{ color: T.textSecondary }}>
          {activeAddr ? 'Your connected Web3 wallet has no Neobank transactions recorded.' : 'No recent transactions.'}
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: T.surface,
        borderRadius: T.radiusLg,
        border: `1px solid ${T.border}`,
        boxShadow: T.shadowSm,
        overflow: 'hidden',
      }}
    >
      <div
        className="flex items-center justify-between px-5 py-3.5"
        style={{ borderBottom: `1px solid ${T.border}` }}
      >
        <p className="text-[13px] font-bold" style={{ color: T.textPrimary }}>Recent Transactions</p>
        <button
          onClick={onViewAll}
          className="flex items-center gap-0.5 text-[11px] font-semibold transition-colors"
          style={{ color: T.blue }}
          onMouseEnter={e => { e.currentTarget.style.color = T.blueText; }}
          onMouseLeave={e => { e.currentTarget.style.color = T.blue; }}
        >
          View All <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {transactions.slice(0, 5).map((tx, i) => {
        const ic = iconMeta[tx.icon] || iconMeta.bank;
        const isCredit = tx.amount.startsWith('+');
        return (
          <div
            key={tx.id}
            onClick={() => onSelectTx && onSelectTx(tx)}
            className="flex items-center justify-between px-5 py-3.5 transition-colors cursor-pointer"
            style={{ borderBottom: i < transactions.slice(0, 5).length - 1 ? `1px solid ${T.border}` : 'none' }}
            onMouseEnter={e => { e.currentTarget.style.background = T.surfaceAlt; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
                style={{ background: ic.bg, color: ic.color, border: `1px solid ${ic.bg === T.redLight ? T.redBorder : ic.bg === T.greenLight ? T.greenBorder : T.blueBorder}` }}
              >
                {ic.label}
              </div>
              <div>
                <p className="text-[12px] font-semibold" style={{ color: T.textPrimary }}>{tx.title}</p>
                <p className="text-[10px] mt-0.5" style={{ color: T.textTertiary }}>{tx.date}</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p
                className="text-[12px] font-bold"
                style={{ color: isCredit ? T.green : T.red }}
              >
                {tx.amount}
              </p>
              {/* Completed → green badge */}
              <StatusPill label={tx.status} variant="green" className="mt-1" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────
   NETWORK STATUS PANEL
   Live/Healthy → green · Gas Sponsored → blue (informational)
──────────────────────────────────────────────────────────────── */
const NetworkStatus = () => {
  const rows = [
    { label: 'Polygon Amoy',    value: 'Live',    variant: 'green' },
    { label: 'Gas Sponsorship', value: 'Active',  variant: 'blue'  },
    { label: 'OMS API',         value: 'Healthy', variant: 'green' },
  ];
  return (
    <div
      style={{
        background: T.surface,
        borderRadius: T.radiusLg,
        border: `1px solid ${T.border}`,
        boxShadow: T.shadowSm,
        padding: '16px',
      }}
    >
      <p className="text-[10px] font-bold uppercase tracking-widest mb-3.5" style={{ color: T.textTertiary }}>
        Network Status
      </p>
      <div className="space-y-2.5">
        {rows.map(({ label, value, variant }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-[12px]" style={{ color: T.textSecondary }}>{label}</span>
            <StatusPill label={value} variant={variant} />
          </div>
        ))}
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────
   SKELETON LOADER
──────────────────────────────────────────────────────────────── */
const Skeleton = () => (
  <div className="space-y-3 animate-pulse">
    {[160, 110, 72].map(h => (
      <div
        key={h}
        style={{ height: h, background: T.surfaceAlt, borderRadius: T.radiusLg, border: `1px solid ${T.border}` }}
      />
    ))}
  </div>
);

/* ────────────────────────────────────────────────────────────────
   COIN MASCOT  — friendly empty-state for the desktop centre panel
   Pure CSS + keyframe animation. Uses app's green/blue/gold palette.
──────────────────────────────────────────────────────────────── */
const coinBounce = {
  animate: {
    y: [0, -10, 0],
    transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
  },
};

const CoinMascot = () => (
  <div className="flex flex-col items-center justify-center py-16 px-6 select-none">
    {/* Coin body */}
    <motion.div
      {...coinBounce}
      className="relative"
    >
      {/* Shadow on "ground" */}
      <motion.div
        animate={{ scaleX: [1, 0.85, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-20 h-3 rounded-full"
        style={{ background: 'radial-gradient(ellipse, rgba(0,0,0,0.08) 0%, transparent 70%)' }}
      />

      {/* Outer coin ring */}
      <div
        className="relative w-28 h-28 rounded-full flex items-center justify-center"
        style={{
          background: 'linear-gradient(145deg, #FDE68A, #F59E0B, #D97706)',
          boxShadow: '0 6px 24px rgba(245,158,11,0.3), inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.1)',
        }}
      >
        {/* Inner coin face */}
        <div
          className="w-[90px] h-[90px] rounded-full flex flex-col items-center justify-center"
          style={{
            background: 'linear-gradient(160deg, #FEF3C7, #FDE68A)',
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.06), inset 0 -1px 3px rgba(255,255,255,0.8)',
          }}
        >
          {/* Face */}
          <div className="flex items-center gap-2.5 mb-1.5 mt-1">
            {/* Left eye */}
            <div className="relative">
              <div className="w-3 h-3 rounded-full" style={{ background: '#92400E' }} />
              <div className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-white/70" />
            </div>
            {/* Right eye */}
            <div className="relative">
              <div className="w-3 h-3 rounded-full" style={{ background: '#92400E' }} />
              <div className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-white/70" />
            </div>
          </div>
          {/* Smile */}
          <div
            className="w-5 h-2.5 rounded-b-full"
            style={{ borderBottom: '2.5px solid #92400E', borderLeft: '2.5px solid #92400E', borderRight: '2.5px solid #92400E' }}
          />
          {/* Dollar sign */}
          <div
            className="mt-1.5 text-[11px] font-extrabold tracking-wider"
            style={{ color: '#B45309' }}
          >
            $
          </div>
        </div>

        {/* Left arm */}
        <motion.div
          animate={{ rotate: [-8, 8, -8] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -left-3 top-1/2 -translate-y-1/2 origin-right"
        >
          <div
            className="w-6 h-2.5 rounded-full"
            style={{ background: 'linear-gradient(90deg, #F59E0B, #FBBF24)' }}
          />
          <div
            className="w-2 h-2 rounded-full absolute -left-1 top-1/2 -translate-y-1/2"
            style={{ background: '#FBBF24' }}
          />
        </motion.div>

        {/* Right arm */}
        <motion.div
          animate={{ rotate: [8, -8, 8] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -right-3 top-1/2 -translate-y-1/2 origin-left"
        >
          <div
            className="w-6 h-2.5 rounded-full"
            style={{ background: 'linear-gradient(270deg, #F59E0B, #FBBF24)' }}
          />
          <div
            className="w-2 h-2 rounded-full absolute -right-1 top-1/2 -translate-y-1/2"
            style={{ background: '#FBBF24' }}
          />
        </motion.div>
      </div>
    </motion.div>

    {/* Message */}
    <div className="mt-8 text-center">
      <p
        className="text-[15px] font-bold"
        style={{ color: T.textPrimary, fontFamily: 'var(--font-display)' }}
      >
        Ready when you are!
      </p>
      <p className="text-[13px] mt-1.5" style={{ color: T.textSecondary }}>
        Select an action from the sidebar or top nav to get started.
      </p>
    </div>

    {/* Quick hint chips */}
    <div className="flex items-center gap-2 mt-6">
      {[
        { label: 'Send',    color: T.green, bg: T.greenLight, border: T.greenBorder },
        { label: 'Cash-In', color: T.blue,  bg: T.blueLight,  border: T.blueBorder  },
        { label: 'Top-Up',  color: T.blue,  bg: T.blueLight,  border: T.blueBorder  },
        { label: 'Payout',  color: T.red,   bg: T.redLight,   border: T.redBorder   },
      ].map(({ label, color, bg, border }) => (
        <span
          key={label}
          className="px-3 py-1 rounded-full text-[11px] font-semibold"
          style={{ background: bg, color, border: `1px solid ${border}` }}
        >
          {label}
        </span>
      ))}
    </div>
  </div>
);

/* ────────────────────────────────────────────────────────────────
   MAIN PAGE
──────────────────────────────────────────────────────────────── */
export default function Neobank() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [account,   setAccount]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [liveBal,   setLiveBal]   = useState(null);
  const [syncing,   setSyncing]   = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const action = params.get('action') || params.get('tab');
    if (action && ['home', 'cash-in', 'send', 'deposit', 'withdraw', 'analytics', 'history', 'kyc'].includes(action)) {
      setActiveTab(action);
    }
  }, [location]);

  const addr = user?.walletAddress || localStorage.getItem('web3_connected_wallet') || account?.walletAddress || '';

  const fetchRealBalance = async (walletAddress, overrideChainId = null) => {
    const targetAddr = walletAddress || addr;
    if (!targetAddr) return;
    setSyncing(true);

    let activeChainId = overrideChainId;
    if (!activeChainId && window.ethereum) {
      try {
        activeChainId = await window.ethereum.request({ method: 'eth_chainId' });
      } catch (e) {}
    }

    const SUPPORTED = {
      '0x13882': { name: 'Polygon Testnet', isTestnet: true, rpcUrl: 'https://polygon-amoy-bor-rpc.publicnode.com', usdc: ['0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582', '0x0FA8781a83E46826621b3BC094Ea2A0212e71B23'] },
      '80002':   { name: 'Polygon Testnet', isTestnet: true, rpcUrl: 'https://polygon-amoy-bor-rpc.publicnode.com', usdc: ['0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582', '0x0FA8781a83E46826621b3BC094Ea2A0212e71B23'] },
      '0x13881': { name: 'Polygon Testnet', isTestnet: true, rpcUrl: 'https://rpc-mumbai.maticvigil.com', usdc: ['0x9999f7Fea19341498065842845c479F2183c5F41'] },
      '80001':   { name: 'Polygon Testnet', isTestnet: true, rpcUrl: 'https://rpc-mumbai.maticvigil.com', usdc: ['0x9999f7Fea19341498065842845c479F2183c5F41'] },
      '0x89':    { name: 'Polygon Mainnet', isTestnet: false, rpcUrl: 'https://polygon-rpc.com', usdc: ['0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'] },
      '137':     { name: 'Polygon Mainnet', isTestnet: false, rpcUrl: 'https://polygon-rpc.com', usdc: ['0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'] }
    };

    const netInfo = activeChainId ? SUPPORTED[activeChainId] : null;

    if (activeChainId && !netInfo) {
      setLiveBal({
        usd: '0.00',
        pol: '0.0000',
        usdc: '0.00',
        networkName: 'Unsupported Network',
        isSupported: false,
        chainId: activeChainId
      });
      setSyncing(false);
      return;
    }

    const currentNet = netInfo || SUPPORTED['0x13882'];
    let fetchedUsdc = 0;
    let fetchedNative = 0;

    const cleanAddr = targetAddr.toLowerCase().replace('0x', '').padStart(64, '0');
    const callData = `0x70a08231${cleanAddr}`;

    for (const contractAddr of currentNet.usdc) {
      try {
        let hexRes = null;
        if (window.ethereum) {
          hexRes = await window.ethereum.request({
            method: 'eth_call',
            params: [{ to: contractAddr, data: callData }, 'latest']
          });
        }
        if (!hexRes || hexRes === '0x' || hexRes === '0x0') {
          const rpcRes = await fetch(currentNet.rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_call',
              params: [{ to: contractAddr, data: callData }, 'latest'],
              id: 1
            })
          });
          const rpcJson = await rpcRes.json();
          hexRes = rpcJson?.result;
        }

        if (hexRes && hexRes !== '0x' && hexRes !== '0x0') {
          const bigVal = BigInt(hexRes);
          if (bigVal > 0n) {
            const val6 = Number(bigVal) / 1e6;
            const val18 = Number(bigVal) / 1e18;
            const computedUsdc = val6 > 1e9 ? val18 : val6;
            if (computedUsdc > fetchedUsdc) {
              fetchedUsdc = computedUsdc;
            }
          }
        }
      } catch (err) {}
    }

    try {
      let nativeHex = null;
      if (window.ethereum) {
        nativeHex = await window.ethereum.request({ method: 'eth_getBalance', params: [targetAddr, 'latest'] });
      }
      if (!nativeHex) {
        const rpcRes = await fetch(currentNet.rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getBalance',
            params: [targetAddr, 'latest'],
            id: 1
          })
        });
        const rpcJson = await rpcRes.json();
        nativeHex = rpcJson?.result;
      }

      if (nativeHex && nativeHex !== '0x') {
        const wei = BigInt(nativeHex);
        fetchedNative = Number(wei) / 1e18;
      }
    } catch (e) {}

    const finalUsd = fetchedUsdc > 0
      ? fetchedUsdc
      : (fetchedNative > 0 ? fetchedNative * 0.42 : 0);

    setLiveBal({
      usd: finalUsd.toFixed(2),
      pol: fetchedNative.toFixed(4),
      usdc: fetchedUsdc.toFixed(2),
      networkName: currentNet.name,
      isSupported: true,
      isTestnet: currentNet.isTestnet,
      chainId: activeChainId || '80002'
    });
    setSyncing(false);
  };

  useEffect(() => {
    if (addr) fetchRealBalance(addr);

    if (window.ethereum) {
      const handleChainChanged = (newChainId) => {
        fetchRealBalance(addr, newChainId);
      };
      const handleAccountsChanged = (accs) => {
        if (accs && accs.length > 0) {
          const selectedAddr = accs[0];
          localStorage.setItem('web3_connected_wallet', selectedAddr);
          if (updateUser) updateUser({ walletAddress: selectedAddr, isWeb3User: true });
          fetchRealBalance(selectedAddr);
          fetchAccount();
        } else {
          localStorage.removeItem('web3_connected_wallet');
          fetchRealBalance('');
          fetchAccount();
        }
      };
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('chainChanged', handleChainChanged);
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, [addr]);

  const handleConnectWallet = async () => {
    if (!window.ethereum) {
      toast.error('MetaMask extension not found. Please install MetaMask.');
      return;
    }
    setSyncing(true);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        const selectedAddr = accounts[0];
        localStorage.setItem('web3_connected_wallet', selectedAddr);
        if (updateUser) updateUser({ walletAddress: selectedAddr, isWeb3User: true });
        await fetchRealBalance(selectedAddr);
        await fetchAccount();
        toast.success(`MetaMask Connected: ${selectedAddr.substring(0, 6)}...${selectedAddr.slice(-4)}`);
      }
    } catch (err) {
      toast.error('Failed to connect MetaMask');
    } finally {
      setSyncing(false);
    }
  };

  const fetchAccount = async () => {
    let savedWallet = localStorage.getItem('web3_connected_wallet') || user?.walletAddress || '';
    if (window.ethereum && window.ethereum.selectedAddress) {
      savedWallet = window.ethereum.selectedAddress;
      localStorage.setItem('web3_connected_wallet', savedWallet);
    }
    let liveBalance = '0.00';
    let isWeb3Connected = false;

    try {
      if (window.ethereum && localStorage.getItem('web3_connected_wallet')) {
        const hexBalance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [savedWallet, 'latest'],
        });
        if (hexBalance) {
          const wei = parseInt(hexBalance, 16);
          const matic = wei / 1e18;
          liveBalance = matic > 0 ? matic.toFixed(4) : '0.00';
          isWeb3Connected = true;
        }
      }
    } catch {
      // Fall back to API or default mode
    }

    try {
      const res = await getNeobankAccount();
      setAccount({
        ...res.data,
        walletAddress: savedWallet,
        balance: liveBalance,
        isWeb3Connected
      });
    } catch {
      setAccount({
        balance: liveBalance,
        walletAddress: savedWallet,
        customerId: 'cst_demo881',
        walletId: 'wlt_demo991',
        kycStatus: 'ACTIVE',
        isWeb3Connected
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAccount(); }, []);

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/dashboard');
  };

  /* renderScreen — used by MOBILE (inside IPhoneFrame) — includes HomeScreen */
  const renderScreen = () => {
    switch (activeTab) {
      case 'home':     return <HomeScreen     account={account} onNavigate={setActiveTab} liveBal={liveBal} />;
      case 'cash-in':  return <CashInScreen   account={account} />;
      case 'send':     return <SendScreen     account={account} onComplete={() => { fetchAccount(); setActiveTab('home'); }} />;
      case 'deposit':  return <DepositScreen  account={account} />;
      case 'withdraw': return <WithdrawScreen account={account} />;
      case 'history':  return <HistoryScreen />;
      case 'kyc':      return <KycScreen      account={account} onComplete={() => { fetchAccount(); setActiveTab('home'); }} />;
      default:         return <HomeScreen     account={account} onNavigate={setActiveTab} />;
    }
  };

  /* renderDesktopCentre — used by DESKTOP centre panel only.
     'home' tab → coin mascot (balance already shown in left sidebar).
     Other tabs → their screen component inside a clean white card. */
  const isIdleState = activeTab === 'home';

  const [selectedTx, setSelectedTx] = useState(null);

  const renderDesktopCentre = () => {
    if (isIdleState) return <CoinMascot />;
    switch (activeTab) {
      case 'cash-in':   return <CashInScreen   account={account} />;
      case 'send':      return <SendScreen     account={account} onComplete={() => { fetchAccount(); setActiveTab('home'); }} />;
      case 'deposit':   return <DepositScreen  account={account} />;
      case 'withdraw':  return <WithdrawScreen account={account} />;
      case 'analytics': return <NeobankAnalytics />;
      case 'history':   return <HistoryScreen />;
      case 'kyc':       return <KycScreen      account={account} onComplete={() => { fetchAccount(); setActiveTab('home'); }} />;
      default:          return <CoinMascot />;
    }
  };

  /* ── RESPONSIVE PC LAYOUT (Unified Mobile & Desktop) ────────────────── */
  return (
    <>
      <div
        className="flex min-h-screen flex-col"
        style={{ background: T.pageBg }}
      >
        {/* Top nav bar */}
        <header
          className="px-4 sm:px-6 h-[54px] flex items-center gap-3 sm:gap-4 sticky top-0 z-30 overflow-x-auto max-w-full no-scrollbar shrink-0"
          style={{
            background: T.surface,
            borderBottom: `1px solid ${T.border}`,
            boxShadow: T.shadowXs,
          }}
        >
          {/* Back button */}
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all active:scale-95 shrink-0"
            style={{
              background: T.surfaceAlt,
              border: `1px solid ${T.border}`,
              color: T.textSecondary,
              borderRadius: T.radiusSm,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = T.border; e.currentTarget.style.color = T.textPrimary; }}
            onMouseLeave={e => { e.currentTarget.style.background = T.surfaceAlt; e.currentTarget.style.color = T.textSecondary; }}
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
            Back
          </button>

          {/* Divider */}
          <div className="shrink-0 hidden sm:block" style={{ width: 1, height: 20, background: T.border }} />

          {/* Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0"
              style={{ background: T.greenLight, border: `1px solid ${T.greenBorder}` }}
            >
              💳
            </div>
            <span className="font-bold text-[13px] sm:text-[14px] whitespace-nowrap" style={{ color: T.textPrimary }}>
              Polygon Open Money Stack
            </span>
            <StatusPill label="v0.11 Sandbox" variant="green" />
          </div>

          {/* Nav tabs */}
          <nav className="ml-auto flex items-center gap-1 shrink-0 overflow-x-auto py-1">
            {NAV_TABS.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 h-8 text-xs font-semibold transition-all whitespace-nowrap shrink-0"
                  style={{
                    background:   active ? T.green : 'transparent',
                    color:        active ? '#fff'  : T.textSecondary,
                    borderRadius: T.radiusSm,
                    border:       active ? `1px solid ${T.green}` : '1px solid transparent',
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.background = T.surfaceAlt; e.currentTarget.style.color = T.textPrimary; }}}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.textSecondary; }}}
                >
                  <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                  {label}
                </button>
              );
            })}
          </nav>
        </header>

        {/* 3-column content (stacked on mobile, side-by-side on desktop) */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">

          {/* LEFT / TOP: Balance + Actions + Bank card */}
          <aside
            className="w-full lg:w-[320px] xl:w-[360px] shrink-0 flex flex-col gap-4 p-4 sm:p-5 overflow-y-auto"
            style={{
              background: T.pageBg,
              borderRight: `1px solid ${T.border}`,
            }}
          >
            {loading ? <Skeleton /> : (
              <>
                <BalanceCard account={account} liveBal={liveBal} syncing={syncing} fetchRealBalance={fetchRealBalance} handleConnectWallet={handleConnectWallet} />
                <QuickActions onNavigate={setActiveTab} />
                <VirtualBankCard onNavigate={setActiveTab} />
              </>
            )}
          </aside>

          {/* CENTRE: Active screen */}
          <main
            className="flex-1 overflow-y-auto"
            style={{ background: T.pageBg }}
          >
            <div className="max-w-2xl mx-auto px-4 sm:px-8 py-5 sm:py-7">
              {/* Breadcrumb */}
              <div
                className="flex items-center gap-1.5 text-[11px] font-medium mb-4 sm:mb-5"
                style={{ color: T.textSecondary }}
              >
                <span>Polygon Neobank</span>
                <ChevronRight className="w-3 h-3" style={{ color: T.textTertiary }} />
                <span style={{ color: T.textPrimary, fontWeight: 700 }}>
                  {NAV_TABS.find(t => t.id === activeTab)?.label || 'Wallet'}
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                >
                  {isIdleState ? (
                    /* Idle state — mascot in a clean white card */
                    <div
                      style={{
                        borderRadius: T.radiusXl,
                        background: T.surface,
                        border: `1px solid ${T.border}`,
                        boxShadow: T.shadowSm,
                      }}
                    >
                      {renderDesktopCentre()}
                    </div>
                  ) : (
                    /* Active screen — wrapped in a card container */
                    <div
                      style={{
                        borderRadius: T.radiusXl,
                        overflow: 'hidden',
                        border: `1px solid ${T.border}`,
                        boxShadow: T.shadowMd,
                      }}
                    >
                      {renderDesktopCentre()}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>

          {/* RIGHT / BOTTOM: Transactions + Network */}
          <aside
            className="w-full lg:w-[288px] xl:w-[320px] shrink-0 flex flex-col gap-4 p-4 sm:p-5 overflow-y-auto"
            style={{
              background: T.pageBg,
              borderLeft: `1px solid ${T.border}`,
            }}
          >
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-widest mb-3"
                style={{ color: T.textTertiary }}
              >
                Live Feed
              </p>
              {loading  && <Skeleton />}
              {!loading && <RecentTxns account={account} onViewAll={() => setActiveTab('history')} onSelectTx={setSelectedTx} />}
            </div>

            <NetworkStatus />

            {/* Footer */}
            <div
              className="mt-auto flex items-center gap-2 pt-4"
              style={{ borderTop: `1px solid ${T.border}` }}
            >
              <Activity className="w-3.5 h-3.5 shrink-0" style={{ color: T.green }} />
              <p className="text-[10px] leading-snug" style={{ color: T.textTertiary }}>
                Powered by{' '}
                <span style={{ color: T.green, fontWeight: 700 }}>Polygon Open Money Stack</span>
                {' '}· Custodial USDC settlement
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* Transaction Receipt Modal */}
      {selectedTx && (
        <TxReceiptModal
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
        />
      )}
    </>
  );
}

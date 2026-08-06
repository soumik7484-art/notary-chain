import React from 'react';
import { HiSignal, HiWifi, HiBattery50 } from 'react-icons/hi2';

export default function IPhoneFrame({ children, activeTab, onTabChange }) {
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col items-center justify-center py-2 px-1">
      {/* Outer Phone Hardware Chassis */}
      <div className="relative w-full max-w-[370px] h-[780px] bg-slate-950 rounded-[48px] p-3 shadow-[0_25px_60px_-15px_rgba(45,106,79,0.25)] border-4 border-slate-800 ring-1 ring-white/10 overflow-hidden flex flex-col transition-all">
        
        {/* Dynamic Island / Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 flex items-center justify-between px-3 shadow-inner">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#2D6A4F]/60 ring-1 ring-[#2D6A4F] animate-pulse" />
        </div>

        {/* Status Bar */}
        <div className="w-full pt-2.5 pb-1 px-6 flex items-center justify-between text-xs text-slate-300 font-medium z-40 bg-slate-950/90 backdrop-blur-md select-none">
          <span className="text-[11px] font-semibold">{currentTime}</span>
          <div className="flex items-center space-x-1.5 text-slate-300">
            <HiSignal className="w-3.5 h-3.5" />
            <HiWifi className="w-3.5 h-3.5" />
            <HiBattery50 className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        {/* Screen Content Container (Scrollable) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-950 text-white scrollbar-none relative flex flex-col">
          {children}
        </div>

        {/* Bottom Tab Bar */}
        <div className="w-full h-16 bg-slate-950/95 backdrop-blur-xl border-t border-white/10 flex items-center justify-around px-2 z-40 select-none shrink-0">
          <button
            onClick={() => onTabChange('home')}
            className={`flex flex-col items-center space-y-1 transition-colors ${activeTab === 'home' ? 'text-[#2D6A4F] font-semibold scale-105' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <span className="text-xl">💳</span>
            <span className="text-[10px]">Home</span>
          </button>

          <button
            onClick={() => onTabChange('cash-in')}
            className={`flex flex-col items-center space-y-1 transition-colors ${activeTab === 'cash-in' ? 'text-[#2D6A4F] font-semibold scale-105' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <span className="text-xl">🏪</span>
            <span className="text-[10px]">Cash-In</span>
          </button>

          <button
            onClick={() => onTabChange('send')}
            className="flex flex-col items-center -mt-6"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#2D6A4F] to-[#52796F] flex items-center justify-center text-white shadow-lg shadow-[#2D6A4F]/40 hover:scale-110 active:scale-95 transition-all">
              <span className="text-xl">💸</span>
            </div>
            <span className="text-[10px] text-[#B3E4CC] mt-0.5 font-medium">Send</span>
          </button>

          <button
            onClick={() => onTabChange('deposit')}
            className={`flex flex-col items-center space-y-1 transition-colors ${activeTab === 'deposit' ? 'text-[#2D6A4F] font-semibold scale-105' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <span className="text-xl">🏦</span>
            <span className="text-[10px]">Bank</span>
          </button>

          <button
            onClick={() => onTabChange('history')}
            className={`flex flex-col items-center space-y-1 transition-colors ${activeTab === 'history' ? 'text-[#2D6A4F] font-semibold scale-105' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <span className="text-xl">📜</span>
            <span className="text-[10px]">History</span>
          </button>
        </div>

        {/* Home Indicator Line */}
        <div className="w-full pb-1 pt-0.5 flex justify-center bg-slate-950 shrink-0">
          <div className="w-32 h-1 bg-slate-600/60 rounded-full" />
        </div>
      </div>
    </div>
  );
}

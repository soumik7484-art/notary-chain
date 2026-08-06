import React from 'react';
import { Link } from 'react-router-dom';
import { FileCheck, PenTool, CheckCircle2, ShieldCheck } from 'lucide-react';

const NotaryDashboard = () => {
  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-[22px] font-bold text-[#2D2A27] tracking-tight">Notary Workspace</h1>
        <p className="text-[13px] text-[#9B9490] mt-0.5">
          Digital certification, cryptographic sealing, and signature verification
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Signatures Section */}
        <div className="lg:col-span-2 bg-white border border-[#E9E4DD] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-[#E9E4DD]">
            <div>
              <h3 className="text-sm font-bold text-[#2D2A27]">Pending Signatures</h3>
              <p className="text-[11px] text-[#9B9490]">Documents requiring digital notary stamp</p>
            </div>
            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold">
              8 Awaiting
            </span>
          </div>

          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-[#E9E4DD] bg-[#FAF8F4] flex justify-between items-center hover:border-[#2D6A4F] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#F0FAF5] text-[#2D6A4F] border border-[#C3DDD0] flex items-center justify-center shrink-0">
                    <PenTool className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#2D2A27]">Power of Attorney - Doc #{i + 800}</h4>
                    <p className="text-[11px] text-[#9B9490]">Requested by: Legal Partners LLC</p>
                  </div>
                </div>
                <button className="px-3 py-1.5 bg-[#2D6A4F] hover:bg-[#245741] text-white rounded-lg text-xs font-semibold transition-colors shadow-xs">
                  Sign Now
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Total Certificates Issued Card */}
        <div className="bg-white border border-[#E9E4DD] rounded-xl p-6 shadow-xs flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 bg-[#F0FAF5] border border-[#C3DDD0] rounded-full flex items-center justify-center text-[#2D6A4F] mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-3xl font-bold text-[#2D2A27] tracking-tight mb-1">1,042</h3>
          <p className="text-xs font-semibold text-[#52796F]">Total Certificates Issued</p>

          <div className="mt-6 w-full pt-4 border-t border-[#E9E4DD]">
            <div className="flex justify-between text-xs">
              <span className="text-[#9B9490]">This Month</span>
              <span className="text-[#2D6A4F] font-bold">+42 (+12%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotaryDashboard;

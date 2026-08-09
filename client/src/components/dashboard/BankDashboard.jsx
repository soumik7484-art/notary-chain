import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ShieldAlert, CheckCircle2, Clock, Eye, FileText, ArrowUpRight } from 'lucide-react';
import { AnalyticsContent } from '../admin/Analytics';
import Web3WalletSetupBanner from '../common/Web3WalletSetupBanner';

const BankDashboard = () => {
  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-[22px] font-bold text-[#2D2A27] tracking-tight">Bank Verification Portal</h1>
        <p className="text-[13px] text-[#9B9490] mt-0.5">
          Review, verify, and validate incoming institutional document requests
        </p>
      </div>

      {/* ── Web3 Wallet Setup Prompt ── */}
      <Web3WalletSetupBanner />

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1 */}
        <div className="p-5 bg-white border border-[#E9E4DD] rounded-xl shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#9B9490]">Pending Requests</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#2D2A27] tracking-tight">24</p>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50/80 px-2.5 py-1 rounded-md border border-amber-200/60 w-fit">
            <span>12 High Priority</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-5 bg-white border border-[#E9E4DD] rounded-xl shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#9B9490]">Approved Today</span>
            <div className="w-8 h-8 rounded-lg bg-[#F0FAF5] text-[#2D6A4F] flex items-center justify-center border border-[#C3DDD0]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#2D2A27] tracking-tight">15</p>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#2D6A4F] bg-[#F0FAF5] px-2.5 py-1 rounded-md border border-[#C3DDD0] w-fit">
            <span>+5 from yesterday</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-5 bg-white border border-[#E9E4DD] rounded-xl shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#9B9490]">Fraud Alerts</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center border border-red-200">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#2D2A27] tracking-tight">2</p>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-1 rounded-md border border-red-200 w-fit">
            <span>Requires immediate attention</span>
          </div>
        </div>
      </div>

      {/* ── Verification Queue Table ── */}
      <div className="bg-white border border-[#E9E4DD] rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#E9E4DD] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#2D2A27]">Verification Queue</h3>
            <p className="text-[11px] text-[#9B9490]">Active compliance review requests</p>
          </div>
          <span className="text-xs font-semibold text-[#2D6A4F] bg-[#F0FAF5] px-2.5 py-1 rounded-full border border-[#C3DDD0]">
            3 Action Required
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF8F4] border-b border-[#E9E4DD] text-[11px] font-bold text-[#7B746E] uppercase tracking-wider">
                <th className="py-3 px-4">Document ID</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E4DD] text-xs">
              {[
                { id: 'DOC-8492', company: 'Acme Corp', type: 'Financial Statement', risk: 'Low', riskBg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                { id: 'DOC-1123', company: 'Global Tech LLC', type: 'Proof of Address', risk: 'High', riskBg: 'bg-red-50 text-red-700 border-red-200' },
                { id: 'DOC-5591', company: 'Stark Industries', type: 'Identity Verification', risk: 'Medium', riskBg: 'bg-amber-50 text-amber-700 border-amber-200' },
              ].map((row) => (
                <tr key={row.id} className="hover:bg-[#FAF8F4] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#2D2A27]">{row.id}</td>
                  <td className="py-3.5 px-4 font-medium text-[#55504B]">{row.company}</td>
                  <td className="py-3.5 px-4 text-[#7B746E]">{row.type}</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${row.riskBg}`}>
                      {row.risk}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to={`/documents/${row.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#2D6A4F] hover:bg-[#245741] text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" /> Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Analytics & Market Data Graphs ── */}
      <div className="pt-4">
        <h2 className="text-lg font-bold text-[#2D2A27] mb-3">Analytics & Network Intelligence</h2>
        <AnalyticsContent />
      </div>
    </div>
  );
};

export default BankDashboard;

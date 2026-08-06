import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, MoreVertical, Filter, Search } from 'lucide-react';
import Badge from '../common/Badge';

const DocumentList = () => {
  const [docs] = useState([
    { id: 1, name: 'NDA_Corp_2023.pdf', status: 'Verified', variant: 'success', category: 'Contract', date: 'Oct 12, 2023', size: '2.4 MB' },
    { id: 2, name: 'ID_Passport_JD.jpg', status: 'Pending Review', variant: 'warning', category: 'Identity', date: 'Oct 14, 2023', size: '1.1 MB' },
    { id: 3, name: 'Q3_Financials.xlsx', status: 'Rejected', variant: 'danger', category: 'Financial', date: 'Oct 15, 2023', size: '5.6 MB' },
  ]);

  return (
    <div className="w-full space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7B746E]" />
          <input
            type="text"
            placeholder="Search documents..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#E8E2DA] text-[#2E2A26] placeholder-[#7B746E] rounded-xl text-xs focus:outline-none focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/15 transition-all shadow-xs"
          />
        </div>
        <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white text-[#55504B] hover:text-[#2E2A26] rounded-xl hover:bg-[#F6F3EE] transition-colors border border-[#E8E2DA] text-xs font-semibold shadow-xs">
          <Filter className="w-3.5 h-3.5" /> Filter
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-[#E8E2DA] rounded-2xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F6F3EE] border-b border-[#E8E2DA] text-xs font-semibold text-[#7B746E] uppercase tracking-wider">
                <th className="p-4">Document Name</th>
                <th className="p-4">Status</th>
                <th className="p-4">Category</th>
                <th className="p-4">Uploaded</th>
                <th className="p-4">Size</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2DA]">
              {docs.map((doc, i) => (
                <motion.tr
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={doc.id}
                  className="hover:bg-[#F6F3EE]/60 transition-colors group cursor-pointer"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#F0FAF5] text-[#2D6A4F] border border-[#B3E4CC] shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-[#2E2A26]">{doc.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant={doc.variant} size="sm">{doc.status}</Badge>
                  </td>
                  <td className="p-4 text-xs font-medium text-[#55504B]">{doc.category}</td>
                  <td className="p-4 text-xs text-[#7B746E]">{doc.date}</td>
                  <td className="p-4 text-xs text-[#7B746E]">{doc.size}</td>
                  <td className="p-4 text-right">
                    <button className="p-1.5 text-[#7B746E] hover:text-[#2E2A26] hover:bg-[#E8E2DA]/50 rounded-lg transition-all">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DocumentList;

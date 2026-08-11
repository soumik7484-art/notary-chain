import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, MoreVertical, Search } from 'lucide-react';
import Badge from '../common/Badge';
import { useAuth } from '../../hooks/useAuth';
import { getDocumentHistory } from '../../utils/documentHistory';
import axiosInstance from '../../api/axios';

const DocumentList = () => {
  const { user } = useAuth();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUserDocs = async () => {
    setLoading(true);
    try {
      // 1. Fetch real API uploaded documents for logged in user
      const res = await axiosInstance.get('/documents');
      const apiDocs = res.data?.data?.documents || res.data?.documents || [];

      // 2. Also check local tested document history for this specific user
      const localHistory = getDocumentHistory(user);

      // Map API documents to standard format
      const formattedApi = apiDocs.map(d => ({
        id: d._id || d.id,
        name: d.title || d.fileName || d.originalFileName || 'Untitled Document',
        status: d.status ? d.status.replace('_', ' ') : 'Verified',
        variant: d.status === 'rejected' ? 'danger' : (d.status === 'approved' || d.status === 'notarized' ? 'success' : 'warning'),
        category: d.category || 'Contract',
        date: d.createdAt ? new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
        size: d.fileSize ? `${(d.fileSize / 1024 / 1024).toFixed(1)} MB` : '1.2 MB'
      }));

      // Combine local history and API docs uniquely
      const combined = [...formattedApi];
      localHistory.forEach(item => {
        if (!combined.some(c => c.name === item.title)) {
          combined.push({
            id: item.id,
            name: item.title || 'Untitled Document',
            status: item.status || 'Verified',
            variant: item.trustScore >= 80 ? 'success' : (item.trustScore >= 50 ? 'warning' : 'danger'),
            category: item.category || 'Contract',
            date: item.scannedAt ? item.scannedAt.split('•')[0].trim() : 'Recently',
            size: '1.5 MB'
          });
        }
      });

      setDocs(combined);
    } catch (err) {
      // Fall back to local user history only (never default sample docs)
      const localHistory = getDocumentHistory(user);
      const fallback = localHistory.map(item => ({
        id: item.id,
        name: item.title || 'Untitled Document',
        status: item.status || 'Verified',
        variant: item.trustScore >= 80 ? 'success' : 'warning',
        category: item.category || 'Contract',
        date: item.scannedAt ? item.scannedAt.split('•')[0].trim() : 'Recently',
        size: '1.5 MB'
      }));
      setDocs(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDocs();
  }, [user]);

  const filteredDocs = docs.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7B746E]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#E8E2DA] text-[#2E2A26] placeholder-[#7B746E] rounded-xl text-xs focus:outline-none focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/15 transition-all shadow-xs"
          />
        </div>
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
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-xs text-[#7B746E]">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#2D6A4F] border-t-transparent" />
                      Loading user document history…
                    </div>
                  </td>
                </tr>
              ) : filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-10 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="w-8 h-8 text-[#D4CECA]" />
                      <p className="text-sm font-bold text-[#2E2A26]">No documents tested yet</p>
                      <p className="text-xs text-[#7B746E]">Upload and test a document to view its verification history here.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc, i) => (
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
                        <span className="text-sm font-semibold text-[#2E2A26] capitalize">{doc.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={doc.variant} size="sm">{doc.status}</Badge>
                    </td>
                    <td className="p-4 text-xs font-medium text-[#55504B] capitalize">{doc.category}</td>
                    <td className="p-4 text-xs text-[#7B746E]">{doc.date}</td>
                    <td className="p-4 text-xs text-[#7B746E]">{doc.size}</td>
                    <td className="p-4 text-right">
                      <button className="p-1.5 text-[#7B746E] hover:text-[#2E2A26] hover:bg-[#E8E2DA]/50 rounded-lg transition-all">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DocumentList;

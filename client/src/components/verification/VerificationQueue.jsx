import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, ShieldCheck, FileText } from 'lucide-react';
import Badge from '../common/Badge';
import Card from '../common/Card';
import { useAuth } from '../../hooks/useAuth';
import { getDocumentHistory } from '../../utils/documentHistory';
import axiosInstance from '../../api/axios';

const VerificationQueue = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      // Fetch real verification requests or documents for the current user
      const res = await axiosInstance.get('/documents');
      const docs = res.data?.data?.documents || res.data?.documents || [];

      // Map real documents
      const formatted = docs.map(d => ({
        id: d._id || d.id,
        doc: d.title || d.fileName || d.originalFileName || 'Untitled Document',
        requester: d.uploadedBy?.firstName ? `${d.uploadedBy.firstName} ${d.uploadedBy.lastName || ''}`.trim() : (user?.firstName || 'Website User'),
        priority: d.priority || 'medium',
        status: d.status ? d.status.replace('_', ' ') : 'Pending Review',
        date: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'Recently'
      }));

      // Combine with local user tested items
      const localHistory = getDocumentHistory(user);
      localHistory.forEach(h => {
        if (!formatted.some(f => f.doc === h.title)) {
          formatted.push({
            id: h.id,
            doc: h.title,
            requester: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Website User',
            priority: 'medium',
            status: h.status || 'Pending Review',
            date: h.scannedAt ? h.scannedAt.split('•')[0].trim() : 'Recently'
          });
        }
      });

      setItems(formatted);
    } catch (err) {
      // Fallback to user local history only (never hardcoded mock data)
      const localHistory = getDocumentHistory(user);
      const fallback = localHistory.map(h => ({
        id: h.id,
        doc: h.title,
        requester: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Website User',
        priority: 'medium',
        status: h.status || 'Pending Review',
        date: h.scannedAt ? h.scannedAt.split('•')[0].trim() : 'Recently'
      }));
      setItems(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [user]);

  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-5 bg-[#F6F3EE] border-b border-[#E8E2DA] flex justify-between items-center">
        <div>
          <h3 className="font-display font-bold text-base text-[#2E2A26] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#2D6A4F]" /> Verification Queue
          </h3>
          <p className="text-xs text-[#7B746E]">
            {items.length === 1 ? '1 document awaiting approval' : `${items.length} documents awaiting approval`}
          </p>
        </div>
        <Badge variant={items.length > 0 ? 'primary' : 'neutral'} size="sm">
          {items.length} Pending
        </Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E8E2DA] text-xs font-semibold text-[#7B746E] uppercase tracking-wider bg-[#FFFDF9]">
              <th className="p-4">Document Title</th>
              <th className="p-4">Requester</th>
              <th className="p-4">Priority</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E2DA] text-xs">
            {loading ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-xs text-[#7B746E]">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#2D6A4F] border-t-transparent" />
                    Loading verification queue…
                  </div>
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-10 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="w-8 h-8 text-[#D4CECA]" />
                    <p className="text-sm font-bold text-[#2E2A26]">Verification Queue Empty</p>
                    <p className="text-xs text-[#7B746E]">No documents are currently awaiting verification for your account.</p>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-[#F6F3EE]/60 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#F0FAF5] text-[#2D6A4F] border border-[#B3E4CC] shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-[#2E2A26]">{item.doc}</span>
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-[#55504B]">{item.requester}</td>
                  <td className="p-4">
                    <Badge variant={item.priority === 'high' ? 'danger' : item.priority === 'medium' ? 'warning' : 'neutral'} size="sm">
                      {item.priority.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge variant="warning" size="sm">{item.status}</Badge>
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      to={`/documents/${item.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2D6A4F] text-white rounded-xl text-xs font-semibold hover:bg-[#245741] transition-all shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" /> Review
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default VerificationQueue;

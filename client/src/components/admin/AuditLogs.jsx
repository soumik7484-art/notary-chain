import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { History, RefreshCw, FileText, CheckCircle, Clock } from 'lucide-react';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/audit');
      const data = res.data?.data || res.data?.items || res.data || [];
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch audit history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2D2A27] flex items-center gap-2">
            <History className="w-6 h-6 text-[#2D6A4F]" /> Activity & Audit History
          </h1>
          <p className="text-sm text-[#7B746E] mt-1">
            Real-time audit trail of all document scans, uploads, and notarization events.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#E8E2DA] text-sm font-medium text-[#2D2A27] hover:bg-[#F6F3EE] transition-colors shadow-xs"
        >
          <RefreshCw className={`w-4 h-4 text-[#2D6A4F] ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="bg-white border border-[#E8E2DA] rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-[#7B746E] space-y-3">
            <div className="w-8 h-8 border-2 border-[#2D6A4F] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium">Loading audit history…</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-[#7B746E] space-y-2">
            <FileText className="w-10 h-10 mx-auto text-[#AAA49F]" />
            <p className="font-semibold text-base text-[#2D2A27]">No activity logs found</p>
            <p className="text-xs text-[#7B746E]">Upload or scan a document to generate your first audit entry.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF8F4] border-b border-[#E8E2DA] text-[#7B746E] font-medium text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Document / Metadata</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2DA] text-[#2D2A27]">
                {logs.map((log, i) => {
                  const docTitle = log.documentId?.title || log.metadata?.title || log.documentId?.uniqueDocId || 'Document';
                  const userEmail = log.userId?.email || 'User';
                  const actionName = (log.action || 'ACTIVITY').replace(/_/g, ' ');
                  const formattedTime = log.createdAt ? new Date(log.createdAt).toLocaleString() : 'Just now';

                  return (
                    <tr key={log._id || i} className="hover:bg-[#FAF8F4]/60 transition-colors">
                      <td className="p-4 font-mono text-xs text-[#7B746E]">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#AAA49F]" />
                          {formattedTime}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-[#2D6A4F] capitalize">
                        {actionName}
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-[#2D2A27]">{docTitle}</div>
                        {log.metadata?.category && (
                          <span className="text-[11px] text-[#7B746E] uppercase tracking-wider">{log.metadata.category}</span>
                        )}
                      </td>
                      <td className="p-4 text-[#554F4A]">{userEmail}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3 h-3" /> {(log.status || 'success').toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;

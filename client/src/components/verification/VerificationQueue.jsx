import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, ShieldCheck, FileText, CheckCircle2, XCircle } from 'lucide-react';
import Badge from '../common/Badge';
import Card from '../common/Card';

const VerificationQueue = () => {
  const queueItems = [
    { id: 1, doc: 'ID_Passport_V2.pdf', requester: 'Acme Corp', priority: 'high', status: 'Pending Review', date: '10 mins ago' },
    { id: 2, doc: 'Vendor_Agreement_Draft.docx', requester: 'TechCorp Ltd', priority: 'medium', status: 'In Progress', date: '1 hour ago' },
    { id: 3, doc: 'Property_Title_Deed.pdf', requester: 'Global Real Estate', priority: 'low', status: 'Pending Review', date: '3 hours ago' },
  ];

  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-5 bg-[#F6F3EE] border-b border-[#E8E2DA] flex justify-between items-center">
        <div>
          <h3 className="font-display font-bold text-base text-[#2E2A26] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#2D6A4F]" /> Verification Queue
          </h3>
          <p className="text-xs text-[#7B746E]">3 documents awaiting digital notary approval</p>
        </div>
        <Badge variant="primary" size="sm">3 Pending</Badge>
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
            {queueItems.map((item) => (
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
                    to="/documents/DOC-908234"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2D6A4F] text-white rounded-xl text-xs font-semibold hover:bg-[#245741] transition-all shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5" /> Review
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default VerificationQueue;

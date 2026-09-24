import React, { useState, useEffect } from 'react';
import { FileCheck2, Clock, Plus } from 'lucide-react';
import { getSlaPoliciesApi } from '../../api/admin';

interface SlaPolicy {
  id: number;
  priority: string;
  resolution_time_hours: number;
  description?: string;
}

export const SlaTab: React.FC = () => {
  const [policies, setPolicies] = useState<SlaPolicy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      const data = await getSlaPoliciesApi();
      setPolicies(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-[#86868B]">
        <div className="w-6 h-6 border-2 border-[#0071E3] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs">Loading SLA Policies...</p>
      </div>
    );
  }

  const priorityStyles: Record<string, string> = {
    LOW: 'text-[#6E6E73] bg-[#F5F5F7] border-[#E5E5E7]',
    MEDIUM: 'text-[#0071E3] bg-[#EBF5FF] border-[#D0E6FF]',
    HIGH: 'text-[#D97706] bg-[#FFF4E5] border-[#FFE0B2]',
    CRITICAL: 'text-[#FF3B30] bg-[#FEECEB] border-[#FCD0CE]',
  };

  return (
    <div>
      <div className="p-4 px-6 border-b border-[#E5E5E7] flex items-center justify-between bg-[#FAFAFA]">
        <div className="flex items-center gap-2">
          <FileCheck2 size={15} className="text-[#0071E3]" />
          <span className="text-xs font-semibold text-[#1D1D1F]">
            Resolution SLA Policy Windows
          </span>
        </div>
        <button
          onClick={() => alert('New SLA Policy definition')}
          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-medium transition shadow-sm"
        >
          <Plus size={13} />
          <span>New Policy</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8F9FA] text-[#86868B] text-[11px] font-semibold uppercase tracking-wider border-b border-[#E5E5E7]">
              <th className="px-6 py-3">Priority Tier</th>
              <th className="px-6 py-3">Target Time Window</th>
              <th className="px-6 py-3">Commitment Description</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F5F5F7] text-xs">
            {policies.map((p) => (
              <tr key={p.id} className="hover:bg-[#F8F9FA] transition-colors">
                <td className="px-6 py-3.5 whitespace-nowrap">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium border ${
                      priorityStyles[p.priority] || 'bg-[#F5F5F7] text-[#6E6E73]'
                    }`}
                  >
                    {p.priority}
                  </span>
                </td>
                <td className="px-6 py-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 font-semibold text-[#1D1D1F] font-mono text-xs">
                    <Clock size={13} className="text-[#0071E3]" />
                    <span>{p.resolution_time_hours} Hours</span>
                  </div>
                </td>
                <td className="px-6 py-3.5 text-[#6E6E73] max-w-md">{p.description || '-'}</td>
                <td className="px-6 py-3.5 whitespace-nowrap text-right">
                  <button
                    className="px-2.5 py-1 rounded-lg bg-[#F5F5F7] hover:bg-[#E5E5E7] text-[#1D1D1F] font-medium text-xs transition border border-[#E5E5E7]"
                    onClick={() => alert(`Configure SLA for ${p.priority}`)}
                  >
                    Configure
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

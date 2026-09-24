import React, { useState, useEffect } from 'react';
import { getSlaPoliciesApi, updateSlaPolicyApi } from '../../api/admin';

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

  if (loading) return <div className="p-12 text-center text-slate-400">Loading SLA Policies...</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
            <th className="px-6 py-4 font-semibold">Priority</th>
            <th className="px-6 py-4 font-semibold">Resolution Time (Hours)</th>
            <th className="px-6 py-4 font-semibold">Description</th>
            <th className="px-6 py-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/40">
          {policies.map(p => (
            <tr key={p.id} className="hover:bg-slate-700/20 transition">
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 py-1 rounded-md text-xs font-bold bg-slate-700 text-slate-300">
                  {p.priority}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">{p.resolution_time_hours}h</td>
              <td className="px-6 py-4 text-sm text-slate-400">{p.description || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <button className="text-sky-400 hover:text-sky-300 font-semibold" onClick={() => alert('Edit coming soon')}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

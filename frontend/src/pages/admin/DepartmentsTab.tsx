import React, { useState, useEffect } from 'react';
import { Building, Plus } from 'lucide-react';
import { getDepartmentsApi } from '../../api/admin';
import type { Department } from '../../types/auth';

export const DepartmentsTab: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const data = await getDepartmentsApi();
      setDepartments(data);
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
        <p className="text-xs">Loading Departments...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="p-4 px-6 border-b border-[#E5E5E7] flex items-center justify-between bg-[#FAFAFA]">
        <div className="flex items-center gap-2">
          <Building size={15} className="text-[#0071E3]" />
          <span className="text-xs font-semibold text-[#1D1D1F]">Enterprise Departments</span>
        </div>
        <button
          onClick={() => alert('Add Department functionality')}
          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-medium transition shadow-sm"
        >
          <Plus size={13} />
          <span>Add Department</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8F9FA] text-[#86868B] text-[11px] font-semibold uppercase tracking-wider border-b border-[#E5E5E7]">
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Department Name</th>
              <th className="px-6 py-3">Scope Description</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F5F5F7] text-xs">
            {departments.map((d) => (
              <tr key={d.id} className="hover:bg-[#F8F9FA] transition-colors">
                <td className="px-6 py-3.5 whitespace-nowrap text-[#86868B] font-mono font-medium">#{d.id}</td>
                <td className="px-6 py-3.5 whitespace-nowrap font-semibold text-[#1D1D1F]">{d.name}</td>
                <td className="px-6 py-3.5 text-[#6E6E73] max-w-md">{d.description || '-'}</td>
                <td className="px-6 py-3.5 whitespace-nowrap text-right">
                  <button
                    className="px-2.5 py-1 rounded-lg bg-[#F5F5F7] hover:bg-[#E5E5E7] text-[#1D1D1F] font-medium text-xs transition border border-[#E5E5E7]"
                    onClick={() => alert(`Configure ${d.name}`)}
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

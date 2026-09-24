import React, { useState, useEffect } from 'react';
import { FolderTree, Plus } from 'lucide-react';
import { getCategoriesApi } from '../../api/admin';

interface Category {
  id: number;
  name: string;
  description?: string;
  department?: { id: number; name: string };
}

export const CategoriesTab: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getCategoriesApi();
      setCategories(data);
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
        <p className="text-xs">Loading Categories...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="p-4 px-6 border-b border-[#E5E5E7] flex items-center justify-between bg-[#FAFAFA]">
        <div className="flex items-center gap-2">
          <FolderTree size={15} className="text-[#0071E3]" />
          <span className="text-xs font-semibold text-[#1D1D1F]">Service Categories</span>
        </div>
        <button
          onClick={() => alert('Add Category functionality')}
          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-medium transition shadow-sm"
        >
          <Plus size={13} />
          <span>Add Category</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8F9FA] text-[#86868B] text-[11px] font-semibold uppercase tracking-wider border-b border-[#E5E5E7]">
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Category Name</th>
              <th className="px-6 py-3">Department Scope</th>
              <th className="px-6 py-3">Description</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F5F5F7] text-xs">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-[#F8F9FA] transition-colors">
                <td className="px-6 py-3.5 whitespace-nowrap text-[#86868B] font-mono font-medium">#{c.id}</td>
                <td className="px-6 py-3.5 whitespace-nowrap font-semibold text-[#1D1D1F]">{c.name}</td>
                <td className="px-6 py-3.5 whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded bg-[#F5F5F7] border border-[#E5E5E7] font-medium text-[11px] text-[#6E6E73]">
                    {c.department?.name || 'Global'}
                  </span>
                </td>
                <td className="px-6 py-3.5 text-[#6E6E73] max-w-md">{c.description || '-'}</td>
                <td className="px-6 py-3.5 whitespace-nowrap text-right">
                  <button
                    className="px-2.5 py-1 rounded-lg bg-[#F5F5F7] hover:bg-[#E5E5E7] text-[#1D1D1F] font-medium text-xs transition border border-[#E5E5E7]"
                    onClick={() => alert(`Configure ${c.name}`)}
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

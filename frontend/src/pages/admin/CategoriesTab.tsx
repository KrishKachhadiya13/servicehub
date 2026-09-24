import React, { useState, useEffect } from 'react';
import { getCategoriesApi, createCategoryApi, updateCategoryApi } from '../../api/admin';

interface Category {
  id: number;
  name: string;
  description?: string;
  department?: { id: number, name: string };
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

  if (loading) return <div className="p-12 text-center text-slate-400">Loading Categories...</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
            <th className="px-6 py-4 font-semibold">ID</th>
            <th className="px-6 py-4 font-semibold">Name</th>
            <th className="px-6 py-4 font-semibold">Department</th>
            <th className="px-6 py-4 font-semibold">Description</th>
            <th className="px-6 py-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/40">
          {categories.map(c => (
            <tr key={c.id} className="hover:bg-slate-700/20 transition">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">#{c.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">{c.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{c.department?.name || 'Global'}</td>
              <td className="px-6 py-4 text-sm text-slate-400">{c.description || '-'}</td>
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

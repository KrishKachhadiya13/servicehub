import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import type { TicketPriority, Category } from '../../types/ticket';
import type { Department } from '../../types/auth';
import { fetchDepartmentsApi, fetchCategoriesApi, createTicketApi } from '../../api/tickets';

interface TicketFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TicketFormModal: React.FC<TicketFormModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [departmentId, setDepartmentId] = useState<number | ''>('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM');

  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchDepartmentsApi().then((depts) => {
        setDepartments(depts);
        if (depts.length > 0) setDepartmentId(depts[0].id);
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (departmentId) {
      fetchCategoriesApi(Number(departmentId)).then((cats) => {
        setCategories(cats);
        if (cats.length > 0) setCategoryId(cats[0].id);
      });
    }
  }, [departmentId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentId || !categoryId) {
      setError('Please select a department and category.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await createTicketApi({
        title,
        description,
        department_id: Number(departmentId),
        category_id: Number(categoryId),
        priority,
      });
      setTitle('');
      setDescription('');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to create ticket:', err);
      setError(err.response?.data?.detail || 'Failed to create ticket.');
    } finally {
      setLoading(false);
    }
  };

  const priorityOptions: { value: TicketPriority; label: string; activeStyle: string }[] = [
    { value: 'LOW', label: 'Low', activeStyle: 'bg-[#F5F5F7] text-[#1D1D1F] border-[#8E8E93] shadow-sm' },
    { value: 'MEDIUM', label: 'Medium', activeStyle: 'bg-[#EBF5FF] text-[#0071E3] border-[#0071E3] shadow-sm' },
    { value: 'HIGH', label: 'High', activeStyle: 'bg-[#FFF4E5] text-[#D97706] border-[#FF9F0A] shadow-sm' },
    { value: 'CRITICAL', label: 'Critical', activeStyle: 'bg-[#FEECEB] text-[#FF3B30] border-[#FF3B30] shadow-sm' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-[#E5E5E7] rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-[0_20px_40px_rgba(0,0,0,0.12)] relative">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-[#1D1D1F]">New Service Request</h2>
            <p className="text-[#6E6E73] text-xs mt-0.5">Submit an issue or service ticket to support teams</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-[#FEECEB] border border-[#FCD0CE] text-[#FF3B30] text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#1D1D1F] mb-1.5">
              Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. MacBook Pro external monitor flickering"
              className="w-full px-3.5 py-2.5 bg-white border border-[#D2D2D7] rounded-xl text-sm text-[#1D1D1F] placeholder-[#86868B] focus:outline-none focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/15 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-[#1D1D1F] mb-1.5">
                Department
              </label>
              <select
                required
                value={departmentId}
                onChange={(e) => setDepartmentId(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-[#D2D2D7] rounded-xl text-xs text-[#1D1D1F] focus:outline-none focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/15 transition"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1D1D1F] mb-1.5">
                Category
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-[#D2D2D7] rounded-xl text-xs text-[#1D1D1F] focus:outline-none focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/15 transition"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1D1D1F] mb-1.5">
              Priority
            </label>
            <div className="grid grid-cols-4 gap-2">
              {priorityOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPriority(opt.value)}
                  className={`py-2 px-1 rounded-lg text-xs font-medium border transition-all ${
                    priority === opt.value
                      ? opt.activeStyle
                      : 'bg-[#F8F9FA] text-[#6E6E73] border-[#E5E5E7] hover:bg-[#F5F5F7] hover:text-[#1D1D1F]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1D1D1F] mb-1.5">
              Description
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context, error messages, or details..."
              className="w-full px-3.5 py-2.5 bg-white border border-[#D2D2D7] rounded-xl text-xs text-[#1D1D1F] placeholder-[#86868B] focus:outline-none focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/15 transition leading-relaxed resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#F5F5F7]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#F5F5F7] hover:bg-[#E5E5E7] text-[#1D1D1F] text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-medium transition disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

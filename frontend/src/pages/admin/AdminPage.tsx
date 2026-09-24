import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getAuditLogsApi } from '../../api/audit';
import type { AuditLog } from '../../types/audit';
import api from '../../api/client';
import type { User } from '../../types/auth';
import { DepartmentsTab } from './DepartmentsTab';
import { CategoriesTab } from './CategoriesTab';
import { SlaTab } from './SlaTab';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'audit' | 'users' | 'departments' | 'categories' | 'sla'>('audit');
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role.name !== 'ADMIN') return;
    
    const loadData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'audit') {
          const data = await getAuditLogsApi(100);
          setLogs(data);
        } else if (activeTab === 'users') {
          const res = await api.get('/users');
          setUsers(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [activeTab, user]);

  if (user?.role.name !== 'ADMIN') {
    return <div className="p-12 text-center text-rose-500 font-bold">Unauthorized. Administrators only.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">System Administration</h1>
          <p className="text-slate-400 text-sm">Manage system resources and review audit logs</p>
        </div>
        
        <div className="flex flex-wrap p-1 bg-slate-800/80 rounded-xl border border-slate-700 w-fit gap-1">
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === 'audit' ? 'bg-sky-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            Audit Logs
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === 'users' ? 'bg-sky-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('departments')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === 'departments' ? 'bg-sky-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            Departments
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === 'categories' ? 'bg-sky-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab('sla')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === 'sla' ? 'bg-sky-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            SLA Policies
          </button>
        </div>
      </div>

      <div className="bg-slate-800/60 border border-slate-700/60 rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading {activeTab}...</div>
        ) : activeTab === 'departments' ? (
          <DepartmentsTab />
        ) : activeTab === 'categories' ? (
          <CategoriesTab />
        ) : activeTab === 'sla' ? (
          <SlaTab />
        ) : activeTab === 'audit' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Timestamp</th>
                  <th className="px-6 py-4 font-semibold">Actor</th>
                  <th className="px-6 py-4 font-semibold">Action</th>
                  <th className="px-6 py-4 font-semibold">Entity</th>
                  <th className="px-6 py-4 font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {logs.length === 0 ? (
                  <tr><td colSpan={5} className="p-6 text-center text-slate-500">No logs found.</td></tr>
                ) : logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-700/20 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-white">{log.actor ? log.actor.full_name : 'System'}</div>
                      <div className="text-xs text-slate-500">{log.ip_address || 'Internal'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {log.entity} <span className="text-slate-500">#{log.entity_id}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 max-w-xs truncate">
                      {log.details || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">ID / Name</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Department</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-700/20 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-white">{u.full_name}</div>
                      <div className="text-xs text-slate-500 font-mono">#{u.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{u.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {u.role.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {u.department?.name || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

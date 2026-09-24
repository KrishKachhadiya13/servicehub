import React, { useState, useEffect } from 'react';
import {
  Users,
  Building,
  FolderTree,
  FileCheck2,
  Activity,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getAuditLogsApi } from '../../api/audit';
import type { AuditLog } from '../../types/audit';
import api from '../../api/client';
import type { User as UserType } from '../../types/auth';
import { DepartmentsTab } from './DepartmentsTab';
import { CategoriesTab } from './CategoriesTab';
import { SlaTab } from './SlaTab';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'audit' | 'users' | 'departments' | 'categories' | 'sla'>('audit');
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
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
    return (
      <div className="p-10 text-center text-[#FF3B30] bg-white rounded-2xl border border-[#FCD0CE] max-w-md mx-auto text-xs">
        Administrator privileges required.
      </div>
    );
  }

  const tabs = [
    { id: 'audit', label: 'Audit Logs', icon: Activity },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'departments', label: 'Departments', icon: Building },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'sla', label: 'SLA Policies', icon: FileCheck2 },
  ] as const;

  const roleStyles: Record<string, string> = {
    ADMIN: 'bg-[#FFF4E5] text-[#D97706] border-[#FFE0B2]',
    MANAGER: 'bg-[#F3E8FF] text-[#7C3AED] border-[#E9D5FF]',
    SUPPORT_AGENT: 'bg-[#EBF5FF] text-[#0071E3] border-[#D0E6FF]',
    EMPLOYEE: 'bg-[#EAF7EE] text-[#248A3D] border-[#C2EBD0]',
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#E5E5E7]">
        <div>
          <div className="text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-1">
            System Governance
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] tracking-tight">Administration</h1>
          <p className="text-[#6E6E73] text-xs sm:text-sm mt-0.5">Manage system resources, users, policies, and immutable logs</p>
        </div>

        {/* Apple Segmented Control Tab Switcher */}
        <div className="flex flex-wrap p-1 bg-[#F5F5F7] rounded-xl border border-[#E5E5E7] gap-1 self-start md:self-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white text-[#1D1D1F] shadow-sm'
                    : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                }`}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#E5E5E7]">
        {loading ? (
          <div className="p-16 text-center text-[#86868B]">
            <div className="w-6 h-6 border-2 border-[#0071E3] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs font-medium">Loading {activeTab}...</p>
          </div>
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
                <tr className="bg-[#F8F9FA] text-[#86868B] text-[11px] font-semibold uppercase tracking-wider border-b border-[#E5E5E7]">
                  <th className="px-6 py-3">Timestamp</th>
                  <th className="px-6 py-3">Actor</th>
                  <th className="px-6 py-3">Action</th>
                  <th className="px-6 py-3">Target Entity</th>
                  <th className="px-6 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F5F7] text-xs">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[#86868B]">
                      No audit records found.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#F8F9FA] transition-colors">
                      <td className="px-6 py-3.5 whitespace-nowrap text-[#86868B] font-mono text-[11px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <div className="font-semibold text-[#1D1D1F]">
                          {log.actor ? log.actor.full_name : 'System'}
                        </div>
                        <div className="text-[10px] text-[#86868B] font-mono">
                          {log.ip_address || '127.0.0.1'}
                        </div>
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#EBF5FF] text-[#0071E3] border border-[#D0E6FF]">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap text-[#1D1D1F]">
                        {log.entity} <span className="text-[#86868B] font-mono text-[11px]">#{log.entity_id}</span>
                      </td>
                      <td className="px-6 py-3.5 text-[#6E6E73] max-w-sm truncate text-[11px]">
                        {log.details || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F9FA] text-[#86868B] text-[11px] font-semibold uppercase tracking-wider border-b border-[#E5E5E7]">
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Email Address</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Department</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F5F7] text-xs">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#F8F9FA] transition-colors">
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#E5E5E7] text-[#1D1D1F] flex items-center justify-center font-semibold text-xs">
                          {u.full_name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-[#1D1D1F]">{u.full_name}</div>
                          <div className="text-[10px] text-[#86868B] font-mono">#{u.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-[#6E6E73] font-mono text-xs">
                      {u.email}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                          roleStyles[u.role.name] || 'bg-[#F5F5F7] text-[#6E6E73]'
                        }`}
                      >
                        {u.role.name}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-[#6E6E73]">
                      {u.department?.name || <span className="text-[#86868B] italic">System Admin</span>}
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

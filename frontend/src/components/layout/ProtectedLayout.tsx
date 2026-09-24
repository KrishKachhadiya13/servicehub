import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Ticket,
  Shield,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { getNotificationsApi, markNotificationReadApi, markAllNotificationsReadApi } from '../../api/notifications';
import type { Notification } from '../../types/notification';
import { useAuth } from '../../hooks/useAuth';
import type { UserRole } from '../../types/auth';
import { TicketFormModal } from '../tickets/TicketFormModal';

interface ProtectedLayoutProps {
  allowedRoles?: UserRole[];
}

export const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (user && isAuthenticated) {
      loadNotifications();
    }
  }, [user, isAuthenticated]);

  const loadNotifications = async () => {
    try {
      const data = await getNotificationsApi();
      setNotifications(data);
    } catch (e) {
      console.error('Failed to load notifications', e);
    }
  };

  const handleMarkRead = async (id: number) => {
    try {
      await markNotificationReadApi(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsReadApi();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#0071E3] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#6E6E73] text-xs font-medium tracking-wide">
            Connecting to ServiceHub...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role.name)) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-[#E5E5E7] rounded-2xl p-8 text-center shadow-sm">
          <div className="w-12 h-12 bg-[#FEECEB] text-[#FF3B30] border border-[#FCD0CE] rounded-xl flex items-center justify-center mx-auto mb-4 font-semibold text-lg">
            403
          </div>
          <h2 className="text-lg font-semibold text-[#1D1D1F] mb-1">Access Restricted</h2>
          <p className="text-[#6E6E73] text-xs mb-6">
            Your role (<span className="text-[#1D1D1F] font-semibold">{user.role.name}</span>) is not permitted to access this area.
          </p>
          <Link
            to="/dashboard"
            className="inline-block px-4 py-2 bg-[#0071E3] hover:bg-[#0077ED] text-white font-medium text-xs rounded-xl transition"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const roleBadgeStyles: Record<string, { bg: string; text: string; border: string }> = {
    ADMIN: { bg: 'bg-[#FFF4E5]', text: 'text-[#D97706]', border: 'border-[#FFE0B2]' },
    MANAGER: { bg: 'bg-[#F3E8FF]', text: 'text-[#7C3AED]', border: 'border-[#E9D5FF]' },
    SUPPORT_AGENT: { bg: 'bg-[#EBF5FF]', text: 'text-[#0071E3]', border: 'border-[#D0E6FF]' },
    EMPLOYEE: { bg: 'bg-[#EAF7EE]', text: 'text-[#248A3D]', border: 'border-[#C2EBD0]' },
  };

  const currentRoleStyle = roleBadgeStyles[user.role.name] || roleBadgeStyles.EMPLOYEE;

  const navigationItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Tickets', path: '/tickets', icon: Ticket },
    ...(user.role.name === 'ADMIN'
      ? [{ name: 'Administration', path: '/admin', icon: Shield }]
      : []),
  ];

  const currentNav = navigationItems.find(
    (item) => location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1D1D1F] flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white border-b border-[#E5E5E7] px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#0071E3] flex items-center justify-center text-white font-bold text-xs">
            S
          </div>
          <span className="font-semibold text-[#1D1D1F] text-sm tracking-tight">ServiceHub</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 rounded-lg text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] transition"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF3B30] rounded-full"></span>
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] transition"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Apple-style Clean Sidebar (White / Light Gray) */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-60 bg-white border-r border-[#E5E5E7] flex flex-col justify-between transition-transform duration-200 ease-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 flex flex-col flex-1">
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F5F5F7]">
            <Link to="/dashboard" className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#0071E3] flex items-center justify-center text-white font-bold text-xs">
                S
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-[#1D1D1F] text-sm tracking-tight leading-none">
                  ServiceHub
                </span>
                <span className="text-[10px] text-[#86868B] mt-0.5 font-medium">Enterprise</span>
              </div>
            </Link>
          </div>

          {/* Quick Create Button */}
          <div className="mb-4">
            <button
              onClick={() => {
                setIsCreateModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-[#0071E3] hover:bg-[#0077ED] text-white font-medium text-xs transition duration-150 shadow-sm"
            >
              <Plus size={14} />
              <span>New Ticket</span>
            </button>
          </div>

          {/* Navigation Links */}
          <div className="space-y-0.5">
            <div className="text-[10px] font-semibold text-[#86868B] uppercase tracking-wider px-2 py-1 mb-1">
              Menu
            </div>
            {navigationItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/dashboard' && location.pathname.startsWith(`${item.path}`));
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#EBF5FF] text-[#0071E3]'
                      : 'text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon
                      size={16}
                      className={isActive ? 'text-[#0071E3]' : 'text-[#86868B]'}
                    />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer User Info */}
        <div className="p-3 border-t border-[#E5E5E7] bg-[#FBFBFD]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-[#E5E5E7] text-[#1D1D1F] flex items-center justify-center font-semibold text-[11px] shrink-0">
                {user.full_name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-medium text-[#1D1D1F] truncate leading-tight">
                  {user.full_name}
                </p>
                <span
                  className={`inline-block text-[9px] font-medium px-1.5 py-0.2 rounded mt-0.5 border ${currentRoleStyle.bg} ${currentRoleStyle.text} ${currentRoleStyle.border}`}
                >
                  {user.role.name}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-[#86868B] hover:text-[#FF3B30] hover:bg-[#FEECEB] transition-colors shrink-0"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main View Shell */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Apple-style Clean Top Navigation */}
        <header className="hidden md:flex h-14 bg-white border-b border-[#E5E5E7] px-8 items-center justify-between sticky top-0 z-40">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-xs text-[#86868B]">
            <span>ServiceHub</span>
            <ChevronRight size={12} className="text-[#C7C7CC]" />
            <span className="text-[#1D1D1F] font-medium">{currentNav?.name || 'Workspace'}</span>
          </div>

          {/* Right Tools: Notification Bell & Quick Logout */}
          <div className="flex items-center space-x-3">
            {/* System Status Pill */}
            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF7EE] border border-[#C2EBD0] text-[#248A3D] text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]"></span>
              <span>Systems Operational</span>
            </div>

            {/* Notifications Menu */}
            <div className="relative">
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 rounded-lg text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] transition"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#FF3B30] rounded-full text-[9px] flex items-center justify-center font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Flyout */}
              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 apple-dropdown overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="p-3.5 border-b border-[#E5E5E7] flex justify-between items-center bg-[#FAFAFA]">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-[#1D1D1F] text-xs">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-[#EBF5FF] text-[#0071E3]">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-[#0071E3] hover:text-[#0077ED] font-medium transition"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-[#F5F5F7]">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-[#86868B] text-xs">
                        <CheckCircle2 size={20} className="mx-auto mb-1.5 text-[#AEAEB2]" />
                        No notifications
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => !n.is_read && handleMarkRead(n.id)}
                          className={`p-3.5 cursor-pointer hover:bg-[#F5F5F7] transition-colors ${
                            !n.is_read ? 'bg-[#F8F9FA]' : 'opacity-60'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-0.5">
                            <span className="font-medium text-xs text-[#1D1D1F]">{n.title}</span>
                            {!n.is_read && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3] mt-1"></span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#6E6E73] mb-1.5 leading-relaxed">{n.message}</p>
                          <span className="text-[10px] text-[#86868B] font-mono">
                            {new Date(n.created_at).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Logout Link */}
            <button
              onClick={logout}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-[#6E6E73] hover:text-[#FF3B30] hover:bg-[#FEECEB] transition text-xs font-medium"
            >
              <LogOut size={13} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global New Ticket Modal */}
      <TicketFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {}}
      />
    </div>
  );
};

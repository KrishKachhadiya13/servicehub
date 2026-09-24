import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { getNotificationsApi, markNotificationReadApi, markAllNotificationsReadApi } from '../../api/notifications';
import type { Notification } from '../../types/notification';
import { useAuth } from '../../hooks/useAuth';
import type { UserRole } from '../../types/auth';

interface ProtectedLayoutProps {
  allowedRoles?: UserRole[];
}

export const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);

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
      console.error(e);
    }
  };

  const handleMarkRead = async (id: number) => {
    try {
      await markNotificationReadApi(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsReadApi();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-medium">Verifying ServiceHub Credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role.name)) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center shadow-xl">
          <div className="w-14 h-14 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-xl">
            403
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Access Restricted</h2>
          <p className="text-slate-400 text-sm mb-6">
            Your current role (<span className="text-sky-400 font-semibold">{user.role.name}</span>) is not authorized to view this resource.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-medium text-sm rounded-xl transition"
          >
            Return to Authorized Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <header className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-sky-500/20">
              S
            </div>
            <div>
              <span className="font-bold text-white text-lg tracking-tight">ServiceHub</span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                {user.role.name}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button 
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 rounded-full hover:bg-slate-700/50 transition text-slate-300 hover:text-white"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 rounded-full text-[9px] flex items-center justify-center font-bold text-white border border-slate-800">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              
              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50">
                  <div className="p-4 border-b border-slate-700/60 flex justify-between items-center">
                    <h3 className="font-bold text-white text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} className="text-xs text-sky-400 hover:text-sky-300 font-semibold">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-500 text-sm">No notifications</div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => !n.is_read && handleMarkRead(n.id)}
                          className={`p-4 border-b border-slate-700/40 cursor-pointer hover:bg-slate-700/30 transition ${!n.is_read ? 'bg-slate-700/10' : 'opacity-60'}`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold text-sm text-white">{n.title}</span>
                            {!n.is_read && <span className="w-2 h-2 rounded-full bg-sky-500 mt-1.5"></span>}
                          </div>
                          <p className="text-xs text-slate-400 mb-2">{n.message}</p>
                          <span className="text-[10px] text-slate-500">{new Date(n.created_at).toLocaleString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">{user.full_name}</p>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};

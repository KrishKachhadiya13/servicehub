import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>('employee@servicehub.com');
  const [password, setPassword] = useState<string>('password123');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  const demoAccounts = [
    {
      role: 'ADMIN',
      email: 'admin@servicehub.com',
      badgeStyle: 'text-[#D97706] bg-[#FFF4E5] border-[#FFE0B2]',
    },
    {
      role: 'MANAGER',
      email: 'manager@servicehub.com',
      badgeStyle: 'text-[#7C3AED] bg-[#F3E8FF] border-[#E9D5FF]',
    },
    {
      role: 'SUPPORT AGENT',
      email: 'agent@servicehub.com',
      badgeStyle: 'text-[#0071E3] bg-[#EBF5FF] border-[#D0E6FF]',
    },
    {
      role: 'EMPLOYEE',
      email: 'employee@servicehub.com',
      badgeStyle: 'text-[#248A3D] bg-[#EAF7EE] border-[#C2EBD0]',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      <div className="max-w-sm w-full py-8">
        {/* Brand Header */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-[#0071E3] text-white font-bold text-lg mb-3 shadow-sm">
            S
          </div>
          <h1 className="text-2xl font-bold text-[#1D1D1F] tracking-tight">
            ServiceHub
          </h1>
          <p className="text-[#6E6E73] text-xs mt-1">
            Enterprise Service Management
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-[#E5E5E7] rounded-2xl p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-[#1D1D1F]">Sign In</h2>
            <p className="text-[#6E6E73] text-xs mt-0.5">Enter your enterprise work credentials</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-[#FEECEB] border border-[#FCD0CE] text-[#FF3B30] text-xs flex items-start gap-2 animate-in fade-in duration-100">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-[#1D1D1F] mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#86868B]">
                  <Mail size={15} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#D2D2D7] rounded-xl text-xs text-[#1D1D1F] placeholder-[#86868B] focus:outline-none focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/15 transition font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1D1D1F] mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#86868B]">
                  <Lock size={15} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#D2D2D7] rounded-xl text-xs text-[#1D1D1F] placeholder-[#86868B] focus:outline-none focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/15 transition font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white font-medium text-xs transition duration-150 disabled:opacity-50 flex items-center justify-center gap-1.5 mt-2 cursor-pointer shadow-sm"
            >
              {loading ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={13} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Selector */}
          <div className="mt-6 pt-5 border-t border-[#F5F5F7]">
            <div className="text-[10px] font-semibold text-[#86868B] uppercase tracking-wider mb-2.5">
              Quick Demo Accounts
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleQuickFill(acc.email)}
                  className={`p-2 rounded-lg text-left transition border ${
                    email === acc.email
                      ? 'bg-[#EBF5FF] border-[#0071E3]/40'
                      : 'bg-[#F8F9FA] hover:bg-[#F5F5F7] border-[#E5E5E7]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span
                      className={`text-[9px] font-medium px-1.5 py-0.2 rounded border ${acc.badgeStyle}`}
                    >
                      {acc.role}
                    </span>
                    {email === acc.email && <CheckCircle size={10} className="text-[#0071E3]" />}
                  </div>
                  <span className="block text-[10px] text-[#6E6E73] truncate font-mono">
                    {acc.email}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 text-center text-xs text-[#6E6E73]">
            Need an account?{' '}
            <Link to="/register" className="text-[#0071E3] font-medium hover:underline">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

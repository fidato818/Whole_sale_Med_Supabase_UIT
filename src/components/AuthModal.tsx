import React, { useState } from 'react';
import { User, Lock, Mail, Phone, ShieldCheck, X, Sparkles, Check } from 'lucide-react';
import { pharmacyStore } from '../services/store.ts';
import { UserRole } from '../types/pharmacy.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('patient');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleQuickLogin = (userId: string) => {
    pharmacyStore.switchUser(userId);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'login') {
      if (!email) {
        setError('Please enter your email address.');
        return;
      }
      const res = pharmacyStore.loginWithCredentials(email, password, role);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Login failed');
      }
    } else {
      if (!email || !fullName) {
        setError('Please fill in your name and email address.');
        return;
      }
      const res = pharmacyStore.register(email, fullName, role, phone);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Registration failed');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-teal-700 to-cyan-700 text-white flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">
              {mode === 'login' ? 'Sign In to Whole Medicines' : 'Create an Account'}
            </h3>
            <p className="text-xs text-teal-100">
              {mode === 'login' 
                ? 'Access your prescriptions, dosages, and pharmacy orders' 
                : 'Join our digital pharmacy healthcare network'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-teal-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Quick Demo Switcher */}
          <div className="mb-5 bg-teal-50 border border-teal-200 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Instant Demo Accounts (1-Click)</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('usr_patient_demo')}
                className="px-2 py-1.5 text-[11px] font-semibold bg-white border border-teal-200 hover:border-teal-500 rounded-lg text-teal-950 transition-colors text-center shadow-xs"
              >
                Sarah (Patient)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('usr_pharmacist_demo')}
                className="px-2 py-1.5 text-[11px] font-semibold bg-white border border-teal-200 hover:border-teal-500 rounded-lg text-teal-950 transition-colors text-center shadow-xs"
              >
                Dr. Marcus (PharmD)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('usr_admin_demo')}
                className="px-2 py-1.5 text-[11px] font-semibold bg-white border border-teal-200 hover:border-teal-500 rounded-lg text-teal-950 transition-colors text-center shadow-xs"
              >
                Adnan (Admin)
              </button>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="flex border-b border-slate-200 mb-5">
            <button
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 pb-2.5 text-xs font-semibold text-center border-b-2 transition-colors ${
                mode === 'login' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('register'); setError(null); }}
              className={`flex-1 pb-2.5 text-xs font-semibold text-center border-b-2 transition-colors ${
                mode === 'register' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Register New User
            </button>
          </div>

          {error && (
            <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Eleanor Vance"
                    className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (Optional)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            )}

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Account Role</label>
              <div className="grid grid-cols-3 gap-2">
                {(['patient', 'pharmacist', 'doctor'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-1.5 px-2 text-xs rounded-lg font-medium border text-center capitalize transition-colors ${
                      role === r
                        ? 'bg-teal-50 border-teal-600 text-teal-800 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs py-2.5 rounded-lg shadow-sm transition-colors"
            >
              {mode === 'login' ? 'Sign In' : 'Complete Registration'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

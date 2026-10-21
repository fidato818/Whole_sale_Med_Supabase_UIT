import React, { useState } from 'react';
import { 
  Pill, 
  ShoppingCart, 
  User, 
  Database, 
  Calendar, 
  FileText, 
  Package, 
  LogOut, 
  Layers, 
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { Profile, UserRole } from '../types/pharmacy.ts';
import { pharmacyStore } from '../services/store.ts';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: Profile | null;
  onOpenAuth: () => void;
  onOpenCart: () => void;
  onOpenSupabaseHub: () => void;
  cartCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  onOpenAuth,
  onOpenCart,
  onOpenSupabaseHub,
  cartCount
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profiles = pharmacyStore.getProfiles();

  const handleRoleSwitch = (id: string) => {
    pharmacyStore.switchUser(id);
    setProfileDropdownOpen(false);
  };

  const getRoleBadge = (role?: UserRole) => {
    switch (role) {
      case 'pharmacist':
        return <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-medium">Pharmacist</span>;
      case 'admin':
        return <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full font-medium">Chief Admin</span>;
      case 'doctor':
        return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-medium">Physician</span>;
      default:
        return <span className="bg-sky-100 text-sky-800 text-xs px-2 py-0.5 rounded-full font-medium">Patient</span>;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('medications')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <Pill className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900">Whole Medicines</span>
                <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded border border-teal-200">
                  Supabase Backend
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Clinical Pharmacy & Medication Platform</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setCurrentTab('medications')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'medications'
                  ? 'bg-teal-50 text-teal-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Pill className="w-4 h-4" />
              Medications
            </button>

            <button
              onClick={() => setCurrentTab('prescriptions')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'prescriptions'
                  ? 'bg-teal-50 text-teal-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4" />
              Prescriptions
            </button>

            <button
              onClick={() => setCurrentTab('schedule')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'schedule'
                  ? 'bg-teal-50 text-teal-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Dosage Tracker
            </button>

            <button
              onClick={() => setCurrentTab('orders')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'orders'
                  ? 'bg-teal-50 text-teal-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Package className="w-4 h-4" />
              Orders
            </button>

            {(currentUser?.role === 'pharmacist' || currentUser?.role === 'admin') && (
              <button
                onClick={() => setCurrentTab('inventory')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  currentTab === 'inventory'
                    ? 'bg-teal-50 text-teal-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Layers className="w-4 h-4" />
                Inventory
              </button>
            )}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Supabase Schema & API Hub Button */}
            <button
              onClick={onOpenSupabaseHub}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-sm"
              title="View Supabase Schema, RLS, and Backend API"
            >
              <Database className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">Supabase Backend</span>
              <span className="sm:hidden">Backend</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2 text-slate-600 hover:text-teal-600 hover:bg-slate-50 rounded-lg transition-colors"
              aria-label="Pharmacy Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-teal-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Profile Dropdown / Login */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-xs overflow-hidden">
                    {currentUser.avatar_url ? (
                      <img src={currentUser.avatar_url} alt={currentUser.full_name} className="w-full h-full object-cover" />
                    ) : (
                      currentUser.full_name.charAt(0)
                    )}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[120px]">
                      {currentUser.full_name}
                    </p>
                    <div className="flex items-center">{getRoleBadge(currentUser.role)}</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-500">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-900 truncate">{currentUser.full_name}</p>
                      <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                      <div className="mt-1">{getRoleBadge(currentUser.role)}</div>
                    </div>

                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1 mb-1">
                        Switch Demo Role
                      </p>
                      {profiles.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => handleRoleSwitch(p.id)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                            p.id === currentUser.id ? 'bg-teal-50 text-teal-800 font-medium' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span className="truncate">{p.full_name}</span>
                          {getRoleBadge(p.role)}
                        </button>
                      ))}
                    </div>

                    <div className="px-2 pt-1">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          pharmacyStore.logout();
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-sm"
              >
                <User className="w-3.5 h-3.5" />
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-100 overflow-x-auto">
          <button
            onClick={() => setCurrentTab('medications')}
            className={`px-2 py-1 text-xs rounded-md font-medium whitespace-nowrap ${
              currentTab === 'medications' ? 'text-teal-700 bg-teal-50 font-bold' : 'text-slate-600'
            }`}
          >
            Catalog
          </button>
          <button
            onClick={() => setCurrentTab('prescriptions')}
            className={`px-2 py-1 text-xs rounded-md font-medium whitespace-nowrap ${
              currentTab === 'prescriptions' ? 'text-teal-700 bg-teal-50 font-bold' : 'text-slate-600'
            }`}
          >
            Prescriptions
          </button>
          <button
            onClick={() => setCurrentTab('schedule')}
            className={`px-2 py-1 text-xs rounded-md font-medium whitespace-nowrap ${
              currentTab === 'schedule' ? 'text-teal-700 bg-teal-50 font-bold' : 'text-slate-600'
            }`}
          >
            Schedule
          </button>
          <button
            onClick={() => setCurrentTab('orders')}
            className={`px-2 py-1 text-xs rounded-md font-medium whitespace-nowrap ${
              currentTab === 'orders' ? 'text-teal-700 bg-teal-50 font-bold' : 'text-slate-600'
            }`}
          >
            Orders
          </button>
          {(currentUser?.role === 'pharmacist' || currentUser?.role === 'admin') && (
            <button
              onClick={() => setCurrentTab('inventory')}
              className={`px-2 py-1 text-xs rounded-md font-medium whitespace-nowrap ${
                currentTab === 'inventory' ? 'text-teal-700 bg-teal-50 font-bold' : 'text-slate-600'
              }`}
            >
              Inventory
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

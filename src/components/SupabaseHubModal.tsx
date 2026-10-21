import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Copy, 
  Check, 
  Download, 
  ShieldCheck, 
  Table, 
  Key, 
  Activity, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  X,
  ExternalLink,
  Lock,
  Layers
} from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig, testSupabaseConnection } from '../services/supabase.ts';

interface SupabaseHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseHubModal: React.FC<SupabaseHubModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'schema' | 'rls' | 'sql' | 'connect' | 'api'>('schema');
  const [copied, setCopied] = useState(false);
  const [sqlContent, setSqlContent] = useState<string>('');
  const [loadingSql, setLoadingSql] = useState(false);

  // Connection testing state
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{ success: boolean; message: string } | null>(null);

  // Backend API status
  const [serverStatus, setServerStatus] = useState<any>(null);
  const [checkingServer, setCheckingServer] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSql();
      checkServerHealth();
      const existingConfig = getSupabaseConfig();
      if (existingConfig) {
        setSupabaseUrl(existingConfig.url);
        setSupabaseKey(existingConfig.anonKey);
      }
    }
  }, [isOpen]);

  const loadSql = async () => {
    setLoadingSql(true);
    try {
      const res = await fetch('/api/supabase/schema');
      if (res.ok) {
        const text = await res.text();
        setSqlContent(text);
      }
    } catch (e) {
      console.warn('Could not fetch schema from /api/supabase/schema, using fallback', e);
    } finally {
      setLoadingSql(false);
    }
  };

  const checkServerHealth = async () => {
    setCheckingServer(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setServerStatus(data);
      }
    } catch (e) {
      setServerStatus({ status: 'offline', error: String(e) });
    } finally {
      setCheckingServer(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([sqlContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'whole_medicines_supabase_schema.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestingConnection(true);
    setConnectionResult(null);

    const config = { url: supabaseUrl.trim(), anonKey: supabaseKey.trim() };
    saveSupabaseConfig(config.url ? config : null);

    if (config.url && config.anonKey) {
      const result = await testSupabaseConnection(config);
      setConnectionResult(result);
    } else {
      setConnectionResult({
        success: true,
        message: 'Reset to local integrated database storage.'
      });
    }
    setTestingConnection(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">Supabase Backend & Database Architecture</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-900 text-teal-300 border border-teal-700">
                  PostgreSQL + RLS
                </span>
              </div>
              <p className="text-xs text-slate-400">Medication Schemas, Auth Flow & Server REST Endpoints</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('schema')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'schema'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            Database Tables (7)
          </button>
          <button
            onClick={() => setActiveTab('rls')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'rls'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Row Level Security (RLS)
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'sql'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Full SQL Script (.sql)
          </button>
          <button
            onClick={() => setActiveTab('connect')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'connect'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            Supabase Connection
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'api'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Express API Endpoints
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: Database Tables */}
          {activeTab === 'schema' && (
            <div className="space-y-6">
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-xs text-teal-900 flex items-start gap-3">
                <Table className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-teal-950 mb-1">
                    Relational PostgreSQL Schema Architecture
                  </p>
                  <p>
                    The Whole Medicines schema models the complete pharmaceutical care lifecycle: user profiles, drug catalog with NDC codes, doctor prescriptions, dosage schedule reminders, intake adherence logs, orders, and inventory audit logs.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Medications */}
                <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm hover:border-teal-400 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-bold text-slate-900">public.medications</span>
                    <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded font-semibold">Core Catalog</span>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">Primary catalog of pharmaceutical drugs, dosage forms, active ingredients, and live inventory count.</p>
                  <div className="text-xs font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1 text-slate-700">
                    <div><span className="text-purple-600 font-semibold">id:</span> UUID (PRIMARY KEY)</div>
                    <div><span className="text-purple-600 font-semibold">name, generic_name, brand_name:</span> TEXT</div>
                    <div><span className="text-purple-600 font-semibold">category, dosage_form, strength:</span> TEXT</div>
                    <div><span className="text-purple-600 font-semibold">prescription_required:</span> BOOLEAN</div>
                    <div><span className="text-purple-600 font-semibold">stock_quantity, reorder_level:</span> INTEGER</div>
                    <div><span className="text-purple-600 font-semibold">unit_price:</span> NUMERIC(10,2)</div>
                    <div><span className="text-purple-600 font-semibold">ndc_code, manufacturer:</span> TEXT</div>
                  </div>
                </div>

                {/* 2. Profiles */}
                <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm hover:border-teal-400 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-bold text-slate-900">public.profiles</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold">Auth Sync</span>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">Extended user profiles bound to Supabase auth.users with medical allergies, conditions, and roles.</p>
                  <div className="text-xs font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1 text-slate-700">
                    <div><span className="text-purple-600 font-semibold">id:</span> UUID (REFERENCES auth.users)</div>
                    <div><span className="text-purple-600 font-semibold">email, full_name, phone:</span> TEXT</div>
                    <div><span className="text-purple-600 font-semibold">role:</span> patient | pharmacist | doctor | admin</div>
                    <div><span className="text-purple-600 font-semibold">allergies, medical_conditions:</span> TEXT[]</div>
                    <div><span className="text-purple-600 font-semibold">emergency_contact:</span> TEXT</div>
                  </div>
                </div>

                {/* 3. Prescriptions */}
                <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm hover:border-teal-400 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-bold text-slate-900">public.prescriptions</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold">Clinical Rx</span>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">Authorized doctor prescriptions with refill allowances and verified validity windows.</p>
                  <div className="text-xs font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1 text-slate-700">
                    <div><span className="text-purple-600 font-semibold">id:</span> UUID (PRIMARY KEY)</div>
                    <div><span className="text-purple-600 font-semibold">patient_id:</span> UUID (FK public.profiles)</div>
                    <div><span className="text-purple-600 font-semibold">medication_id:</span> UUID (FK public.medications)</div>
                    <div><span className="text-purple-600 font-semibold">dosage, frequency, duration_days:</span> TEXT/INT</div>
                    <div><span className="text-purple-600 font-semibold">refills_allowed, refills_remaining:</span> INTEGER</div>
                    <div><span className="text-purple-600 font-semibold">status:</span> active | completed | expired | pending</div>
                  </div>
                </div>

                {/* 4. Medication Schedules */}
                <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm hover:border-teal-400 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-bold text-slate-900">public.medication_schedules</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">Daily Dosage</span>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">Patient dosage schedule with specific time slots (e.g. 08:00, 20:00) and dietary instructions.</p>
                  <div className="text-xs font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1 text-slate-700">
                    <div><span className="text-purple-600 font-semibold">id:</span> UUID (PRIMARY KEY)</div>
                    <div><span className="text-purple-600 font-semibold">patient_id:</span> UUID (FK public.profiles)</div>
                    <div><span className="text-purple-600 font-semibold">medication_id:</span> UUID (FK public.medications)</div>
                    <div><span className="text-purple-600 font-semibold">time_slots:</span> TEXT[] (e.g. ['08:00', '21:00'])</div>
                    <div><span className="text-purple-600 font-semibold">with_food:</span> BOOLEAN</div>
                  </div>
                </div>

                {/* 5. Intake Logs */}
                <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm hover:border-teal-400 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-bold text-slate-900">public.intake_logs</span>
                    <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-semibold">Compliance</span>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">Real-time medication adherence tracking and streak records for compliance analytics.</p>
                  <div className="text-xs font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1 text-slate-700">
                    <div><span className="text-purple-600 font-semibold">schedule_id:</span> UUID (FK medication_schedules)</div>
                    <div><span className="text-purple-600 font-semibold">scheduled_time:</span> TIME</div>
                    <div><span className="text-purple-600 font-semibold">taken_at:</span> TIMESTAMPTZ</div>
                    <div><span className="text-purple-600 font-semibold">status:</span> taken | skipped | missed</div>
                  </div>
                </div>

                {/* 6. Orders & Inventory */}
                <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm hover:border-teal-400 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-bold text-slate-900">public.orders & inventory</span>
                    <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-semibold">Fulfillment</span>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">Pharmacy orders, order line items, and inventory audit logs for every stock adjustment.</p>
                  <div className="text-xs font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1 text-slate-700">
                    <div><span className="text-purple-600 font-semibold">orders:</span> id, patient_id, total_amount, status</div>
                    <div><span className="text-purple-600 font-semibold">order_items:</span> order_id, medication_id, quantity</div>
                    <div><span className="text-purple-600 font-semibold">inventory_transactions:</span> restock | dispensed</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Row Level Security */}
          {activeTab === 'rls' && (
            <div className="space-y-5">
              <div className="bg-slate-900 text-white rounded-xl p-4 text-xs">
                <div className="flex items-center gap-2 mb-1.5 font-semibold text-teal-400">
                  <Lock className="w-4 h-4" />
                  Zero-Trust Row Level Security (RLS) Implementation
                </div>
                <p className="text-slate-300">
                  All 7 tables enforce PostgreSQL Row Level Security. Data isolation guarantees that patients only see their personal prescriptions and health records, while licensed pharmacists and staff have controlled operational access.
                </p>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="min-w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Table</th>
                      <th className="py-2.5 px-4 font-semibold">Public (Anon)</th>
                      <th className="py-2.5 px-4 font-semibold">Patient (Authenticated)</th>
                      <th className="py-2.5 px-4 font-semibold">Pharmacist / Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    <tr>
                      <td className="py-2.5 px-4 font-mono font-medium text-slate-900">medications</td>
                      <td className="py-2.5 px-4 text-emerald-600">SELECT (Active catalog)</td>
                      <td className="py-2.5 px-4 text-emerald-600">SELECT (Active catalog)</td>
                      <td className="py-2.5 px-4 text-purple-700 font-semibold">ALL (Insert, Update, Restock)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-mono font-medium text-slate-900">profiles</td>
                      <td className="py-2.5 px-4 text-slate-400">None</td>
                      <td className="py-2.5 px-4 text-teal-600 font-medium">SELECT & UPDATE (Own profile only)</td>
                      <td className="py-2.5 px-4 text-purple-700 font-semibold">SELECT All (For patient care)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-mono font-medium text-slate-900">prescriptions</td>
                      <td className="py-2.5 px-4 text-slate-400">None</td>
                      <td className="py-2.5 px-4 text-teal-600 font-medium">SELECT (Own prescriptions)</td>
                      <td className="py-2.5 px-4 text-purple-700 font-semibold">ALL (Verify, Issue, Refill)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-mono font-medium text-slate-900">medication_schedules</td>
                      <td className="py-2.5 px-4 text-slate-400">None</td>
                      <td className="py-2.5 px-4 text-teal-600 font-medium">ALL (Create, Edit, Delete Own)</td>
                      <td className="py-2.5 px-4 text-slate-600">SELECT</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-mono font-medium text-slate-900">intake_logs</td>
                      <td className="py-2.5 px-4 text-slate-400">None</td>
                      <td className="py-2.5 px-4 text-teal-600 font-medium">ALL (Log adherence doses)</td>
                      <td className="py-2.5 px-4 text-slate-600">SELECT</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-mono font-medium text-slate-900">orders</td>
                      <td className="py-2.5 px-4 text-slate-400">None</td>
                      <td className="py-2.5 px-4 text-teal-600 font-medium">SELECT & INSERT (Own orders)</td>
                      <td className="py-2.5 px-4 text-purple-700 font-semibold">SELECT & UPDATE (Fulfill status)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-mono font-medium text-slate-900">inventory_transactions</td>
                      <td className="py-2.5 px-4 text-slate-400">None</td>
                      <td className="py-2.5 px-4 text-slate-400">None</td>
                      <td className="py-2.5 px-4 text-purple-700 font-semibold">ALL (Audit trail)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Full SQL Script */}
          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-100 p-3 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-900">Ready to execute in Supabase SQL Editor:</span> Creates all tables, constraints, foreign keys, indexes, triggers, and RLS policies.
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopySql}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:border-teal-500 rounded-lg text-xs font-semibold text-slate-800 transition-colors shadow-sm"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy SQL'}
                  </button>
                  <button
                    onClick={handleDownloadSql}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download .sql
                  </button>
                </div>
              </div>

              <div className="relative">
                <pre className="bg-slate-950 text-slate-200 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-[420px] leading-relaxed border border-slate-800">
                  {loadingSql ? 'Loading SQL script...' : sqlContent || '-- Script ready in /supabase_schema.sql'}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: Supabase Connection */}
          {activeTab === 'connect' && (
            <div className="max-w-xl mx-auto space-y-6">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h4 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <Key className="w-4 h-4 text-teal-600" />
                  Connect Your Supabase Project
                </h4>
                <p className="text-xs text-slate-600">
                  Enter your Supabase Project URL and Anonymous Public Key from your Supabase dashboard (Project Settings &rarr; API).
                </p>
              </div>

              <form onSubmit={handleSaveAndTest} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://your-project-id.supabase.co"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Supabase Anon Public API Key
                  </label>
                  <input
                    type="password"
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={testingConnection}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {testingConnection ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Testing Connection...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Save & Test Connection
                      </>
                    )}
                  </button>

                  {(supabaseUrl || supabaseKey) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSupabaseUrl('');
                        setSupabaseKey('');
                        saveSupabaseConfig(null);
                        setConnectionResult({ success: true, message: 'Switched to integrated backend mode.' });
                      }}
                      className="px-3 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium"
                    >
                      Reset to Local
                    </button>
                  )}
                </div>
              </form>

              {connectionResult && (
                <div
                  className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
                    connectionResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  {connectionResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                  <div>
                    <p className="font-semibold">{connectionResult.success ? 'Success' : 'Connection Notice'}</p>
                    <p className="mt-0.5">{connectionResult.message}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Express API Endpoints */}
          {activeTab === 'api' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-slate-900">Express Full-Stack Server Running on Port 3000</span>
                </div>
                <button
                  onClick={checkServerHealth}
                  className="text-xs text-teal-700 hover:underline flex items-center gap-1 font-semibold"
                >
                  <RefreshCw className={`w-3 h-3 ${checkingServer ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              <div className="space-y-2">
                {[
                  { method: 'GET', path: '/api/health', desc: 'Server health check, active records count, and Supabase status' },
                  { method: 'GET', path: '/api/medications', desc: 'List medications with ?search=&category=&prescription_required=' },
                  { method: 'POST', path: '/api/medications', desc: 'Create new medication entry (Pharmacist/Staff restricted)' },
                  { method: 'PUT', path: '/api/medications/:id', desc: 'Update medication stock quantity, price, or specifications' },
                  { method: 'GET', path: '/api/prescriptions', desc: 'List active prescriptions for patient or all (for staff)' },
                  { method: 'POST', path: '/api/prescriptions/:id/refill', desc: 'Request prescription refill and decrement allowance' },
                  { method: 'GET', path: '/api/orders', desc: 'List pharmacy pickup and delivery orders' },
                  { method: 'POST', path: '/api/orders', desc: 'Create new pharmacy checkout order and decrement stock' },
                  { method: 'GET', path: '/api/supabase/schema', desc: 'Direct raw text export of the complete SQL schema DDL script' },
                  { method: 'POST', path: '/api/auth/login', desc: 'Session token generation and user role validation' }
                ].map((ep, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg text-xs">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                        ep.method === 'GET' ? 'bg-sky-100 text-sky-800' :
                        ep.method === 'POST' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ep.method}
                      </span>
                      <span className="font-mono font-semibold text-slate-800">{ep.path}</span>
                    </div>
                    <span className="text-slate-500 text-[11px] hidden sm:inline">{ep.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Layers className="w-3.5 h-3.5 text-teal-600" />
            <span>Whole Medicines Backend Architecture</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Layers, 
  AlertTriangle, 
  Plus, 
  Minus, 
  RefreshCw, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  Search,
  PackageCheck
} from 'lucide-react';
import { Medication, InventoryTransaction, Profile } from '../types/pharmacy.ts';
import { pharmacyStore } from '../services/store.ts';

interface InventoryManagerProps {
  medications: Medication[];
  currentUser: Profile | null;
  onOpenAddModal: () => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  medications,
  currentUser,
  onOpenAddModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const inventoryLogs = pharmacyStore.getInventoryLogs();

  const handleAdjustStock = (medId: string, currentStock: number, delta: number) => {
    const newStock = Math.max(0, currentStock + delta);
    pharmacyStore.updateMedication(medId, { stock_quantity: newStock });
  };

  const filteredMeds = medications.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.generic_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStockUnits = medications.reduce((sum, m) => sum + m.stock_quantity, 0);
  const lowStockCount = medications.filter((m) => m.stock_quantity <= m.reorder_level).length;

  return (
    <div className="space-y-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Total Medication Units
            </span>
            <span className="text-3xl font-extrabold text-slate-900">{totalStockUnits.toLocaleString()}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
            <PackageCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Active Formulations
            </span>
            <span className="text-3xl font-extrabold text-teal-700">{medications.length}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Reorder Threshold Alerts
            </span>
            <span className="text-3xl font-extrabold text-amber-600">{lowStockCount}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Stock Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-900">Pharmacy Inventory & Dispense Controls</h3>
            <p className="text-xs text-slate-500">Live PostgreSQL inventory count with automated audit log triggers.</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search inventory..."
                className="w-full text-xs pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <button
              onClick={onOpenAddModal}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              New Drug
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Medication & Strength</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Reorder Level</th>
                <th className="py-3 px-4">Unit Price</th>
                <th className="py-3 px-4 text-right">Quick Stock Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredMeds.map((med) => {
                const isLow = med.stock_quantity <= med.reorder_level;

                return (
                  <tr key={med.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{med.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {med.generic_name} • {med.dosage_form} {med.strength}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium text-slate-700">
                        {med.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-sm font-extrabold ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>
                          {med.stock_quantity}
                        </span>
                        {isLow && (
                          <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <AlertTriangle className="w-3 h-3" />
                            Low
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {med.reorder_level} units
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-teal-800">
                      ${med.unit_price.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleAdjustStock(med.id, med.stock_quantity, -5)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold"
                          title="Reduce 5 units"
                        >
                          -5
                        </button>
                        <button
                          onClick={() => handleAdjustStock(med.id, med.stock_quantity, 10)}
                          className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded text-xs font-semibold"
                          title="Restock 10 units"
                        >
                          +10
                        </button>
                        <button
                          onClick={() => handleAdjustStock(med.id, med.stock_quantity, 50)}
                          className="px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-semibold"
                          title="Restock 50 units"
                        >
                          +50
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inventory Audit Trail */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-teal-600" />
            <h4 className="font-bold text-sm text-slate-900">Inventory Transaction Audit Log</h4>
          </div>
          <span className="text-xs text-slate-400">Recorded via inventory_transactions table</span>
        </div>

        {inventoryLogs.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-3 text-center">No transactions recorded yet in this session.</p>
        ) : (
          <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
            {inventoryLogs.slice(0, 15).map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      log.quantity_change > 0
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {log.quantity_change > 0 ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownLeft className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">{log.medication_name}</span>
                    <span className="text-[11px] text-slate-500 ml-2">
                      ({log.reason || log.change_type}) • {log.performed_by_name}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`font-mono font-bold ${
                      log.quantity_change > 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {log.quantity_change > 0 ? `+${log.quantity_change}` : log.quantity_change}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    New: {log.new_stock}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

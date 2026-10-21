import React, { useState } from 'react';
import { 
  FileText, 
  RotateCw, 
  Calendar, 
  User, 
  ShieldCheck, 
  AlertCircle, 
  Plus, 
  CheckCircle2, 
  Pill,
  Clock
} from 'lucide-react';
import { Prescription, Profile } from '../types/pharmacy.ts';
import { pharmacyStore } from '../services/store.ts';

interface PrescriptionsListProps {
  prescriptions: Prescription[];
  currentUser: Profile | null;
  onOpenPrescribeModal: () => void;
}

export const PrescriptionsList: React.FC<PrescriptionsListProps> = ({
  prescriptions,
  currentUser,
  onOpenPrescribeModal
}) => {
  const [refillStatus, setRefillStatus] = useState<{ id: string; msg: string; success: boolean } | null>(null);

  const handleRequestRefill = (id: string) => {
    const res = pharmacyStore.requestRefill(id);
    setRefillStatus({ id, msg: res.message, success: res.success });
    setTimeout(() => setRefillStatus(null), 4000);
  };

  const isStaff = currentUser?.role === 'pharmacist' || currentUser?.role === 'doctor' || currentUser?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Active Prescriptions & Refills</h2>
            <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
              {prescriptions.length} Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track licensed prescriptions, monitor remaining refills, and submit refill dispatch requests directly.
          </p>
        </div>

        <button
          onClick={onOpenPrescribeModal}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Authorize / Write Prescription
        </button>
      </div>

      {refillStatus && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 transition-all ${
            refillStatus.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {refillStatus.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span className="font-medium">{refillStatus.msg}</span>
        </div>
      )}

      {/* Prescriptions List */}
      {prescriptions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Prescriptions On File</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You currently have no active doctor prescriptions registered. Use the button above to write or upload an authorized prescription.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {prescriptions.map((rx) => {
            const hasRefills = rx.refills_remaining > 0;

            return (
              <div
                key={rx.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Rx Number & Status */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-slate-800">Rx #{rx.id.toUpperCase()}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {rx.status}
                    </span>
                  </div>

                  {/* Drug Title */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-bold text-base text-slate-900 flex items-center gap-1.5">
                        <Pill className="w-4 h-4 text-teal-600" />
                        {rx.medication_name}
                      </h3>
                      {rx.medication_strength && (
                        <p className="text-xs font-medium text-teal-700">{rx.medication_strength}</p>
                      )}
                    </div>
                  </div>

                  {/* Dosage Directions */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 my-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Sig / Directions
                    </span>
                    <p className="text-xs font-semibold text-slate-800 leading-snug">
                      {rx.dosage}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                      <span>Frequency: <strong>{rx.frequency}</strong></span>
                      <span>•</span>
                      <span>Quantity: <strong>{rx.quantity}</strong></span>
                      <span>•</span>
                      <span>Duration: <strong>{rx.duration_days} days</strong></span>
                    </div>
                  </div>

                  {/* Doctor & Clinic Credentials */}
                  <div className="space-y-1 text-xs text-slate-600 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Prescribed by:</span>
                      <span className="font-semibold text-slate-800">{rx.doctor_name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">DEA / License:</span>
                      <span className="font-mono font-medium text-slate-700">{rx.doctor_license}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Valid Until:</span>
                      <span className="font-medium text-slate-700">{rx.expiration_date}</span>
                    </div>
                  </div>

                  {rx.notes && (
                    <p className="text-[11px] text-slate-500 italic bg-amber-50/60 p-2 rounded-lg border border-amber-100 mb-3">
                      Notes: {rx.notes}
                    </p>
                  )}
                </div>

                {/* Footer: Refills Remaining & Request Button */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Refills Left</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-sm font-extrabold ${hasRefills ? 'text-teal-700' : 'text-rose-600'}`}>
                        {rx.refills_remaining} of {rx.refills_allowed}
                      </span>
                      {!hasRefills && (
                        <span className="text-[10px] text-rose-600 font-semibold">(Contact Doctor)</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRequestRefill(rx.id)}
                    disabled={!hasRefills}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                      hasRefills
                        ? 'bg-teal-600 hover:bg-teal-700 text-white'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Request Refill</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

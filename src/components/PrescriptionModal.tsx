import React, { useState } from 'react';
import { X, FileText, CheckCircle2, User, Pill, Calendar } from 'lucide-react';
import { pharmacyStore } from '../services/store.ts';
import { Medication } from '../types/pharmacy.ts';

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedMedication?: Medication | null;
}

export const PrescriptionModal: React.FC<PrescriptionModalProps> = ({
  isOpen,
  onClose,
  preselectedMedication
}) => {
  const medications = pharmacyStore.getMedications();
  const profiles = pharmacyStore.getProfiles().filter((p) => p.role === 'patient');
  const currentUser = pharmacyStore.getCurrentUser();

  const [patientId, setPatientId] = useState(
    currentUser?.role === 'patient' ? currentUser.id : profiles[0]?.id || 'usr_patient_demo'
  );
  const [medicationId, setMedicationId] = useState(
    preselectedMedication?.id || medications[0]?.id || ''
  );
  const [doctorName, setDoctorName] = useState('Dr. Rebecca Chen, MD');
  const [doctorLicense, setDoctorLicense] = useState('MD-928410-NY');
  const [dosage, setDosage] = useState('1 tablet orally twice daily with meals');
  const [frequency, setFrequency] = useState('Twice Daily');
  const [durationDays, setDurationDays] = useState(30);
  const [quantity, setQuantity] = useState(60);
  const [refillsAllowed, setRefillsAllowed] = useState(3);
  const [notes, setNotes] = useState('Monitor symptoms and follow up in 4 weeks.');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const med = medications.find((m) => m.id === medicationId);
    if (!med) return;

    const issuedDate = new Date().toISOString().split('T')[0];
    const expiryDateObj = new Date();
    expiryDateObj.setDate(expiryDateObj.getDate() + 365);
    const expirationDate = expiryDateObj.toISOString().split('T')[0];

    pharmacyStore.addPrescription({
      patient_id: patientId,
      medication_id: med.id,
      medication_name: med.name,
      medication_strength: med.strength,
      doctor_name: doctorName,
      doctor_license: doctorLicense,
      dosage,
      frequency,
      duration_days: Number(durationDays),
      quantity: Number(quantity),
      refills_allowed: Number(refillsAllowed),
      refills_remaining: Number(refillsAllowed),
      status: 'active',
      issued_date: issuedDate,
      expiration_date: expirationDate,
      notes
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-6">
        <div className="px-6 py-4 bg-amber-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-200" />
            <h3 className="text-lg font-bold">Write / Authorize Prescription</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-amber-200 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Patient</label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name} ({p.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Prescribed Medication</label>
            <select
              value={medicationId}
              onChange={(e) => setMedicationId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white"
            >
              {medications.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.strength}) - {m.dosage_form} [{m.category}]
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Prescribing Physician</label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Doctor License #</label>
              <input
                type="text"
                value={doctorLicense}
                onChange={(e) => setDoctorLicense(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Sig / Dosage Instructions</label>
            <input
              type="text"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="e.g. Take 1 tablet by mouth twice daily"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="Once Daily">Once Daily</option>
                <option value="Twice Daily">Twice Daily</option>
                <option value="Every 8 Hours">Every 8 Hours</option>
                <option value="Nightly">Nightly</option>
                <option value="As Needed (PRN)">As Needed (PRN)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dispense Qty</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 30)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Refills Allowed</label>
              <input
                type="number"
                min="0"
                max="12"
                value={refillsAllowed}
                onChange={(e) => setRefillsAllowed(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Clinical Notes & Precautions</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Authorize & Issue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

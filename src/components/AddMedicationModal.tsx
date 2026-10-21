import React, { useState } from 'react';
import { X, Plus, Pill, DollarSign, Layers, Building, AlertCircle } from 'lucide-react';
import { pharmacyStore } from '../services/store.ts';
import { MedicationCategory, DosageForm } from '../types/pharmacy.ts';

interface AddMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddMedicationModal: React.FC<AddMedicationModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [category, setCategory] = useState<MedicationCategory>('Antibiotics');
  const [dosageForm, setDosageForm] = useState<DosageForm>('Tablet');
  const [strength, setStrength] = useState('');
  const [description, setDescription] = useState('');
  const [usageInstructions, setUsageInstructions] = useState('');
  const [prescriptionRequired, setPrescriptionRequired] = useState(true);
  const [stockQuantity, setStockQuantity] = useState(100);
  const [reorderLevel, setReorderLevel] = useState(20);
  const [unitPrice, setUnitPrice] = useState(15.00);
  const [manufacturer, setManufacturer] = useState('');
  const [ndcCode, setNdcCode] = useState('');
  const [sideEffects, setSideEffects] = useState('Nausea, Headache, Drowsiness');
  const [contraindications, setContraindications] = useState('Known allergy to active ingredient');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !genericName || !strength || !manufacturer) {
      alert('Please fill out the required fields.');
      return;
    }

    pharmacyStore.addMedication({
      name,
      generic_name: genericName,
      brand_name: brandName || undefined,
      category,
      dosage_form: dosageForm,
      strength,
      description: description || `Standard clinical formulation of ${genericName}.`,
      usage_instructions: usageInstructions || `Take as directed by your physician or pharmacist.`,
      prescription_required: prescriptionRequired,
      stock_quantity: Number(stockQuantity),
      reorder_level: Number(reorderLevel),
      unit_price: Number(unitPrice),
      manufacturer,
      ndc_code: ndcCode || undefined,
      side_effects: sideEffects.split(',').map((s) => s.trim()).filter(Boolean),
      contraindications: contraindications.split(',').map((s) => s.trim()).filter(Boolean),
      is_active: true
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6">
        <div className="px-6 py-4 bg-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-teal-300" />
            <h3 className="text-lg font-bold">Add New Pharmaceutical Product</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-teal-200 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Medication Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ciprofloxacin HCl"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Generic Name (Active Ingredient) *</label>
              <input
                type="text"
                value={genericName}
                onChange={(e) => setGenericName(e.target.value)}
                placeholder="e.g. Ciprofloxacin"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Brand Name (Optional)</label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Cipro"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dosage Form *</label>
              <select
                value={dosageForm}
                onChange={(e) => setDosageForm(e.target.value as DosageForm)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Liquid">Liquid</option>
                <option value="Inhaler">Inhaler</option>
                <option value="Topical">Topical</option>
                <option value="Injection">Injection</option>
                <option value="Patch">Patch</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Strength (e.g. 500 mg) *</label>
              <input
                type="text"
                value={strength}
                onChange={(e) => setStrength(e.target.value)}
                placeholder="500 mg / 10 ml"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Therapeutic Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MedicationCategory)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="Antibiotics">Antibiotics</option>
                <option value="Cardiovascular">Cardiovascular</option>
                <option value="Endocrine & Diabetes">Endocrine & Diabetes</option>
                <option value="Pain Relief & Analgesics">Pain Relief & Analgesics</option>
                <option value="Respiratory & Asthma">Respiratory & Asthma</option>
                <option value="Gastrointestinal">Gastrointestinal</option>
                <option value="Mental Health & Neurology">Mental Health & Neurology</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Vitamins & Supplements">Vitamins & Supplements</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Manufacturer *</label>
              <input
                type="text"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="e.g. Bayer Pharmaceuticals"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Unit Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={unitPrice}
                onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Initial Stock</label>
              <input
                type="number"
                min="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reorder Threshold</label>
              <input
                type="number"
                min="0"
                value={reorderLevel}
                onChange={(e) => setReorderLevel(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">NDC Code (Optional)</label>
              <input
                type="text"
                value={ndcCode}
                onChange={(e) => setNdcCode(e.target.value)}
                placeholder="0024-5860-01"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 font-mono"
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="rxRequired"
                checked={prescriptionRequired}
                onChange={(e) => setPrescriptionRequired(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
              />
              <label htmlFor="rxRequired" className="font-semibold text-slate-800 cursor-pointer">
                Requires Doctor's Prescription (Rx)
              </label>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Clinical Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Indication, therapeutic effects, and primary mechanism of action..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Usage & Dosage Instructions</label>
            <input
              type="text"
              value={usageInstructions}
              onChange={(e) => setUsageInstructions(e.target.value)}
              placeholder="Take 1 tablet every 12 hours with plenty of fluids."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Side Effects (Comma separated)</label>
              <input
                type="text"
                value={sideEffects}
                onChange={(e) => setSideEffects(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contraindications (Comma separated)</label>
              <input
                type="text"
                value={contraindications}
                onChange={(e) => setContraindications(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
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
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Save to Catalog
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

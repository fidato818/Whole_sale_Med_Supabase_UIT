import React, { useState } from 'react';
import { 
  X, 
  Pill, 
  AlertTriangle, 
  CheckCircle2, 
  ShoppingCart, 
  FileText, 
  ShieldAlert, 
  Thermometer, 
  Building2, 
  Barcode 
} from 'lucide-react';
import { Medication } from '../types/pharmacy.ts';
import { pharmacyStore } from '../services/store.ts';

interface MedicationDetailModalProps {
  medication: Medication | null;
  onClose: () => void;
  onRequestPrescription: (med: Medication) => void;
}

export const MedicationDetailModal: React.FC<MedicationDetailModalProps> = ({
  medication,
  onClose,
  onRequestPrescription
}) => {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!medication) return null;

  const handleAddToCart = () => {
    pharmacyStore.addToCart(medication, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const isLowStock = medication.stock_quantity > 0 && medication.stock_quantity <= medication.reorder_level;
  const isOutOfStock = medication.stock_quantity <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-teal-800 to-slate-900 text-white flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-500/30 text-teal-200 border border-teal-400/30">
                {medication.category}
              </span>
              {medication.prescription_required ? (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  Rx Required
                </span>
              ) : (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Over-The-Counter (OTC)
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">{medication.name}</h2>
            <p className="text-xs text-teal-200">
              Generic: <span className="font-semibold">{medication.generic_name}</span>
              {medication.brand_name && ` • Brand: ${medication.brand_name}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Quick Specs Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Dosage Form</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                <Pill className="w-3.5 h-3.5 text-teal-600" />
                {medication.dosage_form}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Strength</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">{medication.strength}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Unit Price</span>
              <span className="font-bold text-teal-700 text-sm mt-0.5 block">${medication.unit_price.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Stock Status</span>
              {isOutOfStock ? (
                <span className="text-rose-600 font-bold mt-0.5 block">Out of Stock</span>
              ) : isLowStock ? (
                <span className="text-amber-600 font-bold mt-0.5 block">Low Stock ({medication.stock_quantity})</span>
              ) : (
                <span className="text-emerald-600 font-bold mt-0.5 block">{medication.stock_quantity} available</span>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Clinical Indications & Description
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 border border-slate-100 rounded-lg">
              {medication.description}
            </p>
          </div>

          {/* Usage Instructions */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Administration & Usage Directions
            </h4>
            <div className="bg-teal-50/50 border border-teal-100 rounded-lg p-3 text-xs text-teal-950 font-medium leading-relaxed">
              {medication.usage_instructions}
            </div>
          </div>

          {/* Side Effects & Contraindications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Common Side Effects
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {medication.side_effects && medication.side_effects.length > 0 ? (
                  medication.side_effects.map((se, idx) => (
                    <span key={idx} className="text-[11px] px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg">
                      {se}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">None reported</span>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                Contraindications & Warnings
              </h4>
              <div className="space-y-1">
                {medication.contraindications && medication.contraindications.length > 0 ? (
                  medication.contraindications.map((ci, idx) => (
                    <div key={idx} className="text-[11px] text-rose-800 bg-rose-50 border border-rose-200 rounded-lg p-2 leading-tight">
                      • {ci}
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">Standard clinical precautions</span>
                )}
              </div>
            </div>
          </div>

          {/* Pharmaceutical Info Footer */}
          <div className="border-t border-slate-100 pt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Mfg: {medication.manufacturer}</span>
            </div>
            {medication.ndc_code && (
              <div className="flex items-center gap-1.5">
                <Barcode className="w-3.5 h-3.5 text-slate-400" />
                <span>NDC: {medication.ndc_code}</span>
              </div>
            )}
            {medication.storage_conditions && (
              <div className="flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{medication.storage_conditions}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 font-semibold">Quantity:</span>
            <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 text-xs font-bold"
              >
                -
              </button>
              <span className="px-3 py-1 text-xs font-semibold text-slate-800">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 text-xs font-bold"
              >
                +
              </button>
            </div>
            <span className="text-xs text-slate-500 ml-1">
              Total: <strong className="text-slate-900">${(medication.unit_price * quantity).toFixed(2)}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {medication.prescription_required ? (
              <button
                onClick={() => {
                  onClose();
                  onRequestPrescription(medication);
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
              >
                <FileText className="w-3.5 h-3.5" />
                Prescribe / Request Rx
              </button>
            ) : null}

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors shadow-sm ${
                added
                  ? 'bg-emerald-600 text-white'
                  : isOutOfStock
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-teal-600 hover:bg-teal-700 text-white'
              }`}
            >
              {added ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  {medication.prescription_required ? 'Add Rx Item to Order' : 'Add to Pharmacy Cart'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

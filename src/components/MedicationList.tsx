import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Pill, 
  Plus, 
  ShoppingCart, 
  CheckCircle2, 
  Info, 
  ShieldAlert, 
  Sparkles,
  Layers
} from 'lucide-react';
import { Medication, MedicationCategory, Profile } from '../types/pharmacy.ts';
import { pharmacyStore } from '../services/store.ts';

interface MedicationListProps {
  medications: Medication[];
  currentUser: Profile | null;
  onSelectMedication: (med: Medication) => void;
  onOpenAddModal: () => void;
  onOpenSupabaseHub: () => void;
}

const CATEGORIES: ('All' | MedicationCategory)[] = [
  'All',
  'Antibiotics',
  'Cardiovascular',
  'Endocrine & Diabetes',
  'Pain Relief & Analgesics',
  'Respiratory & Asthma',
  'Gastrointestinal',
  'Mental Health & Neurology',
  'Vitamins & Supplements'
];

export const MedicationList: React.FC<MedicationListProps> = ({
  medications,
  currentUser,
  onSelectMedication,
  onOpenAddModal,
  onOpenSupabaseHub
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | MedicationCategory>('All');
  const [filterType, setFilterType] = useState<'all' | 'rx' | 'otc' | 'in_stock'>('all');
  const [addedId, setAddedId] = useState<string | null>(null);

  const handleQuickAdd = (e: React.MouseEvent, med: Medication) => {
    e.stopPropagation();
    pharmacyStore.addToCart(med, 1);
    setAddedId(med.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const filteredMeds = medications.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.generic_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.brand_name && m.brand_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      m.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;

    const matchesFilter =
      filterType === 'all'
        ? true
        : filterType === 'rx'
        ? m.prescription_required
        : filterType === 'otc'
        ? !m.prescription_required
        : m.stock_quantity > 0;

    return matchesSearch && matchesCategory && matchesFilter;
  });

  const isStaff = currentUser?.role === 'pharmacist' || currentUser?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Digital Pharmacy & Prescription Dispatch</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Whole Medicines Clinical Catalog
          </h1>
          <p className="text-sm text-teal-100/90 leading-relaxed">
            Browse pharmaceutical treatments, verify NDC codes, review contraindications, and manage prescription refills backed by the Postgres & Supabase schema.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onOpenSupabaseHub}
              className="px-3.5 py-1.5 bg-white text-teal-900 hover:bg-teal-50 rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-teal-700" />
              Inspect Supabase Database Schema
            </button>
            {isStaff && (
              <button
                onClick={onOpenAddModal}
                className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add New Drug to Database
              </button>
            )}
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-teal-500/20 to-transparent pointer-events-none" />
      </div>

      {/* Controls Bar: Search & Filter Tabs */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by drug name, generic ingredient, brand or condition..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Quick Filter Radios */}
          <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filterType === 'all'
                  ? 'bg-teal-700 text-white font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Drugs ({medications.length})
            </button>
            <button
              onClick={() => setFilterType('rx')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filterType === 'rx'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Rx Required
            </button>
            <button
              onClick={() => setFilterType('otc')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filterType === 'otc'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              OTC (Over The Counter)
            </button>
            <button
              onClick={() => setFilterType('in_stock')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filterType === 'in_stock'
                  ? 'bg-sky-600 text-white font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              In Stock Only
            </button>
          </div>
        </div>

        {/* Categories Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-teal-100 text-teal-900 border border-teal-300 font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Medication Grid */}
      {filteredMeds.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Pill className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No medications matched your filters</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, selecting "All" categories, or resetting the prescription filter.
          </p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedCategory('All'); setFilterType('all'); }}
            className="text-xs text-teal-700 hover:underline font-bold"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMeds.map((med) => {
            const isOutOfStock = med.stock_quantity <= 0;
            const isLowStock = med.stock_quantity > 0 && med.stock_quantity <= med.reorder_level;

            return (
              <div
                key={med.id}
                onClick={() => onSelectMedication(med)}
                className="bg-white rounded-2xl border border-slate-200 hover:border-teal-400 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  {/* Card Badges */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {med.category}
                    </span>
                    {med.prescription_required ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        Rx Required
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        OTC Available
                      </span>
                    )}
                  </div>

                  {/* Title & Generic Name */}
                  <h3 className="font-bold text-base text-slate-900 group-hover:text-teal-700 transition-colors">
                    {med.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mb-2">
                    {med.generic_name} {med.brand_name && `(${med.brand_name})`}
                  </p>

                  {/* Form & Strength */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md bg-teal-50 text-teal-800 border border-teal-100">
                      <Pill className="w-3.5 h-3.5 text-teal-600" />
                      {med.dosage_form} • {med.strength}
                    </span>
                  </div>

                  {/* Clinical Description Snippet */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    {med.description}
                  </p>
                </div>

                {/* Footer: Price, Stock & Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block text-[10px] uppercase font-semibold">Unit Price</span>
                    <span className="text-base font-extrabold text-teal-800">${med.unit_price.toFixed(2)}</span>
                    <div className="text-[10px] mt-0.5">
                      {isOutOfStock ? (
                        <span className="text-rose-600 font-bold">Out of stock</span>
                      ) : isLowStock ? (
                        <span className="text-amber-600 font-semibold">Low: {med.stock_quantity} left</span>
                      ) : (
                        <span className="text-emerald-600 font-medium">{med.stock_quantity} in stock</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectMedication(med);
                      }}
                      className="p-2 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Clinical Details & NDC"
                    >
                      <Info className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleQuickAdd(e, med)}
                      disabled={isOutOfStock}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                        addedId === med.id
                          ? 'bg-emerald-600 text-white'
                          : isOutOfStock
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-teal-600 hover:bg-teal-700 text-white'
                      }`}
                    >
                      {addedId === med.id ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Added!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

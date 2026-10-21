/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { pharmacyStore } from './services/store.ts';
import { Navbar } from './components/Navbar.tsx';
import { MedicationList } from './components/MedicationList.tsx';
import { PrescriptionsList } from './components/PrescriptionsList.tsx';
import { ScheduleTracker } from './components/ScheduleTracker.tsx';
import { OrdersList } from './components/OrdersList.tsx';
import { InventoryManager } from './components/InventoryManager.tsx';
import { MedicationDetailModal } from './components/MedicationDetailModal.tsx';
import { AddMedicationModal } from './components/AddMedicationModal.tsx';
import { PrescriptionModal } from './components/PrescriptionModal.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { SupabaseHubModal } from './components/SupabaseHubModal.tsx';
import { Medication, Profile } from './types/pharmacy.ts';
import { Database, ShieldCheck, Heart, Pill, ExternalLink } from 'lucide-react';

export default function App() {
  const [, setTick] = useState(0);

  // Active view tab: 'medications' | 'prescriptions' | 'schedule' | 'orders' | 'inventory'
  const [currentTab, setCurrentTab] = useState('medications');

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSupabaseHubOpen, setIsSupabaseHubOpen] = useState(false);
  const [isAddMedOpen, setIsAddMedOpen] = useState(false);
  const [isPrescribeOpen, setIsPrescribeOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [prescribeTargetMed, setPrescribeTargetMed] = useState<Medication | null>(null);

  // Store subscription
  useEffect(() => {
    const unsubscribe = pharmacyStore.subscribe(() => {
      setTick((t) => t + 1);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const currentUser = pharmacyStore.getCurrentUser();
  const medications = pharmacyStore.getMedications();
  const prescriptions = pharmacyStore.getPrescriptions(
    currentUser?.role === 'patient' ? currentUser?.id : undefined
  );
  const schedules = pharmacyStore.getSchedules(
    currentUser?.role === 'patient' ? currentUser?.id : undefined
  );
  const orders = pharmacyStore.getOrders(
    currentUser?.role === 'patient' ? currentUser?.id : undefined
  );
  const cart = pharmacyStore.getCart();

  const handleOpenPrescribeForMed = (med: Medication) => {
    setPrescribeTargetMed(med);
    setIsPrescribeOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSupabaseHub={() => setIsSupabaseHubOpen(true)}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'medications' && (
          <MedicationList
            medications={medications}
            currentUser={currentUser}
            onSelectMedication={(med) => setSelectedMedication(med)}
            onOpenAddModal={() => setIsAddMedOpen(true)}
            onOpenSupabaseHub={() => setIsSupabaseHubOpen(true)}
          />
        )}

        {currentTab === 'prescriptions' && (
          <PrescriptionsList
            prescriptions={prescriptions}
            currentUser={currentUser}
            onOpenPrescribeModal={() => {
              setPrescribeTargetMed(null);
              setIsPrescribeOpen(true);
            }}
          />
        )}

        {currentTab === 'schedule' && (
          <ScheduleTracker
            schedules={schedules}
            currentUser={currentUser}
          />
        )}

        {currentTab === 'orders' && (
          <OrdersList
            orders={orders}
            currentUser={currentUser}
          />
        )}

        {currentTab === 'inventory' && (
          <InventoryManager
            medications={medications}
            currentUser={currentUser}
            onOpenAddModal={() => setIsAddMedOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center">
              <Pill className="w-3.5 h-3.5 -rotate-45" />
            </div>
            <span className="font-bold text-slate-800">Whole Medicines</span>
            <span>•</span>
            <span>Clinical Pharmacy & Medication Platform</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <button
              onClick={() => setIsSupabaseHubOpen(true)}
              className="text-teal-700 hover:text-teal-900 flex items-center gap-1 font-semibold"
            >
              <Database className="w-3.5 h-3.5" />
              Supabase Schema & RLS Policies
            </button>
            <a
              href="/api/supabase/schema"
              target="_blank"
              rel="noreferrer"
              className="text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              Download .sql
            </a>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <MedicationDetailModal
        medication={selectedMedication}
        onClose={() => setSelectedMedication(null)}
        onRequestPrescription={handleOpenPrescribeForMed}
      />

      <AddMedicationModal
        isOpen={isAddMedOpen}
        onClose={() => setIsAddMedOpen(false)}
      />

      <PrescriptionModal
        isOpen={isPrescribeOpen}
        onClose={() => setIsPrescribeOpen(false)}
        preselectedMedication={prescribeTargetMed}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOrderSuccess={() => setCurrentTab('orders')}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <SupabaseHubModal
        isOpen={isSupabaseHubOpen}
        onClose={() => setIsSupabaseHubOpen(false)}
      />
    </div>
  );
}

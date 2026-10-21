import { 
  Medication, 
  Prescription, 
  MedicationSchedule, 
  IntakeLog, 
  Profile, 
  Order, 
  OrderItem,
  InventoryTransaction,
  UserRole
} from '../types/pharmacy.ts';
import { 
  INITIAL_MEDICATIONS, 
  INITIAL_PRESCRIPTIONS, 
  INITIAL_SCHEDULES, 
  INITIAL_INTAKE_LOGS, 
  INITIAL_ORDERS, 
  INITIAL_PROFILES 
} from './mockData.ts';
import { getSupabase } from './supabase.ts';

const STORAGE_KEYS = {
  CURRENT_USER: 'wm_current_user',
  PROFILES: 'wm_profiles',
  MEDICATIONS: 'wm_medications',
  PRESCRIPTIONS: 'wm_prescriptions',
  SCHEDULES: 'wm_schedules',
  INTAKE_LOGS: 'wm_intake_logs',
  ORDERS: 'wm_orders',
  CART: 'wm_cart',
  INVENTORY_LOGS: 'wm_inventory_logs',
};

class PharmacyStore {
  private currentUser: Profile | null = null;
  private profiles: Profile[] = [];
  private medications: Medication[] = [];
  private prescriptions: Prescription[] = [];
  private schedules: MedicationSchedule[] = [];
  private intakeLogs: IntakeLog[] = [];
  private orders: Order[] = [];
  private cart: OrderItem[] = [];
  private inventoryLogs: InventoryTransaction[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedProfiles = localStorage.getItem(STORAGE_KEYS.PROFILES);
      this.profiles = storedProfiles ? JSON.parse(storedProfiles) : INITIAL_PROFILES;

      const storedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      this.currentUser = storedUser ? JSON.parse(storedUser) : this.profiles[0];

      const storedMeds = localStorage.getItem(STORAGE_KEYS.MEDICATIONS);
      this.medications = storedMeds ? JSON.parse(storedMeds) : INITIAL_MEDICATIONS;

      const storedRx = localStorage.getItem(STORAGE_KEYS.PRESCRIPTIONS);
      this.prescriptions = storedRx ? JSON.parse(storedRx) : INITIAL_PRESCRIPTIONS;

      const storedSch = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
      this.schedules = storedSch ? JSON.parse(storedSch) : INITIAL_SCHEDULES;

      const storedLogs = localStorage.getItem(STORAGE_KEYS.INTAKE_LOGS);
      this.intakeLogs = storedLogs ? JSON.parse(storedLogs) : INITIAL_INTAKE_LOGS;

      const storedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
      this.orders = storedOrders ? JSON.parse(storedOrders) : INITIAL_ORDERS;

      const storedCart = localStorage.getItem(STORAGE_KEYS.CART);
      this.cart = storedCart ? JSON.parse(storedCart) : [];

      const storedInv = localStorage.getItem(STORAGE_KEYS.INVENTORY_LOGS);
      this.inventoryLogs = storedInv ? JSON.parse(storedInv) : [];
    } catch (e) {
      console.error('Error loading storage, resetting to defaults', e);
      this.profiles = INITIAL_PROFILES;
      this.currentUser = INITIAL_PROFILES[0];
      this.medications = INITIAL_MEDICATIONS;
      this.prescriptions = INITIAL_PRESCRIPTIONS;
      this.schedules = INITIAL_SCHEDULES;
      this.intakeLogs = INITIAL_INTAKE_LOGS;
      this.orders = INITIAL_ORDERS;
      this.cart = [];
      this.inventoryLogs = [];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.currentUser));
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(this.profiles));
      localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(this.medications));
      localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(this.prescriptions));
      localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(this.schedules));
      localStorage.setItem(STORAGE_KEYS.INTAKE_LOGS, JSON.stringify(this.intakeLogs));
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(this.orders));
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(this.cart));
      localStorage.setItem(STORAGE_KEYS.INVENTORY_LOGS, JSON.stringify(this.inventoryLogs));
    } catch (e) {
      console.error('Error persisting to localStorage', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // --- Auth & Profile ---
  public getCurrentUser(): Profile | null {
    return this.currentUser;
  }

  public getProfiles(): Profile[] {
    return this.profiles;
  }

  public switchUser(userId: string) {
    const found = this.profiles.find((p) => p.id === userId);
    if (found) {
      this.currentUser = found;
      this.saveToStorage();
    }
  }

  public loginWithCredentials(email: string, _password: string, role?: UserRole): { success: boolean; error?: string } {
    let user = this.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      // Auto register for seamless testing
      const newUser: Profile = {
        id: `usr_${Date.now()}`,
        email,
        full_name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        role: role || 'patient',
        created_at: new Date().toISOString()
      };
      this.profiles.push(newUser);
      this.currentUser = newUser;
    } else {
      if (role && user.role !== role) {
        user.role = role;
      }
      this.currentUser = user;
    }
    this.saveToStorage();
    return { success: true };
  }

  public register(email: string, fullName: string, role: UserRole, phone?: string): { success: boolean; error?: string } {
    if (this.profiles.some((p) => p.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'An account with this email already exists.' };
    }
    const newUser: Profile = {
      id: `usr_${Date.now()}`,
      email,
      full_name: fullName,
      role,
      phone,
      created_at: new Date().toISOString()
    };
    this.profiles.push(newUser);
    this.currentUser = newUser;
    this.saveToStorage();
    return { success: true };
  }

  public updateProfile(updates: Partial<Profile>) {
    if (!this.currentUser) return;
    this.currentUser = { ...this.currentUser, ...updates };
    this.profiles = this.profiles.map((p) => (p.id === this.currentUser!.id ? this.currentUser! : p));
    this.saveToStorage();
  }

  public logout() {
    this.currentUser = null;
    this.saveToStorage();
  }

  // --- Medications ---
  public getMedications(): Medication[] {
    return this.medications;
  }

  public getMedicationById(id: string): Medication | undefined {
    return this.medications.find((m) => m.id === id);
  }

  public addMedication(med: Omit<Medication, 'id'>): Medication {
    const newMed: Medication = {
      ...med,
      id: `med_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.medications.unshift(newMed);

    // Record inventory transaction
    this.inventoryLogs.unshift({
      id: `inv_${Date.now()}`,
      medication_id: newMed.id,
      medication_name: newMed.name,
      change_type: 'restock',
      quantity_change: newMed.stock_quantity,
      previous_stock: 0,
      new_stock: newMed.stock_quantity,
      performed_by_name: this.currentUser?.full_name || 'Pharmacist Staff',
      reason: 'Initial stock intake',
      created_at: new Date().toISOString()
    });

    this.saveToStorage();
    return newMed;
  }

  public updateMedication(id: string, updates: Partial<Medication>): Medication | null {
    const index = this.medications.findIndex((m) => m.id === id);
    if (index === -1) return null;

    const oldMed = this.medications[index];
    const updated = {
      ...oldMed,
      ...updates,
      updated_at: new Date().toISOString()
    };

    if (updates.stock_quantity !== undefined && updates.stock_quantity !== oldMed.stock_quantity) {
      const diff = updates.stock_quantity - oldMed.stock_quantity;
      this.inventoryLogs.unshift({
        id: `inv_${Date.now()}`,
        medication_id: id,
        medication_name: updated.name,
        change_type: diff > 0 ? 'restock' : 'adjustment',
        quantity_change: diff,
        previous_stock: oldMed.stock_quantity,
        new_stock: updates.stock_quantity,
        performed_by_name: this.currentUser?.full_name || 'Staff',
        reason: 'Manual inventory stock update',
        created_at: new Date().toISOString()
      });
    }

    this.medications[index] = updated;
    this.saveToStorage();
    return updated;
  }

  // --- Prescriptions ---
  public getPrescriptions(patientId?: string): Prescription[] {
    if (patientId) {
      return this.prescriptions.filter((p) => p.patient_id === patientId);
    }
    return this.prescriptions;
  }

  public addPrescription(rx: Omit<Prescription, 'id'>): Prescription {
    const med = this.getMedicationById(rx.medication_id);
    const newRx: Prescription = {
      ...rx,
      id: `rx_${Date.now()}`,
      medication_name: rx.medication_name || med?.name || 'Medication',
      medication_strength: rx.medication_strength || med?.strength || '',
      created_at: new Date().toISOString()
    };
    this.prescriptions.unshift(newRx);

    // Automatically create a schedule reminder for the patient!
    this.addSchedule({
      patient_id: newRx.patient_id,
      prescription_id: newRx.id,
      medication_id: newRx.medication_id,
      medication_name: newRx.medication_name!,
      strength: newRx.medication_strength!,
      dosage_instructions: newRx.dosage,
      time_slots: ['08:00', '20:00'],
      with_food: true,
      start_date: newRx.issued_date,
      is_active: true
    });

    this.saveToStorage();
    return newRx;
  }

  public requestRefill(prescriptionId: string): { success: boolean; message: string } {
    const rx = this.prescriptions.find((p) => p.id === prescriptionId);
    if (!rx) return { success: false, message: 'Prescription not found.' };
    if (rx.refills_remaining <= 0) {
      return { success: false, message: 'No refills remaining. Please consult your physician for authorization.' };
    }

    rx.refills_remaining -= 1;
    rx.status = 'active';

    // Auto add to orders
    const med = this.getMedicationById(rx.medication_id);
    if (med) {
      this.createOrder({
        patient_id: rx.patient_id,
        items: [{
          id: `item_${Date.now()}`,
          medication_id: med.id,
          medication_name: med.name,
          dosage_form: med.dosage_form,
          strength: med.strength,
          quantity: 1,
          unit_price: med.unit_price,
          subtotal: med.unit_price
        }],
        total_amount: med.unit_price,
        delivery_method: 'pickup',
        notes: `Prescription Refill Request for Rx #${rx.id}`
      });
    }

    this.saveToStorage();
    return { success: true, message: `Refill submitted! ${rx.refills_remaining} refills now remaining.` };
  }

  // --- Schedules & Adherence ---
  public getSchedules(patientId?: string): MedicationSchedule[] {
    const id = patientId || this.currentUser?.id;
    return this.schedules.filter((s) => !id || s.patient_id === id);
  }

  public addSchedule(sch: Omit<MedicationSchedule, 'id'>): MedicationSchedule {
    const newSch: MedicationSchedule = {
      ...sch,
      id: `sch_${Date.now()}`
    };
    this.schedules.push(newSch);
    this.saveToStorage();
    return newSch;
  }

  public getIntakeLogs(patientId?: string, dateStr?: string): IntakeLog[] {
    const id = patientId || this.currentUser?.id;
    return this.intakeLogs.filter((log) => {
      const matchPatient = !id || log.patient_id === id;
      const matchDate = !dateStr || log.logged_date === dateStr;
      return matchPatient && matchDate;
    });
  }

  public logIntake(scheduleId: string, scheduledTime: string, status: 'taken' | 'skipped' | 'missed', notes?: string) {
    if (!this.currentUser) return;
    const sch = this.schedules.find((s) => s.id === scheduleId);
    if (!sch) return;

    const todayStr = new Date().toISOString().split('T')[0];
    // Find existing log for today
    const existingIndex = this.intakeLogs.findIndex(
      (l) => l.schedule_id === scheduleId && l.scheduled_time === scheduledTime && l.logged_date === todayStr
    );

    if (existingIndex >= 0) {
      this.intakeLogs[existingIndex].status = status;
      this.intakeLogs[existingIndex].taken_at = status === 'taken' ? new Date().toISOString() : undefined;
      this.intakeLogs[existingIndex].notes = notes;
    } else {
      this.intakeLogs.unshift({
        id: `log_${Date.now()}`,
        patient_id: this.currentUser.id,
        schedule_id: scheduleId,
        medication_name: sch.medication_name,
        scheduled_time: scheduledTime,
        taken_at: status === 'taken' ? new Date().toISOString() : undefined,
        status,
        notes,
        logged_date: todayStr
      });
    }
    this.saveToStorage();
  }

  // --- Cart & Orders ---
  public getCart(): OrderItem[] {
    return this.cart;
  }

  public addToCart(med: Medication, qty = 1) {
    const existing = this.cart.find((item) => item.medication_id === med.id);
    if (existing) {
      existing.quantity += qty;
      existing.subtotal = existing.quantity * existing.unit_price;
    } else {
      this.cart.push({
        id: `item_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        medication_id: med.id,
        medication_name: med.name,
        dosage_form: med.dosage_form,
        strength: med.strength,
        quantity: qty,
        unit_price: med.unit_price,
        subtotal: med.unit_price * qty
      });
    }
    this.saveToStorage();
  }

  public updateCartQuantity(medicationId: string, quantity: number) {
    if (quantity <= 0) {
      this.cart = this.cart.filter((item) => item.medication_id !== medicationId);
    } else {
      const item = this.cart.find((i) => i.medication_id === medicationId);
      if (item) {
        item.quantity = quantity;
        item.subtotal = item.quantity * item.unit_price;
      }
    }
    this.saveToStorage();
  }

  public clearCart() {
    this.cart = [];
    this.saveToStorage();
  }

  public createOrder(orderData: Partial<Order>): Order {
    const patient = this.currentUser || this.profiles[0];
    const items = orderData.items || [...this.cart];
    const total = items.reduce((acc, item) => acc + item.subtotal, 0);

    const newOrder: Order = {
      id: `ord_${Date.now().toString().slice(-6)}`,
      patient_id: orderData.patient_id || patient.id,
      patient_name: patient.full_name,
      items,
      total_amount: orderData.total_amount ?? total,
      status: 'pending',
      delivery_method: orderData.delivery_method || 'pickup',
      delivery_address: orderData.delivery_address,
      notes: orderData.notes,
      created_at: new Date().toISOString()
    };

    // Deduct stock
    for (const item of items) {
      const med = this.medications.find((m) => m.id === item.medication_id);
      if (med) {
        const prev = med.stock_quantity;
        med.stock_quantity = Math.max(0, med.stock_quantity - item.quantity);
        this.inventoryLogs.unshift({
          id: `inv_${Date.now()}`,
          medication_id: med.id,
          medication_name: med.name,
          change_type: 'dispensed',
          quantity_change: -item.quantity,
          previous_stock: prev,
          new_stock: med.stock_quantity,
          performed_by_name: 'Order Processing',
          reason: `Dispensed for Order #${newOrder.id}`,
          created_at: new Date().toISOString()
        });
      }
    }

    this.orders.unshift(newOrder);
    this.cart = [];
    this.saveToStorage();
    return newOrder;
  }

  public updateOrderStatus(orderId: string, status: Order['status']) {
    const order = this.orders.find((o) => o.id === orderId);
    if (order) {
      order.status = status;
      this.saveToStorage();
    }
  }

  public getOrders(patientId?: string): Order[] {
    const id = patientId || (this.currentUser?.role === 'patient' ? this.currentUser?.id : undefined);
    if (id) {
      return this.orders.filter((o) => o.patient_id === id);
    }
    return this.orders;
  }

  public getInventoryLogs(): InventoryTransaction[] {
    return this.inventoryLogs;
  }

  public resetToDefaults() {
    this.profiles = INITIAL_PROFILES;
    this.currentUser = INITIAL_PROFILES[0];
    this.medications = INITIAL_MEDICATIONS;
    this.prescriptions = INITIAL_PRESCRIPTIONS;
    this.schedules = INITIAL_SCHEDULES;
    this.intakeLogs = INITIAL_INTAKE_LOGS;
    this.orders = INITIAL_ORDERS;
    this.cart = [];
    this.inventoryLogs = [];
    this.saveToStorage();
  }
}

export const pharmacyStore = new PharmacyStore();

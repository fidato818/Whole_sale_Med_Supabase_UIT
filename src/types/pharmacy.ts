export type UserRole = 'patient' | 'pharmacist' | 'doctor' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  date_of_birth?: string;
  allergies?: string[];
  medical_conditions?: string[];
  emergency_contact?: string;
  avatar_url?: string;
  created_at?: string;
}

export type MedicationCategory =
  | 'Antibiotics'
  | 'Cardiovascular'
  | 'Endocrine & Diabetes'
  | 'Pain Relief & Analgesics'
  | 'Respiratory & Asthma'
  | 'Gastrointestinal'
  | 'Mental Health & Neurology'
  | 'Dermatology'
  | 'Vitamins & Supplements';

export type DosageForm =
  | 'Tablet'
  | 'Capsule'
  | 'Liquid'
  | 'Inhaler'
  | 'Topical'
  | 'Injection'
  | 'Patch';

export interface Medication {
  id: string;
  name: string;
  generic_name: string;
  brand_name?: string;
  category: MedicationCategory;
  dosage_form: DosageForm;
  strength: string;
  description: string;
  usage_instructions: string;
  side_effects: string[];
  contraindications: string[];
  prescription_required: boolean;
  stock_quantity: number;
  reorder_level: number;
  unit_price: number;
  manufacturer: string;
  ndc_code?: string;
  storage_conditions?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type PrescriptionStatus =
  | 'active'
  | 'completed'
  | 'expired'
  | 'pending_verification'
  | 'cancelled';

export interface Prescription {
  id: string;
  patient_id: string;
  medication_id: string;
  medication_name?: string;
  medication_strength?: string;
  doctor_name: string;
  doctor_license: string;
  dosage: string;
  frequency: string;
  duration_days: number;
  quantity: number;
  refills_allowed: number;
  refills_remaining: number;
  status: PrescriptionStatus;
  issued_date: string;
  expiration_date: string;
  notes?: string;
  created_at?: string;
}

export interface MedicationSchedule {
  id: string;
  patient_id: string;
  prescription_id?: string;
  medication_id: string;
  medication_name: string;
  strength: string;
  dosage_instructions: string;
  time_slots: string[]; // e.g. ["08:00", "20:00"]
  with_food: boolean;
  start_date: string;
  end_date?: string;
  is_active: boolean;
}

export type IntakeStatus = 'taken' | 'skipped' | 'missed';

export interface IntakeLog {
  id: string;
  patient_id: string;
  schedule_id: string;
  medication_name: string;
  scheduled_time: string;
  taken_at?: string;
  status: IntakeStatus;
  notes?: string;
  logged_date: string; // YYYY-MM-DD
}

export type OrderStatus =
  | 'pending'
  | 'approved'
  | 'preparing'
  | 'ready_for_pickup'
  | 'dispatched'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  id: string;
  order_id?: string;
  medication_id: string;
  medication_name: string;
  dosage_form: string;
  strength: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  patient_id: string;
  patient_name?: string;
  items: OrderItem[];
  total_amount: number;
  status: OrderStatus;
  delivery_method: 'pickup' | 'home_delivery';
  delivery_address?: string;
  prescription_file_url?: string;
  notes?: string;
  created_at: string;
}

export interface InventoryTransaction {
  id: string;
  medication_id: string;
  medication_name: string;
  change_type: 'restock' | 'dispensed' | 'adjustment' | 'expired_disposal';
  quantity_change: number;
  previous_stock: number;
  new_stock: number;
  performed_by_name: string;
  reason?: string;
  created_at: string;
}

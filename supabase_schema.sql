-- ============================================================================
-- WHOLE MEDICINES - SUPABASE POSTGRESQL SCHEMA & ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Complete schema for medications, prescriptions, dosages, schedules, 
-- pharmacy inventory, orders, and authentication integration.
-- Run this script in the Supabase SQL Editor.
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean existing schema (Safe for migrations)
-- DROP TABLE IF EXISTS inventory_transactions CASCADE;
-- DROP TABLE IF EXISTS order_items CASCADE;
-- DROP TABLE IF EXISTS orders CASCADE;
-- DROP TABLE IF EXISTS intake_logs CASCADE;
-- DROP TABLE IF EXISTS medication_schedules CASCADE;
-- DROP TABLE IF EXISTS prescriptions CASCADE;
-- DROP TABLE IF EXISTS medications CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;

-- ----------------------------------------------------------------------------
-- 1. PROFILES TABLE (Extends Supabase auth.users)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'pharmacist', 'doctor', 'admin')),
    phone TEXT,
    date_of_birth DATE,
    allergies TEXT[] DEFAULT '{}',
    medical_conditions TEXT[] DEFAULT '{}',
    emergency_contact TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. MEDICATIONS TABLE (Catalog & Core Pharmaceutical Records)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    generic_name TEXT NOT NULL,
    brand_name TEXT,
    category TEXT NOT NULL CHECK (category IN (
        'Antibiotics', 
        'Cardiovascular', 
        'Endocrine & Diabetes', 
        'Pain Relief & Analgesics', 
        'Respiratory & Asthma', 
        'Gastrointestinal', 
        'Mental Health & Neurology', 
        'Dermatology', 
        'Vitamins & Supplements'
    )),
    dosage_form TEXT NOT NULL CHECK (dosage_form IN ('Tablet', 'Capsule', 'Liquid', 'Inhaler', 'Topical', 'Injection', 'Patch')),
    strength TEXT NOT NULL,
    description TEXT NOT NULL,
    usage_instructions TEXT NOT NULL,
    side_effects TEXT[] DEFAULT '{}',
    contraindications TEXT[] DEFAULT '{}',
    prescription_required BOOLEAN NOT NULL DEFAULT true,
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    reorder_level INTEGER NOT NULL DEFAULT 20,
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    manufacturer TEXT NOT NULL,
    ndc_code TEXT,
    storage_conditions TEXT DEFAULT 'Store at room temperature 15°-30°C (59°-86°F)',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. PRESCRIPTIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    medication_id UUID NOT NULL REFERENCES public.medications(id) ON DELETE RESTRICT,
    doctor_name TEXT NOT NULL,
    doctor_license TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    duration_days INTEGER NOT NULL CHECK (duration_days > 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    refills_allowed INTEGER NOT NULL DEFAULT 0 CHECK (refills_allowed >= 0),
    refills_remaining INTEGER NOT NULL DEFAULT 0 CHECK (refills_remaining >= 0),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired', 'pending_verification', 'cancelled')),
    issued_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiration_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. MEDICATION SCHEDULES (Daily Dosages & Reminders)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.medication_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    prescription_id UUID REFERENCES public.prescriptions(id) ON DELETE SET NULL,
    medication_id UUID NOT NULL REFERENCES public.medications(id) ON DELETE RESTRICT,
    dosage_instructions TEXT NOT NULL,
    time_slots TEXT[] NOT NULL DEFAULT '{"08:00"}',
    with_food BOOLEAN DEFAULT false,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 5. INTAKE LOGS (Adherence Tracker)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.intake_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    schedule_id UUID NOT NULL REFERENCES public.medication_schedules(id) ON DELETE CASCADE,
    scheduled_time TIME NOT NULL,
    taken_at TIMESTAMPTZ,
    status TEXT NOT NULL CHECK (status IN ('taken', 'skipped', 'missed')),
    notes TEXT,
    logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 6. ORDERS & REFILL REQUESTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 
        'approved', 
        'preparing', 
        'ready_for_pickup', 
        'dispatched', 
        'delivered', 
        'cancelled'
    )),
    delivery_method TEXT NOT NULL DEFAULT 'pickup' CHECK (delivery_method IN ('pickup', 'home_delivery')),
    delivery_address TEXT,
    prescription_file_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    medication_id UUID NOT NULL REFERENCES public.medications(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 7. INVENTORY TRANSACTIONS (Audit Trail for Pharmacy Stock)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medication_id UUID NOT NULL REFERENCES public.medications(id) ON DELETE CASCADE,
    change_type TEXT NOT NULL CHECK (change_type IN ('restock', 'dispensed', 'adjustment', 'expired_disposal')),
    quantity_change INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 8. INDEXES FOR PERFORMANCE
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_medications_category ON public.medications(category);
CREATE INDEX IF NOT EXISTS idx_medications_prescription_required ON public.medications(prescription_required);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON public.prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON public.prescriptions(status);
CREATE INDEX IF NOT EXISTS idx_schedules_patient ON public.medication_schedules(patient_id);
CREATE INDEX IF NOT EXISTS idx_intake_logs_patient ON public.intake_logs(patient_id, logged_date);
CREATE INDEX IF NOT EXISTS idx_orders_patient ON public.orders(patient_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- ----------------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intake_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is pharmacist or admin
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('pharmacist', 'admin', 'doctor')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Users can read/write own profile, staff can read all
CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_staff());

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Medications: Anyone can view active medications, staff can modify
CREATE POLICY "Public can view active medications" ON public.medications
    FOR SELECT USING (is_active = true OR public.is_staff());

CREATE POLICY "Staff can manage medications" ON public.medications
    FOR ALL USING (public.is_staff());

-- Prescriptions: Patients read own, Staff can read and write
CREATE POLICY "Patients view own prescriptions" ON public.prescriptions
    FOR SELECT USING (auth.uid() = patient_id OR public.is_staff());

CREATE POLICY "Staff manage prescriptions" ON public.prescriptions
    FOR ALL USING (public.is_staff());

-- Medication Schedules: Patients manage own, staff can view
CREATE POLICY "Patients manage own schedules" ON public.medication_schedules
    FOR ALL USING (auth.uid() = patient_id OR public.is_staff());

-- Intake Logs: Patients manage own
CREATE POLICY "Patients manage own intake logs" ON public.intake_logs
    FOR ALL USING (auth.uid() = patient_id OR public.is_staff());

-- Orders: Patients manage own orders, staff can view and update status
CREATE POLICY "Patients view and create orders" ON public.orders
    FOR SELECT USING (auth.uid() = patient_id OR public.is_staff());

CREATE POLICY "Patients insert own orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Staff update orders" ON public.orders
    FOR UPDATE USING (public.is_staff());

-- Order Items: Viewable if related order is accessible
CREATE POLICY "Access order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND (orders.patient_id = auth.uid() OR public.is_staff())
        )
    );

CREATE POLICY "Insert order items" ON public.order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND orders.patient_id = auth.uid()
        )
    );

-- Inventory Transactions: Staff only
CREATE POLICY "Staff access inventory transactions" ON public.inventory_transactions
    FOR ALL USING (public.is_staff());

-- ----------------------------------------------------------------------------
-- 10. AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'role', 'patient')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

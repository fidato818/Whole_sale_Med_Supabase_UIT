import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { INITIAL_MEDICATIONS, INITIAL_PRESCRIPTIONS, INITIAL_SCHEDULES, INITIAL_ORDERS, INITIAL_PROFILES } from './src/services/mockData.ts';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// In-memory server database models for Whole Medicines
let dbMedications = [...INITIAL_MEDICATIONS];
let dbPrescriptions = [...INITIAL_PRESCRIPTIONS];
let dbSchedules = [...INITIAL_SCHEDULES];
let dbOrders = [...INITIAL_ORDERS];
let dbUsers = [...INITIAL_PROFILES];
let dbInventoryLogs: any[] = [];

// Optional live Supabase backend client if credentials exist in environment
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
let supabaseBackendClient: any = null;
if (supabaseUrl && supabaseKey) {
  try {
    supabaseBackendClient = createClient(supabaseUrl, supabaseKey);
    console.log('[Supabase] Initialized server client with:', supabaseUrl);
  } catch (err) {
    console.warn('[Supabase] Failed to init server client:', err);
  }
}

// ==========================================
// API ROUTES
// ==========================================

// Health check & Server Status
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Whole Medicines Backend API',
    supabaseConnected: Boolean(supabaseBackendClient),
    medicationsCount: dbMedications.length,
    prescriptionsCount: dbPrescriptions.length
  });
});

// Supabase SQL Schema Endpoint
app.get('/api/supabase/schema', (req: Request, res: Response) => {
  try {
    const schemaPath = path.resolve(__dirname, 'supabase_schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sqlContent = fs.readFileSync(schemaPath, 'utf8');
      res.setHeader('Content-Type', 'text/plain');
      return res.send(sqlContent);
    }
    return res.status(404).json({ error: 'supabase_schema.sql file not found' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Supabase Status Endpoint
app.get('/api/supabase/status', async (req: Request, res: Response) => {
  if (!supabaseBackendClient) {
    return res.json({
      connected: false,
      message: 'Supabase URL and Key are not set in server environment. Running in high-performance integrated backend mode.',
      instructions: 'Set SUPABASE_URL and SUPABASE_ANON_KEY to enable direct Supabase cloud sync.'
    });
  }

  try {
    const { data, error } = await supabaseBackendClient.from('medications').select('id').limit(1);
    if (error) {
      return res.json({
        connected: true,
        tablesCreated: false,
        message: `Connected to Supabase project, but tables need migration: ${error.message}`
      });
    }
    res.json({
      connected: true,
      tablesCreated: true,
      message: 'Successfully connected to live Supabase database instance!'
    });
  } catch (err: any) {
    res.json({
      connected: false,
      message: err.message
    });
  }
});

// Authentication: Register
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { email, full_name, role, phone } = req.body;
  if (!email || !full_name) {
    return res.status(400).json({ error: 'Email and full_name are required' });
  }

  const existing = dbUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'User with this email already exists' });
  }

  const newUser = {
    id: `usr_${Date.now()}`,
    email,
    full_name,
    role: role || 'patient',
    phone,
    allergies: [],
    medical_conditions: [],
    created_at: new Date().toISOString()
  };

  dbUsers.push(newUser);
  res.status(201).json({ user: newUser, token: `mock_jwt_${newUser.id}` });
});

// Authentication: Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, role } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  let user = dbUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    user = {
      id: `usr_${Date.now()}`,
      email,
      full_name: email.split('@')[0].replace(/[._]/g, ' '),
      role: role || 'patient',
      created_at: new Date().toISOString()
    };
    dbUsers.push(user);
  }

  res.json({ user, token: `jwt_${user.id}_${Date.now()}` });
});

// Users / Profiles
app.get('/api/users/me', (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;
  const user = dbUsers.find(u => u.id === userId) || dbUsers[0];
  res.json(user);
});

// Medications: List with category and search filter
app.get('/api/medications', (req: Request, res: Response) => {
  const { search, category, prescription_required } = req.query;
  let results = [...dbMedications];

  if (category) {
    results = results.filter(m => m.category.toLowerCase() === (category as string).toLowerCase());
  }

  if (prescription_required !== undefined) {
    const reqBool = prescription_required === 'true';
    results = results.filter(m => m.prescription_required === reqBool);
  }

  if (search) {
    const q = (search as string).toLowerCase();
    results = results.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.generic_name.toLowerCase().includes(q) ||
      (m.brand_name && m.brand_name.toLowerCase().includes(q)) ||
      m.description.toLowerCase().includes(q)
    );
  }

  res.json(results);
});

// Medication: Get Single
app.get('/api/medications/:id', (req: Request, res: Response) => {
  const med = dbMedications.find(m => m.id === req.params.id);
  if (!med) {
    return res.status(404).json({ error: 'Medication not found' });
  }
  res.json(med);
});

// Medication: Create (Pharmacist/Staff)
app.post('/api/medications', (req: Request, res: Response) => {
  const data = req.body;
  if (!data.name || !data.category || !data.dosage_form) {
    return res.status(400).json({ error: 'Name, category, and dosage_form are required' });
  }

  const newMed = {
    ...data,
    id: `med_${Date.now()}`,
    stock_quantity: Number(data.stock_quantity) || 0,
    reorder_level: Number(data.reorder_level) || 20,
    unit_price: Number(data.unit_price) || 10.0,
    prescription_required: Boolean(data.prescription_required),
    is_active: true,
    created_at: new Date().toISOString()
  };

  dbMedications.unshift(newMed);
  res.status(201).json(newMed);
});

// Medication: Update (Stock adjustment, pricing, etc.)
app.put('/api/medications/:id', (req: Request, res: Response) => {
  const index = dbMedications.findIndex(m => m.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Medication not found' });
  }

  const prev = dbMedications[index];
  const updated = {
    ...prev,
    ...req.body,
    updated_at: new Date().toISOString()
  };

  dbMedications[index] = updated;
  res.json(updated);
});

// Prescriptions: List
app.get('/api/prescriptions', (req: Request, res: Response) => {
  const { patient_id } = req.query;
  if (patient_id) {
    return res.json(dbPrescriptions.filter(p => p.patient_id === patient_id));
  }
  res.json(dbPrescriptions);
});

// Prescriptions: Refill Request
app.post('/api/prescriptions/:id/refill', (req: Request, res: Response) => {
  const rx = dbPrescriptions.find(p => p.id === req.params.id);
  if (!rx) {
    return res.status(404).json({ error: 'Prescription not found' });
  }

  if (rx.refills_remaining <= 0) {
    return res.status(400).json({ error: 'No refills remaining on this prescription' });
  }

  rx.refills_remaining -= 1;
  res.json({
    success: true,
    message: 'Refill approved and processed',
    refills_remaining: rx.refills_remaining
  });
});

// Orders: List
app.get('/api/orders', (req: Request, res: Response) => {
  const { patient_id } = req.query;
  if (patient_id) {
    return res.json(dbOrders.filter(o => o.patient_id === patient_id));
  }
  res.json(dbOrders);
});

// Orders: Create
app.post('/api/orders', (req: Request, res: Response) => {
  const { patient_id, items, delivery_method, delivery_address, notes } = req.body;
  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Order must contain items' });
  }

  const total = items.reduce((sum: number, item: any) => sum + (item.unit_price * item.quantity), 0);
  const newOrder = {
    id: `ord_${Date.now().toString().slice(-6)}`,
    patient_id: patient_id || 'usr_patient_demo',
    items,
    total_amount: total,
    status: 'pending' as const,
    delivery_method: delivery_method || 'pickup',
    delivery_address,
    notes,
    created_at: new Date().toISOString()
  };

  dbOrders.unshift(newOrder);
  res.status(201).json(newOrder);
});

// ==========================================
// VITE DEV SERVER MIDDLEWARE & STATIC SERVE
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Whole Medicines] Full-Stack Server running on port ${PORT}`);
  });
}

startServer();

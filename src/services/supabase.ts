import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration can come from environment variables or custom runtime configuration
let clientInstance: SupabaseClient | null = null;

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getSupabaseConfig(): SupabaseConfig | null {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (envUrl && envKey) {
    return { url: envUrl, anonKey: envKey };
  }

  // Check localStorage for manually configured keys
  try {
    const saved = localStorage.getItem('whole_medicines_supabase_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to read supabase config from localStorage', e);
  }

  return null;
}

export function saveSupabaseConfig(config: SupabaseConfig | null) {
  if (!config) {
    localStorage.removeItem('whole_medicines_supabase_config');
    clientInstance = null;
    return;
  }
  localStorage.setItem('whole_medicines_supabase_config', JSON.stringify(config));
  clientInstance = createClient(config.url, config.anonKey);
}

export function getSupabase(): SupabaseClient | null {
  if (clientInstance) {
    return clientInstance;
  }
  const config = getSupabaseConfig();
  if (config) {
    try {
      clientInstance = createClient(config.url, config.anonKey);
      return clientInstance;
    } catch (err) {
      console.warn('Could not initialize Supabase client:', err);
    }
  }
  return null;
}

export async function testSupabaseConnection(config: SupabaseConfig): Promise<{ success: boolean; message: string }> {
  try {
    const client = createClient(config.url, config.anonKey);
    // Ping a table or auth
    const { error } = await client.from('medications').select('id').limit(1);
    if (error) {
      // Table might not be created yet, but connection is alive if error is relation does not exist
      if (error.code === '42P01') {
        return {
          success: true,
          message: 'Connected to Supabase! (Tables not yet migrated - run schema SQL).'
        };
      }
      return {
        success: false,
        message: `Supabase returned: ${error.message}`
      };
    }
    return { success: true, message: 'Successfully connected and verified database tables!' };
  } catch (e: any) {
    return { success: false, message: e.message || 'Connection failed' };
  }
}

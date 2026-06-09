import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cachedServiceClient: SupabaseClient | null | undefined;

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getServiceSupabaseClient() {
  if (cachedServiceClient !== undefined) {
    return cachedServiceClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    cachedServiceClient = null;
    return cachedServiceClient;
  }

  cachedServiceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return cachedServiceClient;
}

export function requireServiceSupabaseClient() {
  const client = getServiceSupabaseClient();

  if (!client) {
    getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL');
    getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');
    throw new Error('Supabase service role is not configured');
  }

  return client;
}

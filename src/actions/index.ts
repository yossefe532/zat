'use server';

import { DEFAULT_GRANT_CODES } from '@/lib/data';
import { getSupabaseClient } from '@/lib/supabase';
import { createRegistrationCodeCandidate } from '@/lib/utils';
import { RegistrationInput } from '@/lib/types';

type GrantCodeRow = {
  code: string;
  name_ar: string;
  name_en: string;
  whatsapp_number: string;
  is_active: boolean;
};

function mapGrantCodeRow(grant: GrantCodeRow) {
  return {
    code: grant.code,
    nameAr: grant.name_ar,
    nameEn: grant.name_en,
    whatsappNumber: grant.whatsapp_number,
    isActive: grant.is_active,
  };
}

function getFallbackGrantCode(code: string): GrantCodeRow | null {
  const fallbackGrant = DEFAULT_GRANT_CODES[code as keyof typeof DEFAULT_GRANT_CODES];

  if (!fallbackGrant?.isActive) {
    return null;
  }

  return {
    code,
    name_ar: fallbackGrant.nameAr,
    name_en: fallbackGrant.nameEn,
    whatsapp_number: fallbackGrant.whatsappNumber,
    is_active: fallbackGrant.isActive,
  };
}

async function generateUniqueRegistrationCode(grantCodeUsed?: string) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  for (let attempt = 0; attempt < 25; attempt += 1) {
    const candidate = createRegistrationCodeCandidate(grantCodeUsed);
    const { data, error } = await supabase
      .from('registrations')
      .select('id')
      .eq('registration_code', candidate)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return candidate;
    }
  }

  throw new Error('Unable to generate a unique registration code');
}

export async function submitRegistration(data: RegistrationInput) {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    const registrationCode = await generateUniqueRegistrationCode(data.grantCodeUsed);
    const { data: result, error } = await supabase
      .from('registrations')
      .insert([{
        full_name: data.fullName,
        phone: data.phone,
        age: data.age,
        courses: data.courses,
        total_price: data.totalPrice,
        first_installment: data.firstInstallment,
        second_installment: data.secondInstallment,
        registration_code: registrationCode,
        grant_code_used: data.grantCodeUsed || null
      }])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data: {
        ...result,
        registration_code: registrationCode,
      },
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Registration failed',
    };
  }
}

export async function verifyGrantCodeAction(code: string) {
  const normalizedCode = code.trim().toUpperCase();
  const fallbackGrant = getFallbackGrantCode(normalizedCode);
  const supabase = getSupabaseClient();

  if (!supabase) {
    if (fallbackGrant) {
      return {
        success: true,
        data: mapGrantCodeRow(fallbackGrant),
      };
    }

    return {
      success: false,
      errorMessage: 'Supabase is not configured',
    };
  }

  try {
    const { data, error } = await supabase
      .from('grant_codes')
      .select('*')
      .eq('code', normalizedCode)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data) {
      return {
        success: true,
        data: mapGrantCodeRow(data as GrantCodeRow),
      };
    }

    if (fallbackGrant) {
      return {
        success: true,
        data: mapGrantCodeRow(fallbackGrant),
      };
    }
  } catch (error) {
    console.error('Code verification error:', error);

    if (fallbackGrant) {
      return {
        success: true,
        data: mapGrantCodeRow(fallbackGrant),
      };
    }

    return {
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Code verification failed',
    };
  }

  return {
    success: false,
    errorMessage: 'Grant code not found',
  };
}

export async function getRegistrations() {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Fetch registrations error:', error);
    return {
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Fetch registrations failed',
    };
  }
}

export async function getGrantCodes() {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    const { data, error } = await supabase
      .from('grant_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Fetch grant codes error:', error);
    return {
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Fetch grant codes failed',
    };
  }
}

export async function addGrantCode(code: { code: string; name_ar: string; name_en: string; whatsapp_number: string }) {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    const { data, error } = await supabase
      .from('grant_codes')
      .insert([{ ...code, is_active: true }])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Add grant code error:', error);
    return {
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Add grant code failed',
    };
  }
}

export async function updateGrantCode(code: string, updates: { is_active?: boolean; name_ar?: string; name_en?: string; whatsapp_number?: string }) {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    const { data, error } = await supabase
      .from('grant_codes')
      .update(updates)
      .eq('code', code)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Update grant code error:', error);
    return {
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Update grant code failed',
    };
  }
}

export async function deleteGrantCode(code: string) {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    const { error } = await supabase
      .from('grant_codes')
      .delete()
      .eq('code', code);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Delete grant code error:', error);
    return {
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Delete grant code failed',
    };
  }
}

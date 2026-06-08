'use server';

import { supabase } from '@/lib/supabase';
import { Registration } from '@/lib/types';

export async function submitRegistration(data: Registration) {
  try {
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
        registration_code: data.registrationCode,
        grant_code_used: data.grantCodeUsed
      }])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: result };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error };
  }
}

export async function verifyGrantCode(code: string) {
  try {
    const { data, error } = await supabase
      .from('grant_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Code verification error:', error);
    return { success: false, error };
  }
}

export async function getRegistrations() {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Fetch registrations error:', error);
    return { success: false, error };
  }
}

export async function getGrantCodes() {
  try {
    const { data, error } = await supabase
      .from('grant_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Fetch grant codes error:', error);
    return { success: false, error };
  }
}

export async function addGrantCode(code: { code: string; name_ar: string; name_en: string; whatsapp_number: string }) {
  try {
    const { data, error } = await supabase
      .from('grant_codes')
      .insert([code])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Add grant code error:', error);
    return { success: false, error };
  }
}

export async function updateGrantCode(id: string, updates: { is_active?: boolean; name_ar?: string; name_en?: string; whatsapp_number?: string }) {
  try {
    const { data, error } = await supabase
      .from('grant_codes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Update grant code error:', error);
    return { success: false, error };
  }
}

export async function deleteGrantCode(id: string) {
  try {
    const { error } = await supabase
      .from('grant_codes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Delete grant code error:', error);
    return { success: false, error };
  }
}

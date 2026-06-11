'use server';

import { DEFAULT_GRANT_CODES, DISCOUNT_RULES, SMART_BUNDLES } from '@/lib/data';
import { buildRegistrationPhoneCandidates, normalizeRegistrantName } from '@/lib/registration-booking';
import { applyReferralBenefitsToTotal, getCourseCatalog, verifyReferralCodeForGrant } from '@/lib/portal';
import { getSupabaseClient } from '@/lib/supabase';
import { requireServiceSupabaseClient } from '@/lib/server-supabase';
import { createRegistrationCodeCandidate, normalizePhoneNumber } from '@/lib/utils';
import type { RegistrationInput, RegistrationRecord, RegistrationSubmissionResult } from '@/lib/types';

type GrantCodeRow = {
  code: string;
  name_ar: string;
  name_en: string;
  whatsapp_number: string;
  is_active: boolean;
};

type RegistrationRow = {
  id: string;
  full_name: string;
  phone: string;
  age: number | null;
  courses: number[] | null;
  total_price: number | string;
  first_installment: number | string | null;
  second_installment: number | string | null;
  registration_code: string;
  grant_code_used: string | null;
  referral_code_used: string | null;
  whatsapp_sent: boolean | null;
  created_at: string | null;
};

const registrationSelectFields = 'id, full_name, phone, age, courses, total_price, first_installment, second_installment, registration_code, grant_code_used, referral_code_used, whatsapp_sent, created_at';

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

function mapRegistrationRow(row: RegistrationRow): RegistrationRecord {
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    age: row.age,
    courses: Array.isArray(row.courses)
      ? row.courses.map((courseId) => Number(courseId)).filter((courseId) => Number.isFinite(courseId))
      : [],
    totalPrice: Number(row.total_price ?? 0),
    firstInstallment: Number(row.first_installment ?? 0),
    secondInstallment: Number(row.second_installment ?? 0),
    registrationCode: row.registration_code,
    grantCodeUsed: row.grant_code_used,
    referralCodeUsed: row.referral_code_used,
    whatsappSent: Boolean(row.whatsapp_sent),
    createdAt: row.created_at,
  };
}

async function calculateOrderTotals(options: { courseIds: number[]; hasGrant: boolean; referralDiscountApplied: number }) {
  const catalog = await getCourseCatalog({ includeInactive: true });
  const catalogMap = new Map(catalog.map((course) => [course.id, course] as const));
  const selectedCourses = options.courseIds
    .map((courseId) => catalogMap.get(courseId))
    .filter((course): course is NonNullable<typeof course> => Boolean(course));
  const selectedCourseIds = selectedCourses.map((course) => course.id);

  const subtotal = selectedCourses.reduce((sum, course) => (
    sum + (options.hasGrant ? course.grantPrice : course.originalPrice)
  ), 0);

  let countDiscount = 0;
  for (const rule of DISCOUNT_RULES) {
    if (selectedCourses.length >= rule.count) {
      countDiscount = rule.discount;
    }
  }

  const activeBundle = SMART_BUNDLES.find((bundle) => {
    if (bundle.courseIds.length !== selectedCourseIds.length) {
      return false;
    }

    return bundle.courseIds.every((courseId) => selectedCourseIds.includes(courseId));
  });

  const bundleDiscount = activeBundle?.extraDiscount ?? 0;
  const discount = Math.max(countDiscount, bundleDiscount);

  const totalBeforeReferral = Math.max(subtotal - discount, 0);
  const total = Math.max(totalBeforeReferral - Math.max(0, options.referralDiscountApplied), 0);
  const firstInstallment = selectedCourses.length === 0
    ? 0
    : Math.min(total, selectedCourses.length * 200);
  const secondInstallment = Math.max(total - firstInstallment, 0);

  return {
    subtotal,
    discount,
    totalBeforeReferral,
    total,
    firstInstallment,
    secondInstallment,
  };
}

async function findExistingRegistrationRow(phone: string) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const phoneCandidates = buildRegistrationPhoneCandidates(phone);
  const { data, error } = await supabase
    .from('registrations')
    .select(registrationSelectFields)
    .in('phone', phoneCandidates)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    throw error;
  }

  const existing = (data?.[0] ?? null) as RegistrationRow | null;
  return existing;
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

export async function submitRegistration(data: RegistrationInput): Promise<RegistrationSubmissionResult> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    const normalizedPhone = normalizePhoneNumber(data.phone);
    const sanitizedFullName = data.fullName.trim().replace(/\s+/g, ' ');
    const normalizedName = normalizeRegistrantName(sanitizedFullName);

    if (!normalizedName) {
      throw new Error('Full name is required');
    }

    const existingRegistration = await findExistingRegistrationRow(normalizedPhone);

    if (existingRegistration) {
      const existingRecord = mapRegistrationRow(existingRegistration);

      return {
        success: true,
        mode: 'existing',
        data: existingRecord,
      };
    }

    const referralCodeUsed = data.referralCodeUsed?.trim().toUpperCase() ?? null;
    const referral = referralCodeUsed ? await verifyReferralCodeForGrant(referralCodeUsed) : null;
    const referralDiscountApplied = referral ? 50 : 0;
    const calculated = await calculateOrderTotals({
      courseIds: data.courses,
      hasGrant: Boolean(data.grantCodeUsed),
      referralDiscountApplied,
    });

    const registrationCode = await generateUniqueRegistrationCode(data.grantCodeUsed);
    const { data: result, error } = await supabase
      .from('registrations')
      .insert([{
        full_name: sanitizedFullName,
        phone: normalizedPhone,
        age: data.age,
        courses: data.courses,
        total_price: calculated.total,
        first_installment: calculated.firstInstallment,
        second_installment: calculated.secondInstallment,
        registration_code: registrationCode,
        grant_code_used: data.grantCodeUsed || null,
        referral_code_used: referral?.referralCodeUsed ?? null,
        referral_discount_applied: referralDiscountApplied,
      }])
      .select(registrationSelectFields)
      .single<RegistrationRow>();

    if (error) throw error;

    if (referral && result?.id) {
      const serviceSupabase = requireServiceSupabaseClient();
      const { error: eventError } = await serviceSupabase
        .from('referral_events')
        .insert([{
          referral_code_used: referral.referralCodeUsed,
          root_referral_code: referral.rootReferralCode,
          owner_registration_id: referral.ownerRegistrationId,
          referred_registration_id: result.id,
          applied_discount: 50,
        }]);

      if (eventError) {
        throw new Error(eventError.message);
      }
    }

    return {
      success: true,
      mode: 'created',
      data: mapRegistrationRow({
        ...result,
        registration_code: registrationCode,
      } as RegistrationRow),
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Registration failed',
    };
  }
}

export async function updateExistingRegistration(
  registrationId: string,
  data: Pick<RegistrationInput, 'courses' | 'totalPrice' | 'firstInstallment' | 'secondInstallment' | 'grantCodeUsed'>,
): Promise<RegistrationSubmissionResult> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    const serviceSupabase = requireServiceSupabaseClient();
    const { data: existingDiscountRow, error: existingDiscountError } = await serviceSupabase
      .from('registrations')
      .select('referral_discount_applied, referral_code_used')
      .eq('id', registrationId)
      .maybeSingle<{ referral_discount_applied: number | string | null; referral_code_used: string | null }>();

    if (existingDiscountError) {
      throw new Error(existingDiscountError.message);
    }

    const persistedReferralDiscount = Number(existingDiscountRow?.referral_discount_applied ?? 0);
    const inferredReferralDiscount = existingDiscountRow?.referral_code_used ? 50 : 0;
    const effectiveReferralDiscount = persistedReferralDiscount > 0 ? persistedReferralDiscount : inferredReferralDiscount;

    if (effectiveReferralDiscount !== persistedReferralDiscount) {
      const { error: syncDiscountError } = await serviceSupabase
        .from('registrations')
        .update({ referral_discount_applied: effectiveReferralDiscount })
        .eq('id', registrationId);

      if (syncDiscountError) {
        throw new Error(syncDiscountError.message);
      }
    }

    const calculated = await calculateOrderTotals({
      courseIds: data.courses,
      hasGrant: Boolean(data.grantCodeUsed),
      referralDiscountApplied: effectiveReferralDiscount,
    });

    const benefitApplied = await applyReferralBenefitsToTotal(registrationId, data.courses, calculated.total);
    const safeTotal = benefitApplied.total;
    const safeFirst = data.courses.length === 0
      ? 0
      : Math.min(safeTotal, data.courses.length * 200);
    const safeSecond = Math.max(safeTotal - safeFirst, 0);

    const { data: result, error } = await supabase
      .from('registrations')
      .update({
        courses: data.courses,
        total_price: safeTotal,
        first_installment: safeFirst,
        second_installment: safeSecond,
        grant_code_used: data.grantCodeUsed || null,
      })
      .eq('id', registrationId)
      .select(registrationSelectFields)
      .single<RegistrationRow>();

    if (error) {
      throw error;
    }

    return {
      success: true,
      mode: 'updated',
      data: mapRegistrationRow(result),
    };
  } catch (error) {
    console.error('Update registration error:', error);
    return {
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Update registration failed',
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

export async function verifyAccessCodeAction(code: string) {
  const normalizedCode = code.trim().toUpperCase();
  const grantResult = await verifyGrantCodeAction(normalizedCode);

  if (grantResult.success && grantResult.data) {
    return {
      success: true,
      data: grantResult.data,
      accessType: 'grant' as const,
      referralCodeUsed: null as string | null,
      referralDiscount: 0,
    };
  }

  try {
    const referral = await verifyReferralCodeForGrant(normalizedCode);
    if (!referral) {
      return {
        success: false,
        errorMessage: 'Invalid or inactive code',
      };
    }

    const rootGrantResult = await verifyGrantCodeAction(referral.rootGrantCodeUsed);
    if (!rootGrantResult.success || !rootGrantResult.data) {
      return {
        success: false,
        errorMessage: 'Invalid or inactive code',
      };
    }

    return {
      success: true,
      data: rootGrantResult.data,
      accessType: 'referral' as const,
      referralCodeUsed: referral.referralCodeUsed,
      referralDiscount: 50,
    };
  } catch {
    return {
      success: false,
      errorMessage: 'Invalid or inactive code',
    };
  }
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

import { supabase } from '../../../supabaseClient';

export async function getClinicMemberships(userId) {
  const { data, error } = await supabase
    .from('clinic_memberships')
    .select(`
      clinic_id,
      clinics (
        id,
        name
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`שגיאה בטעינת מרפאות: ${error.message}`);
  }

  return (data || [])
    .filter((membership) => membership.clinics)
    .map((membership) => ({
      id: membership.clinics.id,
      name: membership.clinics.name,
    }));
}

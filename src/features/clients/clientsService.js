import { supabase } from '../../supabaseClient';

/**
 * שליפת רשימת כל הלקוחות
 */
export async function getClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('id, full_name, phone, created_at')
    .order('full_name', { ascending: true });

  if (error) {
    throw new Error(`שגיאה בשליפת לקוחות: ${error.message}`);
  }

  return data;
}

/**
 * משימה 16: הוספת לקוח חדש
 * @param {Object} clientData - { full_name, phone }
 */
export async function createClient(clientData) {
  const { full_name, phone } = clientData;

  if (!full_name || !phone) {
    throw new Error('שם מלא ומספר טלפון הם שדות חובה');
  }

  const { data, error } = await supabase
    .from('clients')
    .insert([
      {
        full_name,
        phone,
      }
    ])
    .select()
    .single();

  if (error) {
    throw new Error(`שגיאה בהוספת לקוח: ${error.message}`);
  }

  return data;
}
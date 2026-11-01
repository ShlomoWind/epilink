import { supabase } from '../../supabaseClient';

/**
 * שליפת רשימת כל הלקוחות
 */
export async function getClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('full_name', { ascending: true });

  if (error) {
    throw new Error(`שגיאה בשליפת לקוחות: ${error.message}`);
  }

  return data;
}

/**
 * משימה 16: הוספת לקוח חדש
 * @param {Object} clientData - { full_name, phone, email, notes, default_price_per_hour }
 */
export async function createClient(clientData) {
  const { full_name, phone, email = '', notes = '', default_price_per_hour = 150 } = clientData;

  const { data, error } = await supabase
    .from('clients')
    .insert([
      {
        full_name,
        phone,
        email,
        notes,
        default_price_per_hour
      }
    ])
    .select()
    .single();

  if (error) {
    throw new Error(`שגיאה בהוספת לקוח: ${error.message}`);
  }

  return data;
}
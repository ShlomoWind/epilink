import { supabase } from '../../supabaseClient';

const CLIENT_FIELDS =
  'id, full_name, phone, email, needle_type, outstanding_balance, created_at';

function normalizeClientData(clientData) {
  const full_name =
    typeof clientData.full_name === 'string' ? clientData.full_name.trim() : '';
  const phone =
    typeof clientData.phone === 'string' ? clientData.phone.trim() : '';
  const email =
    typeof clientData.email === 'string' ? clientData.email.trim() : '';
  const needle_type =
    typeof clientData.needle_type === 'string'
      ? clientData.needle_type.trim()
      : '';
  const outstanding_balance = Number(clientData.outstanding_balance ?? 0);

  if (!full_name || !phone) {
    throw new Error('שם מלא ומספר טלפון הם שדות חובה.');
  }

  if (!/^\d{10}$/.test(phone)) {
    throw new Error('מספר הטלפון חייב להכיל בדיוק 10 ספרות.');
  }

  if (
    email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    throw new Error('יש להזין כתובת אימייל תקינה.');
  }

  if (needle_type && !/^[1-5]$/.test(needle_type)) {
    throw new Error('יש לבחור סוג מחט בין 1 ל־5.');
  }

  if (
    !Number.isFinite(outstanding_balance) ||
    outstanding_balance < 0 ||
    outstanding_balance > 99999999.99
  ) {
    throw new Error('יתרת החוב חייבת להיות מספר שאינו שלילי ותקין.');
  }

  return {
    full_name,
    phone,
    email: email || null,
    needle_type: needle_type || null,
    outstanding_balance,
  };
}

export async function getClients() {
  const { data, error } = await supabase
    .from('clients')
    .select(CLIENT_FIELDS)
    .order('full_name', { ascending: true });

  if (error) {
    throw new Error(`שגיאה בשליפת לקוחות: ${error.message}`);
  }

  return data;
}

export async function getNextAppointments() {
  const { data, error } = await supabase
    .from('appointments')
    .select('client_id, appointment_date')
    .eq('status', 'scheduled')
    .gt('appointment_date', new Date().toISOString())
    .order('appointment_date', { ascending: true });

  if (error) {
    throw new Error(`שגיאה בשליפת התורים הקרובים: ${error.message}`);
  }

  return data;
}

export async function createClient(clientData) {
  const normalizedClient = normalizeClientData(clientData);
  const { data, error } = await supabase
    .from('clients')
    .insert([normalizedClient])
    .select(CLIENT_FIELDS)
    .single();

  if (error) {
    throw new Error(`שגיאה בהוספת לקוח: ${error.message}`);
  }

  return data;
}

export async function updateClient(id, clientData) {
  if (typeof id !== 'string' || !id.trim()) {
    throw new Error('מזהה הלקוח אינו תקין.');
  }

  const normalizedClient = normalizeClientData(clientData);
  const { data, error } = await supabase
    .from('clients')
    .update(normalizedClient)
    .eq('id', id)
    .select(CLIENT_FIELDS)
    .single();

  if (error) {
    throw new Error(`שגיאה בעדכון פרטי הלקוח: ${error.message}`);
  }

  return data;
}

export async function deleteClient(id) {
  if (typeof id !== 'string' || !id.trim()) {
    throw new Error('מזהה הלקוח אינו תקין.');
  }

  const { error } = await supabase.from('clients').delete().eq('id', id);

  if (error) {
    throw new Error(`שגיאה במחיקת הלקוח: ${error.message}`);
  }
}

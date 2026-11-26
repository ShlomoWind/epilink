import { supabase } from '../../supabaseClient';

const CLIENT_FIELDS =
  'id, clinic_id, full_name, phone, email, needle_type, outstanding_balance, is_active, created_at';

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

  return {
    full_name,
    phone,
    email: email || null,
    needle_type: needle_type || null,
  };
}

export async function getClients(clinicId) {
  if (typeof clinicId !== 'string' || !clinicId.trim()) {
    throw new Error('יש לבחור מרפאה פעילה.');
  }

  const { data, error } = await supabase
    .from('clients')
    .select(CLIENT_FIELDS)
    .eq('clinic_id', clinicId)
    .order('full_name', { ascending: true });

  if (error) {
    throw new Error(`שגיאה בשליפת לקוחות: ${error.message}`);
  }

  return data;
}

export async function getNextAppointments(clinicId) {
  if (typeof clinicId !== 'string' || !clinicId.trim()) {
    throw new Error('יש לבחור מרפאה פעילה.');
  }

  const { data, error } = await supabase
    .from('appointments')
    .select('client_id, appointment_date')
    .eq('clinic_id', clinicId)
    .eq('status', 'scheduled')
    .gt('appointment_date', new Date().toISOString())
    .order('appointment_date', { ascending: true });

  if (error) {
    throw new Error(`שגיאה בשליפת התורים הקרובים: ${error.message}`);
  }

  return data;
}

export async function createClient(clinicId, clientData) {
  if (typeof clinicId !== 'string' || !clinicId.trim()) {
    throw new Error('יש לבחור מרפאה פעילה.');
  }

  const normalizedClient = normalizeClientData(clientData);
  const { data, error } = await supabase
    .from('clients')
    .insert([{ ...normalizedClient, clinic_id: clinicId }])
    .select(CLIENT_FIELDS)
    .single();

  if (error) {
    throw new Error(`שגיאה בהוספת לקוח: ${error.message}`);
  }

  return data;
}

export async function updateClient(clinicId, id, clientData) {
  if (typeof clinicId !== 'string' || !clinicId.trim()) {
    throw new Error('יש לבחור מרפאה פעילה.');
  }

  if (typeof id !== 'string' || !id.trim()) {
    throw new Error('מזהה הלקוח אינו תקין.');
  }

  const normalizedClient = normalizeClientData(clientData);
  const { data, error } = await supabase
    .from('clients')
    .update(normalizedClient)
    .eq('clinic_id', clinicId)
    .eq('id', id)
    .select(CLIENT_FIELDS)
    .single();

  if (error) {
    throw new Error(`שגיאה בעדכון פרטי הלקוח: ${error.message}`);
  }

  return data;
}

export async function deactivateClient(clinicId, id) {
  if (typeof clinicId !== 'string' || !clinicId.trim()) {
    throw new Error('יש לבחור מרפאה פעילה.');
  }

  if (typeof id !== 'string' || !id.trim()) {
    throw new Error('מזהה הלקוח אינו תקין.');
  }

  const { data, error } = await supabase
    .from('clients')
    .update({ is_active: false })
    .eq('clinic_id', clinicId)
    .eq('id', id)
    .select(CLIENT_FIELDS)
    .single();

  if (error) {
    throw new Error(`שגיאה בהשבתת הלקוח: ${error.message}`);
  }

  return data;
}

export async function recordClientBalanceAdjustment(
  clinicId,
  clientId,
  amount,
  note,
) {
  if (typeof clinicId !== 'string' || !clinicId.trim()) {
    throw new Error('יש לבחור מרפאה פעילה.');
  }

  if (typeof clientId !== 'string' || !clientId.trim()) {
    throw new Error('מזהה הלקוח אינו תקין.');
  }

  const parsedAmount = Number(amount);
  const normalizedNote = typeof note === 'string' ? note.trim() : '';
  if (
    !Number.isFinite(parsedAmount) ||
    parsedAmount === 0 ||
    Math.abs(parsedAmount) > 99999999.99
  ) {
    throw new Error('סכום ההתאמה חייב להיות מספר חיובי או שלילי תקין, שאינו אפס.');
  }

  if (!normalizedNote || normalizedNote.length > 500) {
    throw new Error('יש להזין סיבת התאמה באורך של עד 500 תווים.');
  }

  const { data, error } = await supabase.rpc(
    'record_client_balance_adjustment',
    {
      p_clinic_id: clinicId,
      p_client_id: clientId,
      p_amount: parsedAmount,
      p_note: normalizedNote,
    },
  );

  if (error) {
    throw new Error(`שגיאה ברישום התאמת היתרה: ${error.message}`);
  }

  if (data === null) {
    throw new Error('התאמת היתרה לא החזירה יתרה עדכנית.');
  }

  return Number(data);
}

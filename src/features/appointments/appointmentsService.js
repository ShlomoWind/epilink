import { supabase } from '../../supabaseClient';

/**
 * שליפת כל התורים כולל פרטי הלקוח
 */
export async function getAppointments() {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      id,
      client_id,
      appointment_date,
      estimated_duration,
      actual_duration,
      calculated_price,
      status,
      created_at,
      clients (
        id,
        full_name,
        phone
      )
    `)
    .order('appointment_date', { ascending: true });

  if (error) {
    throw new Error(`שגיאה בשליפת תורים: ${error.message}`);
  }

  return data;
}

/**
 * הוספת תור חדש
 * @param {Object} appointmentData - { client_id, appointment_date, estimated_duration }
 */
export async function createAppointment(appointmentData) {
  const { client_id, appointment_date, estimated_duration = 30 } = appointmentData;

  const { data, error } = await supabase
    .from('appointments')
    .insert([
      {
        client_id,
        appointment_date,
        estimated_duration,
        status: 'scheduled',
      }
    ])
    .select(`
      *,
      clients (
        id,
        full_name,
        phone
      )
    `)
    .single();

  if (error) {
    throw new Error(`שגיאה ביצירת תור: ${error.message}`);
  }

  return data;
}

export async function updateAppointment(
  id,
  { client_id, appointment_date, estimated_duration, status = 'scheduled' },
) {
  if (typeof id !== 'string' || !id.trim()) {
    throw new Error('מזהה התור אינו תקין.');
  }

  if (typeof client_id !== 'string' || !client_id.trim()) {
    throw new Error('יש לבחור לקוחה לתור.');
  }

  if (
    typeof appointment_date !== 'string' ||
    Number.isNaN(new Date(appointment_date).getTime())
  ) {
    throw new Error('יש לבחור מועד תקין לתור.');
  }

  if (!Number.isInteger(estimated_duration) || estimated_duration <= 0) {
    throw new Error('משך התור חייב להיות מספר חיובי של דקות שלמות.');
  }

  if (status !== 'scheduled' && status !== 'completed') {
    throw new Error('סטטוס התור אינו תקין.');
  }

  const updates = {
    client_id,
    appointment_date,
    estimated_duration,
    status,
  };

  if (status === 'scheduled') {
    updates.actual_duration = null;
    updates.calculated_price = null;
  }

  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      clients (
        id,
        full_name,
        phone
      )
    `)
    .single();

  if (error) {
    throw new Error(`שגיאה בעדכון התור: ${error.message}`);
  }

  return data;
}

export async function deleteAppointment(id) {
  if (typeof id !== 'string' || !id.trim()) {
    throw new Error('מזהה התור אינו תקין.');
  }

  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`שגיאה במחיקת התור: ${error.message}`);
  }
}

/**
 * סיום טיפול וחישוב מחיר
 * @param {string} id - מזהה התור
 * @param {number} actual_duration - משך הטיפול בדקות
 * @param {number} [pricePerMinute=2.5] - תעריף בדקות בשקלים
 */
export async function completeAppointment(
  id,
  actual_duration,
  pricePerMinute = 2.5,
) {
  if (!id || typeof id !== 'string') {
    throw new Error('מזהה התור אינו תקין.');
  }

  if (!Number.isInteger(actual_duration) || actual_duration <= 0) {
    throw new Error('משך הטיפול חייב להיות מספר חיובי של דקות שלמות.');
  }

  if (!Number.isFinite(pricePerMinute) || pricePerMinute <= 0) {
    throw new Error('המחיר לדקה חייב להיות מספר חיובי.');
  }

  const calculated_price = Number(
    (actual_duration * pricePerMinute).toFixed(2),
  );

  const { data, error } = await supabase
    .from('appointments')
    .update({
      actual_duration,
      calculated_price,
      status: 'completed',
    })
    .eq('id', id)
    .select(`
      *,
      clients (
        id,
        full_name,
        phone
      )
    `)
    .single();

  if (error) {
    throw new Error(`שגיאה בסיום תור: ${error.message}`);
  }

  return data;
}
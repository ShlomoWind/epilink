import { supabase } from '../../supabaseClient';

/**
 * שליפת כל התורים כולל פרטי הלקוח
 */
export async function getAppointments(clinicId) {
  if (typeof clinicId !== 'string' || !clinicId.trim()) {
    throw new Error('יש לבחור מרפאה פעילה.');
  }

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
    .eq('clinic_id', clinicId)
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
export async function createAppointment(clinicId, appointmentData) {
  if (typeof clinicId !== 'string' || !clinicId.trim()) {
    throw new Error('יש לבחור מרפאה פעילה.');
  }

  const { client_id, appointment_date, estimated_duration = 30 } = appointmentData;

  const { data, error } = await supabase
    .from('appointments')
    .insert([
      {
        clinic_id: clinicId,
        client_id,
        appointment_date,
        estimated_duration,
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
  clinicId,
  id,
  { client_id, appointment_date, estimated_duration },
) {
  if (typeof clinicId !== 'string' || !clinicId.trim()) {
    throw new Error('יש לבחור מרפאה פעילה.');
  }

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

  const updates = {
    client_id,
    appointment_date,
    estimated_duration,
  };

  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('clinic_id', clinicId)
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

export async function deleteAppointment(clinicId, id) {
  if (typeof clinicId !== 'string' || !clinicId.trim()) {
    throw new Error('יש לבחור מרפאה פעילה.');
  }

  if (typeof id !== 'string' || !id.trim()) {
    throw new Error('מזהה התור אינו תקין.');
  }

  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('clinic_id', clinicId)
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
  clinicId,
  id,
  actual_duration,
  pricePerMinute = 2.5,
) {
  if (typeof clinicId !== 'string' || !clinicId.trim()) {
    throw new Error('יש לבחור מרפאה פעילה.');
  }

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
  if (!Number.isFinite(calculated_price) || calculated_price > 99999999.99) {
    throw new Error('מחיר הטיפול חורג מהסכום המרבי הנתמך.');
  }

  const { error } = await supabase.rpc('complete_clinic_appointment', {
    p_clinic_id: clinicId,
    p_appointment_id: id,
    p_actual_duration: actual_duration,
    p_price_per_minute: pricePerMinute,
  });

  if (error) {
    throw new Error(`שגיאה בסיום תור: ${error.message}`);
  }

  const { data, error: fetchError } = await supabase
    .from('appointments')
    .select(`
      *,
      clients (
        id,
        full_name,
        phone
      )
    `)
    .eq('clinic_id', clinicId)
    .eq('id', id)
    .single();

  if (fetchError) {
    throw new Error(
      `הטיפול הושלם אך לא ניתן לטעון את התור המעודכן: ${fetchError.message}`,
    );
  }

  return data;
}

export async function correctCompletedAppointment(
  clinicId,
  id,
  actual_duration,
  calculated_price,
) {
  if (typeof clinicId !== 'string' || !clinicId.trim()) {
    throw new Error('יש לבחור מרפאה פעילה.');
  }

  if (typeof id !== 'string' || !id.trim()) {
    throw new Error('מזהה התור אינו תקין.');
  }

  if (!Number.isInteger(actual_duration) || actual_duration <= 0) {
    throw new Error('משך הטיפול חייב להיות מספר חיובי של דקות שלמות.');
  }

  if (
    !Number.isFinite(calculated_price) ||
    calculated_price < 0 ||
    calculated_price > 99999999.99
  ) {
    throw new Error('מחיר הטיפול המתוקן אינו תקין.');
  }

  const { error } = await supabase.rpc(
    'correct_completed_clinic_appointment',
    {
      p_clinic_id: clinicId,
      p_appointment_id: id,
      p_actual_duration: actual_duration,
      p_calculated_price: calculated_price,
    },
  );

  if (error) {
    throw new Error(`שגיאה בתיקון הטיפול שהושלם: ${error.message}`);
  }

  const { data, error: fetchError } = await supabase
    .from('appointments')
    .select(`
      *,
      clients (
        id,
        full_name,
        phone
      )
    `)
    .eq('clinic_id', clinicId)
    .eq('id', id)
    .single();

  if (fetchError) {
    throw new Error(
      `הטיפול תוקן אך לא ניתן לטעון את התור המעודכן: ${fetchError.message}`,
    );
  }

  return data;
}
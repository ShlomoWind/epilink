import { supabase } from '../../supabaseClient';

/**
 * משימה 14: שליפת כל התורים כולל פרטי הלקוח
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
 * משימה 15: הוספת תור חדש
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

/**
 * משימה 17: סיום טיפול וחישוב מחיר
 * @param {string} id - מזהה התור
 * @param {number} actual_duration - משך הטיפול בדקות
 * @param {number} [hourlyRate=150] - תעריף לשעה (ברירת מחדל: 150 ש"ח)
 */
export async function completeAppointment(id, actual_duration, hourlyRate = 150) {
  // חישוב מחיר יחסי: (משך בדקות / 60) * תעריף לשעה
  const calculated_price = Math.round((actual_duration / 60) * hourlyRate);

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
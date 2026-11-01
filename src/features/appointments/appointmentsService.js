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
      notes,
      created_at,
      clients (
        id,
        full_name,
        phone,
        default_price_per_hour
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
 * @param {Object} appointmentData - { client_id, appointment_date, estimated_duration, notes }
 */
export async function createAppointment(appointmentData) {
  const { client_id, appointment_date, estimated_duration = 30, notes = '' } = appointmentData;

  const { data, error } = await supabase
    .from('appointments')
    .insert([
      {
        client_id,
        appointment_date,
        estimated_duration,
        notes,
        status: 'scheduled'
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
 * @param {number} [price_per_hour] - תעריף שעתי (אם לא סופק, נלקח מפרטי הלקוח או ברירת מחדל של 150)
 */
export async function completeAppointment(id, actual_duration, price_per_hour = null) {
  let hourlyRate = price_per_hour;

  // אם לא סופק תעריף, שולפים את הגדרת הלקוח
  if (!hourlyRate) {
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('clients(default_price_per_hour)')
      .eq('id', id)
      .single();

    if (!fetchError && appointment?.clients?.default_price_per_hour) {
      hourlyRate = appointment.clients.default_price_per_hour;
    } else {
      hourlyRate = 150; // ברירת מחדל
    }
  }

  // חישוב מחיר יחסי לפי דקות: (משך בדקות / 60) * תעריף לשעה
  const calculated_price = Math.round((actual_duration / 60) * hourlyRate);

  const { data, error } = await supabase
    .from('appointments')
    .update({
      actual_duration,
      calculated_price,
      status: 'completed'
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
import { AuthApiError } from '@supabase/supabase-js';
import { supabase } from '../../../supabaseClient';

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      scopes: 'openid email profile',
      redirectTo: window.location.origin,
    },
  });

  if (error) {
    throw error;
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export function getAuthErrorMessage(error, action) {
  console.error(`Error ${action}:`, error);

  if (error instanceof AuthApiError && error.status === 400) {
    return 'ההתחברות נדחתה על ידי Supabase. בדוק שספק Google מופעל ושה-Redirect URL מורשה בהגדרות Supabase.';
  }

  if (
    error instanceof Error &&
    (error.name === 'AuthRetryableFetchError' ||
      /network|fetch/i.test(error.message))
  ) {
    return 'לא ניתן להגיע ל-Supabase. בדוק את כתובת הפרויקט בקובץ .env.local ואת חיבור הרשת.';
  }

  return error instanceof Error
    ? error.message
    : 'אירעה שגיאה לא צפויה. בדוק את הגדרות החיבור ל-Supabase.';
}

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../../supabaseClient';
import { fetchGoogleIdentity } from '../services/googleIdentityService';
import {
  getAuthErrorMessage,
  signInWithGoogle,
  signOut,
} from '../services/googleAuthService';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [googleAccess, setGoogleAccess] = useState(null);
  const [googleIdentity, setGoogleIdentity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const nextUser = event === 'SIGNED_OUT' ? null : (session?.user ?? null);
      setUser(nextUser);

      if (event === 'SIGNED_OUT') {
        setGoogleAccess(null);
        setGoogleIdentity(null);
        setError('');
      } else if (event === 'SIGNED_IN') {
        setGoogleIdentity(null);
        setError('');

        if (session?.provider_token && nextUser) {
          setGoogleAccess({
            userId: nextUser.id,
            token: session.provider_token,
          });
        } else {
          setGoogleAccess(null);
        }
      }

      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!googleAccess || googleAccess.userId !== user?.id) {
      return undefined;
    }

    const controller = new AbortController();

    fetchGoogleIdentity(googleAccess.token, { signal: controller.signal })
      .then((identity) => {
        setGoogleIdentity({ ...identity, userId: googleAccess.userId });
      })
      .catch((profileError) => {
        if (profileError.name === 'AbortError') {
          return;
        }

        console.error('Failed to load Google profile:', profileError);
        setError(
          'לא ניתן לטעון את פרטי הפרופיל מ-Google. מוצגים הפרטים השמורים בחשבון.',
        );
      });

    return () => controller.abort();
  }, [googleAccess, user?.id]);

  const loginWithGoogle = useCallback(async () => {
    setError('');
    setIsSubmitting(true);

    try {
      await signInWithGoogle();
    } catch (authError) {
      setError(getAuthErrorMessage(authError, 'logging in with Google'));
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setError('');
    setIsSubmitting(true);

    try {
      await signOut();
    } catch (authError) {
      setError(getAuthErrorMessage(authError, 'logging out'));
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    user,
    googleIdentity:
      googleIdentity?.userId === user?.id ? googleIdentity : null,
    isLoading,
    isSubmitting,
    error,
    loginWithGoogle,
    logout,
  };
}

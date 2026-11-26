import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../../../supabaseClient';
import { clearResourceCache } from '../../../utils/resourceCache';
import { fetchGoogleIdentity } from '../services/googleIdentityService';
import {
  getAuthErrorMessage,
  signInWithGoogle,
  signOut,
} from '../services/googleAuthService';
import { getClinicMemberships } from '../services/clinicMembershipService';

const ACTIVE_CLINIC_STORAGE_KEY = 'epilink-active-clinic';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [googleAccess, setGoogleAccess] = useState(null);
  const [googleIdentity, setGoogleIdentity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [clinics, setClinics] = useState([]);
  const [activeClinicId, setActiveClinicId] = useState('');
  const [isLoadingClinics, setIsLoadingClinics] = useState(false);
  const activeUserId = useRef(null);
  const userId = user?.id;

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const nextUser = event === 'SIGNED_OUT' ? null : (session?.user ?? null);
      const nextUserId = nextUser?.id ?? null;
      const userChanged = activeUserId.current !== nextUserId;
      activeUserId.current = nextUserId;

      if (userChanged || event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        clearResourceCache();
      }

      setUser(nextUser);

      if (!nextUser) {
        setGoogleAccess(null);
        setGoogleIdentity(null);
        setError('');
        setClinics([]);
        setActiveClinicId('');
        setIsLoadingClinics(false);
      } else {
        if (userChanged) {
          setGoogleIdentity(null);
          setClinics([]);
          setActiveClinicId('');
          setError('');
          setIsLoadingClinics(true);
        }

        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          setGoogleIdentity(null);

          if (session?.provider_token) {
            setGoogleAccess({
              userId: nextUser.id,
              token: session.provider_token,
            });
          } else {
            setGoogleAccess(null);
          }
        }
      }

      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) {
      return;
    }
    let isCancelled = false;

    getClinicMemberships(userId)
      .then((memberships) => {
        if (isCancelled) {
          return;
        }

        setClinics(memberships);
        const storageKey = `${ACTIVE_CLINIC_STORAGE_KEY}:${userId}`;
        let savedClinicId = '';
        try {
          savedClinicId = window.localStorage.getItem(storageKey) || '';
        } catch (storageError) {
          console.error('Failed to read the active clinic preference:', storageError);
          setError('לא ניתן לקרוא את בחירת המרפאה השמורה בדפדפן.');
        }
        const savedMembership = memberships.find(
          (clinic) => clinic.id === savedClinicId,
        );

        setActiveClinicId(
          savedMembership?.id || memberships[0]?.id || '',
        );
        if (!savedMembership && memberships[0]) {
          try {
            window.localStorage.setItem(storageKey, memberships[0].id);
          } catch (storageError) {
            console.error('Failed to save the active clinic preference:', storageError);
            setError('המרפאה נבחרה, אך לא ניתן לשמור את הבחירה בדפדפן.');
          }
        }
      })
      .catch((membershipError) => {
        if (isCancelled) {
          return;
        }

        console.error('Failed to load clinic memberships:', membershipError);
        setClinics([]);
        setActiveClinicId('');
        setError(membershipError.message);
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoadingClinics(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [userId]);

  const selectClinic = useCallback((clinicId) => {
    if (!clinics.some((clinic) => clinic.id === clinicId)) {
      return;
    }

    clearResourceCache();
    setActiveClinicId(clinicId);

    try {
      window.localStorage.setItem(
        `${ACTIVE_CLINIC_STORAGE_KEY}:${userId}`,
        clinicId,
      );
    } catch (storageError) {
      console.error('Failed to persist the active clinic:', storageError);
      setError('המרפאה הוחלפה, אך לא ניתן לשמור את הבחירה בדפדפן.');
    }
  }, [clinics, userId]);

  useEffect(() => {
    if (!googleAccess) {
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
  }, [googleAccess]);

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
    clinics,
    activeClinicId,
    isLoadingClinics,
    selectClinic,
    loginWithGoogle,
    logout,
  };
}

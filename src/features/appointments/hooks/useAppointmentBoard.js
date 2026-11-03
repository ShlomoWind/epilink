import { useCallback, useMemo, useState } from 'react';
import { useCachedResource } from '../../../hooks/useCachedResource';
import {
  invalidateResource,
  updateCachedResource,
} from '../../../utils/resourceCache';
import {
  completeAppointment,
  createAppointment,
  deleteAppointment,
  getAppointments,
  updateAppointment,
} from '../appointmentsService';
import { getClients } from '../../clients/clientsService';
import {
  DEFAULT_PRICE_PER_MINUTE,
  PRICE_PER_MINUTE_STORAGE_KEY,
} from '../constants/pricing';
import {
  getDefaultAppointmentDateTime,
  toLocalDateTimeInput,
} from '../utils/appointmentDateTime';
import { formatCurrency, getLocalDateKey } from '../../../utils/formatters';

const EMPTY_APPOINTMENTS = [];
const EMPTY_CLIENTS = [];

function readPricePerMinuteSetting() {
  try {
    const storedRate = window.localStorage.getItem(
      PRICE_PER_MINUTE_STORAGE_KEY,
    );

    if (storedRate === null) {
      return { value: DEFAULT_PRICE_PER_MINUTE, error: '' };
    }

    const value = Number(storedRate);

    if (!Number.isFinite(value) || value <= 0) {
      throw new Error('המחיר השמור לדקה אינו תקין.');
    }

    return { value, error: '' };
  } catch (error) {
    console.error('Failed to read the price-per-minute setting:', error);
    return {
      value: DEFAULT_PRICE_PER_MINUTE,
      error: error.message || 'לא ניתן לקרוא את הגדרת המחיר מהדפדפן.',
    };
  }
}

function sortByAppointmentDate(appointments) {
  return [...appointments].sort(
    (first, second) =>
      new Date(first.appointment_date) - new Date(second.appointment_date),
  );
}

export function useAppointmentBoard(userId) {
  const appointmentsKey = `appointments:${userId}`;
  const clientsKey = `clients:${userId}`;
  const appointmentsResource = useCachedResource(
    appointmentsKey,
    getAppointments,
  );
  const clientsResource = useCachedResource(clientsKey, getClients);
  const appointments = appointmentsResource.data || EMPTY_APPOINTMENTS;
  const clients = clientsResource.data || EMPTY_CLIENTS;
  const isLoading =
    (appointmentsResource.data === undefined && !appointmentsResource.error) ||
    (clientsResource.data === undefined && !clientsResource.error);
  const loadError =
    appointmentsResource.error?.message || clientsResource.error?.message;

  function setAppointments(update) {
    updateCachedResource(appointmentsKey, update);
  }

  const [appointmentView, setAppointmentView] = useState('upcoming');
  const [pageError, setPageError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAppointmentFormOpen, setIsAppointmentFormOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(
    getDefaultAppointmentDateTime,
  );
  const [estimatedDuration, setEstimatedDuration] = useState('30');
  const [appointmentStatus, setAppointmentStatus] = useState('scheduled');
  const [appointmentError, setAppointmentError] = useState('');
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState(null);
  const [isUpdatingAppointment, setIsUpdatingAppointment] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [isDeletingAppointment, setIsDeletingAppointment] = useState(false);
  const [deleteAppointmentError, setDeleteAppointmentError] = useState('');
  const [appointmentToComplete, setAppointmentToComplete] = useState(null);
  const [actualDuration, setActualDuration] = useState('30');
  const [priceSetting, setPriceSetting] = useState(readPricePerMinuteSetting);
  const [pricePerMinute, setPricePerMinute] = useState(
    String(DEFAULT_PRICE_PER_MINUTE),
  );
  const [settingsPricePerMinute, setSettingsPricePerMinute] = useState(
    String(priceSetting.value),
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const [completionError, setCompletionError] = useState('');
  const [isCompletingAppointment, setIsCompletingAppointment] = useState(false);

  const openAppointmentForm = useCallback(() => {
    setPageError('');
    setSuccess('');
    setAppointmentError('');
    setSelectedClientId(clients[0]?.id || '');
    setAppointmentDate(getDefaultAppointmentDateTime());
    setEstimatedDuration('30');
    setAppointmentToEdit(null);
    setIsAppointmentFormOpen(true);
  }, [clients]);

  const closeAppointmentForm = useCallback(() => {
    if (!isCreatingAppointment) {
      setIsAppointmentFormOpen(false);
      setAppointmentError('');
    }
  }, [isCreatingAppointment]);

  const openAppointmentEdit = useCallback((appointment) => {
    setPageError('');
    setSuccess('');
    setAppointmentError('');
    setSelectedClientId(appointment.client_id);
    setAppointmentDate(toLocalDateTimeInput(appointment.appointment_date));
    setEstimatedDuration(String(appointment.estimated_duration || 30));
    setAppointmentStatus(appointment.status);
    setAppointmentToEdit(appointment);
  }, []);

  const closeAppointmentEdit = useCallback(() => {
    if (!isUpdatingAppointment) {
      setAppointmentToEdit(null);
      setAppointmentError('');
    }
  }, [isUpdatingAppointment]);

  const openAppointmentDelete = useCallback((appointment) => {
    setPageError('');
    setSuccess('');
    setDeleteAppointmentError('');
    setAppointmentToDelete(appointment);
  }, []);

  const closeAppointmentDelete = useCallback(() => {
    if (!isDeletingAppointment) {
      setAppointmentToDelete(null);
      setDeleteAppointmentError('');
    }
  }, [isDeletingAppointment]);

  const openCompletionForm = useCallback((appointment) => {
    setPageError('');
    setSuccess('');
    setCompletionError('');
    setActualDuration(String(appointment.estimated_duration || 30));
    setPricePerMinute(String(priceSetting.value));
    setAppointmentToComplete(appointment);
  }, [priceSetting.value]);

  const closeCompletionForm = useCallback(() => {
    if (!isCompletingAppointment) {
      setAppointmentToComplete(null);
      setCompletionError('');
    }
  }, [isCompletingAppointment]);

  const openSettings = useCallback(() => {
    setSettingsError('');
    setSettingsPricePerMinute(String(priceSetting.value));
    setIsSettingsOpen(true);
  }, [priceSetting.value]);

  const closeSettings = useCallback(() => {
    setIsSettingsOpen(false);
    setSettingsError('');
  }, []);

  function handleSaveSettings(event) {
    event.preventDefault();
    setSettingsError('');

    const rate = Number(settingsPricePerMinute);

    if (!Number.isFinite(rate) || rate <= 0) {
      setSettingsError('המחיר לדקה חייב להיות מספר חיובי.');
      return;
    }

    try {
      window.localStorage.setItem(
        PRICE_PER_MINUTE_STORAGE_KEY,
        String(rate),
      );
      setPriceSetting({ value: rate, error: '' });
      setIsSettingsOpen(false);
      setSuccess(`מחיר ברירת המחדל עודכן ל־${formatCurrency(rate)} לדקה.`);
    } catch (saveError) {
      console.error('Failed to save the price-per-minute setting:', saveError);
      setSettingsError(
        saveError.message || 'לא ניתן לשמור את ההגדרה בדפדפן.',
      );
    }
  }

  async function handleCreateAppointment(event) {
    event.preventDefault();
    setAppointmentError('');
    setPageError('');
    setSuccess('');

    const duration = Number(estimatedDuration);

    if (
      !selectedClientId ||
      !appointmentDate ||
      !Number.isInteger(duration) ||
      duration <= 0
    ) {
      setAppointmentError('יש לבחור לקוח, מועד ומשך תור תקין.');
      return;
    }

    setIsCreatingAppointment(true);

    try {
      const newAppointment = await createAppointment({
        client_id: selectedClientId,
        appointment_date: new Date(appointmentDate).toISOString(),
        estimated_duration: duration,
      });

      setAppointments((currentAppointments) =>
        sortByAppointmentDate([...currentAppointments, newAppointment]),
      );
      invalidateResource(`client-next-appointments:${userId}`);
      setIsAppointmentFormOpen(false);
      setAppointmentStatus('scheduled');
      setSuccess(
        `התור עבור ${newAppointment.clients?.full_name || 'הלקוח/ה'} נקבע בהצלחה.`,
      );
    } catch (createError) {
      console.error('Failed to create appointment:', createError);
      setAppointmentError(
        createError.message || 'לא ניתן לקבוע את התור. נסו שוב.',
      );
    } finally {
      setIsCreatingAppointment(false);
    }
  }

  async function handleUpdateAppointment(event) {
    event.preventDefault();
    setAppointmentError('');
    setPageError('');
    setSuccess('');

    const duration = Number(estimatedDuration);

    if (
      !selectedClientId ||
      !appointmentDate ||
      !Number.isInteger(duration) ||
      duration <= 0
    ) {
      setAppointmentError('יש לבחור לקוחה, מועד ומשך תור תקין.');
      return;
    }

    if (!appointmentToEdit) {
      return;
    }

    setIsUpdatingAppointment(true);

    try {
      const needsCompletion =
        appointmentStatus === 'completed' &&
        appointmentToEdit.status !== 'completed';
      const updatedAppointment = await updateAppointment(appointmentToEdit.id, {
        client_id: selectedClientId,
        appointment_date: new Date(appointmentDate).toISOString(),
        estimated_duration: duration,
        status: needsCompletion ? 'scheduled' : appointmentStatus,
      });

      setAppointments((currentAppointments) =>
        sortByAppointmentDate(
          currentAppointments.map((appointment) =>
            appointment.id === updatedAppointment.id
              ? updatedAppointment
              : appointment,
          ),
        ),
      );
      invalidateResource(`client-next-appointments:${userId}`);
      setAppointmentToEdit(null);

      if (needsCompletion) {
        setActualDuration(String(duration));
        setPricePerMinute(String(priceSetting.value));
        setCompletionError('');
        setAppointmentToComplete(updatedAppointment);
      } else {
        setSuccess(
          `התור של ${updatedAppointment.clients?.full_name || 'הלקוחה'} עודכן בהצלחה.`,
        );
      }
    } catch (updateError) {
      console.error('Failed to update appointment:', updateError);
      setAppointmentError(
        updateError.message || 'לא ניתן לעדכן את התור. נסו שוב.',
      );
    } finally {
      setIsUpdatingAppointment(false);
    }
  }

  async function handleDeleteAppointment() {
    if (!appointmentToDelete) {
      return;
    }

    setDeleteAppointmentError('');
    setIsDeletingAppointment(true);

    try {
      await deleteAppointment(appointmentToDelete.id);
      setAppointments((currentAppointments) =>
        currentAppointments.filter(
          (appointment) => appointment.id !== appointmentToDelete.id,
        ),
      );
      invalidateResource(`client-next-appointments:${userId}`);
      setAppointmentToDelete(null);
      setSuccess(
        `התור של ${appointmentToDelete.clients?.full_name || 'הלקוחה'} נמחק.`,
      );
    } catch (deleteError) {
      console.error('Failed to delete appointment:', deleteError);
      setDeleteAppointmentError(
        deleteError.message || 'לא ניתן למחוק את התור. נסו שוב.',
      );
    } finally {
      setIsDeletingAppointment(false);
    }
  }

  async function handleCompleteAppointment(event) {
    event.preventDefault();
    setCompletionError('');
    setPageError('');
    setSuccess('');

    const duration = Number(actualDuration);
    const rate = Number(pricePerMinute);

    if (!Number.isInteger(duration) || duration <= 0) {
      setCompletionError('יש להזין את משך הטיפול בדקות כמספר חיובי.');
      return;
    }

    if (!Number.isFinite(rate) || rate <= 0) {
      setCompletionError('יש להזין מחיר חיובי לדקה עבור הטיפול.');
      return;
    }

    if (!appointmentToComplete) {
      return;
    }

    setIsCompletingAppointment(true);

    try {
      const completedAppointment = await completeAppointment(
        appointmentToComplete.id,
        duration,
        rate,
      );

      setAppointments((currentAppointments) =>
        currentAppointments.map((appointment) =>
          appointment.id === completedAppointment.id
            ? completedAppointment
            : appointment,
        ),
      );
      invalidateResource(`client-next-appointments:${userId}`);
      setAppointmentToComplete(null);
      setSuccess(
        `הטיפול הסתיים. המחיר לתשלום: ${completedAppointment.calculated_price} ₪.`,
      );
    } catch (completeError) {
      console.error('Failed to complete appointment:', completeError);
      setCompletionError(
        completeError.message || 'לא ניתן לשמור את סיום הטיפול. נסו שוב.',
      );
    } finally {
      setIsCompletingAppointment(false);
    }
  }

  const todayKey = getLocalDateKey(new Date());
  const {
    scheduledAppointments,
    overdueAppointments,
    todayAppointments,
    futureAppointments,
    completedAppointments,
  } = useMemo(() => {
    const scheduled = appointments.filter(
      (appointment) => appointment.status === 'scheduled',
    );

    return {
      scheduledAppointments: scheduled,
      overdueAppointments: scheduled.filter(
        (appointment) =>
          getLocalDateKey(appointment.appointment_date) < todayKey,
      ),
      todayAppointments: scheduled.filter(
        (appointment) =>
          getLocalDateKey(appointment.appointment_date) === todayKey,
      ),
      futureAppointments: scheduled.filter(
        (appointment) =>
          getLocalDateKey(appointment.appointment_date) > todayKey,
      ),
      completedAppointments: appointments
        .filter((appointment) => appointment.status === 'completed')
        .sort(
          (first, second) =>
            new Date(second.appointment_date) -
            new Date(first.appointment_date),
        ),
    };
  }, [appointments, todayKey]);
  const calculatedPrice = useMemo(() => {
    const minutesToComplete = Number(actualDuration);
    const rateForCurrentTreatment = Number(pricePerMinute);

    return Number.isInteger(minutesToComplete) &&
      minutesToComplete > 0 &&
      Number.isFinite(rateForCurrentTreatment) &&
      rateForCurrentTreatment > 0
      ? Number((minutesToComplete * rateForCurrentTreatment).toFixed(2))
      : null;
  }, [actualDuration, pricePerMinute]);

  return {
    appointments,
    clients,
    appointmentView,
    setAppointmentView,
    isLoading,
    pageError: pageError || loadError || '',
    success,
    setSuccess,
    isAppointmentFormOpen,
    setIsAppointmentFormOpen,
    selectedClientId,
    setSelectedClientId,
    appointmentDate,
    setAppointmentDate,
    estimatedDuration,
    setEstimatedDuration,
    appointmentStatus,
    setAppointmentStatus,
    appointmentError,
    isCreatingAppointment,
    appointmentToEdit,
    isUpdatingAppointment,
    appointmentToDelete,
    setAppointmentToDelete,
    isDeletingAppointment,
    deleteAppointmentError,
    setDeleteAppointmentError,
    appointmentToComplete,
    actualDuration,
    setActualDuration,
    priceSetting,
    pricePerMinute,
    setPricePerMinute,
    settingsPricePerMinute,
    setSettingsPricePerMinute,
    isSettingsOpen,
    setIsSettingsOpen,
    settingsError,
    setSettingsError,
    completionError,
    isCompletingAppointment,
    scheduledAppointments,
    overdueAppointments,
    todayAppointments,
    futureAppointments,
    completedAppointments,
    calculatedPrice,
    openAppointmentForm,
    closeAppointmentForm,
    openAppointmentEdit,
    closeAppointmentEdit,
    openAppointmentDelete,
    closeAppointmentDelete,
    openCompletionForm,
    closeCompletionForm,
    openSettings,
    closeSettings,
    handleSaveSettings,
    handleCreateAppointment,
    handleUpdateAppointment,
    handleDeleteAppointment,
    handleCompleteAppointment,
  };
}

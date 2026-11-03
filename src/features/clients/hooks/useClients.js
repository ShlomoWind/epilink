import { useCallback, useMemo, useState } from 'react';
import { useCachedResource } from '../../../hooks/useCachedResource';
import {
  invalidateResource,
  updateCachedResource,
} from '../../../utils/resourceCache';
import {
  createClient,
  deleteClient,
  getClients,
  getNextAppointments,
  updateClient,
} from '../clientsService';
import { createClientForm, EMPTY_CLIENT_FORM } from '../constants/clientForm';

const EMPTY_CLIENTS = [];
const EMPTY_NEXT_APPOINTMENTS = [];

function sortClients(clients) {
  return [...clients].sort((first, second) =>
    first.full_name.localeCompare(second.full_name, 'he'),
  );
}

export function useClients(userId) {
  const clientsKey = `clients:${userId}`;
  const nextAppointmentsKey = `client-next-appointments:${userId}`;
  const clientsResource = useCachedResource(clientsKey, getClients);
  const nextAppointmentsResource = useCachedResource(
    nextAppointmentsKey,
    getNextAppointments,
  );
  const clients = clientsResource.data || EMPTY_CLIENTS;
  const nextAppointments = useMemo(() => {
    const appointmentsByClient = new Map();

    (nextAppointmentsResource.data || EMPTY_NEXT_APPOINTMENTS).forEach(
      (appointment) => {
        if (!appointmentsByClient.has(appointment.client_id)) {
          appointmentsByClient.set(
            appointment.client_id,
            appointment.appointment_date,
          );
        }
      },
    );

    return Object.fromEntries(appointmentsByClient);
  }, [nextAppointmentsResource.data]);
  const isLoading =
    clientsResource.data === undefined && !clientsResource.error;
  const error =
    clientsResource.error?.message ||
    nextAppointmentsResource.error?.message ||
    '';
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [success, setSuccess] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false);
  const [form, setForm] = useState(EMPTY_CLIENT_FORM);
  const [formError, setFormError] = useState('');

  function openCreateForm() {
    setSuccess('');
    setFormError('');
    setForm(EMPTY_CLIENT_FORM);
    setIsCreateOpen(true);
  }

  function closeCreateForm() {
    if (!isSaving) {
      setIsCreateOpen(false);
      setFormError('');
    }
  }

  const openClientDetails = useCallback((client) => {
    setSuccess('');
    setSelectedClient(client);
    setForm(createClientForm(client));
    setFormError('');
    setIsEditing(false);
    setIsDeleteConfirmationOpen(false);
  }, []);

  function closeClientModal() {
    if (isSaving || isDeleting) {
      return;
    }

    setSelectedClient(null);
    setIsEditing(false);
    setIsDeleteConfirmationOpen(false);
    setFormError('');
  }

  function handleFormChange(name, value) {
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  function cancelEditing() {
    if (!selectedClient) {
      return;
    }

    setIsEditing(false);
    setFormError('');
    setForm(createClientForm(selectedClient));
  }

  async function handleCreateClient(event) {
    event.preventDefault();
    setFormError('');
    setIsSaving(true);

    try {
      const newClient = await createClient(form);
      updateCachedResource(clientsKey, (currentClients) =>
        sortClients([...currentClients, newClient]),
      );
      setIsCreateOpen(false);
      setSuccess(`הלקוח/ה ${newClient.full_name} נוסף/ה בהצלחה.`);
    } catch (saveError) {
      console.error('Failed to create client:', saveError);
      setFormError(saveError.message || 'לא ניתן להוסיף את הלקוח/ה. נסו שוב.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpdateClient(event) {
    event.preventDefault();
    setFormError('');

    if (!selectedClient) {
      return;
    }

    setIsSaving(true);

    try {
      const updatedClient = await updateClient(selectedClient.id, form);
      updateCachedResource(clientsKey, (currentClients) =>
        sortClients(
          currentClients.map((client) =>
            client.id === updatedClient.id ? updatedClient : client,
          ),
        ),
      );
      invalidateResource(`appointments:${userId}`);
      setSelectedClient(updatedClient);
      setForm(createClientForm(updatedClient));
      setIsEditing(false);
      setSuccess(`הפרטים של ${updatedClient.full_name} עודכנו בהצלחה.`);
    } catch (updateError) {
      console.error('Failed to update client:', updateError);
      setFormError(updateError.message || 'לא ניתן לעדכן את פרטי הלקוח/ה.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteClient() {
    setFormError('');

    if (!selectedClient) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteClient(selectedClient.id);
      updateCachedResource(clientsKey, (currentClients) =>
        currentClients.filter((client) => client.id !== selectedClient.id),
      );
      invalidateResource(`appointments:${userId}`);
      setSelectedClient(null);
      setIsDeleteConfirmationOpen(false);
      setSuccess(`הלקוח/ה ${selectedClient.full_name} נמחק/ה.`);
    } catch (deleteError) {
      console.error('Failed to delete client:', deleteError);
      setFormError(
        deleteError.message ||
          'לא ניתן למחוק את הלקוח/ה. ייתכן שקיימים תורים המשויכים אליו/ה.',
      );
    } finally {
      setIsDeleting(false);
    }
  }

  const normalizedSearchQuery = searchQuery.trim().toLocaleLowerCase('he');
  const filteredClients = useMemo(
    () =>
      clients.filter((client) =>
        [client.full_name, client.phone, client.email, client.needle_type].some(
          (value) =>
            String(value || '')
              .toLocaleLowerCase('he')
              .includes(normalizedSearchQuery),
        ),
      ),
    [clients, normalizedSearchQuery],
  );

  return {
    clients,
    filteredClients,
    nextAppointments,
    searchQuery,
    setSearchQuery,
    isLoading,
    isSaving,
    isDeleting,
    error,
    success,
    isCreateOpen,
    setIsCreateOpen,
    selectedClient,
    isEditing,
    setIsEditing,
    isDeleteConfirmationOpen,
    setIsDeleteConfirmationOpen,
    form,
    formError,
    setFormError,
    openCreateForm,
    closeCreateForm,
    openClientDetails,
    closeClientModal,
    handleFormChange,
    cancelEditing,
    handleCreateClient,
    handleUpdateClient,
    handleDeleteClient,
  };
}

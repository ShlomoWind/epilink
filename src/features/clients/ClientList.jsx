import { memo } from 'react';
import {
  LoaderCircle,
  Plus,
  Search,
  Trash2,
  UserRound,
  Users,
} from 'lucide-react';
import FeedbackMessage from '../../components/ui/FeedbackMessage';
import Modal from '../../components/ui/Modal';
import { formatDate } from '../../utils/formatters';
import ClientCard from './components/ClientCard';
import ClientDetails from './components/ClientDetails';
import ClientFormFields from './components/ClientFormFields';
import { useClients } from './hooks/useClients';

const JOIN_DATE_FORMAT = {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
};

function ClientList({ userId }) {
  const {
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
  } = useClients(userId);

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-violet-700">
            <Users aria-hidden="true" size={17} />
            <span>ניהול לקוחות</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">רשימת לקוחות</h1>
          <p className="mt-2 text-gray-600">
            בחרו כרטיס לקוח כדי לצפות בפרטים ולעדכן אותם.
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-violet-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
          onClick={openCreateForm}
          type="button"
        >
          <Plus aria-hidden="true" size={19} />
          הוספת לקוח
        </button>
      </header>

      {error && <FeedbackMessage>{error}</FeedbackMessage>}
      {success && <FeedbackMessage type="success">{success}</FeedbackMessage>}

      <section
        aria-labelledby="client-cards-heading"
        className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="font-semibold text-gray-900" id="client-cards-heading">
            כרטיסיות לקוחות
          </h2>
          <span className="rounded-full bg-violet-50 px-3 py-1 text-sm font-medium text-violet-700">
            {filteredClients.length} מתוך {clients.length} לקוחות
          </span>
        </div>

        <label className="relative block border-b border-gray-100 px-5 py-4">
          <Search
            aria-hidden="true"
            className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            aria-label="חיפוש לקוחות לפי שם, טלפון או אימייל"
            className="w-full rounded-xl border border-gray-300 py-3 pe-11 ps-4 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="חיפוש לפי שם, טלפון או אימייל..."
            type="search"
            value={searchQuery}
          />
        </label>

        {isLoading ? (
          <div className="flex items-center justify-center gap-3 px-6 py-16 text-gray-500">
            <LoaderCircle
              aria-hidden="true"
              className="animate-spin"
              size={20}
            />
            טוען לקוחות...
          </div>
        ) : clients.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <UserRound
              aria-hidden="true"
              className="mx-auto text-gray-300"
              size={36}
            />
            <p className="mt-3 font-medium text-gray-700">עדיין אין לקוחות</p>
            <p className="mt-1 text-sm text-gray-500">
              הוסיפו לקוח חדש כדי להתחיל.
            </p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="px-6 py-16 text-center text-gray-500">
            לא נמצאו לקוחות התואמים לחיפוש.
          </div>
        ) : (
          <div className="grid max-h-[440px] gap-4 overflow-y-auto overscroll-contain p-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredClients.map((client) => (
              <ClientCard
                client={client}
                key={client.id}
                nextAppointment={nextAppointments[client.id]}
                onSelect={openClientDetails}
              />
            ))}
          </div>
        )}
      </section>

      {isCreateOpen && (
        <Modal
          description="מלאו את הפרטים כדי להוסיף לקוח/ה לרשימה."
          onClose={closeCreateForm}
          title="הוספת לקוח חדש"
        >
          {formError && (
            <div className="mb-4">
              <FeedbackMessage>{formError}</FeedbackMessage>
            </div>
          )}
          <form className="space-y-4" onSubmit={handleCreateClient}>
            <ClientFormFields form={form} onChange={handleFormChange} />
            <p className="text-xs text-gray-500">
              תאריך ההצטרפות ייקבע אוטומטית בעת שמירת הלקוח.
            </p>
            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
              <button
                className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
                disabled={isSaving}
                onClick={closeCreateForm}
                type="button"
              >
                ביטול
              </button>
              <button
                className="flex-1 rounded-xl bg-violet-700 px-4 py-3 font-semibold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSaving}
                type="submit"
              >
                {isSaving ? 'שומר...' : 'שמירת לקוח'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {selectedClient && (
        <Modal
          description={
            isEditing
              ? 'עדכנו את הפרטים ושמרו את השינויים.'
              : 'פרטי הלקוח/ה ותאריך ההצטרפות.'
          }

          onClose={closeClientModal}
          title={isEditing ? 'עריכת פרטי לקוח' : selectedClient.full_name}
        >
          {formError && (
            <div className="mb-4">
              <FeedbackMessage>{formError}</FeedbackMessage>
            </div>
          )}

          {isEditing ? (
            <form className="space-y-4" onSubmit={handleUpdateClient}>
              <ClientFormFields form={form} onChange={handleFormChange} />
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-gray-700">
                  תאריך הצטרפות
                </span>
                <input
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500"
                  readOnly
                  value={formatDate(selectedClient.created_at, JOIN_DATE_FORMAT)}
                />
              </label>
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
                <button
                  className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
                  disabled={isSaving}
                  onClick={cancelEditing}
                  type="button"
                >
                  ביטול
                </button>
                <button
                  className="flex-1 rounded-xl bg-violet-700 px-4 py-3 font-semibold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSaving}
                  type="submit"
                >
                  {isSaving ? 'שומר...' : 'שמירת שינויים'}
                </button>
              </div>
            </form>
          ) : isDeleteConfirmationOpen ? (
            <div className="space-y-4">
              <FeedbackMessage>
                למחוק את {selectedClient.full_name}? לא ניתן לבטל פעולה זו.
              </FeedbackMessage>
              <p className="text-sm text-gray-600">
                אם קיימים תורים המשויכים ללקוח/ה, ייתכן שמסד הנתונים ימנע את
                המחיקה.
              </p>
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
                <button
                  className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
                  onClick={() => setIsDeleteConfirmationOpen(false)}
                  type="button"
                >
                  חזרה לפרטים
                </button>
                <button
                  className="flex-1 rounded-xl bg-red-700 px-4 py-3 font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isDeleting}
                  onClick={handleDeleteClient}
                  type="button"
                >
                  {isDeleting ? 'מוחק...' : 'מחיקת לקוח'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <ClientDetails client={selectedClient} />
              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row">
                <button
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 font-medium text-red-700 transition hover:bg-red-50"
                  onClick={() => {
                    setFormError('');
                    setIsDeleteConfirmationOpen(true);
                  }}
                  type="button"
                >
                  <Trash2 aria-hidden="true" size={17} />
                  מחיקת לקוח
                </button>
                <button
                  className="flex-1 rounded-xl bg-violet-700 px-4 py-3 font-semibold text-white transition hover:bg-violet-800"
                  onClick={() => {
                    setFormError('');
                    setIsEditing(true);
                  }}
                  type="button"
                >
                  עריכת פרטים
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </section>
  );
}

export default memo(ClientList);

import { memo } from 'react';
import {
  CalendarDays,
  History,
  LoaderCircle,
  Plus,
  Settings2,
} from 'lucide-react';
import FeedbackMessage from '../../components/ui/FeedbackMessage';
import AppointmentCompletionModal from './components/AppointmentCompletionModal';
import AppointmentDeleteModal from './components/AppointmentDeleteModal';
import AppointmentFormModal from './components/AppointmentFormModal';
import AppointmentGroup from './components/AppointmentGroup';
import AppointmentPricingSettingsModal from './components/AppointmentPricingSettingsModal';
import { useAppointmentBoard } from './hooks/useAppointmentBoard';

function AppointmentBoard({ userId }) {
  const {
    clients,
    appointmentView,
    setAppointmentView,
    isLoading,
    pageError,
    success,
    isAppointmentFormOpen,
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
    isDeletingAppointment,
    deleteAppointmentError,
    appointmentToComplete,
    actualDuration,
    setActualDuration,
    priceSetting,
    pricePerMinute,
    setPricePerMinute,
    settingsPricePerMinute,
    setSettingsPricePerMinute,
    isSettingsOpen,
    settingsError,
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
  } = useAppointmentBoard(userId);

  return (
    <section className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-violet-700">
            <CalendarDays aria-hidden="true" size={17} />
            <span>יומן הטיפולים</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">לוח תורים</h1>
          <p className="mt-2 text-gray-600">התורים להיום ולימים הקרובים.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
            onClick={openSettings}
            type="button"
          >
            <Settings2 aria-hidden="true" size={19} />
            הגדרות תמחור
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-violet-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
            onClick={openAppointmentForm}
            type="button"
          >
            <Plus aria-hidden="true" size={19} />
            קביעת תור
          </button>
        </div>
      </header>

      {pageError && <FeedbackMessage>{pageError}</FeedbackMessage>}
      {priceSetting.error && (
        <FeedbackMessage>{priceSetting.error}</FeedbackMessage>
      )}
      {success && <FeedbackMessage type="success">{success}</FeedbackMessage>}

      <div
        aria-label="תצוגת תורים"
        className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm"
        role="tablist"
      >
        <button
          aria-controls="upcoming-appointments-panel"
          aria-selected={appointmentView === 'upcoming'}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
            appointmentView === 'upcoming'
              ? 'bg-violet-700 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
          onClick={() => setAppointmentView('upcoming')}
          id="upcoming-appointments-tab"
          role="tab"
          type="button"
        >
          <CalendarDays aria-hidden="true" size={17} />
          תורים קרובים
          <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs">
            {scheduledAppointments.length}
          </span>
        </button>
        <button
          aria-controls="completed-appointments-panel"
          aria-selected={appointmentView === 'history'}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
            appointmentView === 'history'
              ? 'bg-violet-700 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
          onClick={() => setAppointmentView('history')}
          id="completed-appointments-tab"
          role="tab"
          type="button"
        >
          <History aria-hidden="true" size={17} />
          היסטוריה
          <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs">
            {completedAppointments.length}
          </span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white px-6 py-16 text-gray-500">
          <LoaderCircle aria-hidden="true" className="animate-spin" size={20} />
          טוען תורים...
        </div>
      ) : appointmentView === 'upcoming' ? (
        <div
          aria-labelledby="upcoming-appointments-tab"
          className="space-y-8"
          id="upcoming-appointments-panel"
          role="tabpanel"
        >
          {overdueAppointments.length > 0 && (
            <AppointmentGroup
              appointments={overdueAppointments}
              emptyMessage=""
              heading="תורים שעבר מועד ונשארו פתוחים"
              onComplete={openCompletionForm}
              onDelete={openAppointmentDelete}
              onEdit={openAppointmentEdit}
            />
          )}
          <AppointmentGroup
            appointments={todayAppointments}
            emptyMessage="אין תורים נוספים להיום."
            heading="התורים להיום"
            onComplete={openCompletionForm}
            onDelete={openAppointmentDelete}
            onEdit={openAppointmentEdit}
          />
          <AppointmentGroup
            appointments={futureAppointments}
            emptyMessage="אין תורים מתוזמנים לימים הקרובים."
            heading="תורים עתידיים"
            onComplete={openCompletionForm}
            onDelete={openAppointmentDelete}
            onEdit={openAppointmentEdit}
          />
        </div>
      ) : (
        <div
          aria-labelledby="completed-appointments-tab"
          id="completed-appointments-panel"
          role="tabpanel"
        >
          <AppointmentGroup
            appointments={completedAppointments}
            emptyMessage="עדיין אין תורים שבוצעו."
            heading="תורים שבוצעו"
            onComplete={openCompletionForm}
            onDelete={openAppointmentDelete}
            onEdit={openAppointmentEdit}
          />
        </div>
      )}

      {(isAppointmentFormOpen || appointmentToEdit) && (
        <AppointmentFormModal
          appointment={appointmentToEdit}
          appointmentDate={appointmentDate}
          appointmentStatus={appointmentStatus}
          clients={clients}
          error={appointmentError}
          estimatedDuration={estimatedDuration}
          isSaving={appointmentToEdit ? isUpdatingAppointment : isCreatingAppointment}
          onClientChange={setSelectedClientId}
          onClose={appointmentToEdit ? closeAppointmentEdit : closeAppointmentForm}
          onDateChange={setAppointmentDate}
          onDurationChange={setEstimatedDuration}
          onStatusChange={setAppointmentStatus}
          onSubmit={appointmentToEdit ? handleUpdateAppointment : handleCreateAppointment}
          selectedClientId={selectedClientId}
        />
      )}

      {appointmentToDelete && (
        <AppointmentDeleteModal
          appointment={appointmentToDelete}
          error={deleteAppointmentError}
          isDeleting={isDeletingAppointment}
          onClose={closeAppointmentDelete}
          onConfirm={handleDeleteAppointment}
        />
      )}

      {appointmentToComplete && (
        <AppointmentCompletionModal
          actualDuration={actualDuration}
          appointment={appointmentToComplete}
          calculatedPrice={calculatedPrice}
          error={completionError}
          isCompleting={isCompletingAppointment}
          onClose={closeCompletionForm}
          onDurationChange={setActualDuration}
          onPriceChange={setPricePerMinute}
          onSubmit={handleCompleteAppointment}
          pricePerMinute={pricePerMinute}
        />
      )}

      {isSettingsOpen && (
        <AppointmentPricingSettingsModal
          error={settingsError}
          onClose={closeSettings}
          onPriceChange={setSettingsPricePerMinute}
          onSubmit={handleSaveSettings}
          price={settingsPricePerMinute}
        />
      )}
    </section>
  );
}

export default memo(AppointmentBoard);

import { memo } from 'react';
import {
  CalendarDays,
  History,
  Plus,
  Settings2,
} from 'lucide-react';
import styled from 'styled-components';
import FeedbackMessage from '../../components/ui/FeedbackMessage';
import {
  ActionGroup,
  Button,
  Eyebrow,
  InlineCount,
  LoadingIcon,
  LoadingState,
  PageContainer,
  PageDescription,
  PageHeader,
  PageIntro,
  PageTitle,
  TabButton,
  TabList,
} from '../../components/ui/Primitives.styles';
import AppointmentCompletionModal from './components/AppointmentCompletionModal';
import AppointmentDeleteModal from './components/AppointmentDeleteModal';
import AppointmentFormModal from './components/AppointmentFormModal';
import AppointmentGroup from './components/AppointmentGroup';
import AppointmentPricingSettingsModal from './components/AppointmentPricingSettingsModal';
import { useAppointmentBoard } from './hooks/useAppointmentBoard';

const TabPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

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
    <PageContainer $gap="2rem">
      <PageHeader>
        <PageIntro>
          <Eyebrow>
            <CalendarDays aria-hidden="true" size={17} />
            <span>יומן הטיפולים</span>
          </Eyebrow>
          <PageTitle>לוח תורים</PageTitle>
          <PageDescription>התורים להיום ולימים הקרובים.</PageDescription>
        </PageIntro>
        <ActionGroup>
          <Button
            $variant="secondary"
            $shadow
            onClick={openSettings}
            type="button"
          >
            <Settings2 aria-hidden="true" size={19} />
            הגדרות תמחור
          </Button>
          <Button
            $shadow
            onClick={openAppointmentForm}
            type="button"
          >
            <Plus aria-hidden="true" size={19} />
            קביעת תור
          </Button>
        </ActionGroup>
      </PageHeader>

      {pageError && <FeedbackMessage>{pageError}</FeedbackMessage>}
      {priceSetting.error && (
        <FeedbackMessage>{priceSetting.error}</FeedbackMessage>
      )}
      {success && (
        <FeedbackMessage key={success} type="success">
          {success}
        </FeedbackMessage>
      )}

      <TabList
        aria-label="תצוגת תורים"
        role="tablist"
      >
        <TabButton
          aria-controls="upcoming-appointments-panel"
          aria-selected={appointmentView === 'upcoming'}
          $active={appointmentView === 'upcoming'}
          onClick={() => setAppointmentView('upcoming')}
          id="upcoming-appointments-tab"
          role="tab"
          type="button"
        >
          <CalendarDays aria-hidden="true" size={17} />
          תורים קרובים
          <InlineCount>
            {scheduledAppointments.length}
          </InlineCount>
        </TabButton>
        <TabButton
          aria-controls="completed-appointments-panel"
          aria-selected={appointmentView === 'history'}
          $active={appointmentView === 'history'}
          onClick={() => setAppointmentView('history')}
          id="completed-appointments-tab"
          role="tab"
          type="button"
        >
          <History aria-hidden="true" size={17} />
          היסטוריה
          <InlineCount>
            {completedAppointments.length}
          </InlineCount>
        </TabButton>
      </TabList>

      {isLoading ? (
        <LoadingState $boxed>
          <LoadingIcon aria-hidden="true" size={20} />
          טוען תורים...
        </LoadingState>
      ) : appointmentView === 'upcoming' ? (
        <TabPanel
          aria-labelledby="upcoming-appointments-tab"
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
        </TabPanel>
      ) : (
        <TabPanel
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
        </TabPanel>
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
    </PageContainer>
  );
}

export default memo(AppointmentBoard);

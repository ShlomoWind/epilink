import { memo } from 'react';
import {
  Plus,
  Search,
  Trash2,
  UserRound,
  Users,
} from 'lucide-react';
import styled from 'styled-components';
import FeedbackMessage from '../../components/ui/FeedbackMessage';
import Modal from '../../components/ui/Modal';
import {
  Button,
  ButtonRow,
  CountBadge,
  EmptyDescription,
  EmptyIcon,
  EmptyState,
  EmptyTitle,
  Eyebrow,
  FieldLabel,
  FieldTitle,
  FormStack,
  LoadingState,
  LoadingIcon,
  PageContainer,
  PageDescription,
  PageHeader,
  PageIntro,
  PageTitle,
  Panel,
  PanelHeader,
  PanelTitle,
  ScrollableGrid,
  SearchIcon,
  SearchLabel,
  TextInput,
} from '../../components/ui/Primitives.styles';
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

const FormNote = styled.p`
  margin: 0;
  color: #6b7280;
  font-size: 0.75rem;
`;

const DeleteNote = styled.p`
  margin: 0;
  color: #4b5563;
  font-size: 0.875rem;
`;

const DetailsActions = styled(ButtonRow)`
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
`;

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
    <PageContainer>
      <PageHeader>
        <PageIntro>
          <Eyebrow>
            <Users aria-hidden="true" size={17} />
            <span>ניהול לקוחות</span>
          </Eyebrow>
          <PageTitle>רשימת לקוחות</PageTitle>
          <PageDescription>
            בחרו כרטיס לקוח כדי לצפות בפרטים ולעדכן אותם.
          </PageDescription>
        </PageIntro>
        <Button
          onClick={openCreateForm}
          type="button"
        >
          <Plus aria-hidden="true" size={19} />
          הוספת לקוח
        </Button>
      </PageHeader>

      {error && <FeedbackMessage>{error}</FeedbackMessage>}
      {success && (
        <FeedbackMessage key={success} type="success">
          {success}
        </FeedbackMessage>
      )}

      <Panel
        aria-labelledby="client-cards-heading"
      >
        <PanelHeader>
          <PanelTitle id="client-cards-heading">
            כרטיסיות לקוחות
          </PanelTitle>
          <CountBadge>
            {filteredClients.length} מתוך {clients.length} לקוחות
          </CountBadge>
        </PanelHeader>

        <SearchLabel>
          <SearchIcon>
            <Search
            aria-hidden="true"
            size={18}
            />
          </SearchIcon>
          <TextInput
            aria-label="חיפוש לקוחות לפי שם, טלפון או אימייל"
            $search
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="חיפוש לפי שם, טלפון או אימייל..."
            type="search"
            value={searchQuery}
          />
        </SearchLabel>

        {isLoading ? (
          <LoadingState>
            <LoadingIcon aria-hidden="true" size={20} />
            טוען לקוחות...
          </LoadingState>
        ) : clients.length === 0 ? (
          <EmptyState>
            <EmptyIcon>
              <UserRound aria-hidden="true" size={36} />
            </EmptyIcon>
            <EmptyTitle>עדיין אין לקוחות</EmptyTitle>
            <EmptyDescription>
              הוסיפו לקוח חדש כדי להתחיל.
            </EmptyDescription>
          </EmptyState>
        ) : filteredClients.length === 0 ? (
          <EmptyState>
            לא נמצאו לקוחות התואמים לחיפוש.
          </EmptyState>
        ) : (
          <ScrollableGrid>
            {filteredClients.map((client) => (
              <ClientCard
                client={client}
                key={client.id}
                nextAppointment={nextAppointments[client.id]}
                onSelect={openClientDetails}
              />
            ))}
          </ScrollableGrid>
        )}
      </Panel>

      {isCreateOpen && (
        <Modal
          description="מלאו את הפרטים כדי להוסיף לקוח/ה לרשימה."
          onClose={closeCreateForm}
          title="הוספת לקוח חדש"
        >
          {formError && (
            <div>
              <FeedbackMessage>{formError}</FeedbackMessage>
            </div>
          )}
          <FormStack onSubmit={handleCreateClient}>
            <ClientFormFields form={form} onChange={handleFormChange} />
            <FormNote>
              תאריך ההצטרפות ייקבע אוטומטית בעת שמירת הלקוח.
            </FormNote>
            <ButtonRow>
              <Button
                $variant="secondary"
                $grow
                disabled={isSaving}
                onClick={closeCreateForm}
                type="button"
              >
                ביטול
              </Button>
              <Button
                $grow
                disabled={isSaving}
                type="submit"
              >
                {isSaving ? 'שומר...' : 'שמירת לקוח'}
              </Button>
            </ButtonRow>
          </FormStack>
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
            <div>
              <FeedbackMessage>{formError}</FeedbackMessage>
            </div>
          )}

          {isEditing ? (
            <FormStack onSubmit={handleUpdateClient}>
              <ClientFormFields form={form} onChange={handleFormChange} />
              <FieldLabel>
                <FieldTitle>
                  תאריך הצטרפות
                </FieldTitle>
                <TextInput
                  $readOnly
                  readOnly
                  value={formatDate(selectedClient.created_at, JOIN_DATE_FORMAT)}
                />
              </FieldLabel>
              <ButtonRow>
                <Button
                  $variant="secondary"
                  $grow
                  disabled={isSaving}
                  onClick={cancelEditing}
                  type="button"
                >
                  ביטול
                </Button>
                <Button
                  $grow
                  disabled={isSaving}
                  type="submit"
                >
                  {isSaving ? 'שומר...' : 'שמירת שינויים'}
                </Button>
              </ButtonRow>
            </FormStack>
          ) : isDeleteConfirmationOpen ? (
            <FormStack as="div">
              <FeedbackMessage>
                למחוק את {selectedClient.full_name}? לא ניתן לבטל פעולה זו.
              </FeedbackMessage>
              <DeleteNote>
                אם קיימים תורים המשויכים ללקוח/ה, ייתכן שמסד הנתונים ימנע את
                המחיקה.
              </DeleteNote>
              <ButtonRow>
                <Button
                  $variant="secondary"
                  $grow
                  onClick={() => setIsDeleteConfirmationOpen(false)}
                  type="button"
                >
                  חזרה לפרטים
                </Button>
                <Button
                  $variant="danger"
                  $grow
                  disabled={isDeleting}
                  onClick={handleDeleteClient}
                  type="button"
                >
                  {isDeleting ? 'מוחק...' : 'מחיקת לקוח'}
                </Button>
              </ButtonRow>
            </FormStack>
          ) : (
            <FormStack as="div">
              <ClientDetails client={selectedClient} />
              <DetailsActions>
                <Button
                  $variant="dangerOutline"
                  $grow
                  onClick={() => {
                    setFormError('');
                    setIsDeleteConfirmationOpen(true);
                  }}
                  type="button"
                >
                  <Trash2 aria-hidden="true" size={17} />
                  מחיקת לקוח
                </Button>
                <Button
                  $grow
                  onClick={() => {
                    setFormError('');
                    setIsEditing(true);
                  }}
                  type="button"
                >
                  עריכת פרטים
                </Button>
              </DetailsActions>
            </FormStack>
          )}
        </Modal>
      )}
    </PageContainer>
  );
}

export default memo(ClientList);

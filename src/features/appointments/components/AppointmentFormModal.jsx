import FeedbackMessage from '../../../components/ui/FeedbackMessage';
import Modal from '../../../components/ui/Modal';
import {
  Button,
  ButtonRow,
  FieldHint,
  FieldInput,
  FieldLabel,
  FieldSelect,
  FieldTitle,
  FormStack,
} from '../../../components/ui/Primitives.styles';
import { getDefaultAppointmentDateTime } from '../utils/appointmentDateTime';

export default function AppointmentFormModal({
  appointment,
  clients,
  selectedClientId,
  onClientChange,
  appointmentStatus,
  onStatusChange,
  appointmentDate,
  onDateChange,
  estimatedDuration,
  onDurationChange,
  error,
  isSaving,
  onSubmit,
  onClose,
}) {
  const isEditing = Boolean(appointment);

  return (
    <Modal
      description={
        isEditing
          ? 'שנו את הלקוחה, מועד התור או משכו.'
          : 'בחרו לקוח ומועד כדי להוסיף תור ליומן.'
      }
      onClose={onClose}
      title={isEditing ? 'עריכת תור' : 'קביעת תור חדש'}
    >
      {error && (
        <div>
          <FeedbackMessage>{error}</FeedbackMessage>
        </div>
      )}

      {clients.length === 0 && !isEditing ? (
        <FormStack as="div">
          <FeedbackMessage>
            כדי לקבוע תור, יש להוסיף קודם לקוח לרשימה.
          </FeedbackMessage>
          <button
            $variant="secondary"
            onClick={onClose}
            type="button"
          >
            סגירה
          </button>
        </FormStack>
      ) : (
        <FormStack onSubmit={onSubmit}>
          <FieldLabel>
            <FieldTitle>
              {isEditing ? 'לקוחה' : 'לקוח/ה'}
            </FieldTitle>
            <FieldSelect
              onChange={(event) => onClientChange(event.target.value)}
              required
              value={selectedClientId}
            >
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.full_name} · {client.phone}
                </option>
              ))}
            </FieldSelect>
          </FieldLabel>

          {isEditing && (
            <FieldLabel>
              <FieldTitle>
                סטטוס התור
              </FieldTitle>
              <FieldSelect
                onChange={(event) => onStatusChange(event.target.value)}
                value={appointmentStatus}
              >
                <option value="scheduled">נקבע</option>
                <option value="completed">בוצע</option>
              </FieldSelect>
              {appointmentStatus === 'completed' &&
                appointment.status !== 'completed' && (
                  <FieldHint>
                    בשמירה נבקש להזין את משך הטיפול והמחיר כדי להשלים את התור.
                  </FieldHint>
                )}
              {appointmentStatus === 'scheduled' &&
                appointment.status === 'completed' && (
                  <FieldHint>
                    החזרת התור ל״נקבע״ תסיר את משך הטיפול והמחיר שנשמרו.
                  </FieldHint>
                )}
            </FieldLabel>
          )}

          <FieldLabel>
            <FieldTitle>
              תאריך ושעה
            </FieldTitle>
            <FieldInput
              min={isEditing ? undefined : getDefaultAppointmentDateTime()}
              onChange={(event) => onDateChange(event.target.value)}
              required
              type="datetime-local"
              value={appointmentDate}
            />
          </FieldLabel>

          <FieldLabel>
            <FieldTitle>
              משך משוער (בדקות)
            </FieldTitle>
            <FieldInput
              min="1"
              onChange={(event) => onDurationChange(event.target.value)}
              required
              type="number"
              value={estimatedDuration}
            />
          </FieldLabel>

          <ButtonRow>
            <Button
              $variant="secondary"
              $grow
              disabled={isSaving}
              onClick={onClose}
              type="button"
            >
              ביטול
            </Button>
            <Button
              $grow
              disabled={isSaving}
              type="submit"
            >
              {isSaving
                ? 'שומר...'
                : isEditing
                  ? 'שמירת שינויים'
                  : 'שמירת תור'}
            </Button>
          </ButtonRow>
        </FormStack>
      )}
    </Modal>
  );
}

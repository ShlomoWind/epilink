import FeedbackMessage from '../../../components/ui/FeedbackMessage';
import Modal from '../../../components/ui/Modal';
import { Button, ButtonRow } from '../../../components/ui/Primitives.styles';
import { formatDate } from '../../../utils/formatters';
import styled from 'styled-components';

const DeleteDescription = styled.p`
  margin: 0 0 1.25rem;
  color: #374151;
`;

export default function AppointmentDeleteModal({
  appointment,
  error,
  isDeleting,
  onClose,
  onConfirm,
}) {
  return (
    <Modal
      description="הפעולה אינה ניתנת לביטול."
      onClose={onClose}
      title="מחיקת תור"
    >
      {error && (
        <div>
          <FeedbackMessage>{error}</FeedbackMessage>
        </div>
      )}

      <DeleteDescription>
        למחוק את התור של{' '}
        <strong>{appointment.clients?.full_name || 'הלקוחה'}</strong> בתאריך{' '}
        <strong>
          {formatDate(appointment.appointment_date, {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}{' '}
          בשעה{' '}
          {formatDate(appointment.appointment_date, {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </strong>
        ?
      </DeleteDescription>

      <ButtonRow $paddingTop="0">
        <Button
          $variant="secondary"
          $grow
          disabled={isDeleting}
          onClick={onClose}
          type="button"
        >
          ביטול
        </Button>
        <Button
          $variant="danger"
          $grow
          disabled={isDeleting}
          onClick={onConfirm}
          type="button"
        >
          {isDeleting ? 'מוחק...' : 'מחיקת תור'}
        </Button>
      </ButtonRow>
    </Modal>
  );
}

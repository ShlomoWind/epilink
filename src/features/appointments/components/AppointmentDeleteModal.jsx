import FeedbackMessage from '../../../components/ui/FeedbackMessage';
import Modal from '../../../components/ui/Modal';
import { formatDate } from '../../../utils/formatters';

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
        <div className="mb-4">
          <FeedbackMessage>{error}</FeedbackMessage>
        </div>
      )}

      <p className="mb-5 text-gray-700">
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
      </p>

      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <button
          className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
          disabled={isDeleting}
          onClick={onClose}
          type="button"
        >
          ביטול
        </button>
        <button
          className="flex-1 rounded-xl bg-red-700 px-4 py-3 font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isDeleting}
          onClick={onConfirm}
          type="button"
        >
          {isDeleting ? 'מוחק...' : 'מחיקת תור'}
        </button>
      </div>
    </Modal>
  );
}

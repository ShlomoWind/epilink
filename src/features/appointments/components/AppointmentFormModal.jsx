import FeedbackMessage from '../../../components/ui/FeedbackMessage';
import Modal from '../../../components/ui/Modal';
import { getDefaultAppointmentDateTime } from '../utils/appointmentDateTime';

const fieldClassName =
  'w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100';

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
        <div className="mb-4">
          <FeedbackMessage>{error}</FeedbackMessage>
        </div>
      )}

      {clients.length === 0 && !isEditing ? (
        <div className="space-y-4">
          <FeedbackMessage>
            כדי לקבוע תור, יש להוסיף קודם לקוח לרשימה.
          </FeedbackMessage>
          <button
            className="w-full rounded-xl border border-gray-300 px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
            onClick={onClose}
            type="button"
          >
            סגירה
          </button>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={onSubmit}>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-gray-700">
              {isEditing ? 'לקוחה' : 'לקוח/ה'}
            </span>
            <select
              className={fieldClassName}
              onChange={(event) => onClientChange(event.target.value)}
              required
              value={selectedClientId}
            >
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.full_name} · {client.phone}
                </option>
              ))}
            </select>
          </label>

          {isEditing && (
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-gray-700">
                סטטוס התור
              </span>
              <select
                className={fieldClassName}
                onChange={(event) => onStatusChange(event.target.value)}
                value={appointmentStatus}
              >
                <option value="scheduled">נקבע</option>
                <option value="completed">בוצע</option>
              </select>
              {appointmentStatus === 'completed' &&
                appointment.status !== 'completed' && (
                  <span className="block text-xs leading-5 text-gray-500">
                    בשמירה נבקש להזין את משך הטיפול והמחיר כדי להשלים את התור.
                  </span>
                )}
              {appointmentStatus === 'scheduled' &&
                appointment.status === 'completed' && (
                  <span className="block text-xs leading-5 text-amber-700">
                    החזרת התור ל״נקבע״ תסיר את משך הטיפול והמחיר שנשמרו.
                  </span>
                )}
            </label>
          )}

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-gray-700">
              תאריך ושעה
            </span>
            <input
              className={fieldClassName}
              min={isEditing ? undefined : getDefaultAppointmentDateTime()}
              onChange={(event) => onDateChange(event.target.value)}
              required
              type="datetime-local"
              value={appointmentDate}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-gray-700">
              משך משוער (בדקות)
            </span>
            <input
              className={fieldClassName}
              min="1"
              onChange={(event) => onDurationChange(event.target.value)}
              required
              type="number"
              value={estimatedDuration}
            />
          </label>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
            <button
              className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
              disabled={isSaving}
              onClick={onClose}
              type="button"
            >
              ביטול
            </button>
            <button
              className="flex-1 rounded-xl bg-violet-700 px-4 py-3 font-semibold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSaving}
              type="submit"
            >
              {isSaving
                ? 'שומר...'
                : isEditing
                  ? 'שמירת שינויים'
                  : 'שמירת תור'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

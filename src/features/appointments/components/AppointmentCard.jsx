import { memo } from 'react';
import {
  Check,
  CircleDollarSign,
  Clock3,
  Pencil,
  Trash2,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const TIME_FORMAT = { hour: '2-digit', minute: '2-digit' };

function StatusBadge({ status }) {
  const isCompleted = status === 'completed';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
        isCompleted
          ? 'bg-emerald-100 text-emerald-800'
          : 'bg-blue-100 text-blue-800'
      }`}
    >
      {isCompleted ? (
        <Check aria-hidden="true" size={14} />
      ) : (
        <Clock3 aria-hidden="true" size={14} />
      )}
      {isCompleted ? 'הושלם' : 'נקבע'}
    </span>
  );
}

function AppointmentCard({
  appointment,
  onComplete,
  onDelete,
  onEdit,
}) {
  const clientName = appointment.clients?.full_name || 'לקוח/ה';
  const isCompleted = appointment.status === 'completed';

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-violet-200 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        <div className="flex min-w-[76px] flex-col items-center rounded-xl bg-violet-50 px-3 py-2 text-violet-800">
          <span className="text-lg font-bold leading-tight">
            {formatDate(appointment.appointment_date, TIME_FORMAT)}
          </span>
          <span className="mt-1 text-xs">
            {appointment.estimated_duration} דקות
          </span>
        </div>

        <div className="min-w-0">
          <h3 className="truncate font-semibold text-gray-900">{clientName}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
            {appointment.clients?.phone && (
              <span dir="ltr">{appointment.clients.phone}</span>
            )}
            {isCompleted && appointment.actual_duration != null && (
              <span>{appointment.actual_duration} דקות בפועל</span>
            )}
          </div>
          {isCompleted && appointment.calculated_price != null && (
            <p className="mt-2 flex items-center gap-1 text-sm font-semibold text-emerald-700">
              <CircleDollarSign aria-hidden="true" size={16} />
              {formatCurrency(appointment.calculated_price)} ₪
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
        <StatusBadge status={appointment.status} />
        <button
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
          onClick={() => onEdit(appointment)}
          type="button"
        >
          <Pencil aria-hidden="true" size={15} />
          עריכה
        </button>
        {!isCompleted && (
          <button
            className="rounded-lg border border-violet-200 px-3 py-2 text-sm font-semibold text-violet-800 transition hover:bg-violet-50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
            onClick={() => onComplete(appointment)}
            type="button"
          >
            סיום טיפול
          </button>
        )}
        <button
          aria-label={`מחיקת התור של ${clientName}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          onClick={() => onDelete(appointment)}
          type="button"
        >
          <Trash2 aria-hidden="true" size={15} />
          מחיקה
        </button>
      </div>
    </article>
  );
}

export default memo(AppointmentCard);

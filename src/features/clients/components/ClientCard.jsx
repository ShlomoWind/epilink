import { memo } from 'react';
import {
  CalendarDays,
  CircleDollarSign,
  Mail,
  Scissors,
  UserRound,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const JOIN_DATE_FORMAT = {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
};

const APPOINTMENT_DATE_FORMAT = {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
};

function ClientCard({
  client,
  nextAppointment,
  onSelect,
}) {
  return (
    <button
      className="group rounded-2xl border border-gray-200 bg-white p-5 text-right shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
      key={client.id}
      onClick={() => onSelect(client)}
      type="button"
    >
      <span className="flex items-start justify-between gap-3">
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700">
            <UserRound aria-hidden="true" size={21} />
          </span>
          <span className="truncate text-lg font-semibold text-gray-900">
            {client.full_name}
          </span>
        </span>
        <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 opacity-0 transition group-hover:opacity-100 group-focus:opacity-100">
          פרטים
        </span>
      </span>

      <span className="mt-5 block space-y-3 text-sm text-gray-600">
        <span className="block text-left" dir="ltr">
          {client.phone}
        </span>
        <span className="flex min-h-5 items-center gap-2">
          <Mail aria-hidden="true" className="shrink-0 text-gray-400" size={16} />
          <span className="truncate" dir="ltr">
            {client.email || 'לא הוזן אימייל'}
          </span>
        </span>
        <span className="flex min-h-5 items-center gap-2">
          <Scissors
            aria-hidden="true"
            className="shrink-0 text-gray-400"
            size={16}
          />
          <span>{client.needle_type || 'לא הוזן סוג מחט'}</span>
        </span>
        <span className="flex min-h-5 items-center gap-2">
          <CircleDollarSign
            aria-hidden="true"
            className="shrink-0 text-gray-400"
            size={16}
          />
          <span>חוב: {formatCurrency(client.outstanding_balance)} ₪</span>
        </span>
        <span className="flex min-h-5 items-center gap-2">
          <CalendarDays
            aria-hidden="true"
            className="shrink-0 text-gray-400"
            size={16}
          />
          <span>
            {nextAppointment
              ? `התור הבא: ${formatDate(nextAppointment, APPOINTMENT_DATE_FORMAT)}`
              : 'אין תור קרוב שנקבע'}
          </span>
        </span>
      </span>

      <span className="mt-4 block border-t border-gray-100 pt-3 text-xs text-gray-500">
        הצטרפות: {formatDate(client.created_at, JOIN_DATE_FORMAT)}
      </span>
    </button>
  );
}

export default memo(ClientCard);

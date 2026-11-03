import { memo } from 'react';
import { CalendarDays, Clock3 } from 'lucide-react';
import { formatDate, getLocalDateKey } from '../../../utils/formatters';
import AppointmentCard from './AppointmentCard';

const DATE_FORMAT = {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
};

function AppointmentGroup({
  appointments,
  emptyMessage,
  heading,
  onComplete,
  onDelete,
  onEdit,
}) {
  const groupedAppointments = appointments.reduce((groups, appointment) => {
    const dateKey = getLocalDateKey(appointment.appointment_date);
    const dateAppointments = groups.get(dateKey) || [];
    dateAppointments.push(appointment);
    groups.set(dateKey, dateAppointments);
    return groups;
  }, new Map());

  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
        <CalendarDays aria-hidden="true" className="text-violet-700" size={21} />
        {heading}
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-600">
          {appointments.length}
        </span>
      </h2>

      {appointments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-gray-500">
          {emptyMessage}
        </div>
      ) : (
        <div className="space-y-5">
          {[...groupedAppointments.entries()].map(
            ([dateKey, dateAppointments]) => (
              <div className="space-y-3" key={dateKey}>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-500">
                  <Clock3 aria-hidden="true" size={16} />
                  {formatDate(
                    dateAppointments[0].appointment_date,
                    DATE_FORMAT,
                  )}
                </h3>
                {dateAppointments.map((appointment) => (
                  <AppointmentCard
                    appointment={appointment}
                    key={appointment.id}
                    onComplete={onComplete}
                    onDelete={onDelete}
                    onEdit={onEdit}
                  />
                ))}
              </div>
            ),
          )}
        </div>
      )}
    </section>
  );
}

export default memo(AppointmentGroup);

import { memo } from 'react';
import { CalendarDays, Clock3 } from 'lucide-react';
import { formatDate, getLocalDateKey } from '../../../utils/formatters';
import styled from 'styled-components';
import AppointmentCard from './AppointmentCard';

const GroupSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const GroupHeading = styled.h2`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  color: #111827;
  font-size: 1.25rem;
  font-weight: 700;
`;

const VioletIcon = styled(CalendarDays)`
  color: #6d28d9;
`;

const AppointmentCount = styled.span`
  padding: 0.125rem 0.625rem;
  border-radius: 9999px;
  background: #f3f4f6;
  color: #4b5563;
  font-size: 0.875rem;
  font-weight: 500;
`;

const EmptyAppointments = styled.div`
  padding: 2.5rem 1.5rem;
  border: 1px dashed #d1d5db;
  border-radius: 1rem;
  background: #ffffff;
  color: #6b7280;
  text-align: center;
`;

const GroupedAppointments = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const DateGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const DateHeading = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 600;
`;

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
    <GroupSection>
      <GroupHeading>
        <VioletIcon aria-hidden="true" size={21} />
        {heading}
        <AppointmentCount>
          {appointments.length}
        </AppointmentCount>
      </GroupHeading>

      {appointments.length === 0 ? (
        <EmptyAppointments>
          {emptyMessage}
        </EmptyAppointments>
      ) : (
        <GroupedAppointments>
          {[...groupedAppointments.entries()].map(
            ([dateKey, dateAppointments]) => (
              <DateGroup key={dateKey}>
                <DateHeading>
                  <Clock3 aria-hidden="true" size={16} />
                  {formatDate(
                    dateAppointments[0].appointment_date,
                    DATE_FORMAT,
                  )}
                </DateHeading>
                {dateAppointments.map((appointment) => (
                  <AppointmentCard
                    appointment={appointment}
                    key={appointment.id}
                    onComplete={onComplete}
                    onDelete={onDelete}
                    onEdit={onEdit}
                  />
                ))}
              </DateGroup>
            ),
          )}
        </GroupedAppointments>
      )}
    </GroupSection>
  );
}

export default memo(AppointmentGroup);

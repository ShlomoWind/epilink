import { memo } from 'react';
import {
  Check,
  CircleDollarSign,
  Clock3,
  Pencil,
  Trash2,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import styled, { css } from 'styled-components';

const TIME_FORMAT = { hour: '2-digit', minute: '2-digit' };

const AppointmentArticle = styled.article`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  background: #ffffff;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
  transition: border-color 0.2s ease;

  &:hover {
    border-color: #ddd6fe;
  }

  @media (min-width: 640px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const AppointmentInfo = styled.div`
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: 1rem;
`;

const TimeBlock = styled.div`
  display: flex;
  min-width: 4.75rem;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-radius: 0.75rem;
  background: #f5f3ff;
  color: #5b21b6;
`;

const TimeText = styled.span`
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.25;
`;

const DurationText = styled.span`
  margin-top: 0.25rem;
  font-size: 0.75rem;
`;

const ClientInfo = styled.div`
  min-width: 0;
`;

const ClientName = styled.h3`
  overflow: hidden;
  margin: 0;
  color: #111827;
  font-weight: 600;
  text-overflow: ellipsis;
`;

const SecondaryInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.75rem;
  margin-top: 0.25rem;
  color: #6b7280;
  font-size: 0.875rem;
`;

const PriceInfo = styled.p`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin: 0.5rem 0 0;
  color: #047857;
  font-size: 0.875rem;
  font-weight: 600;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;

  @media (min-width: 640px) {
    justify-content: flex-end;
  }
`;

const StatusBadgeElement = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  ${(props) =>
    props.$completed
      ? css`
          background: #d1fae5;
          color: #065f46;
        `
      : css`
          background: #dbeafe;
          color: #1e40af;
        `}
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid ${(props) => props.$border};
  border-radius: 0.5rem;
  background: #ffffff;
  color: ${(props) => props.$color};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: ${(props) => props.$hover};
  }

  &:focus-visible {
    outline: 2px solid #8b5cf6;
    outline-offset: 2px;
  }
`;

function StatusBadge({ status }) {
  const isCompleted = status === 'completed';

  return (
    <StatusBadgeElement $completed={isCompleted}>
      {isCompleted ? (
        <Check aria-hidden="true" size={14} />
      ) : (
        <Clock3 aria-hidden="true" size={14} />
      )}
      {isCompleted ? 'הושלם' : 'נקבע'}
    </StatusBadgeElement>
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
    <AppointmentArticle>
      <AppointmentInfo>
        <TimeBlock>
          <TimeText>
            {formatDate(appointment.appointment_date, TIME_FORMAT)}
          </TimeText>
          <DurationText>
            {appointment.estimated_duration} דקות
          </DurationText>
        </TimeBlock>

        <ClientInfo>
          <ClientName>{clientName}</ClientName>
          <SecondaryInfo>
            {appointment.clients?.phone && (
              <span dir="ltr">{appointment.clients.phone}</span>
            )}
            {isCompleted && appointment.actual_duration != null && (
              <span>{appointment.actual_duration} דקות בפועל</span>
            )}
          </SecondaryInfo>
          {isCompleted && appointment.calculated_price != null && (
            <PriceInfo>
              <CircleDollarSign aria-hidden="true" size={16} />
              {formatCurrency(appointment.calculated_price)} ₪
            </PriceInfo>
          )}
        </ClientInfo>
      </AppointmentInfo>

      <Actions>
        <StatusBadge status={appointment.status} />
        <ActionButton
          $border="#d1d5db"
          $color="#374151"
          $hover="#f9fafb"
          onClick={() => onEdit(appointment)}
          type="button"
        >
          <Pencil aria-hidden="true" size={15} />
          עריכה
        </ActionButton>
        {!isCompleted && (
          <ActionButton
            $border="#ddd6fe"
            $color="#5b21b6"
            $hover="#f5f3ff"
            onClick={() => onComplete(appointment)}
            type="button"
          >
            סיום טיפול
          </ActionButton>
        )}
        <ActionButton
          aria-label={`מחיקת התור של ${clientName}`}
          $border="#fecaca"
          $color="#b91c1c"
          $hover="#fef2f2"
          onClick={() => onDelete(appointment)}
          type="button"
        >
          <Trash2 aria-hidden="true" size={15} />
          מחיקה
        </ActionButton>
      </Actions>
    </AppointmentArticle>
  );
}

export default memo(AppointmentCard);

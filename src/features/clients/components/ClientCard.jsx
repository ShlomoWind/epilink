import { memo } from 'react';
import {
  CalendarDays,
  CircleDollarSign,
  Mail,
  Scissors,
  UserRound,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import styled from 'styled-components';

const CardButton = styled.button`
  width: 100%;
  padding: 1.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  background: #ffffff;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
  text-align: right;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: #c4b5fd;
    box-shadow: 0 4px 12px rgb(0 0 0 / 0.08);
  }

  &:focus-visible {
    outline: 2px solid #8b5cf6;
    outline-offset: 2px;
  }
`;

const CardHeader = styled.span`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
`;

const Identity = styled.span`
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.75rem;
`;

const Avatar = styled.span`
  display: flex;
  width: 2.75rem;
  height: 2.75rem;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: #ede9fe;
  color: #6d28d9;
`;

const ClientName = styled.span`
  overflow: hidden;
  color: #111827;
  font-size: 1.125rem;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DetailsLink = styled.span`
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  background: #f5f3ff;
  color: #6d28d9;
  font-size: 0.75rem;
  font-weight: 500;
  opacity: 0;
  transition: opacity 0.2s ease;

  ${CardButton}:hover &,
  ${CardButton}:focus-visible & {
    opacity: 1;
  }
`;

const CardDetails = styled.span`
  display: block;
  margin-top: 1.25rem;
  color: #4b5563;
  font-size: 0.875rem;

  > span {
    display: flex;
    min-height: 1.25rem;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.75rem;
  }
`;

const Phone = styled.span`
  display: block !important;
  text-align: left;
`;

const DetailIcon = styled.span`
  display: flex;
  flex: 0 0 auto;
  color: #9ca3af;
`;

const DetailValue = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
`;

const JoinedDate = styled.span`
  display: block;
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f3f4f6;
  color: #6b7280;
  font-size: 0.75rem;
`;

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
    <CardButton
      key={client.id}
      onClick={() => onSelect(client)}
      type="button"
    >
      <CardHeader>
        <Identity>
          <Avatar>
            <UserRound aria-hidden="true" size={21} />
          </Avatar>
          <ClientName>
            {client.full_name}
          </ClientName>
        </Identity>
        <DetailsLink>
          פרטים
        </DetailsLink>
      </CardHeader>

      <CardDetails>
        <Phone dir="ltr">
          {client.phone}
        </Phone>
        <span>
          <DetailIcon><Mail aria-hidden="true" size={16} /></DetailIcon>
          <DetailValue dir="ltr">
            {client.email || 'לא הוזן אימייל'}
          </DetailValue>
        </span>
        <span>
          <DetailIcon><Scissors aria-hidden="true" size={16} /></DetailIcon>
          <DetailValue>{client.needle_type || 'לא הוזן סוג מחט'}</DetailValue>
        </span>
        <span>
          <DetailIcon><CircleDollarSign aria-hidden="true" size={16} /></DetailIcon>
          <DetailValue>חוב: {formatCurrency(client.outstanding_balance)} ₪</DetailValue>
        </span>
        <span>
          <DetailIcon><CalendarDays aria-hidden="true" size={16} /></DetailIcon>
          <DetailValue>
            {nextAppointment
              ? `התור הבא: ${formatDate(nextAppointment, APPOINTMENT_DATE_FORMAT)}`
              : 'אין תור קרוב שנקבע'}
          </DetailValue>
        </span>
      </CardDetails>

      <JoinedDate>
        הצטרפות: {formatDate(client.created_at, JOIN_DATE_FORMAT)}
      </JoinedDate>
    </CardButton>
  );
}

export default memo(ClientCard);

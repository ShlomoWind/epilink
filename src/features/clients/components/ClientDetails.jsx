import { formatCurrency, formatDate } from '../../../utils/formatters';
import styled from 'styled-components';

const DetailsGrid = styled.dl`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const Detail = styled.div`
  min-width: 0;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  background: #f9fafb;
`;

const DetailLabel = styled.dt`
  color: #6b7280;
  font-size: 0.75rem;
  font-weight: 500;
`;

const DetailValue = styled.dd`
  overflow-wrap: break-word;
  margin: 0.25rem 0 0;
  color: #111827;
  font-weight: 500;
`;

const JOIN_DATE_FORMAT = {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
};

export default function ClientDetails({ client }) {
  return (
    <DetailsGrid>
      <ClientDetail label="שם מלא" value={client.full_name} />
      <ClientDetail label="מספר טלפון" value={client.phone} dir="ltr" />
      <ClientDetail
        label="כתובת אימייל"
        value={client.email || 'לא הוזן'}
        dir={client.email ? 'ltr' : undefined}
      />
      <ClientDetail label="סוג מחט" value={client.needle_type || 'לא הוזן'} />
      <ClientDetail
        label="יתרת חוב"
        value={`${formatCurrency(client.outstanding_balance)} ₪`}
      />
      <ClientDetail
        label="תאריך הצטרפות"
        value={formatDate(client.created_at, JOIN_DATE_FORMAT)}
      />
    </DetailsGrid>
  );
}

function ClientDetail({ dir, label, value }) {
  return (
    <Detail>
      <DetailLabel>{label}</DetailLabel>
      <DetailValue dir={dir}>
        {value}
      </DetailValue>
    </Detail>
  );
}

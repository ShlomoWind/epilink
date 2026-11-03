import { formatCurrency, formatDate } from '../../../utils/formatters';

const JOIN_DATE_FORMAT = {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
};

export default function ClientDetails({ client }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
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
    </dl>
  );
}

function ClientDetail({ dir, label, value }) {
  return (
    <div className="min-w-0 rounded-xl bg-gray-50 px-4 py-3">
      <dt className="text-xs font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 break-words font-medium text-gray-900" dir={dir}>
        {value}
      </dd>
    </div>
  );
}

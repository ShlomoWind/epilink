import {
  FieldInput,
  FieldLabel,
  FieldSelect,
  FieldTitle,
} from '../../../components/ui/Primitives.styles';

export default function ClientFormFields({ form, onChange }) {
  return (
    <>
      <FieldLabel>
        <FieldTitle>שם מלא</FieldTitle>
        <FieldInput
          autoComplete="name"
          name="full_name"
          onChange={(event) => onChange('full_name', event.target.value)}
          placeholder="לדוגמה: ישראל ישראלי"
          required
          value={form.full_name}
        />
      </FieldLabel>

      <FieldLabel>
        <FieldTitle>מספר טלפון</FieldTitle>
        <FieldInput
          autoComplete="tel"
          $align="left"
          dir="ltr"
          inputMode="numeric"
          maxLength={10}
          name="phone"
          onChange={(event) =>
            onChange(
              'phone',
              event.target.value.replace(/\D/g, '').slice(0, 10),
            )
          }
          pattern="\d{10}"
          placeholder="0501234567"
          required
          title="יש להזין מספר טלפון המכיל בדיוק 10 ספרות."
          type="tel"
          value={form.phone}
        />
      </FieldLabel>

      <FieldLabel>
        <FieldTitle>כתובת אימייל</FieldTitle>
        <FieldInput
          autoComplete="email"
          $align="left"
          dir="ltr"
          name="email"
          onChange={(event) => onChange('email', event.target.value)}
          placeholder="name@example.com"
          type="email"
          value={form.email}
        />
      </FieldLabel>

      <FieldLabel>
        <FieldTitle>סוג מחט</FieldTitle>
        <FieldSelect
          name="needle_type"
          onChange={(event) => onChange('needle_type', event.target.value)}
          value={form.needle_type}
        >
          <option value="">בחירת סוג מחט</option>
          {[1, 2, 3, 4, 5].map((needleType) => (
            <option key={needleType} value={String(needleType)}>
              {needleType}
            </option>
          ))}
        </FieldSelect>
      </FieldLabel>

      <FieldLabel>
        <FieldTitle>יתרת חוב (₪)</FieldTitle>
        <FieldInput
          min="0"
          onChange={(event) =>
            onChange('outstanding_balance', event.target.value)
          }
          required
          step="0.01"
          type="number"
          value={form.outstanding_balance}
        />
      </FieldLabel>
    </>
  );
}

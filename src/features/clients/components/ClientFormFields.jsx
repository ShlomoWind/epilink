const FIELD_CLASS_NAME =
  'w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100';

export default function ClientFormFields({ form, onChange }) {
  return (
    <>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-gray-700">שם מלא</span>
        <input
          autoComplete="name"
          className={FIELD_CLASS_NAME}
          name="full_name"
          onChange={(event) => onChange('full_name', event.target.value)}
          placeholder="לדוגמה: ישראל ישראלי"
          required
          value={form.full_name}
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-gray-700">מספר טלפון</span>
        <input
          autoComplete="tel"
          className={`${FIELD_CLASS_NAME} text-left`}
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
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-gray-700">כתובת אימייל</span>
        <input
          autoComplete="email"
          className={`${FIELD_CLASS_NAME} text-left`}
          dir="ltr"
          name="email"
          onChange={(event) => onChange('email', event.target.value)}
          placeholder="name@example.com"
          type="email"
          value={form.email}
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-gray-700">סוג מחט</span>
        <select
          className={`${FIELD_CLASS_NAME} bg-white`}
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
        </select>
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-gray-700">יתרת חוב (₪)</span>
        <input
          className={FIELD_CLASS_NAME}
          min="0"
          onChange={(event) =>
            onChange('outstanding_balance', event.target.value)
          }
          required
          step="0.01"
          type="number"
          value={form.outstanding_balance}
        />
      </label>
    </>
  );
}

import FeedbackMessage from '../../../components/ui/FeedbackMessage';
import Modal from '../../../components/ui/Modal';
import { formatCurrency } from '../../../utils/formatters';

export default function AppointmentCompletionModal({
  appointment,
  actualDuration,
  onDurationChange,
  pricePerMinute,
  onPriceChange,
  calculatedPrice,
  error,
  isCompleting,
  onClose,
  onSubmit,
}) {
  return (
    <Modal
      description={`עדכון משך הטיפול עבור ${appointment.clients?.full_name || 'הלקוח/ה'}.`}
      onClose={onClose}
      title="סיום טיפול"
    >
      {error && (
        <div className="mb-4">
          <FeedbackMessage>{error}</FeedbackMessage>
        </div>
      )}

      <form className="space-y-5" onSubmit={onSubmit}>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-gray-700">
            משך הטיפול בפועל (בדקות)
          </span>
          <input
            autoFocus
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            min="1"
            onChange={(event) => onDurationChange(event.target.value)}
            required
            type="number"
            value={actualDuration}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-gray-700">
            מחיר לדקה עבור טיפול זה (₪)
          </span>
          <input
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            min="0.01"
            onChange={(event) => onPriceChange(event.target.value)}
            required
            step="0.01"
            type="number"
            value={pricePerMinute}
          />
        </label>

        <div
          aria-live="polite"
          className="flex items-center justify-between rounded-xl bg-violet-50 px-4 py-4"
        >
          <div>
            <p className="text-sm text-violet-800">מחיר משוער</p>
            <p className="mt-1 text-xs text-violet-600">
              {actualDuration || '0'} דקות ×{' '}
              {formatCurrency(Number(pricePerMinute))} לדקה
            </p>
          </div>
          <p className="text-2xl font-bold text-violet-900">
            {calculatedPrice == null
              ? '—'
              : `${formatCurrency(calculatedPrice)} ₪`}
          </p>
        </div>

        <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row">
          <button
            className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
            disabled={isCompleting}
            onClick={onClose}
            type="button"
          >
            ביטול
          </button>
          <button
            className="flex-1 rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isCompleting}
            type="submit"
          >
            {isCompleting ? 'שומר...' : 'אישור סיום טיפול'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

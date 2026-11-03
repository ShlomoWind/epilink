import FeedbackMessage from '../../../components/ui/FeedbackMessage';
import Modal from '../../../components/ui/Modal';

export default function AppointmentPricingSettingsModal({
  price,
  onPriceChange,
  error,
  onClose,
  onSubmit,
}) {
  return (
    <Modal
      description="המחיר הזה ימולא כברירת מחדל בחלונית סיום טיפול. אפשר לשנות אותו לכל טיפול בנפרד."
      onClose={onClose}
      title="הגדרות תמחור"
    >
      {error && (
        <div className="mb-4">
          <FeedbackMessage>{error}</FeedbackMessage>
        </div>
      )}

      <form className="space-y-5" onSubmit={onSubmit}>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-gray-700">
            מחיר ברירת מחדל לדקה (₪)
          </span>
          <input
            autoFocus
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            min="0.01"
            onChange={(event) => onPriceChange(event.target.value)}
            required
            step="0.01"
            type="number"
            value={price}
          />
        </label>

        <p className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
          ההגדרה נשמרת בדפדפן הזה בלבד. ניתן להזין תעריף שונה לטיפול יחיד בזמן
          סיומו.
        </p>

        <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row">
          <button
            className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
            onClick={onClose}
            type="button"
          >
            ביטול
          </button>
          <button
            className="flex-1 rounded-xl bg-violet-700 px-4 py-3 font-semibold text-white transition hover:bg-violet-800"
            type="submit"
          >
            שמירת הגדרה
          </button>
        </div>
      </form>
    </Modal>
  );
}

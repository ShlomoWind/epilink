import { AlertCircle } from 'lucide-react';

export default function FeedbackMessage({ children, type = 'error' }) {
  const isError = type === 'error';

  return (
    <div
      className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${
        isError
          ? 'border border-red-200 bg-red-50 text-red-700'
          : 'border border-emerald-200 bg-emerald-50 text-emerald-700'
      }`}
      role={isError ? 'alert' : 'status'}
    >
      {isError && <AlertCircle aria-hidden="true" size={18} />}
      <span>{children}</span>
    </div>
  );
}

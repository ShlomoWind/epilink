import { useId } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  children,
  description,
  maxWidth = 'max-w-lg',
  onClose,
  title,
}) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-950/50 p-4"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          onClose();
        }
      }}
      role="presentation"
    >
      <section
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        aria-modal="true"
        className={`my-auto w-full ${maxWidth} rounded-2xl bg-white p-6 shadow-2xl`}
        role="dialog"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-xl font-bold text-gray-900" id={titleId}>
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-gray-500" id={descriptionId}>
                {description}
              </p>
            )}
          </div>
          <button
            aria-label="סגירה"
            className="shrink-0 rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={20} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

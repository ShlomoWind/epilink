import { useId } from 'react';
import { X } from 'lucide-react';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  z-index: 50;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  padding: 1rem;
  background: rgb(3 7 18 / 0.5);
`;

const Dialog = styled.section`
  width: 100%;
  max-width: ${(props) => props.$maxWidth || '32rem'};
  margin: auto;
  padding: 1.5rem;
  border-radius: 1rem;
  background: #ffffff;
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
`;

const DialogHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const DialogHeading = styled.div`
  min-width: 0;
`;

const DialogTitle = styled.h2`
  overflow: hidden;
  margin: 0;
  color: #111827;
  font-size: 1.25rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DialogDescription = styled.p`
  margin: 0.25rem 0 0;
  color: #6b7280;
  font-size: 0.875rem;
`;

const CloseButton = styled.button`
  flex: 0 0 auto;
  padding: 0.5rem;
  border: 0;
  border-radius: 0.5rem;
  background: transparent;
  color: #6b7280;
  cursor: pointer;

  &:hover {
    background: #f3f4f6;
    color: #1f2937;
  }
`;

export default function Modal({
  children,
  description,
  maxWidth = '32rem',
  onClose,
  title,
}) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <Overlay
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          onClose();
        }
      }}
      role="presentation"
    >
      <Dialog
        $maxWidth={maxWidth}
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        aria-modal="true"
        role="dialog"
      >
        <DialogHeader>
          <DialogHeading>
            <DialogTitle id={titleId}>
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription id={descriptionId}>
                {description}
              </DialogDescription>
            )}
          </DialogHeading>
          <CloseButton
            aria-label="סגירה"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={20} />
          </CloseButton>
        </DialogHeader>
        {children}
      </Dialog>
    </Overlay>
  );
}

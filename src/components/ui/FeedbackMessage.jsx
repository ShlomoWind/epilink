import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import styled, { css } from 'styled-components';

const Message = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  transition:
    opacity 0.3s ease-out,
    transform 0.3s ease-out;
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  transform: ${(props) => (props.$visible ? 'translateY(0)' : 'translateY(-0.5rem)')};
  ${(props) =>
    props.$error
      ? css`
          border-color: #fecaca;
          background: #fef2f2;
          color: #b91c1c;
        `
      : css`
          border-color: #a7f3d0;
          background: #ecfdf5;
          color: #047857;
        `}
`;

export default function FeedbackMessage({ children, type = 'error' }) {
  const isError = type === 'error';
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isError) {
      return undefined;
    }

    const dismissTimer = window.setTimeout(() => {
      setIsVisible(false);
    }, 10_000);
    const removeTimer = window.setTimeout(() => {
      setIsDismissed(true);
    }, 10_300);

    return () => {
      window.clearTimeout(dismissTimer);
      window.clearTimeout(removeTimer);
    };
  }, [children, isError]);

  if (isDismissed) {
    return null;
  }

  return (
    <Message
      $error={isError}
      $visible={isVisible}
      aria-hidden={!isVisible}
      role={isError ? 'alert' : 'status'}
    >
      {isError && <AlertCircle aria-hidden="true" size={18} />}
      <span>{children}</span>
    </Message>
  );
}

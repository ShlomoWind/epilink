import styled from 'styled-components';

export const LoginButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: ${(props) => (props.$fullWidth ? '100%' : 'auto')};
  min-height: ${(props) => (props.$fullWidth ? '3.5rem' : '2.75rem')};
  padding: 0.75rem 1.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.875rem;
  background-color: #ffffff;
  color: #1f2937;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(17, 24, 39, 0.06);
  transition:
    background-color 0.2s ease-in-out,
    border-color 0.2s ease-in-out,
    box-shadow 0.2s ease-in-out,
    transform 0.2s ease-in-out;

  &:hover:not(:disabled) {
    background-color: #fafafa;
    border-color: #d1d5db;
    box-shadow: 0 6px 18px rgba(17, 24, 39, 0.08);
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 3px solid rgba(124, 58, 237, 0.3);
    outline-offset: 2px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    transform: none;
  }
`;

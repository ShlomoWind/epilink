import styled from 'styled-components';

export const LoginButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  background-color: #2563eb;
  color: #ffffff;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  &:hover:not(:disabled) {
    background-color: #1d4ed8;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }
`;

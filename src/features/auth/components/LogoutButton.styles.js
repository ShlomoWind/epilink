import styled from 'styled-components';

export const LogoutButton = styled.button`
  padding: 0;
  border: none;
  background: none;
  color: #dc2626;
  font-size: 0.875rem;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &:hover:not(:disabled) {
    text-decoration: underline;
  }
`;

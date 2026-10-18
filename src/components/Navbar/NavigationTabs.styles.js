import styled from 'styled-components';

export const TabsContainer = styled.div`
  display: flex;
  gap: 1rem;
`;

export const NavigationTab = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  background-color: ${(props) => (props.$active ? '#dbeafe' : 'transparent')};
  color: ${(props) => (props.$active ? '#1d4ed8' : '#4b5563')};

  &:hover {
    background-color: ${(props) => (props.$active ? '#dbeafe' : '#f3f4f6')};
  }
`;

import styled from 'styled-components';

export const NavContainer = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  direction: rtl;
`;

export const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 3.75rem;
`;

export const LogoImage = styled.img`
  display: block;
  width: 3.75rem;
  height: 3.75rem;
  object-fit: contain;
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
`;

export const NavTabs = styled.div`
  display: flex;
  gap: 1rem;
`;

export const TabButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  background-color: ${(props) => (props.$active ? '#dbeafe' : 'transparent')};
  color: ${(props) => (props.$active ? '#1d4ed8' : '#4b5563')};

  &:hover {
    background-color: ${(props) => (props.$active ? '#dbeafe' : '#f3f4f6')};
  }
`;

export const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

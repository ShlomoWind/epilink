import styled from 'styled-components';

const Shell = styled.div`
  min-height: 100vh;
  background: #f9fafb;
`;

export default function AppShell({ children }) {
  return (
    <Shell dir="rtl">
      {children}
    </Shell>
  );
}

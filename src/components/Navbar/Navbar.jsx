import { Calendar, Users, LogIn } from 'lucide-react';
import {
  NavContainer,
  Logo,
  LogoImage,
  NavTabs,
  TabButton,
  UserSection,
  LoginButton,
  LogoutButton,
  UserEmail,
} from './Navbar.styles';

export default function Navbar({ activeTab, setActiveTab, user, onLogin, onLogout }) {
  return (
    <NavContainer>
      <Logo>
        <LogoImage src="/epilink-logo.jpg" alt="לוגו Epilink" />
      </Logo>

      <NavTabs>
        <TabButton
          $active={activeTab === 'appointments'}
          onClick={() => setActiveTab?.('appointments')}
          type="button"
        >
          <Calendar size={18} />
          לוח תורים
        </TabButton>

        <TabButton
          $active={activeTab === 'clients'}
          onClick={() => setActiveTab?.('clients')}
          type="button"
        >
          <Users size={18} />
          רשימת לקוחות
        </TabButton>
      </NavTabs>

      <UserSection>
        {user ? (
          <>
            <UserEmail>{user.email}</UserEmail>
            <LogoutButton onClick={onLogout} type="button">התנתק</LogoutButton>
          </>
        ) : (
          <LoginButton onClick={onLogin} type="button">
            <LogIn size={18} />
            התחבר עם Google
          </LoginButton>
        )}
      </UserSection>
    </NavContainer>
  );
}

import BrandLogo from './BrandLogo';
import NavigationTabs from './NavigationTabs';
import AuthStatusMessage from './AuthStatusMessage';
import GoogleLoginButton from '../../features/auth/components/GoogleLoginButton';
import LogoutButton from '../../features/auth/components/LogoutButton';
import UserProfile from '../../features/auth/components/UserProfile';
import { NavContainer, UserSection } from './Navbar.styles';

export default function Navbar({
  activeTab,
  setActiveTab,
  user,
  googleIdentity,
  isAuthLoading,
  isSubmitting,
  authError,
  onLogin,
  onLogout,
}) {
  return (
    <>
      <NavContainer>
        <BrandLogo />
        <NavigationTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <UserSection>
          {user ? (
            <>
              <UserProfile user={user} googleIdentity={googleIdentity} />
              <LogoutButton disabled={isSubmitting} onLogout={onLogout} />
            </>
          ) : (
            <GoogleLoginButton
              isLoading={isAuthLoading}
              isSubmitting={isSubmitting}
              onLogin={onLogin}
            />
          )}
        </UserSection>
      </NavContainer>
      <AuthStatusMessage>{authError}</AuthStatusMessage>
    </>
  );
}

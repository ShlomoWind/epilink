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
  clinics,
  activeClinicId,
  onClinicChange,
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
              {clinics.length > 1 && (
                <label dir="rtl">
                  <span style={{ marginInlineEnd: '0.5rem' }}>מרפאה:</span>
                  <select
                    aria-label="בחירת מרפאה פעילה"
                    value={activeClinicId}
                    onChange={(event) => onClinicChange(event.target.value)}
                  >
                    {clinics.map((clinic) => (
                      <option key={clinic.id} value={clinic.id}>
                        {clinic.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
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

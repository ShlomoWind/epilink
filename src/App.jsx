import { lazy, Suspense, useState } from 'react';
import Navbar from './components/Navbar/Navbar';
import { useAuth } from './features/auth/hooks/useAuth';
import AppShell from './layouts/AppShell';
import styled from 'styled-components';
import { LoadingIcon, LoadingState } from './components/ui/Primitives.styles';

const AppointmentBoard = lazy(
  () => import('./features/appointments/AppointmentBoard'),
);
const ClientList = lazy(() => import('./features/clients/ClientList'));
const LoginPage = lazy(() => import('./features/auth/components/LoginPage'));

const AuthLoadingState = styled(LoadingState)`
  min-height: 100vh;
`;

const MainContent = styled.main`
  padding: 1.5rem;
`;

function FeatureLoadingState() {
  return (
    <LoadingState aria-live="polite" dir="rtl">
      <LoadingIcon aria-hidden="true" size={22} />
      טוען...
    </LoadingState>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('appointments');
  const [hasVisitedClients, setHasVisitedClients] = useState(false);
  const {
    user,
    googleIdentity,
    isLoading: isAuthLoading,
    isSubmitting,
    error: authError,
    loginWithGoogle,
    logout,
  } = useAuth();

  function handleTabChange(tab) {
    setActiveTab(tab);

    if (tab === 'clients') {
      setHasVisitedClients(true);
    }
  }

  if (isAuthLoading) {
    return (
      <AppShell>
        <AuthLoadingState aria-live="polite" dir="rtl">
          <LoadingIcon aria-hidden="true" size={22} />
          בודק התחברות...
        </AuthLoadingState>
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell>
        <Suspense fallback={<FeatureLoadingState />}>
          <LoginPage
            error={authError}
            isSubmitting={isSubmitting}
            onLogin={loginWithGoogle}
          />
        </Suspense>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        user={user}
        googleIdentity={googleIdentity}
        isSubmitting={isSubmitting}
        authError={authError}
        onLogin={loginWithGoogle}
        onLogout={logout}
      />

      <MainContent>
        <Suspense fallback={<FeatureLoadingState />}>
          <div hidden={activeTab !== 'appointments'}>
            <AppointmentBoard key={user.id} userId={user.id} />
          </div>
          <div hidden={activeTab !== 'clients'}>
            {(hasVisitedClients || activeTab === 'clients') && (
              <ClientList key={user.id} userId={user.id} />
            )}
          </div>
        </Suspense>
      </MainContent>
    </AppShell>
  );
}

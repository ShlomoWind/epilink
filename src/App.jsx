import { lazy, Suspense, useState } from 'react';
import Navbar from './components/Navbar/Navbar';
import { useAuth } from './features/auth/hooks/useAuth';
import AppShell from './layouts/AppShell';
import { LoaderCircle } from 'lucide-react';

const AppointmentBoard = lazy(
  () => import('./features/appointments/AppointmentBoard'),
);
const ClientList = lazy(() => import('./features/clients/ClientList'));
const LoginPage = lazy(() => import('./features/auth/components/LoginPage'));

function FeatureLoadingState() {
  return (
    <div
      aria-live="polite"
      className="flex items-center justify-center gap-3 py-16 text-gray-600"
      dir="rtl"
    >
      <LoaderCircle
        aria-hidden="true"
        className="animate-spin text-violet-700"
        size={22}
      />
      טוען...
    </div>
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
        <main
          aria-live="polite"
          className="flex min-h-screen items-center justify-center gap-3 text-gray-600"
          dir="rtl"
        >
          <LoaderCircle
            aria-hidden="true"
            className="animate-spin text-violet-700"
            size={22}
          />
          בודק התחברות...
        </main>
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

      <main className="p-6">
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
      </main>
    </AppShell>
  );
}

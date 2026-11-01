import { useState } from 'react';
import Navbar from './components/Navbar/Navbar';
import AppointmentBoard from './features/appointments/AppointmentBoard';
import { useAuth } from './features/auth/hooks/useAuth';
import ClientList from './features/clients/ClientList';
import AppShell from './layouts/AppShell';

export default function App() {
  const [activeTab, setActiveTab] = useState('appointments');
  const {
    user,
    googleIdentity,
    isLoading: isAuthLoading,
    isSubmitting,
    error: authError,
    loginWithGoogle,
    logout,
  } = useAuth();

  return (
    <AppShell>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        googleIdentity={googleIdentity}
        isAuthLoading={isAuthLoading}
        isSubmitting={isSubmitting}
        authError={authError}
        onLogin={loginWithGoogle}
        onLogout={logout}
      />

      <main className="p-6">
        {activeTab === 'appointments' && <AppointmentBoard />}
        {activeTab === 'clients' && <ClientList />}
      </main>
    </AppShell>
  );
}

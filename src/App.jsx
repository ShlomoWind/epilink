import { useState } from 'react';
import Navbar from './components/Navbar/Navbar';
import AppointmentBoard from './features/appointments/AppointmentBoard';
import ClientList from './features/clients/ClientList';
import AppShell from './layouts/AppShell';

export default function App() {
  const [activeTab, setActiveTab] = useState('appointments');

  return (
    <AppShell>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="p-6">
        {activeTab === 'appointments' && <AppointmentBoard />}
        {activeTab === 'clients' && <ClientList />}
      </main>
    </AppShell>
  );
}
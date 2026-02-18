import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { MobileNav } from './components/MobileNav';
import { Dashboard } from './sections/Dashboard';
import { Tasks } from './sections/Tasks';
import { Finances } from './sections/Finances';
import type { ViewType } from './types';

function AppContent() {
  const { user, loading, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'tasks':
        return <Tasks />;
      case 'finances':
        return <Finances />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <p className="text-lg font-medium">Módulo en desarrollo</p>
            <p className="text-sm">Próximamente disponible</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileNav 
        currentView={currentView} 
        onViewChange={setCurrentView}
        onLogout={signOut}
      />

      <main className="lg:ml-64 p-4 lg:p-8 max-w-7xl">
        {renderView()}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

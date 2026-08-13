import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { FleetOverview } from './pages/FleetOverview';
import { EquipmentExplorer } from './pages/EquipmentExplorer';
import { AIAssistant } from './pages/AIAssistant';
import { DataQuality } from './pages/DataQuality';
import { EquipmentDetail } from './pages/EquipmentDetail';
import { EquipmentAnalysis } from './pages/EquipmentAnalysis';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Profile } from './pages/Profile';

export default function App() {
  const [authView, setAuthView] = useState('login');
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('fleet');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  // Track the selected equipment for detail view
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('mw_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('mw_user');
      }
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('mw_user', JSON.stringify(userData));
    setCurrentView('fleet');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('mw_user');
    setSelectedEquipmentId(null);
    setSelectedEquipment(null);
    setAuthView('login');
  };

  const handleSelectEquipment = (id, equipmentData) => {
    setSelectedEquipmentId(id);
    setSelectedEquipment(equipmentData);
  };

  // Auth screens
  if (!user) {
    if (authView === 'signup') {
      return <Signup onNavigate={setAuthView} />;
    }
    return <Login onNavigate={setAuthView} onLogin={handleLogin} />;
  }

  // Profile page (full-screen)
  if (currentView === 'profile') {
    return (
      <Profile
        user={user}
        onLogout={handleLogout}
        onNavigate={setCurrentView}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-main font-sans selection:bg-primary/30 selection:text-white flex overflow-hidden h-screen">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
        } md:w-64 shrink-0 transition-all duration-300 ease-in-out border-r border-border-subtle bg-surface z-20 flex flex-col`}
      >
        <Sidebar currentView={currentView} onNavigate={setCurrentView} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          currentView={currentView}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          user={user}
          onProfileClick={() => setCurrentView('profile')}
          searchQuery={globalSearchQuery}
          onSearchChange={setGlobalSearchQuery}
        />

        <main className="flex-1 overflow-auto bg-background">
          {currentView === 'fleet'     && <FleetOverview />}
          {currentView === 'explorer'  && (
            <EquipmentExplorer
              onNavigate={setCurrentView}
              searchQuery={globalSearchQuery}
              onSelectEquipment={handleSelectEquipment}
            />
          )}
          {currentView === 'detail'    && (
            <EquipmentDetail
              onNavigate={setCurrentView}
              selectedEquipmentId={selectedEquipmentId}
            />
          )}
          {currentView === 'assistant' && <AIAssistant />}
          {currentView === 'quality'   && <DataQuality globalSearchQuery={globalSearchQuery} />}
          {currentView === 'analysis'  && <EquipmentAnalysis />}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

// src/App.tsx
import { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Analyze from './pages/Analyze';
import Dub from './pages/Dub';
import History from './pages/History';
import Settings from './pages/Settings';
import Script from './pages/Script';
import Auth from './pages/Auth';
import { useAuth } from './context/AuthContext';
import { Page } from './types';
import Trends from './pages/Trends';
import Schedule from './pages/Schedule';


function App() {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#DF812D] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const pageTitles: Record<Page, string> = {
    dashboard: 'Dashboard',
    analyze: 'Analyze Content',
    dub: 'Dub Video',
    history: 'History',
    settings: 'Settings',
    script: 'Script Generator',
    trends: 'Content Intelligence',
    schedule: 'Schedule & Publish',
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'analyze': return <Analyze />;
      case 'dub': return <Dub />;
      case 'history': return <History />;
      case 'settings': return <Settings />;
      case 'script': return <Script />;
      case 'trends': return <Trends />;
      case 'schedule': return <Schedule />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage} title={pageTitles[currentPage]}>
      {renderPage()}
    </Layout>
  );
}

export default App;
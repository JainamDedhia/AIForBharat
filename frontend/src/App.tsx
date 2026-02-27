import { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Analyze from './pages/Analyze';
import Dub from './pages/Dub';
import History from './pages/History';
import Settings from './pages/Settings';
import { Page } from './types';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const pageTitles: Record<Page, string> = {
    dashboard: 'Dashboard',
    analyze: 'Analyze Content',
    dub: 'Dub Video',
    history: 'History',
    settings: 'Settings',
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'analyze':
        return <Analyze />;
      case 'dub':
        return <Dub />;
      case 'history':
        return <History />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      title={pageTitles[currentPage]}
    >
      {renderPage()}
    </Layout>
  );
}

export default App;

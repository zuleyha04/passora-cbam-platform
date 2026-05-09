import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Calculator from './pages/Calculator';
import Simulation from './pages/Simulation';
import Recommendations from './pages/Recommendations';
import Reports from './pages/Reports';
import styles from './App.module.css';

function AppLayout() {
  const { state } = useApp();

  const PAGE = {
    dashboard:       <Dashboard />,
    calculator:      <Calculator />,
    simulation:      <Simulation />,
    recommendations: <Recommendations />,
    reports:         <Reports />,
  };

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <div className={styles.content}>
          {PAGE[state.activeTab]}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
}

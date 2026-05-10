import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Calculator from './pages/Calculator';
import Simulation from './pages/Simulation';
import Recommendations from './pages/Recommendations';
import History from './pages/History';
import Reports from './pages/Reports';

function AppLayout() {
  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <main className="flex-1 overflow-y-auto min-h-screen">
        <Routes>
          <Route path="/"                index element={<Dashboard />} />
          <Route path="/calculator"      element={<Calculator />} />
          <Route path="/simulation"      element={<Simulation />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/history"         element={<History />} />
          <Route path="/reports"         element={<Reports />} />
          <Route path="*"               element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </Provider>
  );
}

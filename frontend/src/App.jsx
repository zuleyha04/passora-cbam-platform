import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { ProtectedRoute } from './auth/ProtectedRoute'
import CompanyProducts from './pages/CompanyProducts'
import CompanyUsers from './pages/CompanyUsers'
import OperatorDataEntry from './pages/OperatorDataEntry'

import Login from './pages/Login'

import AdminDashboard from './pages/AdminDashboard'
import Companies from './pages/Companies'
import CompanyAdmins from './pages/CompanyAdmins'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

import CompanyDashboard from './pages/CompanyDashboard'
import CbamCalculation from './pages/CbamCalculation'
import CompanyDataTasks from './pages/CompanyDataTasks'
import CompanyApprovals from './pages/CompanyApprovals'
import CompanySupplierScenarios from './pages/CompanySupplierScenarios'
import PlaceholderPage from './pages/PlaceholderPage'

import OperatorDashboard from './pages/OperatorDashboard'

import './styles/global.css'

function getDemoRole(user) {
  return localStorage.getItem('passora_role') || user?.role || 'super_admin'
}

function HomeRedirect() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Yükleniyor...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const role = getDemoRole(user)

  if (role === 'company_admin') return <Navigate to="/company" replace />
  if (role === 'operator') return <Navigate to="/operator" replace />

  return <Navigate to="/admin" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<HomeRedirect />} />

      {/* Passora Super Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/companies"
        element={
          <ProtectedRoute>
            <Companies />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/company-admins"
        element={
          <ProtectedRoute>
            <CompanyAdmins />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* KOBİ Firma Admini */}
      <Route
        path="/company"
        element={
          <ProtectedRoute>
            <CompanyDashboard />
          </ProtectedRoute>
        }
      />

      <Route
  path="/company/products"
  element={
    <ProtectedRoute>
      <CompanyProducts />
    </ProtectedRoute>
  }
/>

      <Route
        path="/company/cbam-calculation"
        element={
          <ProtectedRoute>
            <CbamCalculation />
          </ProtectedRoute>
        }
      />

      <Route
        path="/company/data-tasks"
        element={
          <ProtectedRoute>
            <CompanyDataTasks />
          </ProtectedRoute>
        }
      />

      <Route
        path="/company/approvals"
        element={
          <ProtectedRoute>
            <CompanyApprovals />
          </ProtectedRoute>
        }
      />

      <Route
        path="/company/supplier-scenarios"
        element={
          <ProtectedRoute>
            <CompanySupplierScenarios />
          </ProtectedRoute>
        }
      />

      <Route
        path="/company/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />

      <Route
  path="/company/users"
  element={
    <ProtectedRoute>
      <CompanyUsers />
    </ProtectedRoute>
  }
/>

      <Route
        path="/company/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* Operasyon Kullanıcısı */}
      <Route
        path="/operator"
        element={
          <ProtectedRoute>
            <OperatorDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/operator/tasks"
        element={
          <ProtectedRoute>
            <OperatorDashboard />
          </ProtectedRoute>
        }
      />

      <Route
  path="/operator/data-entry"
  element={
    <ProtectedRoute>
      <OperatorDataEntry />
    </ProtectedRoute>
  }
/>

      <Route
        path="/operator/documents"
        element={
          <ProtectedRoute>
            <PlaceholderPage title="Belgeler" subtitle="Kanıt ve belge yükleme alanı" />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
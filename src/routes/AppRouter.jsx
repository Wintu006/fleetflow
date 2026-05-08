import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

// Auth
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))

// Dashboard
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'))

// Vehicles
const VehiclesListPage = lazy(() => import('@/pages/vehicles/VehiclesListPage'))
const VehicleCreatePage = lazy(() => import('@/pages/vehicles/VehicleCreatePage'))
const VehicleDetailPage = lazy(() => import('@/pages/vehicles/VehicleDetailPage'))

// Maintenance
const MaintenanceListPage = lazy(() => import('@/pages/maintenance/MaintenanceListPage'))
const MaintenanceCreatePage = lazy(() => import('@/pages/maintenance/MaintenanceCreatePage'))
const MaintenanceEditPage = lazy(() => import('@/pages/maintenance/MaintenanceEditPage'))

// Checklist
const ChecklistListPage = lazy(() => import('@/pages/checklist/ChecklistListPage'))
const ChecklistCreatePage = lazy(() => import('@/pages/checklist/ChecklistCreatePage'))

// Outros
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

function SuspenseWrapper({ children }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <LoadingSpinner size="lg" />
      </div>
    }>
      {children}
    </Suspense>
  )
}

const router = createBrowserRouter([
  // Rotas públicas
  {
    path: '/login',
    element: <SuspenseWrapper><LoginPage /></SuspenseWrapper>,
  },
  {
    path: '/register',
    element: <SuspenseWrapper><RegisterPage /></SuspenseWrapper>,
  },

  // Rotas protegidas COM layout administrativo
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      
      // Dashboard
      { path: 'dashboard', element: <SuspenseWrapper><DashboardPage /></SuspenseWrapper> },
      
      // Veículos
      { path: 'vehicles', element: <SuspenseWrapper><VehiclesListPage /></SuspenseWrapper> },
      { path: 'vehicles/new', element: <SuspenseWrapper><VehicleCreatePage /></SuspenseWrapper> },
      { path: 'vehicles/:id', element: <SuspenseWrapper><VehicleDetailPage /></SuspenseWrapper> },
      
      // Manutenções
      { path: 'maintenance', element: <SuspenseWrapper><MaintenanceListPage /></SuspenseWrapper> },
      { path: 'maintenance/new', element: <SuspenseWrapper><MaintenanceCreatePage /></SuspenseWrapper> },
      
      // Checklists
      { path: 'checklist', element: <SuspenseWrapper><ChecklistListPage /></SuspenseWrapper> },
      { path: 'checklist/new', element: <SuspenseWrapper><ChecklistCreatePage /></SuspenseWrapper> },
      
      // Outros
      { path: 'analytics', element: <SuspenseWrapper><AnalyticsPage /></SuspenseWrapper> },
      { path: 'settings', element: <SuspenseWrapper><SettingsPage /></SuspenseWrapper> },
      { path: 'maintenance/:id/edit', element: <SuspenseWrapper><MaintenanceEditPage /></SuspenseWrapper> },
    ],
  },

  // 404
  {
    path: '*',
    element: <SuspenseWrapper><NotFoundPage /></SuspenseWrapper>,
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
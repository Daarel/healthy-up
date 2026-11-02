import { lazy, Suspense } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';

// Public / Auth Pages
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Login = lazy(() => import('./pages/Login'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPasswordOtp = lazy(() => import('./pages/ResetPasswordOtp'));
const ResetPasswordBaru = lazy(() => import('./pages/ResetPasswordBaru'));

// User Pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Tugas = lazy(() => import('./pages/Tugas'));
const Hadiah = lazy(() => import('./pages/Hadiah'));
const Profil = lazy(() => import('./pages/Profil'));

// Admin Pages
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminUserDetail = lazy(() => import('./pages/admin/AdminUserDetail'));
const AdminMissions = lazy(() => import('./pages/admin/AdminMissions'));
const AdminRewards = lazy(() => import('./pages/admin/AdminRewards'));

function PageLoader() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-[var(--color-bg,#f8f9ff)]'>
      <div className='w-8 h-8 border-4 border-[#006e2f] border-t-transparent rounded-full animate-spin' />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path='/' element={<Navigate to='/onboarding' replace />} />
          <Route
            path='/onboarding'
            element={
              <PublicRoute>
                <Onboarding />
              </PublicRoute>
            }
          />
          <Route
            path='/onboarding'
            element={<Navigate to='/onboarding' replace />}
          />
          <Route
            path='/login'
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path='/admin/login'
            element={<Navigate to='/login' replace />}
          />
          <Route
            path='/lupa-password'
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />
          <Route
            path='/reset-password/otp'
            element={
              <PublicRoute>
                <ResetPasswordOtp />
              </PublicRoute>
            }
          />
          <Route
            path='/reset-password/baru'
            element={
              <PublicRoute>
                <ResetPasswordBaru />
              </PublicRoute>
            }
          />

          <Route
            path='/dashboard'
            element={
              <PrivateRoute allowedRoles={['user']}>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path='/tugas'
            element={
              <PrivateRoute allowedRoles={['user']}>
                <Tugas />
              </PrivateRoute>
            }
          />
          <Route
            path='/hadiah'
            element={
              <PrivateRoute allowedRoles={['user']}>
                <Hadiah />
              </PrivateRoute>
            }
          />
          <Route
            path='/profil'
            element={
              <PrivateRoute allowedRoles={['user']}>
                <Profil />
              </PrivateRoute>
            }
          />

          <Route
            path='/admin'
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to='/admin/users' replace />} />
            <Route path='users' element={<AdminUsers />} />
            <Route path='users/:id' element={<AdminUserDetail />} />
            <Route path='missions' element={<AdminMissions />} />
            <Route path='rewards' element={<AdminRewards />} />
          </Route>

          <Route path='*' element={<Navigate to='/login' replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;

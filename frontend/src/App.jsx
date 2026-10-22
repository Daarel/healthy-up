import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';

// Public / Auth Pages
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPasswordOtp from './pages/ResetPasswordOtp';
import ResetPasswordBaru from './pages/ResetPasswordBaru';

// User Pages
import Dashboard from './pages/Dashboard';
import Tugas from './pages/Tugas';
import Hadiah from './pages/Hadiah';
import Profil from './pages/Profil';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminUsers from './pages/admin/AdminUsers';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import AdminMissions from './pages/admin/AdminMissions';
import AdminRewards from './pages/admin/AdminRewards';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Navigate to='/onboarding/1' replace />} />
        <Route
          path='/onboarding/1'
          element={
            <PublicRoute>
              <Onboarding />
            </PublicRoute>
          }
        />
        <Route
          path='/onboarding/2'
          element={<Navigate to='/onboarding/1' replace />}
        />
        <Route
          path='/onboarding/3'
          element={<Navigate to='/onboarding/1' replace />}
        />
        <Route
          path='/onboarding/4'
          element={<Navigate to='/onboarding/1' replace />}
        />
        <Route
          path='/onboarding/5'
          element={<Navigate to='/onboarding/1' replace />}
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
          element={
            <PublicRoute>
              <AdminLogin />
            </PublicRoute>
          }
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
    </Router>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import OnboardingStep1 from "./pages/OnboardingStep1";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPasswordOtp from "./pages/ResetPasswordOtp";
import ResetPasswordBaru from "./pages/ResetPasswordBaru";
import Dashboard from "./pages/Dashboard";
import Tugas from "./pages/Tugas";
import Hadiah from "./pages/Hadiah";
import Profil from "./pages/Profil";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/onboarding/1" replace />} />
        <Route path="/onboarding/1" element={<OnboardingStep1 />} />
        <Route path="/onboarding/2" element={<Navigate to="/onboarding/1" replace />} />
        <Route path="/onboarding/3" element={<Navigate to="/onboarding/1" replace />} />
        <Route path="/onboarding/4" element={<Navigate to="/onboarding/1" replace />} />
        <Route path="/onboarding/5" element={<Navigate to="/onboarding/1" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/lupa-password" element={<ForgotPassword />} />
        <Route path="/reset-password/otp" element={<ResetPasswordOtp />} />
        <Route path="/reset-password/baru" element={<ResetPasswordBaru />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/tugas"     element={<PrivateRoute><Tugas /></PrivateRoute>} />
        <Route path="/hadiah"    element={<PrivateRoute><Hadiah /></PrivateRoute>} />
        <Route path="/profil"    element={<PrivateRoute><Profil /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;

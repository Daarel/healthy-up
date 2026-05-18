import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import OnboardingStep1 from "./pages/OnboardingStep1";
import OnboardingStep2 from "./pages/OnboardingStep2";
import OnboardingStep3 from "./pages/OnboardingStep3";
import OnboardingStep4 from "./pages/OnboardingStep4";
import OnboardingStep5 from "./pages/OnboardingStep5";
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
        <Route path="/" element={<Navigate to="/onboarding/1" replace />} />
        <Route path="/onboarding/1" element={<OnboardingStep1 />} />
        <Route path="/onboarding/2" element={<OnboardingStep2 />} />
        <Route path="/onboarding/3" element={<OnboardingStep3 />} />
        <Route path="/onboarding/4" element={<OnboardingStep4 />} />
        <Route path="/onboarding/5" element={<OnboardingStep5 />} />
        <Route path="/login" element={<Login />} />
        <Route path="/lupa-password" element={<ForgotPassword />} />
        <Route path="/reset-password/otp" element={<ResetPasswordOtp />} />
        <Route path="/reset-password/baru" element={<ResetPasswordBaru />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tugas" element={<Tugas />} />
        <Route path="/hadiah" element={<Hadiah />} />
        <Route path="/profil" element={<Profil />} />
      </Routes>
    </Router>
  );
}

export default App;

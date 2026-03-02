import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import OfficerLogin from "./pages/OfficerLogin";
import OfficerDashboard from "./pages/OfficerDashboard";
import OfficerSlotsPage from "./pages/OfficerSlotsPage";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import SuperAdminLogin from "./pages/SuperAdminLogin";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOtp from "./pages/VerifyOtp";
import ResetPassword from "./pages/ResetPassword";
import VerifyCertificate from "./pages/VerifyCertificate";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/officer-login" element={<OfficerLogin />} />
<Route path="/officer" element={<OfficerDashboard />} />
<Route path="/officer/slots" element={<OfficerSlotsPage />} />
<Route path="/super-admin/login" element={<SuperAdminLogin />} />
<Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
<Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/verify-otp" element={<VerifyOtp />} />
<Route path="/reset-password" element={<ResetPassword />} />
<Route path="/verify" element={<VerifyCertificate />} />
      </Routes>
    </BrowserRouter>
  );
}

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import OfficerLogin from "./pages/OfficerLogin";
import OfficerDashboard from "./pages/OfficerDashboard";

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

      </Routes>
    </BrowserRouter>
  );
}

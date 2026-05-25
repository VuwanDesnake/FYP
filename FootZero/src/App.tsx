import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import OTPVerify from "./pages/OTPVerify";
import Dashboard from "./pages/Dashboard";
import CalculatorPage from "./pages/CalculatorPage";
import Transport from "./pages/Transport";
import Diet from "./pages/Diet";
import Energy from "./pages/Energy";
import Shopping from "./pages/Shopping";
import Results from "./pages/Results";
import Analysis from "./pages/Analysis";
import HistoryPage from "./pages/HistoryPage";
import Goals from "./pages/Goals";
import Tips from "./pages/Tips";
import Resources from "./pages/Resources";
import SettingsPage from "./pages/SettingsPage";
import Help from "./pages/Help";
import Legal from "./pages/Legal";
import Privacy from "./pages/Privacy";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";
import UsersManagement from "./pages/admin/UsersManagement";
import AdminResources from "./pages/admin/AdminResources";
import Achievements from "./pages/Achievements";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AuthCallback from "./pages/AuthCallback";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/verify" element={<OTPVerify />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/legal" element={<Legal />} />
            <Route path="/privacy" element={<Privacy />} />

            {/* Google OAuth callback — must be outside protected routes */}
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Protected user routes */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/calculator" element={<CalculatorPage />} />
              <Route path="/transport" element={<Transport />} />
              <Route path="/diet" element={<Diet />} />
              <Route path="/energy" element={<Energy />} />
              <Route path="/shopping" element={<Shopping />} />
              <Route path="/results" element={<Results />} />
              <Route path="/analysis" element={<Analysis />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/tips" element={<Tips />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/help" element={<Help />} />
            </Route>

            {/* Protected admin routes */}
            <Route element={<ProtectedRoute requiredRole="admin"><Layout /></ProtectedRoute>}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/users" element={<UsersManagement />} />
              <Route path="/admin/resources" element={<AdminResources />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

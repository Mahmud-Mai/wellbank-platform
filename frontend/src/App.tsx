import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth-context";
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import PatientLayout from "./components/layout/PatientLayout";
import Dashboard from "./pages/patient/Dashboard";
import Wallet from "./pages/patient/Wallet";
import Consultations from "./pages/patient/Consultations";
import ConsultationDetail from "./pages/patient/ConsultationDetail";
import Notifications from "./pages/patient/Notifications";
import WellPoints from "./pages/patient/WellPoints";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<PatientLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/consultations" element={<Consultations />} />
              <Route path="/consultations/:id" element={<ConsultationDetail />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/wellpoints" element={<WellPoints />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

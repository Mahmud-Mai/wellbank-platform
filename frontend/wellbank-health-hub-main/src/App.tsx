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
import Profile from "./pages/patient/Profile";
import DoctorSearch from "./pages/patient/DoctorSearch";
import DoctorProfile from "./pages/patient/DoctorProfile";
import PatientOnboarding from "./pages/onboarding/PatientOnboarding";
import DoctorOnboarding from "./pages/onboarding/DoctorOnboarding";
import NewOrganization from "./pages/organization/NewOrganization";
import AddRole from "./pages/AddRole";
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
            <Route path="/onboarding/patient" element={<PatientOnboarding />} />
            <Route path="/onboarding/doctor" element={<DoctorOnboarding />} />
            <Route path="/organization/new" element={<NewOrganization />} />
            <Route path="/add-role" element={<AddRole />} />
            <Route element={<PatientLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/consultations" element={<Consultations />} />
              <Route path="/consultations/:id" element={<ConsultationDetail />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/wellpoints" element={<WellPoints />} />
              <Route path="/doctors" element={<DoctorSearch />} />
              <Route path="/doctors/:id" element={<DoctorProfile />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

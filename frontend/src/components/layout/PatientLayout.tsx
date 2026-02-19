import { Outlet, Link, useLocation, Navigate } from "react-router-dom";
import {
  Home,
  Wallet,
  Stethoscope,
  FlaskConical,
  Pill,
  Shield,
  Star,
  Settings,
  LogOut,
  Heart,
  Bell,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import BottomNav from "./BottomNav";
import wellbankLogo from "@/assets/wellbank-logo.jpeg";

const sidebarLinks = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Stethoscope, label: "Consultations", href: "/consultations" },
  { icon: FlaskConical, label: "Lab Tests", href: "/labs" },
  { icon: Pill, label: "Pharmacy", href: "/pharmacy" },
  { icon: Wallet, label: "Wallet", href: "/wallet" },
  { icon: Shield, label: "Insurance", href: "/insurance" },
  { icon: Star, label: "WellPoints", href: "/wellpoints" },
  { icon: Bell, label: "Notifications", href: "/notifications" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

const PatientLayout = () => {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const { pathname } = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-sidebar lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
          <img src={wellbankLogo} alt="WellBank" className="h-8 w-8 rounded-lg object-cover" />
          <span className="text-lg font-bold text-foreground">
            Well<span className="text-primary">Bank</span>
          </span>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-primary font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <div className="mb-3 flex items-center gap-3 px-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 truncate">
              <p className="truncate text-sm font-medium text-foreground">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <BottomNav />
    </div>
  );
};

export default PatientLayout;

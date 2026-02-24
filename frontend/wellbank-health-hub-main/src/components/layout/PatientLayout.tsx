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
  Bell,
  User,
  ChevronDown,
  Plus,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import BottomNav from "./BottomNav";
import wellbankLogo from "@/assets/wellbank-logo.jpeg";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const sidebarLinks = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: User, label: "Profile", href: "/profile" },
  { icon: Stethoscope, label: "Consultations", href: "/consultations" },
  { icon: FlaskConical, label: "Lab Tests", href: "/labs" },
  { icon: Pill, label: "Pharmacy", href: "/pharmacy" },
  { icon: Wallet, label: "Wallet", href: "/wallet" },
  { icon: Shield, label: "Insurance", href: "/insurance" },
  { icon: Star, label: "WellPoints", href: "/wellpoints" },
  { icon: Bell, label: "Notifications", href: "/notifications" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

const roleLabels: Record<string, string> = {
  patient: "Patient",
  doctor: "Doctor",
  provider_admin: "Provider Admin",
  wellbank_admin: "Admin",
};

const PatientLayout = () => {
  const { isAuthenticated, isLoading, user, logout, switchRole } = useAuth();
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
          {/* Role Switcher */}
          {user && (user.roles.length > 1 || user.roles.length < 3) && (
            <DropdownMenu>
              <DropdownMenuTrigger className="mb-3 flex w-full items-center justify-between rounded-lg bg-sidebar-accent px-3 py-2 text-sm">
                <span className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{roleLabels[user.activeRole]}</Badge>
                  <span className="text-xs text-muted-foreground">Active Role</span>
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.roles.map((role) => (
                  <DropdownMenuItem
                    key={role}
                    onClick={() => switchRole(role)}
                    className={role === user.activeRole ? "bg-primary/10 text-primary" : ""}
                  >
                    {roleLabels[role]}
                    {role === user.activeRole && <span className="ml-auto text-xs">✓</span>}
                  </DropdownMenuItem>
                ))}
                {user.roles.length < 3 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/add-role" className="flex items-center gap-2">
                        <Plus className="h-3.5 w-3.5" /> Add New Role
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

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

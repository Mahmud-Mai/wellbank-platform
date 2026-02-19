import { Link, useLocation } from "react-router-dom";
import { Home, Wallet, Search, Bell, User } from "lucide-react";

const navItems = [
  { icon: Home, label: "Home", href: "/dashboard" },
  { icon: Search, label: "Discover", href: "/doctors" },
  { icon: Wallet, label: "Wallet", href: "/wallet" },
  { icon: Bell, label: "Alerts", href: "/notifications" },
  { icon: User, label: "Profile", href: "/profile" },
];

const BottomNav = () => {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm lg:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;

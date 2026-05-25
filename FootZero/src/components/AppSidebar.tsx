import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Calculator, TrendingUp, History, Target, Lightbulb,
  BookOpen, Settings, HelpCircle, Users, BarChart3, Sliders, Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/Logo";

const userLinks = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/calculator", icon: Calculator, label: "Calculator" },
  { to: "/analysis", icon: TrendingUp, label: "Analysis" },
  { to: "/history", icon: History, label: "History" },
  { to: "/goals", icon: Target, label: "Goals" },
  { to: "/tips", icon: Lightbulb, label: "Tips" },
  { to: "/resources", icon: BookOpen, label: "Resources" },
  { to: "/achievements", icon: Trophy, label: "Achievements" },
  { to: "/settings", icon: Settings, label: "Settings" },
  { to: "/help", icon: HelpCircle, label: "Help" },
];

const adminLinks = [
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/reports", icon: BarChart3, label: "Reports" },
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/resources", icon: BookOpen, label: "Resources" },
  { to: "/admin/settings", icon: Sliders, label: "Settings" },
];

export function AppSidebar({ isAdmin }: { isAdmin: boolean }) {
  const location = useLocation();
  const { profile } = useAuth();
  const links = isAdmin ? adminLinks : userLinks;

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "FZ";

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar flex flex-col border-r border-sidebar-border z-40">
      {/* Logo */}
      <div className="h-14 flex items-center px-6 border-b border-sidebar-border">
        <Logo size="md" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-auto">
        {isAdmin && (
          <p className="text-muted-foreground text-[11px] uppercase tracking-widest px-3 mb-3 font-semibold">Admin Panel</p>
        )}
        {links.map((link) => {
          const active = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
                active
                  ? "bg-primary/15 text-primary font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <link.icon className={cn("h-[18px] w-[18px]", active && "text-primary")} />
              <span>{link.label}</span>
              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </nav>

      {/* User info + role switch */}
      <div className="p-4 border-t border-sidebar-border">
        <Link to="/settings" className="flex items-center gap-3 p-2 rounded-xl hover:bg-sidebar-accent transition-colors mb-2">
          <div className="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
            {initials}
          </div>
          <div className="overflow-hidden">
            <p className="text-foreground text-sm font-medium truncate">{profile?.full_name || "FootZero User"}</p>
            <p className="text-muted-foreground text-xs truncate">{profile?.email || ""}</p>
          </div>
        </Link>

        {profile?.role === "admin" && !isAdmin && (
          <Link to="/admin/dashboard" className="block text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1">
            Admin Panel →
          </Link>
        )}
        {isAdmin && (
          <Link to="/dashboard" className="block text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1">
            ← Switch to User View
          </Link>
        )}
      </div>
    </aside>
  );
}

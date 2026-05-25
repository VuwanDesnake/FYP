import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { NotificationDropdown } from "./NotificationDropdown";
import { ArrowLeft, User } from "lucide-react";
import { motion } from "framer-motion";

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = location.pathname.startsWith("/admin");

  const getPageTitle = () => {
    const path = location.pathname;
    const titles: Record<string, string> = {
      "/dashboard": "Dashboard",
      "/calculator": "Calculator",
      "/transport": "Transport",
      "/diet": "Diet",
      "/energy": "Energy",
      "/shopping": "Shopping",
      "/results": "Results",
      "/analysis": "Analysis",
      "/history": "History",
      "/goals": "Goals & Actions",
      "/tips": "Eco Tips",
      "/resources": "Resources",
      "/settings": "Settings",
      "/help": "Help Center",
      "/admin/dashboard": "Admin Dashboard",
      "/admin/reports": "Reports",
      "/admin/settings": "Platform Settings",
      "/admin/users": "User Management",
    };
    return titles[path] || "FootZero";
  };

  const showBack = location.pathname !== "/dashboard" && location.pathname !== "/admin/dashboard";

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar isAdmin={isAdmin} />
      <div className="flex-1 flex flex-col ml-64">
        <header className="h-14 bg-primary flex items-center justify-between px-6 sticky top-0 z-30 shadow-lg shadow-primary/10">
          <div className="flex items-center gap-3">
            {showBack && (
              <button onClick={() => navigate(-1)} className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <h1 className="text-primary-foreground font-semibold text-lg">{getPageTitle()}</h1>
          </div>
          <div className="flex items-center gap-3">
            <NotificationDropdown />
            <button
              onClick={() => navigate("/settings")}
              className="h-8 w-8 rounded-xl bg-primary-foreground/15 flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/25 transition-colors"
              title="Profile & Settings"
            >
              <User className="h-4 w-4" />
            </button>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

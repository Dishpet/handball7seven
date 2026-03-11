import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, Palette, FileText, Settings, LogOut, MountainSnow, ShoppingCart, Users, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { name: "Products", path: "/admin/products", icon: Package },
  { name: "Orders", path: "/admin/orders", icon: ShoppingCart },
  { name: "Designs", path: "/admin/designs", icon: Palette },
  { name: "Content", path: "/admin/content", icon: FileText },
  { name: "Users", path: "/admin/users", icon: Users },
  { name: "Settings", path: "/admin/settings", icon: Settings },
];

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const { signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col md:flex-row font-body">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 h-screen sticky top-0 bg-black border-r border-white/10 shrink-0 flex-col">
        {/* Logo Area */}
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <MountainSnow className="w-8 h-8 text-primary" />
          <h1 className="font-display uppercase tracking-widest font-black text-xl text-primary">H7 Admin</h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== "/admin");
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                  isActive 
                    ? "bg-primary text-black font-bold" 
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="font-display uppercase tracking-widest text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Area */}
        <div className="p-4 border-t border-white/10 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="font-display uppercase tracking-widest text-sm">Back to Store</span>
          </Link>
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-4 py-3 text-destructive/70 hover:text-destructive hover:bg-destructive/5 transition-colors w-full"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="font-display uppercase tracking-widest text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-40 bg-black border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <MountainSnow className="w-6 h-6 text-primary" />
            <span className="font-display uppercase tracking-widest font-black text-sm text-primary">H7 Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="text-white/50 hover:text-white p-2 min-w-[44px] min-h-[44px] flex items-center justify-center">
              <LogOut className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-white/10 bg-black/95 backdrop-blur-md">
            <nav className="p-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== "/admin");
                
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 min-h-[48px] transition-colors ${
                      isActive 
                        ? "bg-primary text-black font-bold" 
                        : "text-white/70 active:bg-white/10"
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="font-display uppercase tracking-widest text-sm">{item.name}</span>
                  </Link>
                );
              })}
              <button
                onClick={() => { signOut(); setMobileMenuOpen(false); }}
                className="flex items-center gap-3 px-4 py-3 min-h-[48px] text-destructive/70 active:bg-destructive/10 transition-colors w-full border-t border-white/10 mt-2 pt-3"
              >
                <LogOut className="w-5 h-5 shrink-0" />
                <span className="font-display uppercase tracking-widest text-sm">Sign Out</span>
              </button>
            </nav>
          </div>
        )}

        {/* Scrollable Tab Bar */}
        <nav className="flex overflow-x-auto border-t border-white/5 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== "/admin");
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-4 py-2.5 shrink-0 min-w-[64px] ${
                  isActive 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-white/50"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="font-display uppercase tracking-wider text-[9px] leading-none">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 bg-[#0a0a0a]">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

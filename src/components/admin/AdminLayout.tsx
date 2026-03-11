import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, Palette, FileText, Settings, LogOut, MountainSnow, ShoppingCart } from "lucide-react";
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
  { name: "Settings", path: "/admin/settings", icon: Settings },
];

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col md:flex-row font-body">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-black border-b md:border-b-0 md:border-r border-white/10 shrink-0 flex flex-col">
        {/* Logo Area */}
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <MountainSnow className="w-8 h-8 text-primary" />
          <h1 className="font-display uppercase tracking-widest font-black text-xl text-primary">H7 Admin</h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto hidden md:block">
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

        {/* Mobile Navigation */}
        <nav className="md:hidden flex overflow-x-auto p-4 gap-2 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== "/admin");
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-4 py-2 shrink-0 ${
                  isActive 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-white/60 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="font-display uppercase tracking-wider text-[10px]">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Area */}
        <div className="p-4 border-t border-white/10 hidden md:block">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="font-display uppercase tracking-widest text-sm">Exit Admin</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 bg-[#0a0a0a]">
        {/* Header - Mobile Only */}
        <div className="md:hidden p-4 border-b border-white/10 flex justify-between items-center bg-black">
          <Link to="/" className="text-white/50 hover:text-white flex items-center gap-2 text-sm font-display uppercase tracking-widest">
            <LogOut className="w-4 h-4" /> Exit
          </Link>
        </div>
        
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

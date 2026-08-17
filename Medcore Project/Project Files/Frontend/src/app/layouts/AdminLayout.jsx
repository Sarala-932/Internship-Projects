import { Link, Outlet, useLocation, useNavigate } from "react-router";
import {
  Activity, LogOut, LayoutDashboard, Building2,
  Users, Calendar, FileText, Pill, Stethoscope, ListTree, ChevronRight, Shield, Sun, Moon, User as UserIcon, Settings, Bed
} from "lucide-react";
import apiClient from "../../shared/service/apiClient";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/state/authSlice";
import { useDarkMode } from "../../shared/hooks/useDarkMode";
import { useState, useRef, useEffect } from "react";
import NotificationBell from "../../features/notification/components/NotificationBell";

const navLinks = [
  { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/departments", label: "Departments", icon: ListTree },
  { path: "/admin/staff", label: "Staff", icon: Users },
  { path: "/admin/appointments", label: "Appointments", icon: Calendar },
  { path: "/admin/patients", label: "Patients", icon: Activity },
  { path: "/admin/pharmacy", label: "Pharmacy", icon: Pill },
  { path: "/admin/lab", label: "Laboratory", icon: Stethoscope },
  { path: "/admin/ipd", label: "Bed Management", icon: Bed },
  { path: "/admin/billing", label: "Billing", icon: FileText },
];

export default function AdminLayout() {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try { await apiClient.post("/auth/logout"); } catch(e) { console.error("Logout API failed", e); }
    dispatch(logout());
    navigate("/login?type=staff");
  };

  const currentPage = navLinks.find(l => location.pathname === l.path)?.label || "Admin";

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-colors">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-700">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-hospital-blue rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-slate-900 dark:text-white font-bold tracking-tight text-sm">Med<span className="text-hospital-blue dark:text-blue-400">Core</span></span>
              <div className="flex items-center gap-1 mt-0.5">
                <Shield className="w-3 h-3 text-indigo-500" />
                <span className="text-indigo-500 text-xs font-medium">Admin</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900/30 text-hospital-blue dark:text-blue-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {link.label}
                {isActive && <ChevronRight className="w-4 h-4 ml-auto text-hospital-blue dark:text-blue-400" />}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 transition-colors">
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white capitalize">{currentPage}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Hospital Administration</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <NotificationBell />
            
            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-500 text-white font-bold shadow-sm hover:ring-2 hover:ring-indigo-300 dark:hover:ring-indigo-700 transition-all cursor-pointer"
              >
                {(user?.firstName || "A")[0]}{(user?.lastName || "A")[0]}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mt-0.5 capitalize">
                      {user?.role?.replace('_', ' ')}
                    </p>
                  </div>
                  
                  <div className="py-2">
                    <Link 
                      to="/admin/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      My Profile
                    </Link>
                    <Link 
                      to="/admin/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400">
                        <Settings className="w-4 h-4" />
                      </div>
                      Account Settings
                    </Link>
                  </div>
                  
                  <div className="px-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

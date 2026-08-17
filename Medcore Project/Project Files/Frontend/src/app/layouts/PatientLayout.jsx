import { Link, Outlet, useLocation, useNavigate } from "react-router";
import {
  Activity, LogOut, LayoutDashboard, Calendar, ClipboardList,
  Sun, Moon, ChevronRight, User as UserIcon, Settings, Pill, FileText
} from "lucide-react";
import apiClient from "../../shared/service/apiClient";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/state/authSlice";
import { useDarkMode } from "../../shared/hooks/useDarkMode";
import { useState, useRef, useEffect } from "react";
import { usePatient } from "../../features/patient/hook/usePatient";
import NotificationBell from "../../features/notification/components/NotificationBell";

const navLinks = [
  { path: "/patient/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/patient/appointments", label: "My Appointments", icon: Calendar },
  { path: "/patient/prescriptions", label: "Prescriptions", icon: Pill },
  { path: "/patient/records", label: "Medical Records", icon: ClipboardList },
  { path: "/patient/bills", label: "My Bills", icon: FileText },
];

export default function PatientLayout() {
  const { user } = useSelector((state) => state.auth);
  const { activeProfile } = useSelector((state) => state.patient);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const { fetchProfile } = usePatient();

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

  // Fetch Patient Profile on mount
  useEffect(() => {
    if (user) {
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleLogout = async () => {
    try { await apiClient.post("/auth/logout"); } catch(e) { console.error("Logout API failed", e); }
    dispatch(logout());
    navigate("/login");
  };

  const currentPage = navLinks.find(l => location.pathname === l.path)?.label || "Patient Portal";

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
          <Link to="/patient/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-slate-900 dark:text-white font-bold tracking-tight text-sm">Med<span className="text-blue-600 dark:text-blue-400">Core</span></span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-blue-600 dark:text-blue-400 text-xs font-medium">Patient Portal</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {link.label}
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
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
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">{currentPage}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Your Health Overview</p>
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
                className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-700 dark:bg-slate-800 text-white font-semibold shadow-sm hover:ring-2 hover:ring-slate-300 dark:hover:ring-slate-600 transition-all cursor-pointer"
              >
                {activeProfile?.firstName?.[0] || user?.firstName?.[0] || "P"}
                {activeProfile?.lastName?.[0] || user?.lastName?.[0] || ""}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {activeProfile?.firstName || user?.firstName} {activeProfile?.lastName || user?.lastName}
                    </p>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                      {user?.email}
                    </p>
                  </div>
                  
                  <div className="py-2">
                    <Link 
                      to="/patient/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      My Profile
                    </Link>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400">
                        <LogOut className="w-4 h-4" />
                      </div>
                      Sign Out
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

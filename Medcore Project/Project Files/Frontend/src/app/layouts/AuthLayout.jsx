import { Outlet, Link, useSearchParams, useLocation } from "react-router";
import { Activity, ArrowLeft, Stethoscope, User, Sun, Moon, UserPlus } from "lucide-react";
import { useDarkMode } from "../../shared/hooks/useDarkMode";

export default function AuthLayout() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const type = searchParams.get("type") || "patient";
  const isStaff = type === "staff";
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className="flex flex-col min-h-screen justify-start items-center bg-slate-50 dark:bg-slate-900 relative transition-colors duration-300 pt-20 pb-12 px-4">
      {/* Top Navigation for Auth */}
      <div className="w-full p-6 flex justify-between items-center absolute top-0 left-0">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-hospital-blue rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Med<span className="text-hospital-blue dark:text-blue-400">Core</span></span>
        </Link>
        
        <button 
          onClick={toggleDarkMode} 
          className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors absolute right-6 top-6"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <div className="w-full max-w-md p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 transition-colors duration-300 relative z-10">
        {!['/verify-otp', '/forgot-password', '/reset-password'].includes(location.pathname) && (
          <div className="mb-5 text-center flex flex-col items-center">
            <div className={`w-12 h-12 rounded-full mb-3 flex items-center justify-center ${isStaff ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'}`}>
              {location.pathname === '/register' ? <UserPlus className="w-6 h-6" /> : (isStaff ? <Stethoscope className="w-6 h-6" /> : <User className="w-6 h-6" />)}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {location.pathname === '/register' ? "Create Account" : (isStaff ? "Staff Portal" : "Patient Portal")}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
              {location.pathname === '/register' 
                ? "Join MedCore to book appointments & view records" 
                : (isStaff ? "Sign in to manage hospital operations" : "Sign in to access your medical records")}
            </p>
          </div>
        )}
        <Outlet />
      </div>
    </div>
  );
}

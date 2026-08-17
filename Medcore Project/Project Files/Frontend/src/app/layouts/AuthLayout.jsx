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
    <div className="flex flex-col min-h-screen justify-center items-center bg-linear-to-br from-blue-50 via-indigo-50/50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative transition-colors duration-500 py-12 px-4 overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 dark:bg-blue-600/5 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/10 dark:bg-indigo-600/5 blur-[80px] pointer-events-none" />

      {/* Top Navigation for Auth */}
      <div className="w-full p-6 sm:px-10 flex justify-between items-center absolute top-0 left-0 z-20">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 bg-hospital-blue rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Med<span className="text-hospital-blue dark:text-blue-400">Core</span></span>
        </Link>
        
        <div className="flex items-center gap-3 sm:gap-5">
            <button 
              onClick={toggleDarkMode} 
              className="p-2.5 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <Link
                to="/login?type=staff"
                className="hidden sm:block text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-hospital-blue dark:hover:text-blue-400 transition-colors"
            >
                Staff Login
            </Link>
            <Link
                to="/login?type=patient"
                className="text-sm font-medium bg-hospital-blue text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-md shadow-blue-900/10 hover:shadow-lg hover:shadow-blue-900/20"
            >
                Patient Portal
            </Link>
        </div>
      </div>

      <div className="w-full max-w-110 p-8 sm:p-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border border-white/60 dark:border-slate-700/50 transition-all duration-300 relative z-10">
        {!['/verify-otp', '/forgot-password', '/reset-password'].includes(location.pathname) && (
          <div className="mb-8 text-center flex flex-col items-center">
            <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center shadow-lg ${isStaff ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 shadow-indigo-900/10' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 shadow-blue-900/10'}`}>
              {location.pathname === '/register' ? <UserPlus className="w-8 h-8" /> : (isStaff ? <Stethoscope className="w-8 h-8" /> : <User className="w-8 h-8" />)}
            </div>
            <h2 className="text-[28px] font-bold text-slate-900 dark:text-white tracking-tight mb-2">
              {location.pathname === '/register' ? "Create Account" : (isStaff ? "Staff Portal" : "Patient Portal")}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-[15px]">
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

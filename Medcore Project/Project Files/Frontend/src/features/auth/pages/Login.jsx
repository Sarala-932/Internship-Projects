import { useState } from "react";
import { User, Lock, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import toast from "react-hot-toast";
import { useAuth } from "../hook/useAuth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "patient";
  const isStaff = type === "staff";
  
  const { handleLogin, loading } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    await handleLogin({ email, password, type });
  };

  return (
    <div className="w-full">
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 block uppercase tracking-wide">Email Address</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-hospital-blue">
              <User className="h-5 w-5 text-slate-400 group-focus-within:text-hospital-blue transition-colors" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-11 pr-4 py-3 border border-slate-200 dark:border-slate-700/60 rounded-xl focus:ring-4 focus:ring-hospital-blue/10 focus:border-hospital-blue bg-slate-50/50 hover:bg-slate-50 focus:bg-white dark:bg-slate-800/40 dark:hover:bg-slate-800/60 dark:focus:bg-slate-800 dark:text-white text-sm outline-none transition-all duration-300 shadow-sm"
              placeholder="admin@medcore.com"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 block uppercase tracking-wide">Password</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-hospital-blue">
              <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-hospital-blue transition-colors" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-11 pr-11 py-3 border border-slate-200 dark:border-slate-700/60 rounded-xl focus:ring-4 focus:ring-hospital-blue/10 focus:border-hospital-blue bg-slate-50/50 hover:bg-slate-50 focus:bg-white dark:bg-slate-800/40 dark:hover:bg-slate-800/60 dark:focus:bg-slate-800 dark:text-white text-sm outline-none transition-all duration-300 shadow-sm"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center">
            <input id="remember-me" type="checkbox" className="h-4 w-4 text-hospital-blue focus:ring-hospital-blue border-slate-300 rounded cursor-pointer" />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 dark:text-slate-400 cursor-pointer select-none">
              Remember me
            </label>
          </div>
          <div className="text-sm">
            <Link to="/forgot-password" className="font-semibold text-hospital-blue hover:text-blue-700 dark:hover:text-blue-400 transition-colors">
              Forgot password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl shadow-[0_8px_16px_-6px_rgba(13,92,82,0.4)] dark:shadow-none text-[15px] font-bold text-white bg-hospital-blue hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-hospital-blue/30 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="w-4 h-4 ml-1" />
            </>
          )}
        </button>

        {!isStaff && (
          <div className="text-center mt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Don't have an account?{" "}
              <Link to={`/register?type=${type}`} className="font-semibold text-hospital-blue hover:text-blue-700 dark:hover:text-blue-400 transition-colors">
                Register here
              </Link>
            </p>
          </div>
        )}

        <div className="mt-8 p-4 bg-slate-50/80 dark:bg-slate-800/30 rounded-xl border border-slate-200/60 dark:border-slate-700/50 text-xs text-slate-500 dark:text-slate-400">
          <p className="font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide text-[10px]">Demo Credentials</p>
          <div className={`grid ${isStaff ? 'grid-cols-2' : 'grid-cols-1'} gap-3 leading-relaxed`}>
            {isStaff ? (
              <>
                <div>
                  <span className="block font-medium text-slate-800 dark:text-slate-200">Admin</span>
                  <span className="opacity-80">admin@cityhospital.com<br/>Admin@1234</span>
                </div>
                <div>
                  <span className="block font-medium text-slate-800 dark:text-slate-200">Doctor</span>
                  <span className="opacity-80">doctor1@cityhospital.com<br/>Doctor@123</span>
                </div>
              </>
            ) : (
              <div>
                <span className="block font-medium text-slate-800 dark:text-slate-200">Patient</span>
                <span className="opacity-80">aarav.test@example.com<br/>Patient@123</span>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

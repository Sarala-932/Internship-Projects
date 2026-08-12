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
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-hospital-blue focus:border-hospital-blue dark:bg-slate-800 dark:text-white text-sm outline-none transition-all"
              placeholder="admin@medcore.com"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-hospital-blue focus:border-hospital-blue dark:bg-slate-800 dark:text-white text-sm outline-none transition-all"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input id="remember-me" type="checkbox" className="h-4 w-4 text-hospital-blue focus:ring-hospital-blue border-slate-300 rounded" />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 dark:text-slate-400">
              Remember me
            </label>
          </div>
          <div className="text-sm">
            <Link to="/forgot-password" className="font-medium text-hospital-blue hover:text-blue-600">
              Forgot password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-hospital-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hospital-blue dark:focus:ring-offset-slate-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {!isStaff && (
          <div className="text-center mt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Don't have an account?{" "}
              <Link to={`/register?type=${type}`} className="font-medium text-hospital-blue hover:text-blue-600 dark:hover:text-blue-400">
                Sign up
              </Link>
            </p>
          </div>
        )}

        <div className="mt-6 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
          <p className="font-semibold text-slate-600 dark:text-slate-300 mb-2">Demo Login Credentials:</p>
          <div className="grid grid-cols-2 gap-2 leading-relaxed">
            <div>
              <span className="block font-medium text-slate-700 dark:text-slate-200">Admin:</span>
              admin@cityhospital.com<br/>Admin@1234
            </div>
            <div>
              <span className="block font-medium text-slate-700 dark:text-slate-200">Doctor:</span>
              doctor1@cityhospital.com<br/>Doctor@123
            </div>
            <div className="col-span-2">
              <span className="block font-medium text-slate-700 dark:text-slate-200">Patient:</span>
              aarav.test@example.com<br/>Patient@123
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

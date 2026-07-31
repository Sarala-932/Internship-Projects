import { useState } from "react";
import { Link } from "react-router";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { authService } from "../service/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email) { toast.error("Please enter your email"); return; }
    try {
      setLoading(true);
      await authService.forgotPassword(email);
      setSent(true);
      toast.success("Reset code sent! Check your email.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="w-full text-center space-y-5">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Check your inbox!</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            We've sent a 6-digit reset code to<br />
            <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span>
          </p>
        </div>
        <Link
          to={`/reset-password?email=${encodeURIComponent(email)}`}
          className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-hospital-blue hover:bg-blue-700 transition-all"
        >
          Enter Reset Code <ArrowRight className="w-4 h-4" />
        </Link>
        <p className="text-xs text-slate-400">Didn't get it? Check spam folder or{" "}
          <button onClick={() => setSent(false)} className="text-hospital-blue hover:underline">try again</button>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5">
      <div className="text-center mb-2">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Enter your registered email and we'll send you a reset code.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rahul@example.com"
              required
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-hospital-blue focus:border-hospital-blue dark:bg-slate-800 dark:text-white text-sm outline-none transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-hospital-blue hover:bg-blue-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <>Send Reset Code <ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>

      <div className="text-center mt-4">
        <Link to="/login" className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors">
          &larr; Back to Login
        </Link>
      </div>
    </div>
  );
}

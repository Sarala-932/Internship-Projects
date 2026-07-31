import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router";
import { Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router";
import { authService } from "../service/authService";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const navigate = useNavigate();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    if (element.nextSibling && element.value) element.nextSibling.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];
      if (!otp[index] && e.target.previousSibling) e.target.previousSibling.focus();
      newOtp[index] = "";
      setOtp(newOtp);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) { toast.error("Enter a valid 6-digit code"); return; }
    if (!newPassword) { toast.error("Enter new password"); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
    if (newPassword.length < 8) { toast.error("Password must be at least 8 characters"); return; }

    try {
      setLoading(true);
      await authService.resetPassword(email, code, newPassword);
      toast.success("Password reset successful! Please login.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    if (!email) return;
    try {
      await authService.forgotPassword(email);
      toast.success("New reset code sent!");
      setTimer(60);
      setOtp(["", "", "", "", "", ""]);
    } catch {
      toast.error("Failed to resend code");
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <ShieldCheck className="w-7 h-7 text-hospital-blue" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Reset Password</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Enter the code sent to <span className="font-semibold text-slate-700 dark:text-slate-300">{email || "your email"}</span>
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* OTP Boxes */}
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Reset Code</label>
          <div className="flex justify-between gap-2">
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={data}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onFocus={(e) => e.target.select()}
                className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-hospital-blue focus:border-hospital-blue outline-none transition-all"
              />
            ))}
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">New Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 8 characters"
              required
              className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-hospital-blue dark:bg-slate-800 dark:text-white text-sm outline-none transition-all"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Confirm Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              required
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-hospital-blue dark:bg-slate-800 dark:text-white text-sm outline-none transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || otp.join("").length !== 6}
          className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-hospital-blue hover:bg-blue-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <>Reset Password <ArrowRight className="w-4 h-4" /></>}
        </button>

        <div className="text-center">
          <button
            type="button"
            disabled={timer > 0}
            onClick={onResend}
            className={`text-sm font-medium transition-colors ${timer > 0 ? "text-slate-400 cursor-not-allowed" : "text-hospital-blue hover:underline"}`}
          >
            {timer > 0 ? `Resend code in ${timer}s` : "Resend code"}
          </button>
        </div>
      </form>

      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
        <Link to="/login" className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 transition-colors">
          &larr; Back to Login
        </Link>
      </div>
    </div>
  );
}

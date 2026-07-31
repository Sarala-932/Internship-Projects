import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router";
import { KeyRound, ShieldCheck, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../hook/useAuth";

export default function VerifyOtp() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const { handleVerifyOtp, handleResendOtp, loading } = useAuth();

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

    // Focus next input
    if (element.nextSibling && element.value) {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];
      if (!otp[index] && e.target.previousSibling) {
        // Move to previous input if current is empty
        e.target.previousSibling.focus();
      }
      newOtp[index] = "";
      setOtp(newOtp);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }
    if (!email) {
      toast.error("Email not found. Please try registering again.");
      return;
    }
    await handleVerifyOtp(email, otpValue);
  };

  const onResend = async () => {
    if (!email) {
      toast.error("Email not found.");
      return;
    }
    const success = await handleResendOtp(email);
    if (success) {
      setTimer(60);
      setOtp(["", "", "", "", "", ""]); // Reset inputs
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-8 h-8 text-hospital-blue" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Verify Your Email
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          We've sent a 6-digit verification code to
          <br />
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {email || "your email"}
          </span>
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="flex justify-between gap-2 sm:gap-3">
          {otp.map((data, index) => (
            <input
              key={index}
              type="text"
              name="otp"
              maxLength={1}
              value={data}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onFocus={(e) => e.target.select()}
              className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg sm:text-xl font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-hospital-blue focus:border-hospital-blue outline-none transition-all"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || otp.join("").length !== 6}
          className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-600/20 text-sm font-semibold text-white bg-hospital-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hospital-blue transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              Verify Code
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="text-center mt-6">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            Didn't receive the code?
          </p>
          <button
            type="button"
            disabled={timer > 0 || loading}
            onClick={onResend}
            className={`text-sm font-semibold transition-colors ${
              timer > 0
                ? "text-slate-400 cursor-not-allowed"
                : "text-hospital-blue hover:text-blue-700 dark:hover:text-blue-400"
            }`}
          >
            {timer > 0 ? `Resend code in ${timer}s` : "Click to resend"}
          </button>
        </div>
      </form>
      
      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
        <Link to="/login" className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors">
          &larr; Back to Login
        </Link>
      </div>
    </div>
  );
}

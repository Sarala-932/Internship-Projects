import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { User, Lock, Mail, UserPlus, Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../hook/useAuth";
import apiClient from "../../../shared/service/apiClient";
import { Building2 } from "lucide-react";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState("");
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "patient";

  const { handleRegister, loading } = useAuth();

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await apiClient.get("/hospitals/public?status=active");
        setHospitals(res.data.hospitals || []);
      } catch (err) {
        console.error("Failed to fetch hospitals", err);
      }
    };
    fetchHospitals();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    if (type === "patient" && !selectedHospital) {
      toast.error("Please select a hospital");
      return;
    }
    
    if (type === "patient" && !dob) {
      toast.error("Please enter your date of birth");
      return;
    }
    
    // Add default role as patient if registering from outside
    const userData = {
      firstName,
      lastName,
      email,
      password,
      role: "patient",
      hospitalId: selectedHospital,
      dob: dob,
      bloodGroup: bloodGroup || "unknown"
    };

    await handleRegister(userData);
  };

  return (
    <div className="w-full">
      <form onSubmit={onSubmit} className="space-y-5">
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 block uppercase tracking-wide">First Name</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-hospital-blue">
                <User className="h-5 w-5 text-slate-400 group-focus-within:text-hospital-blue transition-colors" />
              </div>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="block w-full pl-11 pr-4 py-3 border border-slate-200 dark:border-slate-700/60 rounded-xl focus:ring-4 focus:ring-hospital-blue/10 focus:border-hospital-blue bg-slate-50/50 hover:bg-slate-50 focus:bg-white dark:bg-slate-800/40 dark:hover:bg-slate-800/60 dark:focus:bg-slate-800 dark:text-white text-sm outline-none transition-all duration-300 shadow-sm"
                placeholder="Rahul"
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 block uppercase tracking-wide">Last Name</label>
            <div className="relative group">
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700/60 rounded-xl focus:ring-4 focus:ring-hospital-blue/10 focus:border-hospital-blue bg-slate-50/50 hover:bg-slate-50 focus:bg-white dark:bg-slate-800/40 dark:hover:bg-slate-800/60 dark:focus:bg-slate-800 dark:text-white text-sm outline-none transition-all duration-300 shadow-sm"
                placeholder="Sharma"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 block uppercase tracking-wide">Email Address</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-hospital-blue">
              <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-hospital-blue transition-colors" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-11 pr-4 py-3 border border-slate-200 dark:border-slate-700/60 rounded-xl focus:ring-4 focus:ring-hospital-blue/10 focus:border-hospital-blue bg-slate-50/50 hover:bg-slate-50 focus:bg-white dark:bg-slate-800/40 dark:hover:bg-slate-800/60 dark:focus:bg-slate-800 dark:text-white text-sm outline-none transition-all duration-300 shadow-sm"
              placeholder="rahul@example.com"
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

        {type === "patient" && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 block uppercase tracking-wide">Date of Birth</label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700/60 rounded-xl focus:ring-4 focus:ring-hospital-blue/10 focus:border-hospital-blue bg-slate-50/50 hover:bg-slate-50 focus:bg-white dark:bg-slate-800/40 dark:hover:bg-slate-800/60 dark:focus:bg-slate-800 dark:text-white text-sm outline-none transition-all duration-300 shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 block uppercase tracking-wide">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700/60 rounded-xl focus:ring-4 focus:ring-hospital-blue/10 focus:border-hospital-blue bg-slate-50/50 hover:bg-slate-50 focus:bg-white dark:bg-slate-800/40 dark:hover:bg-slate-800/60 dark:focus:bg-slate-800 dark:text-white text-sm outline-none transition-all duration-300 shadow-sm appearance-none"
                >
                  <option value="" disabled>Select</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 block uppercase tracking-wide">Select Hospital</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-hospital-blue">
                <Building2 className="h-5 w-5 text-slate-400 group-focus-within:text-hospital-blue transition-colors" />
              </div>
              <select
                required
                value={selectedHospital}
                onChange={(e) => setSelectedHospital(e.target.value)}
                className="block w-full pl-11 pr-10 py-3 border border-slate-200 dark:border-slate-700/60 rounded-xl focus:ring-4 focus:ring-hospital-blue/10 focus:border-hospital-blue bg-slate-50/50 hover:bg-slate-50 focus:bg-white dark:bg-slate-800/40 dark:hover:bg-slate-800/60 dark:focus:bg-slate-800 dark:text-white text-sm outline-none transition-all duration-300 shadow-sm appearance-none"
              >
                <option value="" disabled>Select a hospital to connect with</option>
                {hospitals.map(h => (
                  <option key={h._id} value={h._id}>{h.name}</option>
                ))}
              </select>
            </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl shadow-[0_8px_16px_-6px_rgba(13,92,82,0.4)] dark:shadow-none text-[15px] font-bold text-white bg-hospital-blue hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-hospital-blue/30 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              Creating account...
            </>
          ) : (
            <>
              <UserPlus className="w-5 h-5" />
              Sign Up
            </>
          )}
        </button>

        <div className="text-center mt-6 pt-2">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{" "}
            <Link to={`/login?type=${type}`} className="font-semibold text-hospital-blue hover:text-blue-700 dark:hover:text-blue-400 transition-colors">
              Sign in here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

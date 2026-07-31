import { useSelector } from "react-redux";
import { User, Mail, ShieldCheck } from "lucide-react";

export default function DoctorProfile() {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">View your profile information</p>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row">
        {/* Left Side: Summary */}
        <div className="md:w-1/3 bg-slate-50 dark:bg-slate-900/50 p-8 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center text-3xl font-bold shadow-inner mb-4">
            {(user?.firstName || "D")[0]}
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Dr. {user?.firstName} {user?.lastName}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 capitalize flex items-center justify-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            {user?.role?.replace('_', ' ')}
          </p>
        </div>

        {/* Right Side: Details */}
        <div className="md:w-2/3 p-8">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Account Details</h3>

          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">First Name</label>
                <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{user?.firstName}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Last Name</label>
                <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{user?.lastName}</span>
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Email Address</label>
                <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{user?.email}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                To update your profile or change your specialization, please contact the Hospital Administrator.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

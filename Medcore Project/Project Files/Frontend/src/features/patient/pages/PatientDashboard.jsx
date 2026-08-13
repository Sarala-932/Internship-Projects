import { Calendar, Pill, Activity, ArrowRight, User, RefreshCw } from "lucide-react";
import { Link } from "react-router";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { usePatient } from "../hook/usePatient";
import { useSocket } from "../../notification/hook/useSocket";

export default function PatientDashboard() {
  const { activeProfile } = useSelector((state) => state.patient);
  const { getAppointments, getPrescriptions, getMyAdmissions, loading } = usePatient();
  
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [admissions, setAdmissions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (activeProfile?._id) {
        const apps = await getAppointments(activeProfile._id);
        const prescs = await getPrescriptions(activeProfile._id);
        const adms = await getMyAdmissions();
        setAppointments(apps);
        setPrescriptions(prescs);
        setAdmissions(adms);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProfile?._id]);

  const socket = useSocket();
  
  useEffect(() => {
    if (!socket) return;
    
    const handleDataUpdated = (data) => {
      if (data.resource === "admissions") {
        // Refetch admissions silently
        getMyAdmissions().then(adms => setAdmissions(adms));
      }
    };
    
    socket.on("data_updated", handleDataUpdated);
    
    return () => {
      socket.off("data_updated", handleDataUpdated);
    };
  }, [socket]);

  const upcomingAppointments = appointments
    .filter(a => a.status === "scheduled" || a.status === "checked_in" || a.status === "in_consultation")
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden flex justify-between items-start">
        <div className="relative z-10 flex-1">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {activeProfile?.firstName || "Patient"}!
          </h2>
          <p className="text-blue-100 max-w-xl">
            Here is your health overview. You have {upcomingAppointments.length} upcoming appointments.
          </p>
        </div>
        <button 
          onClick={() => {
            if (activeProfile?._id) {
              getAppointments(activeProfile._id).then(setAppointments);
              getPrescriptions(activeProfile._id).then(setPrescriptions);
              getMyAdmissions().then(setAdmissions);
            }
          }}
          className="relative z-10 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-sm transition-colors cursor-pointer"
          title="Refresh"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Activity className="w-48 h-48" />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Upcoming Appointments</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{upcomingAppointments.length}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Prescriptions</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{prescriptions.length}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <User className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">MRN</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{activeProfile?.mrn || "Pending"}</p>
          </div>
        </div>
      </div>

      {/* Active Admission Banner (My Stay) */}
      {admissions.some(a => a.status === 'admitted') && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-md flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
               You are currently admitted.
            </h3>
            <p className="text-emerald-50 mt-1">
              {(() => {
                const active = admissions.find(a => a.status === 'admitted');
                return `Ward: ${active.wardId?.name} | Bed: ${active.bedId?.bedNumber} | Attending: Dr. ${active.attendingDoctorId?.firstName} ${active.attendingDoctorId?.lastName}`;
              })()}
            </p>
          </div>
          <div className="hidden sm:block">
            <span className="px-4 py-2 bg-white/20 rounded-lg text-sm font-semibold backdrop-blur-sm">Active Inpatient Stay</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Appointment */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 dark:text-white">Next Appointment</h3>
            <Link to="/patient/appointments" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-center">
            {upcomingAppointments.length > 0 ? (
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-lg">
                      Dr. {upcomingAppointments[0].doctorId?.firstName} {upcomingAppointments[0].doctorId?.lastName}
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {upcomingAppointments[0].departmentId?.name}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-semibold">
                    Upcoming
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {new Date(upcomingAppointments[0].scheduledAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-slate-400" />
                    {new Date(upcomingAppointments[0].scheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No upcoming appointments</p>
                <Link to="/patient/appointments?book=true" className="text-blue-600 hover:underline mt-2 inline-block">
                  Book an appointment
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Prescriptions */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 dark:text-white">Recent Prescriptions</h3>
            <Link to="/patient/prescriptions" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-0 flex-1">
            {prescriptions.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {prescriptions.slice(0, 3).map((presc, idx) => (
                  <div key={idx} className="p-5 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <Pill className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                        Prescription by Dr. {presc.doctorId?.lastName}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {new Date(presc.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-500 dark:text-slate-400 py-12">
                <Pill className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No recent prescriptions</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

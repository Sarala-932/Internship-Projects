import { useState, useEffect } from "react";
import { X, ChevronRight, Calendar as CalendarIcon, Clock, User, FileText, CheckCircle } from "lucide-react";
import { useSelector } from "react-redux";
import { usePatient } from "../hook/usePatient";
import toast from "react-hot-toast";
import apiClient from "../../../shared/service/apiClient";

export default function BookAppointmentModal({ isOpen, onClose, onSuccess }) {
  const { user } = useSelector((state) => state.auth);
  const { activeProfile } = useSelector((state) => state.patient);
  
  const { fetchDepartments, fetchDoctorsByDepartment, fetchAvailableSlots, bookAppointment, loading } = usePatient();
  
  const [step, setStep] = useState(1);
  const [hospitals, setHospitals] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [doctorSchedule, setDoctorSchedule] = useState("");
  
  const [formData, setFormData] = useState({
    hospitalId: "",
    hospitalName: "",
    departmentId: "",
    departmentName: "",
    doctorId: "",
    doctorName: "",
    date: "",
    time: "",
    reason: ""
  });

  // Fetch departments when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFormData({ hospitalId: user?.hospitalId || "", hospitalName: "", departmentId: "", departmentName: "", doctorId: "", doctorName: "", date: "", time: "", reason: "" });
      if (!user?.hospitalId) {
        loadHospitals();
      } else {
        loadDepartments(user.hospitalId);
      }
    }
  }, [isOpen]);

  const loadHospitals = async () => {
    try {
      const res = await apiClient.get("/hospitals/public");
      const data = res.data.hospitals || [];
      setHospitals(data);
      if (data.length > 0) {
        const firstHospital = data[0];
        setFormData(prev => ({ ...prev, hospitalId: firstHospital._id, hospitalName: firstHospital.name }));
        loadDepartments(firstHospital._id);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load hospitals");
    }
  };

  const loadDepartments = async (hId) => {
    if (!hId) return;
    const deps = await fetchDepartments(hId);
    setDepartments(deps);
  };

  const handleHospitalChange = (e) => {
    const hId = e.target.value;
    const hName = hospitals.find(h => h._id === hId)?.name || "";
    setFormData(prev => ({ ...prev, hospitalId: hId, hospitalName: hName, departmentId: "", departmentName: "", doctorId: "", doctorName: "", date: "", time: "" }));
    loadDepartments(hId);
  };

  const loadDoctors = async (deptId) => {
    const hId = formData.hospitalId || user?.hospitalId;
    const docs = await fetchDoctorsByDepartment(hId, deptId);
    setDoctors(docs);
  };

  const loadSlots = async (doctorId, date) => {
    const available = await fetchAvailableSlots(doctorId, date);
    // Transform backend slots if necessary, assuming backend returns array of time strings or objects
    setSlots(Array.isArray(available) ? available : ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30"]);
  };

  const handleDepartmentChange = (e) => {
    const deptId = e.target.value;
    const dept = departments.find(d => d._id === deptId);
    if (dept) {
      setFormData(prev => ({ ...prev, departmentId: deptId, departmentName: dept.name, doctorId: "", doctorName: "", date: "", time: "" }));
    }
  };

  const handleStep1Next = () => {
    if (!formData.departmentId) {
      toast.error("Please select a department");
      return;
    }
    loadDoctors(formData.departmentId);
    setStep(2);
  };

  const fetchDoctorSchedule = async (doctorId) => {
    try {
      const res = await apiClient.get(`/doctors/profile/${doctorId}`);
      const profile = res.data.doctor || res.data;
      if (profile && profile.availability && profile.availability.length > 0) {
        const daysMap = { 0: "Sunday", 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday", 6: "Saturday" };
        const activeDays = profile.availability.map(a => a.dayOfWeek);
        const daysStr = activeDays.map(d => daysMap[d]).join(" ");
        
        // Find which days are OFF
        const allDays = [0, 1, 2, 3, 4, 5, 6];
        const offDays = allDays.filter(d => !activeDays.includes(d)).map(d => daysMap[d]).join(", ");
        
        const first = profile.availability[0];
        
        let scheduleText = `Visit Schedule: Daily on ${daysStr} @ ${first.startTime} - ${first.endTime}.`;
        if (offDays) {
           scheduleText += ` (${offDays} Off)`;
        }
        setDoctorSchedule(scheduleText);
      } else {
        setDoctorSchedule("Visit Schedule: Not Available");
      }
    } catch (err) {
      setDoctorSchedule("");
    }
  };

  const handleDoctorSelect = (doc) => {
    const docUser = doc.userId || doc;
    setFormData({ ...formData, doctorId: docUser._id, doctorName: `Dr. ${docUser.firstName} ${docUser.lastName}`, date: "", time: "" });
    setDoctorSchedule("Loading schedule...");
    fetchDoctorSchedule(docUser._id);
    setStep(3);
  };

  const handleDateSelect = (e) => {
    const date = e.target.value;
    setFormData({ ...formData, date, time: "" });
    if (date) {
      loadSlots(formData.doctorId, date);
    }
  };

  const handleTimeSelect = (time) => {
    setFormData({ ...formData, time });
    setStep(4);
  };

  const handleSubmit = async () => {
    if (!formData.reason.trim()) {
      toast.error("Please provide a reason for the visit");
      return;
    }

    // Combine date and time into scheduledAt
    const scheduledAt = new Date(`${formData.date}T${formData.time}:00`).toISOString();

    const payload = {
      hospitalId: formData.hospitalId,
      patientId: activeProfile._id,
      doctorId: formData.doctorId,
      departmentId: formData.departmentId,
      scheduledAt,
      durationMin: 15,
      type: "opd",
      reason: formData.reason
    };

    const success = await bookAppointment(payload);
    if (success) {
      onSuccess();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Book Appointment</h2>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${step >= s ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                {step > s ? <CheckCircle className="w-5 h-5" /> : s}
              </div>
              {s < 4 && (
                <div className={`w-12 sm:w-24 h-1 mx-2 rounded-full ${step > s ? 'bg-blue-600' : 'bg-slate-100 dark:bg-slate-700'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* STEP 1: Department */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Select Department</h3>
                
                {!user?.hospitalId && hospitals.length > 0 && (
                  <select
                    value={formData.hospitalId}
                    onChange={handleHospitalChange}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {hospitals.map(h => (
                      <option key={h._id} value={h._id}>{h.name}</option>
                    ))}
                  </select>
                )}
              </div>
              
              {departments.length === 0 && !loading && (
                <p className="text-slate-500">No departments available in selected hospital.</p>
              )}
              
              {departments.length > 0 && (
                <div className="space-y-4">
                  <select
                    value={formData.departmentId}
                    onChange={handleDepartmentChange}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="" disabled>-- Select a Department --</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={handleStep1Next}
                      disabled={!formData.departmentId}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-all cursor-pointer"
                    >
                      Next Step
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Doctor */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Select Doctor</h3>
                <button onClick={() => setStep(1)} className="text-sm text-blue-600 font-medium cursor-pointer">Back</button>
              </div>
              {doctors.length === 0 && !loading && (
                <p className="text-slate-500">No doctors available in {formData.departmentName}.</p>
              )}
              <div className="grid grid-cols-1 gap-3">
                {doctors.map((doc) => {
                  const docUser = doc.userId || doc;
                  return (
                  <button
                    key={doc._id}
                    onClick={() => handleDoctorSelect(doc)}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-slate-200 dark:border-slate-700 rounded-xl transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                        {docUser.firstName?.[0] || "D"}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">Dr. {docUser.firstName} {docUser.lastName}</h4>
                        <p className="text-xs text-slate-500">{doc.qualifications?.join(', ')}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                  </button>
                )})}
              </div>
            </div>
          )}

          {/* STEP 3: Date & Time */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Select Date & Time</h3>
                <button onClick={() => setStep(2)} className="text-sm text-blue-600 font-medium cursor-pointer">Back</button>
              </div>

              {doctorSchedule && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-lg">
                  <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                    {doctorSchedule}
                  </p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Preferred Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.date}
                  onChange={handleDateSelect}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {formData.date && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Available Time Slots</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {slots.length > 0 ? slots.map((time, i) => (
                      <button
                        key={i}
                        onClick={() => handleTimeSelect(time)}
                        className="py-2 px-3 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors dark:text-slate-300 cursor-pointer"
                      >
                        {time}
                      </button>
                    )) : (
                      <p className="col-span-full text-sm text-slate-500">No slots available on this date.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Confirm */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Confirm Details</h3>
                <button onClick={() => setStep(3)} className="text-sm text-blue-600 font-medium cursor-pointer">Back</button>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-xl border border-blue-100 dark:border-blue-800/50 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2"><User className="w-4 h-4"/> Doctor</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formData.doctorName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2"><FileText className="w-4 h-4"/> Department</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formData.departmentName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2"><CalendarIcon className="w-4 h-4"/> Date</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formData.date}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2"><Clock className="w-4 h-4"/> Time</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formData.time}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Reason for Visit</label>
                <textarea
                  rows="3"
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  placeholder="E.g., Follow-up, Routine checkup, Fever..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                ></textarea>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all disabled:opacity-70 flex justify-center cursor-pointer"
              >
                {loading ? "Booking..." : "Confirm & Book Appointment"}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

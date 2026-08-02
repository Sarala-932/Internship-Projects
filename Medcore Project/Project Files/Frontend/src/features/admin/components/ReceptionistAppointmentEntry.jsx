import {useState, useEffect} from "react";
import {
    X,
    Calendar,
    User,
    Phone,
    MapPin,
    Clock,
    Stethoscope,
    FileText,
    CheckCircle,
    RefreshCw,
} from "lucide-react";
import apiClient from "../../../shared/service/apiClient";
import toast from "react-hot-toast";

export default function ReceptionistAppointmentEntry({onClose, onSuccess}) {
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [slots, setSlots] = useState([]);
    const [doctorSchedule, setDoctorSchedule] = useState("");

    const [formData, setFormData] = useState({
        // Patient Details
        prefix: "Mr.",
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        age: "",
        category: "General",
        address: "",
        city: "",

        // Appointment Details
        departmentId: "",
        doctorId: "",
        scheduledAt: "",
        time: "",
        type: "opd",
        refBy: "",
        reason: "",
    });

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            // Admin route usually /departments
            const res = await apiClient.get("/departments");
            setDepartments(res.data.departments || []);
        } catch (err) {
            toast.error("Failed to load departments");
        }
    };

    const fetchDoctors = async (deptId) => {
        try {
            const res = await apiClient.get(`/users?role=doctor&departmentId=${deptId}`);
            setDoctors(res.data.users || []);
        } catch (err) {
            toast.error("Failed to load doctors");
        }
    };

    const fetchSlots = async (doctorId, date) => {
        try {
            if (!doctorId || !date) return;
            const res = await apiClient.get(`/doctors/${doctorId}/slots?date=${date}`);
            setSlots(res.data.availableSlots || []);
        } catch (err) {
            console.error(err);
            setSlots([
                "09:00",
                "09:30",
                "10:00",
                "10:30",
                "11:00",
                "11:30",
                "14:00",
                "14:30",
                "15:00",
                "15:30",
            ]);
        }
    };

    const fetchDoctorSchedule = async (doctorId) => {
        try {
            const res = await apiClient.get(`/doctors/profile/${doctorId}`);
            // In the API, the route is usually /doctors/profile/me or /doctors/profile/:id
            // but if the route returns { doctor: ... } or just the doctor object directly
            const profile = res.data.doctor || res.data;
            if (profile && profile.availability && profile.availability.length > 0) {
                const daysMap = {
                    0: "Sunday",
                    1: "Monday",
                    2: "Tuesday",
                    3: "Wednesday",
                    4: "Thursday",
                    5: "Friday",
                    6: "Saturday",
                };
                const days = profile.availability.map((a) => daysMap[a.dayOfWeek]).join(" ");
                const first = profile.availability[0];
                setDoctorSchedule(
                    `Visit Schedule : Daily On ${days} @ ${first.startTime} - ${first.endTime}`,
                );
            } else {
                setDoctorSchedule("Visit Schedule : Not Available");
            }
        } catch (err) {
            setDoctorSchedule("");
        }
    };

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData((prev) => ({...prev, [name]: value}));

        if (name === "departmentId") {
            fetchDoctors(value);
            setFormData((prev) => ({...prev, doctorId: "", time: ""}));
            setSlots([]);
        }

        if (name === "doctorId" || name === "scheduledAt") {
            const newDoctorId = name === "doctorId" ? value : formData.doctorId;
            const newDate = name === "scheduledAt" ? value : formData.scheduledAt;

            if (name === "doctorId" && newDoctorId) {
                fetchDoctorSchedule(newDoctorId);
            }

            if (newDoctorId && newDate) {
                fetchSlots(newDoctorId, newDate);
                setFormData((prev) => ({...prev, time: ""}));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            const payload = {
                ...formData,
                scheduledAt: new Date(`${formData.scheduledAt}T${formData.time}:00`).toISOString(),
            };

            const res = await apiClient.post("/appointments/desk", payload);
            toast.success(res.data.message || "Appointment booked successfully");
            onSuccess();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to book appointment");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-5xl border border-slate-200 dark:border-slate-800 overflow-hidden my-4 sm:my-8 flex flex-col max-h-[95vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-blue-600 text-white shrink-0">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Appointment Entry
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Content */}
                <div className="p-6 overflow-y-auto flex-1 bg-slate-50 dark:bg-slate-950">
                    <form id="desk-booking-form" onSubmit={handleSubmit} className="space-y-8">
                        {/* Section 1: Patient Details */}
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                                <User className="w-4 h-4 text-blue-500" /> Patient Details
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                <div className="md:col-span-4 lg:col-span-3">
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                                        Mobile No <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            required
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="10-digit number"
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-8 lg:col-span-5 flex gap-2">
                                    <div className="w-24 shrink-0">
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                                            Prefix
                                        </label>
                                        <select
                                            name="prefix"
                                            value={formData.prefix}
                                            onChange={handleChange}
                                            className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option>Mr.</option>
                                            <option>Mrs.</option>
                                            <option>Ms.</option>
                                            <option>Mast.</option>
                                            <option>Dr.</option>
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                                            First Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="Patient First Name"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="Last Name"
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-6 lg:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                                        Age (Years)
                                    </label>
                                    <input
                                        type="number"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="e.g. 35"
                                    />
                                </div>

                                <div className="md:col-span-6 lg:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                                        Category
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option>General</option>
                                        <option>VIP</option>
                                        <option>Staff</option>
                                        <option>Emergency</option>
                                    </select>
                                </div>

                                <div className="md:col-span-12 lg:col-span-4">
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                                        Email ID
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Email (optional)"
                                    />
                                </div>

                                <div className="md:col-span-8 lg:col-span-5">
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                                        Address
                                    </label>
                                    <div className="relative">
                                        <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="Street Address"
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-4 lg:col-span-3">
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="City Name"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Appointment Details */}
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                                <Stethoscope className="w-4 h-4 text-blue-500" /> Appointment Details
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                <div className="md:col-span-4 lg:col-span-3">
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                                        Appointment Type
                                    </label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="opd">OPD Consultation</option>
                                        <option value="follow_up">Follow Up</option>
                                        <option value="tele">Tele-Consultation</option>
                                        <option value="emergency">Emergency</option>
                                    </select>
                                </div>

                                <div className="md:col-span-8 lg:col-span-4">
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                                        Reference By (Ref By)
                                    </label>
                                    <input
                                        type="text"
                                        name="refBy"
                                        value={formData.refBy}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Referring Doctor / Agent"
                                    />
                                </div>

                                <div className="md:col-span-6 lg:col-span-5">
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                                        Department <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        required
                                        name="departmentId"
                                        value={formData.departmentId}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="" disabled>
                                            - Select Department -
                                        </option>
                                        {departments.map((d) => (
                                            <option key={d._id} value={d._id}>
                                                {d.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-6 lg:col-span-4">
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                                        Doctor (Ref To) <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        required
                                        name="doctorId"
                                        value={formData.doctorId}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="" disabled>
                                            - Select Doctor -
                                        </option>
                                        {doctors.map((d) => (
                                            <option key={d._id} value={d._id}>
                                                Dr. {d.firstName} {d.lastName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-span-12">
                                    {doctorSchedule && (
                                        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-lg">
                                            <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                                                {doctorSchedule}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="md:col-span-6 lg:col-span-4">
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                                        Visit Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        required
                                        type="date"
                                        name="scheduledAt"
                                        value={formData.scheduledAt}
                                        onChange={handleChange}
                                        min={new Date().toISOString().split("T")[0]}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                <div className="md:col-span-6 lg:col-span-4">
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                                        Time Slot (Shift) <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        required
                                        name="time"
                                        value={formData.time}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="" disabled>
                                            - Select Time -
                                        </option>
                                        {slots.map((s, i) => (
                                            <option key={i} value={s}>
                                                {s}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-span-12">
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                                        Remarks / Reason
                                    </label>
                                    <div className="relative">
                                        <FileText className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                                        <textarea
                                            name="reason"
                                            value={formData.reason}
                                            onChange={handleChange}
                                            rows="2"
                                            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                            placeholder="Enter remarks..."
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        form="desk-booking-form"
                        type="submit"
                        disabled={loading}
                        className="flex items-center justify-center gap-2 px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg disabled:opacity-70 transition-colors shadow-md cursor-pointer"
                    >
                        {loading ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                            <CheckCircle className="w-4 h-4" />
                        )}
                        Save & Print
                    </button>
                </div>
            </div>
        </div>
    );
}

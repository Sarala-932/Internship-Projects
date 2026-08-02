import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Activity, ClipboardPlus, FileText, Pill, Save, CheckCircle2, ChevronLeft, User, Thermometer, Weight, FileSignature, RefreshCw, CalendarDays, FlaskConical, Download } from "lucide-react";
import doctorService from "../service/doctorService";
import toast from "react-hot-toast";
import PatientHistoryModal from "../components/PatientHistoryModal";

export default function DoctorEncounter() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [appointment, setAppointment] = useState(null);

  // Encounter Form State
  const [vitals, setVitals] = useState({
    bloodPressure: "", temperature: "", heartRate: "", weight: "", height: ""
  });
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");

  // Prescription Form State
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicinesList, setMedicinesList] = useState([]);
  
  // Lab Order State
  const [labTests, setLabTests] = useState([]);
  const [labPriority, setLabPriority] = useState("routine");
  const [patientLabOrders, setPatientLabOrders] = useState([]);
  
  // Encounter metadata
  const [isCompleted, setIsCompleted] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [apt, medRes] = await Promise.all([
        doctorService.getAppointmentById(id),
        doctorService.getPharmacyInventory()
      ]);
      const aptData = apt.appointment || apt;
      setAppointment(aptData);
      setMedicinesList(medRes.inventory || []);

      // Fetch lab orders for this patient
      try {
        const labRes = await doctorService.getLabOrdersByPatient(aptData.patientId._id);
        setPatientLabOrders(labRes.orders || []);
      } catch (e) {
        console.error("Failed to fetch patient lab orders", e);
      }

      if (aptData.status === 'completed') {
        setIsCompleted(true);
      }

      // If there's an encounter linked, fetch it
      if (apt.encounterId) {
        const encounterId = typeof apt.encounterId === 'object' ? apt.encounterId._id : apt.encounterId;
        const encRes = await doctorService.getEncounterById(encounterId);
        const encounter = encRes.encounter || encRes;
        
        if (encounter) {
          if (encounter.status === "signed") {
            setIsCompleted(true);
          }
          setChiefComplaint(encounter.chiefComplaint || "");
          setDiagnosis(encounter.diagnosis || "");
          setClinicalNotes(encounter.clinicalNotes || "");
          if (encounter.vitals) {
            setVitals({
              bloodPressure: encounter.vitals.bloodPressure || "",
              temperature: encounter.vitals.temperature || "",
              heartRate: encounter.vitals.heartRate || "",
              weight: encounter.vitals.weightKg ? encounter.vitals.weightKg.toString() : "",
              height: encounter.vitals.heightCm ? encounter.vitals.heightCm.toString() : ""
            });
          }
          if (encounter.followUpDate) {
             setFollowUpDate(new Date(encounter.followUpDate).toISOString().split('T')[0]);
          }

          try {
            const rxRes = await doctorService.getPrescriptionsByEncounter(encounterId);
            if (rxRes.prescriptions && rxRes.prescriptions.length > 0) {
              const rxMeds = rxRes.prescriptions[0].medicines || [];
              setPrescriptions(rxMeds.map(m => ({
                medicineId: m.medicineId || "",
                medicineName: m.name || "",
                dosage: m.dosage || "",
                frequency: m.frequency || "",
                durationDays: m.durationDays || 1,
                instructions: m.instructions || ""
              })));
            }
          } catch (e) {
            console.error("Failed to fetch prescriptions for encounter");
          }
        }
      }
    } catch (err) {
      toast.error("Failed to load appointment details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedicine = () => {
    setPrescriptions([...prescriptions, { medicineId: "", medicineName: "", dosage: "", frequency: "", durationDays: 1, instructions: "" }]);
  };

  const handleUpdateMedicine = (index, field, value) => {
    const newPresc = [...prescriptions];
    if (field === "medicineId") {
      const selectedMed = medicinesList.find(m => m._id === value);
      newPresc[index].medicineId = value;
      newPresc[index].medicineName = selectedMed ? selectedMed.medicineName : "";
    } else {
      newPresc[index][field] = value;
    }
    setPrescriptions(newPresc);
  };

  const handleRemoveMedicine = (index) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const handleAddLabTest = () => {
    setLabTests([...labTests, { name: "", sampleType: "Blood" }]);
  };

  const handleUpdateLabTest = (index, field, value) => {
    const newTests = [...labTests];
    newTests[index][field] = value;
    setLabTests(newTests);
  };

  const handleRemoveLabTest = (index) => {
    setLabTests(labTests.filter((_, i) => i !== index));
  };

  const handleSaveProgress = async (e) => {
    e.preventDefault();
    await saveEncounterData(false);
  };

  const handleCompleteEncounter = async (e) => {
    e.preventDefault();
    if (!diagnosis) {
      toast.error("Diagnosis is required to complete encounter.");
      return;
    }
    await saveEncounterData(true);
  };

  const saveEncounterData = async (isFinal) => {
    try {
      setSubmitting(true);
      
      // Step 1: Create or get Encounter
      const encRes = await doctorService.createEncounter(id);
      const encounter = encRes.encounter || encRes;
      const encounterId = encounter._id;

      if (encounter.status === "signed") {
        setIsCompleted(true);
        toast.error("This encounter is already signed and locked.");
        setSubmitting(false);
        return;
      }

      // Step 2: Update Clinical Assessment
      await doctorService.updateEncounter(encounterId, {
        chiefComplaint,
        diagnosis,
        clinicalNotes,
        followUpDate: followUpDate || undefined
      });

      // Step 3: Update Vitals if provided
      if (vitals.bloodPressure || vitals.temperature || vitals.heartRate || vitals.weight) {
        await doctorService.updateVitals(encounterId, {
          bloodPressure: vitals.bloodPressure,
          temperature: vitals.temperature,
          heartRate: vitals.heartRate,
          weightKg: vitals.weight ? parseFloat(vitals.weight) : undefined
        });
      }

      // Step 4: Create Prescription if medicines exist
      const validMedicines = prescriptions.filter(p => p.medicineName && p.dosage);
      if (validMedicines.length > 0) {
        const payloadMeds = validMedicines.map(p => ({
          name: p.medicineName,
          dosage: p.dosage,
          frequency: p.frequency,
          durationDays: parseInt(p.durationDays) || 1,
          instructions: p.instructions
        }));
        
        await doctorService.createPrescription({
          patientId: appointment.patientId._id,
          encounterId: encounterId,
          medicines: payloadMeds
        });
      }

      // Step 4.5: Create Lab Order if tests exist
      const validTests = labTests.filter(t => t.name.trim() !== "");
      if (validTests.length > 0) {
        await doctorService.createLabOrder({
          patientId: appointment.patientId._id,
          tests: validTests.map(t => ({
             name: t.name,
             sampleType: t.sampleType
          })),
          priority: labPriority,
          notes: "Ordered during encounter"
        });
      }

      // Step 5: Sign & Complete (only if isFinal)
      if (isFinal) {
        await doctorService.signEncounter(encounterId);
        toast.success("Encounter completed successfully!");
        navigate("/doctor/appointments");
      } else {
        toast.success("Progress saved. Patient can proceed for lab tests.");
        setLabTests([]); // clear lab tests from form since they are ordered
        fetchData(); // refresh data
      }
      
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save encounter");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!appointment) return <div className="text-center py-20 text-slate-500">Appointment not found</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="cursor-pointer p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardPlus className="w-6 h-6 text-purple-500" />
            Clinical Encounter
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {new Date(appointment.scheduledAt).toLocaleDateString()} at {new Date(appointment.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Patient Info & Vitals */}
        <div className="space-y-6">
          {/* Patient Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-slate-500" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                  {appointment.patientId?.firstName} {appointment.patientId?.lastName}
                </h3>
                <p className="text-sm font-mono text-slate-500">{appointment.patientId?.mrn}</p>
              </div>
            </div>
            
            <button 
              onClick={() => setHistoryModalOpen(true)}
              className="cursor-pointer w-full mb-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 border border-indigo-100 dark:border-indigo-800 rounded-lg text-sm font-semibold text-indigo-700 dark:text-indigo-400 transition-colors flex items-center justify-center gap-2"
            >
              <CalendarDays className="w-4 h-4" /> View Past Records
            </button>
            
            <div className="grid grid-cols-2 gap-4 text-sm mt-2 pt-4 border-t border-slate-100 dark:border-slate-700">
              <div>
                <p className="text-slate-500 dark:text-slate-400">Gender</p>
                <p className="font-medium text-slate-900 dark:text-white capitalize">{appointment.patientId?.gender || "Unknown"}</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Blood Group</p>
                <p className="font-medium text-slate-900 dark:text-white">{appointment.patientId?.bloodGroup || "Unknown"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-500 dark:text-slate-400">Reason for visit</p>
                <p className="font-medium text-slate-900 dark:text-white">{appointment.reason || "General Consultation"}</p>
              </div>
            </div>
          </div>

          {/* Vitals Form */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-red-500" />
              Vitals
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">BP (mmHg)</label>
                <input type="text" placeholder="120/80" value={vitals.bloodPressure} onChange={e => setVitals({...vitals, bloodPressure: e.target.value})} disabled={isCompleted}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-70" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Temp (°F)</label>
                <input type="text" placeholder="98.6" value={vitals.temperature} onChange={e => setVitals({...vitals, temperature: e.target.value})} disabled={isCompleted}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-70" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Heart Rate (bpm)</label>
                <input type="text" placeholder="72" value={vitals.heartRate} onChange={e => setVitals({...vitals, heartRate: e.target.value})} disabled={isCompleted}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-70" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Weight (kg)</label>
                <input type="text" placeholder="70" value={vitals.weight} onChange={e => setVitals({...vitals, weight: e.target.value})} disabled={isCompleted}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-70" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Clinical Notes & Prescription */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Lab Reports Section */}
          {patientLabOrders.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <FlaskConical className="w-5 h-5 text-purple-500" />
                Completed Lab Reports
              </h3>
              <div className="space-y-3">
                {patientLabOrders.filter(o => o.overallStatus === 'completed').map(order => (
                  <div key={order._id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{order.orderNumber}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Ordered on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {order.tests.filter(t => t.result?.reportUrl).map((test, idx) => (
                        <a key={idx} href={test.result.reportUrl} target="_blank" rel="noreferrer"
                          className="cursor-pointer px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-purple-600 dark:text-purple-400 rounded-lg shadow-sm hover:bg-purple-50 dark:hover:bg-slate-600 flex items-center gap-1 transition-colors">
                          <Download className="w-3.5 h-3.5" />
                          {test.name}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
                {patientLabOrders.filter(o => o.overallStatus === 'completed').length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">No completed reports available.</p>
                )}
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-5">
              <FileSignature className="w-5 h-5 text-blue-500" />
              Clinical Assessment
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Chief Complaint</label>
                <textarea rows="2" value={chiefComplaint} onChange={e => setChiefComplaint(e.target.value)} disabled={isCompleted}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none disabled:opacity-70"
                  placeholder="Patient's primary symptoms..." />
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Diagnosis</label>
                <input type="text" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} disabled={isCompleted}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-70"
                  placeholder="Primary diagnosis (e.g., Viral Fever)" />
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Clinical Notes</label>
                <textarea rows="4" value={clinicalNotes} onChange={e => setClinicalNotes(e.target.value)} disabled={isCompleted}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none disabled:opacity-70"
                  placeholder="Detailed observations and findings..." />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Pill className="w-5 h-5 text-emerald-500" />
                Prescription
              </h3>
              {!isCompleted && (
                <button type="button" onClick={handleAddMedicine}
                  className="cursor-pointer text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors">
                  + Add Medicine
                </button>
              )}
            </div>
            
            {prescriptions.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                <p className="text-sm text-slate-500">No medicines prescribed yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {prescriptions.map((presc, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="md:col-span-4">
                      <select value={presc.medicineId} onChange={e => handleUpdateMedicine(idx, 'medicineId', e.target.value)} disabled={isCompleted}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none disabled:opacity-70">
                        {presc.medicineName && !medicinesList.find(m => m._id === presc.medicineId) && (
                           <option value={presc.medicineId}>{presc.medicineName}</option>
                        )}
                        <option value="">Select Medicine</option>
                        {medicinesList.map(m => (
                          <option key={m._id} value={m._id}>{m.medicineName}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <input type="text" placeholder="Dosage (e.g. 500mg)" value={presc.dosage} onChange={e => handleUpdateMedicine(idx, 'dosage', e.target.value)} disabled={isCompleted}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none disabled:opacity-70" />
                    </div>
                    <div className="md:col-span-2">
                      <input type="text" placeholder="Frequency (1-0-1)" value={presc.frequency} onChange={e => handleUpdateMedicine(idx, 'frequency', e.target.value)} disabled={isCompleted}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none disabled:opacity-70" />
                    </div>
                    <div className="md:col-span-2">
                      <input type="number" min="1" placeholder="Days" value={presc.durationDays} onChange={e => handleUpdateMedicine(idx, 'durationDays', e.target.value)} disabled={isCompleted}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none disabled:opacity-70" />
                    </div>
                    {!isCompleted && (
                      <div className="md:col-span-2 flex justify-end">
                        <button type="button" onClick={() => handleRemoveMedicine(idx)} className="cursor-pointer text-red-500 hover:text-red-600 text-sm font-medium">Remove</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Lab Tests Section */}
            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-purple-500" />
                  Laboratory Tests
                </h3>
                {!isCompleted && (
                  <div className="flex items-center gap-4">
                    <select 
                      value={labPriority} 
                      onChange={e => setLabPriority(e.target.value)}
                      disabled={isCompleted}
                      className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 outline-none"
                    >
                      <option value="routine">Routine</option>
                      <option value="urgent">Urgent</option>
                      <option value="stat">STAT</option>
                    </select>
                    <button type="button" onClick={handleAddLabTest}
                      className="cursor-pointer text-sm font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 transition-colors">
                      + Add Test
                    </button>
                  </div>
                )}
              </div>
              
              {labTests.length === 0 ? (
                <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                  <p className="text-sm text-slate-500">No lab tests ordered.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {labTests.map((test, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="flex-1">
                        <input type="text" placeholder="Test Name (e.g. Complete Blood Count)" value={test.name} onChange={e => handleUpdateLabTest(idx, 'name', e.target.value)} disabled={isCompleted}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none disabled:opacity-70" />
                      </div>
                      <div className="w-32">
                        <select value={test.sampleType} onChange={e => handleUpdateLabTest(idx, 'sampleType', e.target.value)} disabled={isCompleted}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none disabled:opacity-70">
                          <option value="Blood">Blood</option>
                          <option value="Urine">Urine</option>
                          <option value="Stool">Stool</option>
                          <option value="Swab">Swab</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      {!isCompleted && (
                        <button type="button" onClick={() => handleRemoveLabTest(idx)} className="cursor-pointer text-red-500 hover:text-red-600 text-sm font-medium px-2">Remove</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="w-full sm:w-auto">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Follow-up Date</label>
                <input type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} disabled={isCompleted}
                  className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-70" />
              </div>
              
              {!isCompleted && (
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button 
                    onClick={handleSaveProgress}
                    disabled={submitting}
                    className="cursor-pointer flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 text-sm font-bold rounded-xl disabled:opacity-70 transition-colors shadow-sm"
                  >
                    {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Progress
                  </button>
                  <button 
                    onClick={handleCompleteEncounter}
                    disabled={submitting}
                    className="cursor-pointer flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl disabled:opacity-70 transition-colors shadow-sm"
                  >
                    {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Complete Encounter
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <PatientHistoryModal 
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        patientId={appointment.patientId?._id}
        patientName={`${appointment.patientId?.firstName} ${appointment.patientId?.lastName}`}
      />
    </div>
  );
}

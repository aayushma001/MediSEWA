import { useState, useRef, useCallback, useEffect } from "react";
import { appointmentsAPI } from "../../services/api";
import { locationData } from '../../utils/locationData';
/* ─── INLINE FONT + GLOBAL STYLES ──────────────────────────────── */
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Sora:wght@400;600;700&display=swap');
    * { box-sizing: border-box; }
    body, #root { font-family: 'Plus Jakarta Sans', sans-serif; }
    .booking-root { font-family: 'Plus Jakarta Sans', sans-serif; }
    .heading-font { font-family: 'Sora', sans-serif; }
    .step-fade { animation: stepFade 0.35s ease both; }
    @keyframes stepFade {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .card-hover { transition: all 0.25s ease; cursor: pointer; }
    .card-hover:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(14,116,144,0.13); }
    .card-selected { border: 2.5px solid #0ea5e9 !important; background: #f0f9ff; }
    .slot-btn { transition: all 0.18s; }
    .slot-btn:hover:not(:disabled) { transform: scale(1.04); }
    .upload-zone { transition: all 0.25s; border: 2px dashed #93c5fd; }
    .upload-zone.drag-over { border-color: #0ea5e9; background: #e0f2fe; }
    .symptom-chip { transition: all 0.18s; }
    .symptom-chip:hover { transform: translateY(-2px); }
    .progress-bar { transition: width 0.5s cubic-bezier(.4,0,.2,1); }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 3px; }
    ::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 3px; }
    .shimmer { background: linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%);
               background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
    .pending-pulse { animation: pendingPulse 2s ease-in-out infinite; }
    @keyframes pendingPulse {
      0%,100% { box-shadow: 0 0 0 0 rgba(245,158,11,0.4); }
      50% { box-shadow: 0 0 0 16px rgba(245,158,11,0); }
    }
    .tag { display:inline-flex; align-items:center; font-size:11px; font-weight:600; 
           padding:2px 8px; border-radius:20px; letter-spacing:.3px; }
    .location-dropdown { max-height: 300px; overflow-y: auto; }
  `}</style>
);

/* ─── DATA ─────────────────────────────────────────────────────── */
interface Symptom {
  id: string;
  label: string;
  icon: string;
  specialties: string[];
}

const SYMPTOMS: Symptom[] = [
  { id: "brain", label: "Head / Brain", icon: "🧠", specialties: ["Neurologist", "Neurology", "Psychiatrist", "Psychiatry", "ENT"] },
  { id: "heart", label: "Heart / Chest", icon: "❤️", specialties: ["Cardiologist", "Cardiology", "Pulmonologist", "Pulmonology"] },
  { id: "stomach", label: "Stomach / Gut", icon: "🫁", specialties: ["Gastroenterologist", "Gastroenterology", "General Physician", "General Medicine"] },
  { id: "skin", label: "Skin / Hair", icon: "🩺", specialties: ["Dermatologist", "Dermatology"] },
  { id: "bones", label: "Bones / Joints", icon: "🦴", specialties: ["Orthopedist", "Orthopedics", "Rheumatologist", "Rheumatology"] },
  { id: "eyes", label: "Eyes", icon: "👁️", specialties: ["Ophthalmologist", "Ophthalmology"] },
  { id: "child", label: "Child Health", icon: "🍼", specialties: ["Pediatrician", "Pediatrics"] },
  { id: "mental", label: "Mental Health", icon: "🧘", specialties: ["Psychiatrist", "Psychiatry", "Psychologist", "Psychology"] },
  { id: "women", label: "Women's Health", icon: "🌸", specialties: ["Gynecologist", "Gynecology", "Obstetrician", "Obstetrics"] },
  { id: "general", label: "General", icon: "🏥", specialties: [] },
];

const QR_CODE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="180" height="180">
  <rect width="200" height="200" fill="white"/>
  <g fill="#0f172a">
    <rect x="10" y="10" width="70" height="70" rx="4"/><rect x="20" y="20" width="50" height="50" rx="2" fill="white"/>
    <rect x="30" y="30" width="30" height="30" rx="1"/>
    <rect x="120" y="10" width="70" height="70" rx="4"/><rect x="130" y="20" width="50" height="50" rx="2" fill="white"/>
    <rect x="140" y="30" width="30" height="30" rx="1"/>
    <rect x="10" y="120" width="70" height="70" rx="4"/><rect x="20" y="130" width="50" height="50" rx="2" fill="white"/>
    <rect x="30" y="140" width="30" height="30" rx="1"/>
    <rect x="100" y="10" width="10" height="10"/><rect x="100" y="30" width="10" height="10"/>
    <rect x="100" y="50" width="10" height="10"/><rect x="100" y="70" width="10" height="10"/>
    <rect x="10" y="100" width="10" height="10"/><rect x="30" y="100" width="10" height="10"/>
    <rect x="50" y="100" width="10" height="10"/><rect x="70" y="100" width="10" height="10"/>
    <rect x="120" y="100" width="10" height="10"/><rect x="140" y="100" width="10" height="10"/>
    <rect x="160" y="100" width="10" height="10"/><rect x="180" y="100" width="10" height="10"/>
    <rect x="100" y="120" width="10" height="10"/><rect x="120" y="120" width="10" height="10"/>
    <rect x="100" y="140" width="20" height="10"/><rect x="140" y="130" width="10" height="20"/>
    <rect x="160" y="120" width="10" height="10"/><rect x="170" y="130" width="10" height="20"/>
    <rect x="110" y="160" width="30" height="10"/><rect x="100" y="170" width="10" height="20"/>
    <rect x="150" y="160" width="20" height="10"/><rect x="170" y="170" width="10" height="10"/>
    <rect x="160" y="170" width="10" height="20"/><rect x="150" y="180" width="10" height="10"/>
    <rect x="120" y="150" width="10" height="10"/>
  </g>
</svg>`;

/* ─── HELPER COMPONENTS ─────────────────────────────────────────── */
interface StarRatingProps {
  rating: number;
}
const StarRating = ({ rating }: StarRatingProps) => (
  <span className="flex items-center gap-1 text-amber-500 font-semibold text-sm">
    ★ {rating}
  </span>
);

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}
const Badge = ({ children, className = "" }: BadgeProps) => (
  <span className={`tag ${className}`}>{children}</span>
);

interface StepDotProps {
  num: number;
  current: boolean;
  done: boolean;
  label: string;
}
const StepDot = ({ num, current, done, label }: StepDotProps) => (
  <div className="flex flex-col items-center gap-1">
    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${done ? "bg-teal-500 text-white shadow-md shadow-teal-200" :
      current ? "bg-sky-600 text-white shadow-lg shadow-sky-200 scale-110" :
        "bg-slate-200 text-slate-500"
      }`}>
      {done ? "✓" : num}
    </div>
    <span className={`text-xs font-medium hidden sm:block ${current ? "text-sky-700" : "text-slate-400"}`}>
      {label}
    </span>
  </div>
);

interface StepBarProps {
  step: string;
}
const StepBar = ({ step }: StepBarProps) => {
  const steps = ["Location", "Hospitals", "Doctors", "Schedule", "Payment"];
  const idx = ["location", "hospitals", "doctors", "slots", "payment", "pending"].indexOf(step);
  const pct = Math.min(100, (idx / (steps.length - 1)) * 100);
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="relative flex items-start justify-between">
        <div className="absolute top-4 left-0 right-0 h-1 bg-slate-200 rounded-full mx-4">
          <div className="progress-bar h-full bg-gradient-to-r from-sky-500 to-teal-500 rounded-full"
            style={{ width: `${pct}%` }} />
        </div>
        {steps.map((label, i) => (
          <StepDot key={i} num={i + 1} label={label}
            done={i < idx} current={i === idx} />
        ))}
      </div>
    </div>
  );
};

/* ─── LOCATION SEARCH HELPER ─────────────────────────────────────── */
const searchLocations = (query: string) => {
  if (!query || query.length < 2) return [];

  const results: Array<{ display: string, province: string, district: string, city: string }> = [];
  const lowerQuery = query.toLowerCase();

  Object.entries(locationData).forEach(([province, districts]) => {
    // Search in province name
    if (province.toLowerCase().includes(lowerQuery)) {
      Object.entries(districts).forEach(([district, cities]) => {
        cities.forEach(city => {
          results.push({
            display: `${city}, ${district}, ${province}`,
            province,
            district,
            city
          });
        });
      });
    } else {
      // Search in districts and cities
      Object.entries(districts).forEach(([district, cities]) => {
        if (district.toLowerCase().includes(lowerQuery)) {
          cities.forEach(city => {
            results.push({
              display: `${city}, ${district}, ${province}`,
              province,
              district,
              city
            });
          });
        } else {
          // Search in cities
          cities.forEach(city => {
            if (city.toLowerCase().includes(lowerQuery)) {
              results.push({
                display: `${city}, ${district}, ${province}`,
                province,
                district,
                city
              });
            }
          });
        }
      });
    }
  });

  return results.slice(0, 10); // Limit to 10 results
};

/* ─── MAIN COMPONENT ────────────────────────────────────────────── */
interface ShellProps {
  children: React.ReactNode;
  noPad?: boolean;
}

interface BookAppointmentProps {
  patientId?: string;
}

export default function BookAppointment({ patientId = "PAT-001" }: BookAppointmentProps) {
  const [step, setStep] = useState("location");
  const [locationQuery, setLocationQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [selectedSymptom, setSelectedSymptom] = useState<Symptom | null>(null);

  const [hospitals, setHospitals] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [scheduleSlots, setScheduleSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedHospital, setSelectedHospital] = useState<any | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [consultType, setConsultType] = useState<string>("online");
  const [paymentImg, setPaymentImg] = useState<File | null>(null);
  const [paymentImgURL, setPaymentImgURL] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [bookingRef] = useState(`BK-${Math.random().toString(36).substr(2, 8).toUpperCase()}`);
  const fileRef = useRef<HTMLInputElement>(null);

  /* Fetch Hospitals based on location */
  useEffect(() => {
    const fetchHospitals = async () => {
      if (!selectedLocation) return;

      try {
        setLoading(true);
        const data = await appointmentsAPI.getHospitals();
        setHospitals(data);
      } catch (err) {
        console.error("Failed to fetch hospitals:", err);
      } finally {
        setLoading(false);
      }
    };

    if (step === "hospitals") {
      fetchHospitals();
    }
  }, [step, selectedLocation]);

  /* Fetch Doctors when Hospital is selected */
  useEffect(() => {
    if (selectedHospital) {
      const fetchDoctors = async () => {
        try {
          setLoading(true);
          const hospitalId = selectedHospital.hospital_unique_id || selectedHospital.id;
          const data = await appointmentsAPI.getHospitalDoctors(hospitalId);
          setDoctors(data);
        } catch (err) {
          console.error("Failed to fetch doctors:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchDoctors();
    }
  }, [selectedHospital]);

  /* Fetch Schedule when Doctor and Date are selected */
  useEffect(() => {
    if (selectedDoctor && selectedHospital && selectedDate) {
      const fetchSchedule = async () => {
        try {
          const doctorId = selectedDoctor.doctor_unique_id || selectedDoctor.id;
          const hospitalId = selectedHospital.hospital_unique_id || selectedHospital.id;
          const data = await appointmentsAPI.getDoctorSchedule(doctorId, hospitalId, selectedDate);

          // Flatten slots from sessions
          const allSlots = (data.sessions || []).flatMap((session: any) =>
            (session.slots || []).map((slot: any) => ({
              ...slot,
              sessionName: session.name
            }))
          );
          setScheduleSlots(allSlots);
        } catch (err) {
          console.error("Failed to fetch schedule:", err);
          setScheduleSlots([]);
        }
      };
      fetchSchedule();
    }
  }, [selectedDoctor, selectedHospital, selectedDate]);

  /* Location autocomplete */
  useEffect(() => {
    const results = searchLocations(locationQuery);
    setLocationSuggestions(results);
  }, [locationQuery]);

  /* Filtered hospitals based on location */
  const filteredHospitals = hospitals.filter(h => {
    if (!selectedLocation) return true;

    const matchProvince = selectedLocation.province &&
      h.province?.toLowerCase() === selectedLocation.province.toLowerCase();
    const matchDistrict = selectedLocation.district &&
      h.district?.toLowerCase() === selectedLocation.district.toLowerCase();
    const matchCity = selectedLocation.city &&
      h.city?.toLowerCase() === selectedLocation.city.toLowerCase();

    return matchProvince || matchDistrict || matchCity;
  });

  /* Filtered doctors based on specialty */
  const filteredDoctors = doctors.filter(d => {
    if (!selectedSymptom || selectedSymptom.id === "general") return true;

    const doctorSpec = (d.specialization || "").toLowerCase();

    // Check if doctor's department/specialty matches any of the symptom's specialties
    const hasMatchingDepartment = (d.departments || []).some((dept: any) => {
      const deptName = (dept.name || "").toLowerCase();
      return selectedSymptom.specialties.some(s =>
        deptName.includes(s.toLowerCase()) || s.toLowerCase().includes(deptName)
      );
    });

    // Also check direct specialization field
    const hasMatchingSpec = selectedSymptom.specialties.some(s =>
      doctorSpec.includes(s.toLowerCase()) || s.toLowerCase().includes(doctorSpec)
    );

    return hasMatchingDepartment || hasMatchingSpec;
  });

  /* Dates & slots */
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      full: d.toISOString().split("T")[0],
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      date: d.getDate(),
      month: d.toLocaleDateString("en-US", { month: "short" }),
    };
  });

  const timeSlots = scheduleSlots.map(slot => ({
    value: slot.time,
    display: slot.time,
    avail: !slot.isBooked,
    id: slot.id
  }));

  /* File upload */
  const handleFile = useCallback((file: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    setPaymentImg(file);
    const reader = new FileReader();
    reader.onload = (e) => setPaymentImgURL(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleSubmitPayment = async () => {
    if (!paymentImg) {
      alert("Please upload payment screenshot");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();

      const doctorId = selectedDoctor.id || selectedDoctor.doctor_unique_id || selectedDoctor.user?.id;
      const hospitalId = selectedHospital.id || selectedHospital.hospital_unique_id || selectedHospital.user?.id;

      if (!doctorId || !hospitalId) {
        alert("Error: Missing doctor or hospital ID. Please refresh and try again.");
        setUploading(false);
        return;
      }

      formData.append('doctor', doctorId);
      formData.append('hospital', hospitalId);
      formData.append('date', selectedDate);
      formData.append('time_slot', selectedSlotId || selectedTime);
      formData.append('consultation_type', consultType);
      formData.append('symptoms', selectedSymptom?.label || "General Consultation");
      formData.append('payment_screenshot', paymentImg);
      formData.append('booking_reference', bookingRef);

      await appointmentsAPI.bookAppointment(formData);
      setStep("pending");
    } catch (err) {
      console.error("Failed to book appointment:", err);
      alert("Failed to book appointment. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setStep("location");
    setLocationQuery("");
    setSelectedLocation(null);
    setSelectedSymptom(null);
    setSelectedHospital(null);
    setSelectedDoctor(null);
    setSelectedDate("");
    setSelectedTime("");
    setSelectedSlotId("");
    setConsultType("online");
    setPaymentImg(null);
    setPaymentImgURL("");
  };

  /* ── SHARED SHELL ─────────────────────────────────────────────── */
  const Shell = ({ children }: ShellProps) => (
    <div className="booking-root min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-cyan-50 p-4 sm:p-6">
      <GlobalStyle />
      {/* header */}
      <div className="max-w-3xl mx-auto mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-sky-600 to-teal-600 rounded-xl flex items-center justify-center text-white text-xl shadow-md">
            🏥
          </div>
          <div>
            <h1 className="heading-font text-xl font-bold text-slate-800 leading-tight">Book Appointment</h1>
            <p className="text-slate-500 text-xs">{patientId} · Nepal</p>
          </div>
        </div>
        {step !== "pending" && <StepBar step={step} />}
      </div>
      <div className="max-w-3xl mx-auto">{children}</div>
    </div>
  );

  /* ══════════════════════════════════════════════════════════════
     STEP 1 — LOCATION + SYMPTOM
  ══════════════════════════════════════════════════════════════ */
  if (step === "location") return (
    <Shell>
      <div className="step-fade space-y-6">
        {/* location search */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h2 className="heading-font text-lg font-bold text-slate-800 mb-1">Your Location</h2>
          <p className="text-slate-500 text-sm mb-4">Search by province, district, or city</p>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">📍</span>
            <input
              type="text"
              placeholder="Search: Kathmandu, Budhanilkantha, Bagmati Province..."
              value={locationQuery}
              onChange={e => setLocationQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-sky-400 focus:outline-none text-sm font-medium text-slate-700 bg-slate-50 focus:bg-white transition"
            />
            {locationSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-10 mt-1 overflow-hidden location-dropdown">
                {locationSuggestions.map((loc, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedLocation(loc);
                      setLocationQuery(loc.display);
                      setLocationSuggestions([]);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-sky-50 font-medium transition border-b border-slate-100 last:border-0">
                    <div className="flex items-start gap-2">
                      <span className="text-base">📍</span>
                      <div>
                        <div className="font-semibold text-slate-800">{loc.city}</div>
                        <div className="text-xs text-slate-500">{loc.district}, {loc.province}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedLocation && (
            <div className="mt-3 p-3 bg-sky-50 rounded-lg border border-sky-200">
              <p className="text-sm font-semibold text-sky-900">Selected: {selectedLocation.city}</p>
              <p className="text-xs text-sky-700">{selectedLocation.district}, {selectedLocation.province}</p>
            </div>
          )}
        </div>

        {/* symptom selector */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h2 className="heading-font text-lg font-bold text-slate-800 mb-1">What's the concern?</h2>
          <p className="text-slate-500 text-sm mb-4">Select your symptom area to find the right specialist</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SYMPTOMS.map(sym => (
              <button key={sym.id} onClick={() => setSelectedSymptom(sym)}
                className={`symptom-chip rounded-xl p-3 border-2 text-left transition ${selectedSymptom?.id === sym.id
                  ? "border-sky-400 bg-sky-50 shadow-md shadow-sky-100"
                  : "border-slate-200 hover:border-sky-200 bg-slate-50 hover:bg-white"
                  }`}>
                <div className="text-2xl mb-1">{sym.icon}</div>
                <div className="font-semibold text-slate-800 text-xs leading-tight">{sym.label}</div>
                {sym.specialties.length > 0 && (
                  <div className="text-slate-400 text-xs mt-0.5 truncate">{sym.specialties[0]}</div>
                )}
              </button>
            ))}
          </div>
        </div>

        <button
          disabled={!selectedLocation}
          onClick={() => setStep("hospitals")}
          className="w-full py-4 bg-gradient-to-r from-sky-500 to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-sky-200 hover:from-sky-600 hover:to-teal-600 transition disabled:opacity-40 disabled:cursor-not-allowed text-sm tracking-wide">
          Find Hospitals Near Me →
        </button>
      </div>
    </Shell>
  );

  /* ══════════════════════════════════════════════════════════════
     STEP 2 — HOSPITAL LIST
  ══════════════════════════════════════════════════════════════ */
  if (step === "hospitals") return (
    <Shell>
      <div className="step-fade">
        <button onClick={() => setStep("location")}
          className="flex items-center gap-1 text-sky-600 text-sm font-semibold mb-4 hover:text-sky-700 transition">
          ← Back
        </button>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="heading-font text-xl font-bold text-slate-800">Hospitals Near You</h2>
            <p className="text-slate-500 text-sm">📍 {selectedLocation?.city}, {selectedLocation?.district}
              {selectedSymptom && <span className="ml-2 text-sky-600 font-medium">· {selectedSymptom.icon} {selectedSymptom.label}</span>}
            </p>
          </div>
          <span className="text-slate-400 text-xs font-medium">{filteredHospitals.length} found</span>
        </div>
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center p-12">
              <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredHospitals.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
              <div className="text-5xl mb-3">🏥</div>
              <p className="text-slate-600 font-semibold mb-1">No hospitals found</p>
              <p className="text-slate-400 text-sm">Try a different location</p>
              <button onClick={() => setStep("location")}
                className="mt-4 px-5 py-2 bg-sky-100 text-sky-700 font-semibold rounded-lg text-sm hover:bg-sky-200 transition">
                Change Location
              </button>
            </div>
          ) : filteredHospitals.map(h => {
            return (
              <div key={h.id}
                onClick={() => { setSelectedHospital(h); setStep("doctors"); }}
                className="card-hover bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className={`h-2 bg-gradient-to-r from-sky-600 to-blue-700`} />
                <div className="p-5">
                  <div className="flex gap-4 items-start">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-sky-600 to-blue-700 flex items-center justify-center text-2xl shadow-md flex-shrink-0`}>
                      {h.logo ? <img src={h.logo} alt="" className="w-full h-full object-cover rounded-xl" /> : "🏥"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-slate-800 text-base leading-tight">{h.hospital_name}</h3>
                          <p className="text-slate-500 text-xs mt-0.5">{h.city}, {h.district}</p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-700">{h.hospital_type || 'Hospital'}</Badge>
                      </div>
                      {h.description && (
                        <p className="text-slate-500 text-xs mt-1 italic line-clamp-2">{h.description}</p>
                      )}
                      <div className="flex items-center flex-wrap gap-3 mt-2">
                        <StarRating rating={4.5} />
                        <span className="text-slate-400 text-xs">(0 reviews)</span>
                        {h.opening_hours && (
                          <span className="text-emerald-600 text-xs font-semibold">🕐 {h.opening_hours}</span>
                        )}
                      </div>
                      {h.departments && h.departments.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {h.departments.slice(0, 3).map((dept: any) => (
                            <span key={dept.id} className="text-xs bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full">
                              {dept.name}
                            </span>
                          ))}
                          {h.departments.length > 3 && (
                            <span className="text-xs text-slate-400">+{h.departments.length - 3} more</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Shell>
  );

  /* ══════════════════════════════════════════════════════════════
     STEP 3 — DOCTORS
  ══════════════════════════════════════════════════════════════ */
  if (step === "doctors") return (
    <Shell>
      <div className="step-fade">
        <button onClick={() => setStep("hospitals")}
          className="flex items-center gap-1 text-sky-600 text-sm font-semibold mb-4 hover:text-sky-700 transition">
          ← Back to Hospitals
        </button>
        {/* hospital mini-card */}
        <div className={`rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 p-4 mb-5 text-white shadow-lg`}>
          <div className="flex items-center gap-3">
            <div className="text-3xl">
              {selectedHospital?.logo ?
                <img src={selectedHospital.logo} alt="" className="w-12 h-12 object-cover rounded-xl" />
                : "🏥"
              }
            </div>
            <div>
              <h3 className="font-bold text-base">{selectedHospital?.hospital_name}</h3>
              <p className="text-white/80 text-xs">{selectedHospital?.city}, {selectedHospital?.district}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <h2 className="heading-font text-lg font-bold text-slate-800">
            {selectedSymptom ? `${selectedSymptom.icon} ${selectedSymptom.label} Specialists` : "All Doctors"}
          </h2>
          <span className="text-slate-400 text-xs">{filteredDoctors.length} available</span>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
            <div className="text-5xl mb-3">🔍</div>
            <p className="text-slate-600 font-semibold mb-1">No specialists found</p>
            <p className="text-slate-400 text-sm">Try a different symptom category or view all doctors</p>
            <div className="flex gap-3 justify-center mt-4">
              <button onClick={() => setSelectedSymptom(null)}
                className="px-5 py-2 bg-sky-100 text-sky-700 font-semibold rounded-lg text-sm hover:bg-sky-200 transition">
                View All Doctors
              </button>
              <button onClick={() => setStep("location")}
                className="px-5 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg text-sm hover:bg-slate-200 transition">
                Change Symptom
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDoctors.map(doc => {
              const fullName = `Dr. ${doc.user.first_name} ${doc.user.last_name}`;
              const fee = doc.consultation_fee || selectedHospital?.consultation_fee || 500;

              return (
                <div key={doc.id}
                  onClick={() => { setSelectedDoctor(doc); setStep("slots"); }}
                  className="card-hover bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                  <div className="flex gap-4">
                    <img
                      src={doc.profile_picture || "https://avatar.iran.liara.run/public/11"}
                      alt={fullName}
                      className="w-16 h-16 rounded-xl object-cover border-4 border-sky-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm leading-tight">{fullName}</h4>
                          <p className="text-sky-600 font-semibold text-xs mt-0.5">{doc.specialization}</p>
                          <p className="text-slate-400 text-xs mt-0.5">{doc.qualification}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-sky-600 text-sm">Rs. {fee}</p>
                          <p className="text-slate-400 text-xs">per visit</p>
                        </div>
                      </div>
                      <div className="flex items-center flex-wrap gap-3 mt-2">
                        <StarRating rating={4.8} />
                        <span className="text-slate-400 text-xs">(0 reviews)</span>
                        <span className="text-slate-500 text-xs">🏅 {doc.experience_years} yrs</span>
                      </div>
                      {doc.departments && doc.departments.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {doc.departments.map((dept: any) => (
                            <span key={dept.id} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                              {dept.name}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-emerald-600 text-xs font-semibold">🟢 Available</span>
                        <span className="text-sky-600 text-xs font-semibold">Book →</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Shell>
  );

  /* ══════════════════════════════════════════════════════════════
     STEP 4 — SLOTS
  ══════════════════════════════════════════════════════════════ */
  if (step === "slots") return (
    <Shell>
      <div className="step-fade">
        <button onClick={() => setStep("doctors")}
          className="flex items-center gap-1 text-sky-600 text-sm font-semibold mb-4 hover:text-sky-700 transition">
          ← Back to Doctors
        </button>
        {/* doctor header */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5 flex items-center gap-4">
          <img
            src={selectedDoctor?.profile_picture || "https://avatar.iran.liara.run/public/11"}
            alt={`Dr. ${selectedDoctor?.user?.first_name}`}
            className="w-14 h-14 rounded-xl border-4 border-sky-100"
          />
          <div className="flex-1">
            <h3 className="font-bold text-slate-800">Dr. {selectedDoctor?.user?.first_name} {selectedDoctor?.user?.last_name}</h3>
            <p className="text-sky-600 text-xs font-semibold">{selectedDoctor?.specialization} · {selectedHospital?.hospital_name}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-sky-600 text-lg">Rs. {selectedDoctor?.consultation_fee || 500}</p>
            <p className="text-slate-400 text-xs">fee</p>
          </div>
        </div>

        {/* consult type */}
        <div className="mb-5">
          <p className="text-sm font-bold text-slate-700 mb-2">Consultation Type</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["online", "🎥", "Video Call", "Remote consultation"],
              ["offline", "🏥", "In-Person", "Visit the hospital"]
            ].map(([val, icon, title, sub]) => (
              <button key={val} onClick={() => setConsultType(val)}
                className={`p-3.5 rounded-xl border-2 text-center transition ${consultType === val ? "border-sky-400 bg-sky-50" : "border-slate-200 hover:border-sky-200 bg-white"}`}>
                <div className="text-2xl mb-1">{icon}</div>
                <p className="font-bold text-slate-800 text-sm">{title}</p>
                <p className="text-slate-400 text-xs">{sub}</p>
              </button>
            ))}
          </div>
        </div>

        {/* date picker */}
        <div className="mb-5">
          <p className="text-sm font-bold text-slate-700 mb-2">Select Date</p>
          <div className="grid grid-cols-7 gap-1.5">
            {dates.map(d => (
              <button key={d.full} onClick={() => setSelectedDate(d.full)}
                className={`py-2.5 rounded-xl border-2 text-center transition ${selectedDate === d.full ? "border-sky-500 bg-sky-50" : "border-slate-200 hover:border-sky-300 bg-white"}`}>
                <p className="text-slate-400 text-xs">{d.day}</p>
                <p className="font-bold text-slate-800 text-base">{d.date}</p>
                <p className="text-slate-400 text-xs">{d.month}</p>
              </button>
            ))}
          </div>
        </div>

        {/* time slots */}
        {selectedDate && (
          <div className="mb-5">
            <p className="text-sm font-bold text-slate-700 mb-2">Select Time</p>
            {timeSlots.length === 0 ? (
              <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-200">
                <p className="text-amber-700 text-sm font-semibold">No available slots for this date</p>
                <p className="text-amber-600 text-xs mt-1">Please select another date</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-56 overflow-y-auto pr-1">
                {timeSlots.map(s => (
                  <button
                    key={s.id}
                    onClick={() => {
                      if (s.avail) {
                        setSelectedTime(s.display);
                        setSelectedSlotId(s.id);
                      }
                    }}
                    disabled={!s.avail}
                    className={`slot-btn py-2.5 rounded-lg text-xs font-semibold border-2 transition ${selectedTime === s.display ? "border-sky-500 bg-sky-50 text-sky-700 shadow-md shadow-sky-100" :
                      s.avail ? "border-slate-200 hover:border-sky-300 text-slate-700 bg-white" :
                        "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed"
                      }`}>
                    {s.display}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedDate && selectedTime && (
          <button onClick={() => setStep("payment")}
            className="w-full py-4 bg-gradient-to-r from-sky-500 to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-sky-200 hover:from-sky-600 hover:to-teal-600 transition text-sm tracking-wide">
            Continue to Payment →
          </button>
        )}
      </div>
    </Shell>
  );

  /* ══════════════════════════════════════════════════════════════
     STEP 5 — PAYMENT
  ══════════════════════════════════════════════════════════════ */
  if (step === "payment") return (
    <Shell>
      <div className="step-fade space-y-4">
        <button onClick={() => setStep("slots")}
          className="flex items-center gap-1 text-sky-600 text-sm font-semibold hover:text-sky-700 transition">
          ← Back to Schedule
        </button>

        {/* summary card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="heading-font text-lg font-bold text-slate-800 mb-3">Booking Summary</h2>
          <div className="flex gap-3 items-center pb-3 border-b border-slate-100 mb-3">
            <img
              src={selectedDoctor?.profile_picture || "https://avatar.iran.liara.run/public/11"}
              alt=""
              className="w-12 h-12 rounded-xl"
            />
            <div>
              <p className="font-bold text-slate-800 text-sm">Dr. {selectedDoctor?.user?.first_name} {selectedDoctor?.user?.last_name}</p>
              <p className="text-sky-600 text-xs font-medium">{selectedDoctor?.specialization} · {selectedHospital?.hospital_name}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            {[
              ["📅 Date", selectedDate],
              ["🕐 Time", selectedTime],
              [consultType === "online" ? "🎥 Type" : "🏥 Type", consultType === "online" ? "Video Consultation" : "In-Person Visit"],
              ["📍 Location", `${selectedHospital?.hospital_name}, ${selectedHospital?.city}`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-slate-500 font-medium">{k}</span>
                <span className="text-slate-700 font-semibold text-right">{v}</span>
              </div>
            ))}
            <div className="flex justify-between pt-2 border-t border-slate-100">
              <span className="text-slate-500 font-medium">💳 Fee</span>
              <span className="text-sky-600 font-bold text-base">Rs. {selectedDoctor?.consultation_fee || 500}</span>
            </div>
          </div>
        </div>

        {/* QR payment */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="heading-font font-bold text-slate-800 mb-1">Scan & Pay</h3>
          <p className="text-slate-500 text-xs mb-4">Scan the QR code with eSewa / Khalti / IME Pay</p>
          <div className="flex flex-col items-center gap-3 mb-5 p-4 bg-gradient-to-b from-sky-50 to-white rounded-xl border border-sky-100">
            <div className="bg-white p-3 rounded-xl shadow-md"
              dangerouslySetInnerHTML={{ __html: QR_CODE_SVG }} />
            <div className="text-center">
              <p className="font-bold text-slate-800 text-base">Rs. {selectedDoctor?.consultation_fee || 500}</p>
              <p className="text-slate-500 text-xs">Ref: {bookingRef}</p>
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              {["eSewa", "Khalti", "IME Pay", "ConnectIPS"].map(w => (
                <Badge key={w} className="bg-sky-100 text-sky-700">{w}</Badge>
              ))}
            </div>
          </div>

          {/* upload area */}
          <h3 className="heading-font font-bold text-slate-800 mb-1">Upload Payment Screenshot</h3>
          <p className="text-slate-500 text-xs mb-3">
            Upload your payment screenshot — admin will verify and confirm
          </p>
          {!paymentImgURL ? (
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`upload-zone rounded-xl p-8 text-center cursor-pointer ${dragOver ? "drag-over" : ""}`}>
              <div className="text-4xl mb-2">📤</div>
              <p className="font-semibold text-slate-600 text-sm">Drag & drop your screenshot here</p>
              <p className="text-slate-400 text-xs mt-1">or click to browse · JPG, PNG, WEBP</p>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => { if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]); }} />
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden border-2 border-emerald-400">
              <img src={paymentImgURL} alt="Payment proof" className="w-full h-48 object-cover" />
              <button onClick={() => { setPaymentImg(null); setPaymentImgURL(""); }}
                className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full text-xs font-bold flex items-center justify-center hover:bg-red-600 transition shadow-md">
                ✕
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <p className="text-white text-xs font-semibold">✓ Screenshot uploaded</p>
              </div>
            </div>
          )}
        </div>

        {/* disclaimer */}
        <div className="bg-amber-50 rounded-xl p-4 border-l-4 border-amber-400">
          <p className="text-amber-800 text-xs font-semibold mb-1">⚠️ Important</p>
          <ul className="text-amber-700 text-xs space-y-0.5 list-disc list-inside">
            <li>Admin will verify your payment screenshot</li>
            <li>You'll receive confirmation via SMS/email once approved</li>
            <li>Keep your payment receipt for the appointment</li>
          </ul>
        </div>

        <button
          onClick={handleSubmitPayment}
          disabled={!paymentImgURL || uploading}
          className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 hover:from-emerald-600 hover:to-teal-600 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm tracking-wide">
          {uploading ? (
            <><span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />&nbsp;Submitting…</>
          ) : "Submit Payment & Confirm Booking ✓"}
        </button>
      </div>
    </Shell>
  );

  /* ══════════════════════════════════════════════════════════════
     STEP 6 — PENDING CONFIRMATION
  ══════════════════════════════════════════════════════════════ */
  return (
    <Shell>
      <div className="step-fade">
        {/* status card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center mb-4">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 pending-pulse">
            <span className="text-4xl">⏳</span>
          </div>
          <Badge className="bg-amber-100 text-amber-700 text-sm mb-3 mx-auto">PENDING CONFIRMATION</Badge>
          <h2 className="heading-font text-2xl font-bold text-slate-800 mb-1">Booking Submitted!</h2>
          <p className="text-slate-500 text-sm">Your appointment request is awaiting admin verification</p>
          <div className="mt-4 bg-amber-50 rounded-xl p-3 text-center border border-amber-200">
            <p className="text-amber-700 text-xs font-semibold">Booking Reference</p>
            <p className="text-amber-900 font-bold text-lg tracking-widest">{bookingRef}</p>
          </div>
        </div>

        {/* appointment detail */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-4">
          <h3 className="heading-font font-bold text-slate-800 mb-3">Appointment Details</h3>
          <div className="flex gap-3 items-center pb-3 border-b border-slate-100 mb-3">
            <img
              src={selectedDoctor?.profile_picture || "https://avatar.iran.liara.run/public/11"}
              alt=""
              className="w-12 h-12 rounded-xl"
            />
            <div>
              <p className="font-bold text-slate-800 text-sm">Dr. {selectedDoctor?.user?.first_name} {selectedDoctor?.user?.last_name}</p>
              <p className="text-sky-600 text-xs font-medium">{selectedDoctor?.specialization}</p>
              <p className="text-slate-400 text-xs">{selectedHospital?.hospital_name}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            {[
              ["📅", "Date", selectedDate],
              ["🕐", "Time", selectedTime],
              [consultType === "online" ? "🎥" : "🏥", "Type", consultType === "online" ? "Video Consultation" : "In-Person"],
              ["💳", "Amount Paid", `Rs. ${selectedDoctor?.consultation_fee || 500}`],
            ].map(([icon, k, v]) => (
              <div key={k} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                <span className="text-slate-500 text-sm">{icon} {k}</span>
                <span className="font-semibold text-slate-700">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* timeline */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-4">
          <h3 className="heading-font font-bold text-slate-800 mb-3">What happens next?</h3>
          <div className="space-y-4">
            {[
              { done: true, icon: "📤", title: "Payment uploaded", sub: "Your screenshot was submitted to admin" },
              { done: false, icon: "🔍", title: "Admin verification", sub: "Admin will verify your payment (usually within 2-24 hours)" },
              { done: false, icon: "✅", title: "Booking confirmed", sub: "You'll receive SMS/email confirmation" },
              { done: false, icon: "📅", title: "Your appointment", sub: `${selectedDate} at ${selectedTime}` },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${item.done ? "bg-emerald-100" : "bg-slate-100"}`}>
                  {item.icon}
                </div>
                <div>
                  <p className={`font-semibold text-sm ${item.done ? "text-emerald-700" : "text-slate-700"}`}>{item.title}</p>
                  <p className="text-slate-400 text-xs">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* uploaded screenshot preview */}
        {paymentImgURL && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-4">
            <h3 className="heading-font font-bold text-slate-800 mb-2">Submitted Payment Proof</h3>
            <img src={paymentImgURL} alt="Payment proof" className="w-full h-40 object-cover rounded-xl border border-slate-200" />
            <p className="text-emerald-600 text-xs font-semibold mt-2 text-center">✓ Submitted for admin review</p>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={reset}
            className="flex-1 py-3.5 bg-gradient-to-r from-sky-500 to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-sky-200 hover:from-sky-600 hover:to-teal-600 transition text-sm">
            Book Another Appointment
          </button>
          <button
            onClick={() => window.location.href = '/appointments'}
            className="flex-1 py-3.5 bg-white text-slate-700 font-bold rounded-xl border-2 border-slate-200 hover:border-sky-300 transition text-sm">
            My Appointments
          </button>
        </div>
      </div>
    </Shell>
  );
}
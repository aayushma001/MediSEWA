import { useState, useRef, useCallback, useEffect } from "react";

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
  { id: "brain", label: "Head / Brain", icon: "🧠", specialties: ["Neurologist", "Psychiatrist", "ENT Specialist"] },
  { id: "heart", label: "Heart / Chest", icon: "❤️", specialties: ["Cardiologist", "Pulmonologist"] },
  { id: "stomach", label: "Stomach / Gut", icon: "🫁", specialties: ["Gastroenterologist", "General Physician"] },
  { id: "skin", label: "Skin / Hair", icon: "🩺", specialties: ["Dermatologist"] },
  { id: "bones", label: "Bones / Joints", icon: "🦴", specialties: ["Orthopedist", "Rheumatologist"] },
  { id: "eyes", label: "Eyes", icon: "👁️", specialties: ["Ophthalmologist"] },
  { id: "child", label: "Child Health", icon: "🍼", specialties: ["Pediatrician"] },
  { id: "mental", label: "Mental Health", icon: "🧘", specialties: ["Psychiatrist", "Psychologist"] },
  { id: "women", label: "Women's Health", icon: "🌸", specialties: ["Gynecologist", "Obstetrician"] },
  { id: "general", label: "General", icon: "🏥", specialties: [] },
];

interface Hospital {
  id: string;
  name: string;
  area: string;
  city: string;
  distance: string;
  rating: number;
  reviews: number;
  beds: number;
  image: string;
  color: string;
  badge: string;
  badgeColor: string;
  facilities: string[];
  openTime: string;
  doctorCount: number;
  tagline: string;
}

const HOSPITALS: Hospital[] = [
  {
    id: "h1", name: "Bir Hospital", area: "Mahaboudha", city: "Kathmandu", distance: "1.2 km",
    rating: 4.7, reviews: 1240, beds: 350, image: "🏥",
    color: "from-sky-600 to-blue-700",
    badge: "Government", badgeColor: "bg-blue-100 text-blue-700",
    facilities: ["ICU", "Emergency", "OPD", "Surgery", "Lab", "Pharmacy"],
    openTime: "24/7", doctorCount: 48, tagline: "Premier government hospital in the heart of the city"
  },
  {
    id: "h2", name: "NORVIC International", area: "Thapathali", city: "Kathmandu", distance: "2.4 km",
    rating: 4.9, reviews: 2180, beds: 210, image: "🏨",
    color: "from-emerald-600 to-teal-700",
    badge: "International", badgeColor: "bg-emerald-100 text-emerald-700",
    facilities: ["ICU", "Robotic Surgery", "Cardiology", "Neurology", "Oncology"],
    openTime: "24/7", doctorCount: 72, tagline: "World-class care with modern technology"
  },
  {
    id: "h3", name: "Grande International", area: "Tokha", city: "Kathmandu", distance: "5.1 km",
    rating: 4.8, reviews: 1890, beds: 500, image: "🏛️",
    color: "from-violet-600 to-purple-700",
    badge: "Multi-specialty", badgeColor: "bg-violet-100 text-violet-700",
    facilities: ["Transplant", "Cardiology", "Cancer Care", "Orthopedics", "NICU"],
    openTime: "24/7", doctorCount: 120, tagline: "Nepal's largest multi-specialty hospital"
  },
  {
    id: "h4", name: "Patan Hospital", area: "Lagankhel", city: "Lalitpur", distance: "3.8 km",
    rating: 4.6, reviews: 980, beds: 290, image: "⚕️",
    color: "from-rose-500 to-pink-700",
    badge: "Teaching", badgeColor: "bg-rose-100 text-rose-700",
    facilities: ["Emergency", "Maternity", "Pediatrics", "Internal Medicine", "Surgery"],
    openTime: "24/7", doctorCount: 55, tagline: "Teaching hospital with compassionate care"
  },
  {
    id: "h5", name: "Medicare National", area: "Kalanki", city: "Kathmandu", distance: "4.2 km",
    rating: 4.5, reviews: 760, beds: 180, image: "🏪",
    color: "from-amber-500 to-orange-600",
    badge: "Private", badgeColor: "bg-amber-100 text-amber-700",
    facilities: ["Cardiology", "Orthopedics", "ENT", "Dermatology", "Urology"],
    openTime: "8AM–9PM", doctorCount: 36, tagline: "Affordable quality healthcare for all"
  },
];

interface Doctor {
  id: string;
  hospitalId: string;
  name: string;
  spec: string;
  exp: number;
  rating: number;
  reviews: number;
  fee: number;
  img: string;
  edu: string;
  next: string;
  avail: string[];
}

const DOCTORS: Doctor[] = [
  { id: "d1", hospitalId: "h1", name: "Dr. Rajan Shrestha", spec: "Neurologist", exp: 14, rating: 4.9, reviews: 312, fee: 800, img: "https://avatar.iran.liara.run/public/11", edu: "MD, DM Neurology – TUTH", next: "Today, 3:00 PM", avail: ["Mon", "Wed", "Thu", "Fri"] },
  { id: "d2", hospitalId: "h1", name: "Dr. Sushma Rai", spec: "Cardiologist", exp: 18, rating: 4.8, reviews: 445, fee: 900, img: "https://avatar.iran.liara.run/public/25", edu: "MD, DM Cardiology – BPKIHS", next: "Tomorrow, 10AM", avail: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
  { id: "d3", hospitalId: "h1", name: "Dr. Bikash Thapa", spec: "General Physician", exp: 8, rating: 4.6, reviews: 198, fee: 500, img: "https://avatar.iran.liara.run/public/12", edu: "MBBS – IOM", next: "Today, 5:00 PM", avail: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] },
  { id: "d4", hospitalId: "h1", name: "Dr. Anita Gurung", spec: "Dermatologist", exp: 11, rating: 4.7, reviews: 267, fee: 700, img: "https://avatar.iran.liara.run/public/27", edu: "MD Dermatology – BPKIHS", next: "Wed, 11:00 AM", avail: ["Tue", "Wed", "Fri", "Sat"] },
  { id: "d5", hospitalId: "h2", name: "Dr. Pradeep Maharjan", spec: "Cardiologist", exp: 22, rating: 5.0, reviews: 621, fee: 1200, img: "https://avatar.iran.liara.run/public/13", edu: "MD, FACC – USA", next: "Tomorrow, 9:00 AM", avail: ["Mon", "Tue", "Thu", "Fri"] },
  { id: "d6", hospitalId: "h2", name: "Dr. Sabina Karmacharya", spec: "Gynecologist", exp: 16, rating: 4.9, reviews: 534, fee: 1000, img: "https://avatar.iran.liara.run/public/28", edu: "MD, MRCOG – UK", next: "Today, 2:00 PM", avail: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
  { id: "d7", hospitalId: "h2", name: "Dr. Dipak Joshi", spec: "Orthopedist", exp: 12, rating: 4.8, reviews: 289, fee: 950, img: "https://avatar.iran.liara.run/public/14", edu: "MS Orthopedics – AIIMS", next: "Thu, 4:00 PM", avail: ["Mon", "Wed", "Thu", "Sat"] },
  { id: "d8", hospitalId: "h3", name: "Dr. Meera Acharya", spec: "Oncologist", exp: 20, rating: 4.9, reviews: 412, fee: 1500, img: "https://avatar.iran.liara.run/public/29", edu: "DM Oncology – SGPGI", next: "Tomorrow, 11AM", avail: ["Mon", "Tue", "Wed", "Thu"] },
  { id: "d9", hospitalId: "h3", name: "Dr. Nabin Poudel", spec: "Neurologist", exp: 9, rating: 4.7, reviews: 176, fee: 800, img: "https://avatar.iran.liara.run/public/15", edu: "DM Neurology – IOM", next: "Today, 6:00 PM", avail: ["Tue", "Thu", "Fri", "Sat"] },
  { id: "d10", hospitalId: "h4", name: "Dr. Smriti Basnet", spec: "Pediatrician", exp: 13, rating: 4.9, reviews: 503, fee: 600, img: "https://avatar.iran.liara.run/public/30", edu: "MD Pediatrics – KIST", next: "Tomorrow, 8:00 AM", avail: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] },
  { id: "d11", hospitalId: "h4", name: "Dr. Subash Ghimire", spec: "Psychiatrist", exp: 10, rating: 4.8, reviews: 231, fee: 900, img: "https://avatar.iran.liara.run/public/16", edu: "MD Psychiatry – TUTH", next: "Wed, 2:00 PM", avail: ["Mon", "Wed", "Thu", "Fri"] },
  { id: "d12", hospitalId: "h5", name: "Dr. Kabita Tamang", spec: "Dermatologist", exp: 7, rating: 4.6, reviews: 145, fee: 650, img: "https://avatar.iran.liara.run/public/31", edu: "MD Dermatology – BPKIHS", next: "Today, 4:30 PM", avail: ["Mon", "Tue", "Thu", "Fri", "Sat"] },
];

const LOCATIONS = [
  "Thamel, Kathmandu", "Mahaboudha, Kathmandu", "Baluwatar, Kathmandu",
  "Lalitpur (Patan)", "Bhaktapur", "Tokha, Kathmandu", "Kalanki, Kathmandu",
  "New Baneshwor, Kathmandu", "Lagankhel, Lalitpur", "Gwarko, Lalitpur",
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
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedSymptom, setSelectedSymptom] = useState<Symptom | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [consultType, setConsultType] = useState<string>("online");
  const [paymentImg, setPaymentImg] = useState<File | null>(null);
  const [paymentImgURL, setPaymentImgURL] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [bookingRef] = useState(`BK-${Math.random().toString(36).substr(2, 8).toUpperCase()}`);
  const fileRef = useRef<HTMLInputElement>(null);

  /* location autocomplete */
  useEffect(() => {
    if (locationQuery.length < 2) { setLocationSuggestions([]); return; }
    setLocationSuggestions(LOCATIONS.filter(l =>
      l.toLowerCase().includes(locationQuery.toLowerCase())).slice(0, 5));
  }, [locationQuery]);

  /* filtered data */
  const filteredHospitals = HOSPITALS; // all hospitals shown (location is for display)

  const filteredDoctors = DOCTORS.filter(d => {
    const inHospital = d.hospitalId === selectedHospital?.id;
    if (!selectedSymptom || selectedSymptom.id === "general") return inHospital;
    return inHospital && selectedSymptom.specialties.includes(d.spec);
  });

  /* dates & slots */
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i);
    return {
      full: d.toISOString().split("T")[0],
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      date: d.getDate(),
      month: d.toLocaleDateString("en-US", { month: "short" }),
    };
  });

  const timeSlots = [];
  for (let h = 9; h <= 18; h++) {
    for (let m = 0; m < 60; m += 30) {
      const period = h >= 12 ? "PM" : "AM";
      const dh = h > 12 ? h - 12 : h;
      timeSlots.push({
        value: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
        display: `${dh}:${String(m).padStart(2, "0")} ${period}`,
        avail: Math.random() > 0.35,
      });
    }
  }

  /* file upload */
  const handleFile = useCallback((file: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    setPaymentImg(file);
    const reader = new FileReader();
    reader.onload = (e) => setPaymentImgURL(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleSubmitPayment = () => {
    setUploading(true);
    setTimeout(() => { setUploading(false); setStep("pending"); }, 1800);
  };

  const reset = () => {
    setStep("location"); setLocationQuery(""); setSelectedLocation("");
    setSelectedSymptom(null); setSelectedHospital(null); setSelectedDoctor(null);
    setSelectedDate(""); setSelectedTime(""); setConsultType("online");
    setPaymentImg(null); setPaymentImgURL("");
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
            <p className="text-slate-500 text-xs">{patientId} · Kathmandu</p>
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
          <p className="text-slate-500 text-sm mb-4">We'll show hospitals near you</p>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">📍</span>
            <input
              type="text"
              placeholder="Search area, street, or landmark…"
              value={locationQuery}
              onChange={e => setLocationQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-sky-400 focus:outline-none text-sm font-medium text-slate-700 bg-slate-50 focus:bg-white transition"
            />
            {locationSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-10 mt-1 overflow-hidden">
                {locationSuggestions.map(s => (
                  <button key={s} onClick={() => { setSelectedLocation(s); setLocationQuery(s); setLocationSuggestions([]); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-sky-50 font-medium transition border-b border-slate-100 last:border-0">
                    📍 {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {["Thamel", "New Baneshwor", "Lalitpur", "Bhaktapur"].map(q => (
              <button key={q} onClick={() => { setSelectedLocation(q); setLocationQuery(q); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${selectedLocation === q ? "bg-sky-100 border-sky-400 text-sky-700" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-sky-300"}`}>
                {q}
              </button>
            ))}
          </div>
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
          disabled={!selectedLocation && !locationQuery}
          onClick={() => { if (!selectedLocation) setSelectedLocation(locationQuery); setStep("hospitals"); }}
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
            <p className="text-slate-500 text-sm">📍 {selectedLocation}
              {selectedSymptom && <span className="ml-2 text-sky-600 font-medium">· {selectedSymptom.icon} {selectedSymptom.label}</span>}
            </p>
          </div>
          <span className="text-slate-400 text-xs font-medium">{filteredHospitals.length} found</span>
        </div>
        <div className="space-y-4">
          {filteredHospitals.map(h => {
            const docCount = DOCTORS.filter(d => {
              if (!selectedSymptom || selectedSymptom.id === "general") return d.hospitalId === h.id;
              return d.hospitalId === h.id && selectedSymptom.specialties.includes(d.spec);
            }).length;
            return (
              <div key={h.id}
                onClick={() => { setSelectedHospital(h); setStep("doctors"); }}
                className="card-hover bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${h.color}`} />
                <div className="p-5">
                  <div className="flex gap-4 items-start">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${h.color} flex items-center justify-center text-2xl shadow-md flex-shrink-0`}>
                      {h.image}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-slate-800 text-base leading-tight">{h.name}</h3>
                          <p className="text-slate-500 text-xs mt-0.5">{h.area}, {h.city}</p>
                        </div>
                        <Badge className={h.badgeColor}>{h.badge}</Badge>
                      </div>
                      <p className="text-slate-500 text-xs mt-1 italic">{h.tagline}</p>
                      <div className="flex items-center flex-wrap gap-3 mt-2">
                        <StarRating rating={h.rating} />
                        <span className="text-slate-400 text-xs">({h.reviews})</span>
                        <span className="text-sky-600 text-xs font-semibold">📏 {h.distance}</span>
                        <span className="text-emerald-600 text-xs font-semibold">🕐 {h.openTime}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      {h.facilities.slice(0, 4).map(f => (
                        <Badge key={f} className="bg-slate-100 text-slate-600">{f}</Badge>
                      ))}
                      {h.facilities.length > 4 && (
                        <Badge className="bg-slate-100 text-slate-500">+{h.facilities.length - 4} more</Badge>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-sky-700 font-bold text-sm">{docCount} doctor{docCount !== 1 ? "s" : ""}</p>
                      <p className="text-slate-400 text-xs">available</p>
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
        <div className={`rounded-xl bg-gradient-to-r ${selectedHospital?.color} p-4 mb-5 text-white shadow-lg`}>
          <div className="flex items-center gap-3">
            <div className="text-3xl">{selectedHospital?.image}</div>
            <div>
              <h3 className="font-bold text-base">{selectedHospital?.name}</h3>
              <p className="text-white/80 text-xs">{selectedHospital?.area} · {selectedHospital?.openTime}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <h2 className="heading-font text-lg font-bold text-slate-800">
            {selectedSymptom ? `${selectedSymptom.icon} ${selectedSymptom.label} Specialists` : "All Doctors"}
          </h2>
          <span className="text-slate-400 text-xs">{filteredDoctors.length} available</span>
        </div>

        {filteredDoctors.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
            <div className="text-5xl mb-3">🔍</div>
            <p className="text-slate-600 font-semibold mb-1">No specialists found</p>
            <p className="text-slate-400 text-sm">Try a different symptom category</p>
            <button onClick={() => { setSelectedSymptom(null); setStep("location"); }}
              className="mt-4 px-5 py-2 bg-sky-100 text-sky-700 font-semibold rounded-lg text-sm hover:bg-sky-200 transition">
              Change Symptom
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDoctors.map(doc => (
              <div key={doc.id}
                onClick={() => { setSelectedDoctor(doc); setStep("slots"); }}
                className="card-hover bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <div className="flex gap-4">
                  <img src={doc.img} alt={doc.name} className="w-16 h-16 rounded-xl object-cover border-4 border-sky-100 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm leading-tight">{doc.name}</h4>
                        <p className="text-sky-600 font-semibold text-xs mt-0.5">{doc.spec}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{doc.edu}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-sky-600 text-sm">Rs.{doc.fee}</p>
                        <p className="text-slate-400 text-xs">per visit</p>
                      </div>
                    </div>
                    <div className="flex items-center flex-wrap gap-3 mt-2">
                      <StarRating rating={doc.rating} />
                      <span className="text-slate-400 text-xs">({doc.reviews} reviews)</span>
                      <span className="text-slate-500 text-xs">🏅 {doc.exp} yrs</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-emerald-600 text-xs font-semibold">🟢 Next: {doc.next}</span>
                      <span className="text-sky-600 text-xs font-semibold">Book →</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
          <img src={selectedDoctor?.img} alt={selectedDoctor?.name} className="w-14 h-14 rounded-xl border-4 border-sky-100" />
          <div className="flex-1">
            <h3 className="font-bold text-slate-800">{selectedDoctor?.name}</h3>
            <p className="text-sky-600 text-xs font-semibold">{selectedDoctor?.spec} · {selectedHospital?.name}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-sky-600 text-lg">Rs.{selectedDoctor?.fee}</p>
            <p className="text-slate-400 text-xs">fee</p>
          </div>
        </div>

        {/* consult type */}
        <div className="mb-5">
          <p className="text-sm font-bold text-slate-700 mb-2">Consultation Type</p>
          <div className="grid grid-cols-2 gap-3">
            {[["online", "🎥", "Video Call", "Remote consultation"], ["offline", "🏥", "In-Person", "Visit the hospital"]].map(([val, icon, title, sub]) => (
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
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-56 overflow-y-auto pr-1">
              {timeSlots.map(s => (
                <button key={s.value} onClick={() => s.avail && setSelectedTime(s.display)} disabled={!s.avail}
                  className={`slot-btn py-2.5 rounded-lg text-xs font-semibold border-2 transition ${selectedTime === s.display ? "border-sky-500 bg-sky-50 text-sky-700 shadow-md shadow-sky-100" :
                    s.avail ? "border-slate-200 hover:border-sky-300 text-slate-700 bg-white" :
                      "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed"}`}>
                  {s.display}
                </button>
              ))}
            </div>
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
            <img src={selectedDoctor?.img} alt="" className="w-12 h-12 rounded-xl" />
            <div>
              <p className="font-bold text-slate-800 text-sm">{selectedDoctor?.name}</p>
              <p className="text-sky-600 text-xs font-medium">{selectedDoctor?.spec} · {selectedHospital?.name}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            {[
              ["📅 Date", selectedDate],
              ["🕐 Time", selectedTime],
              [consultType === "online" ? "🎥 Type" : "🏥 Type", consultType === "online" ? "Video Consultation" : "In-Person Visit"],
              ["📍 Location", `${selectedHospital?.name}, ${selectedHospital?.area}`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-slate-500 font-medium">{k}</span>
                <span className="text-slate-700 font-semibold text-right">{v}</span>
              </div>
            ))}
            <div className="flex justify-between pt-2 border-t border-slate-100">
              <span className="text-slate-500 font-medium">💳 Fee</span>
              <span className="text-sky-600 font-bold text-base">Rs. {selectedDoctor?.fee}</span>
            </div>
          </div>
        </div>

        {/* QR payment */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="heading-font font-bold text-slate-800 mb-1">Scan & Pay</h3>
          <p className="text-slate-500 text-xs mb-4">Scan the QR code below with your eSewa / Khalti / IME Pay wallet</p>
          <div className="flex flex-col items-center gap-3 mb-5 p-4 bg-gradient-to-b from-sky-50 to-white rounded-xl border border-sky-100">
            <div className="bg-white p-3 rounded-xl shadow-md"
              dangerouslySetInnerHTML={{ __html: QR_CODE_SVG }} />
            <div className="text-center">
              <p className="font-bold text-slate-800 text-base">Rs. {selectedDoctor?.fee}</p>
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
            After payment, upload your screenshot or receipt photo — admin will verify and confirm your booking
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
            <li>Your booking will be in <strong>Pending</strong> status until admin verifies payment</li>
            <li>Confirmation will be sent to your registered mobile/email</li>
            <li>Bring physical receipt on day of appointment</li>
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
          <p className="text-slate-500 text-sm">Your appointment request is awaiting admin verification of payment</p>
          <div className="mt-4 bg-amber-50 rounded-xl p-3 text-center border border-amber-200">
            <p className="text-amber-700 text-xs font-semibold">Booking Reference</p>
            <p className="text-amber-900 font-bold text-lg tracking-widest">{bookingRef}</p>
          </div>
        </div>

        {/* appointment detail */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-4">
          <h3 className="heading-font font-bold text-slate-800 mb-3">Appointment Details</h3>
          <div className="flex gap-3 items-center pb-3 border-b border-slate-100 mb-3">
            <img src={selectedDoctor?.img} alt="" className="w-12 h-12 rounded-xl" />
            <div>
              <p className="font-bold text-slate-800 text-sm">{selectedDoctor?.name}</p>
              <p className="text-sky-600 text-xs font-medium">{selectedDoctor?.spec}</p>
              <p className="text-slate-400 text-xs">{selectedHospital?.name}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            {[
              ["📅", "Date", selectedDate],
              ["🕐", "Time", selectedTime],
              [consultType === "online" ? "🎥" : "🏥", "Type", consultType === "online" ? "Video Consultation" : "In-Person"],
              ["💳", "Amount Paid", `Rs. ${selectedDoctor?.fee}`],
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
              { done: true, icon: "📤", title: "Payment uploaded", sub: "Your screenshot was submitted" },
              { done: false, icon: "🔍", title: "Admin verification", sub: "Admin checks your payment (usually within 2 hrs)" },
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
          <button className="flex-1 py-3.5 bg-white text-slate-700 font-bold rounded-xl border-2 border-slate-200 hover:border-sky-300 transition text-sm">
            My Appointments
          </button>
        </div>
      </div>
    </Shell>
  );
}
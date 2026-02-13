import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Appointment, Doctor, Medication, Patient } from '../../types';
import { appointmentsAPI } from '../../services/api';
import medicinesData from '../../data/medicines.json';
import {
    Plus,
    Search,
    Send,
    Phone,
    Trash2,
    FileText,
    Activity,
    Sparkles,
    StopCircle,
    Stethoscope,
    Video,
    Mic,
    PhoneOff,
    Mail,
    MapPin
} from 'lucide-react';

interface PatientConsultationProps {
    doctor: Doctor;
    appointment?: Appointment;
    patient?: Patient;
    onComplete: () => void;
    hospitalName?: string;
}

export const PatientConsultation: React.FC<PatientConsultationProps> = ({
    doctor,
    appointment,
    patient: initialPatient,
    onComplete,
    hospitalName = "MediSEWA Hospital"
}) => {
    // Local patient state: start with initialPatient if provided, otherwise build best-effort from appointment.
    const buildLocalFromAppointment = (appt?: Appointment) => {
        const details = (appt as any)?.patient_details;
        if (details) {
            const profile = details.patient_profile || {};
            return {
                id: details.id,
                user: {
                    id: details.id,
                    first_name: details.first_name,
                    last_name: details.last_name,
                    email: details.email,
                    mobile: details.mobile,
                    created_at: details.created_at
                },
                father_name: '', // Not in backend explicitly yet
                illness_description: (appt as any)?.symptoms || (appt as any)?.patientCondition || 'General consultation',
                age: profile.age,
                gender: profile.gender,
                blood_group: profile.blood_group,
                address: profile.address || '',
                city: profile.city || '',
                // Other fields left empty; will be replaced if API returns full patient
            } as any;
        }

        // minimal fallback
        return {
            id: (appt as any)?.patient_id || (appt as any)?.patient || (appt as any)?.id || 'N/A',
            user: {
                id: (appt as any)?.patient_id || (appt as any)?.patient || (appt as any)?.id || 'N/A',
                first_name: appt?.patient_name?.split(' ')[0] || 'Patient',
                last_name: appt?.patient_name?.split(' ')[1] || '',
                email: 'Loading...',
                mobile: 'Loading...',
                created_at: new Date().toISOString()
            },
            father_name: '',
            illness_description: (appt as any)?.symptoms || (appt as any)?.patientCondition || 'General consultation',
            age: 'N/A',
            gender: 'N/A',
            blood_group: 'N/A',
            address: 'Loading...'
        } as any;
    };

    const [patientData, setPatientData] = useState<any>(initialPatient || buildLocalFromAppointment(appointment));

    // Try to fetch authoritative patient data from backend using common appointment fields.
    useEffect(() => {
        let cancelled = false;
        const tryFetchPatient = async () => {
            if (initialPatient) return; // already have complete data

            const appt = appointment as any;
            // common possible id fields on appointment
            const candidateId = appt?.patient_details?.id ?? appt?.patient_id ?? appt?.patient ?? (appt as any)?.id ?? null;
            if (!candidateId) return;

            const idStr = String(candidateId);
            try {
                // Use the standardized API helper
                const { patientsAPI } = await import('../../services/api');
                const data = await patientsAPI.getPatientDetail(idStr);
                console.log('Fetched patient data:', data);
                if (!cancelled) setPatientData(data);
            } catch (e) {
                console.warn('Could not fetch full patient record, using appointment-derived data', e);
                // keep current local patientData (built from appointment)
            }
        };

        tryFetchPatient();
        return () => { cancelled = true; };
    }, [appointment, initialPatient]);

    const [medicines, setMedicines] = useState<Medication[]>([
        {
            id: '1',
            appointment: appointment?.id || '1',
            name: '',
            dosage: '',
            frequency: '',
            instructions: '',
            start_date: new Date().toISOString(),
            end_date: '',
            completed: false,
            timings: []
        }
    ]);

    const [vitalSigns, setVitalSigns] = useState({
        temperature: '',
        bloodPressure: '',
        heartRate: '',
        weight: '',
        height: '',
        oxygenLevel: ''
    });

    const [diagnosis, setDiagnosis] = useState('');
    const [doctorNotes, setDoctorNotes] = useState('');
    const [followUpDate, setFollowUpDate] = useState('');
    const [loading, setLoading] = useState(false);

    // Video call states
    const [showVideo, setShowVideo] = useState(false);
    const [micOn, setMicOn] = useState(true);
    const [cameraOn, setCameraOn] = useState(true);

    // Session Recording states
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [aiInsights, setAiInsights] = useState<{
        summary: string;
        points: string[];
        draft?: string;
    } | null>(null);

    // Medicine autocomplete
    const [activeMedicineId, setActiveMedicineId] = useState<string | null>(null);
    const [suggestions, setSuggestions] = useState<{ name: string; type: string }[]>([]);


    const handleAddMedicine = () => {
        setMedicines([
            ...medicines,
            {
                id: Date.now().toString(),
                appointment: appointment?.id || '1',
                name: '',
                dosage: '',
                frequency: '',
                instructions: '',
                start_date: new Date().toISOString(),
                end_date: '',
                completed: false,
                timings: []
            }
        ]);
    };

    const handleRemoveMedicine = (id: string) => {
        if (medicines.length > 1) {
            setMedicines(medicines.filter(m => m.id !== id));
        }
    };

    const handleMedicineChange = (id: string, field: keyof Medication, value: any) => {
        setMedicines(medicines.map(m => (m.id === id ? { ...m, [field]: value } : m)));

        if (field === 'name') {
            setActiveMedicineId(id);
            if (value.trim()) {
                const filtered = medicinesData
                    .filter(m => m.name.toLowerCase().includes(value.toLowerCase()))
                    .slice(0, 5);
                setSuggestions(filtered);
            } else {
                setSuggestions([]);
            }
        }
    };

    const selectMedicine = (id: string, name: string) => {
        handleMedicineChange(id, 'name', name);
        setSuggestions([]);
        setActiveMedicineId(null);
    };

    const generatePDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(0, 102, 204); // Blue
        doc.text(hospitalName, 105, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Excellence in Healthcare", 105, 26, { align: 'center' });
        doc.setLineWidth(0.5);
        doc.setDrawColor(200);
        doc.line(15, 32, 195, 32); // Horizontal line

        // Doctor Info (Left)
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Dr. ${doctor.user.first_name} ${doctor.user.last_name}`, 15, 45);
        doc.setFontSize(10);
        doc.setTextColor(80);
        doc.text(doctor.specialization, 15, 50);
        if (doctor.nid) doc.text(`NMC Reg No: ${doctor.nid}`, 15, 55);

        // Patient Info (Right)
        doc.setTextColor(0);
        const pName = `${(patientData as any).user.first_name} ${(patientData as any).user.last_name}`;
        doc.text(`Patient: ${pName}`, 130, 42);
        doc.text(`Age/Sex: ${(patientData as any).age} / ${(patientData as any).gender}`, 130, 47);
        doc.text(`Blood Group: ${(patientData as any).blood_group || 'O+'}`, 130, 52);
        doc.text(`Mobile: ${(patientData as any).user.mobile}`, 130, 57);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 130, 62);

        // Medical Context
        let currentY = 75;
        doc.setFontSize(10);
        doc.setFont("helvetica", 'bold');
        doc.text("Chief Complaint:", 15, currentY);
        doc.setFont("helvetica", 'normal');
        doc.text((patientData as any).chief_complaint || 'General Checkup', 50, currentY);

        currentY += 7;
        doc.setFont("helvetica", 'bold');
        doc.text("Health Condition:", 15, currentY);
        doc.setFont("helvetica", 'normal');
        const conditionText = doc.splitTextToSize((patientData as any).health_condition || 'Normal', 145);
        doc.text(conditionText, 50, currentY);

        currentY += Math.max(7, conditionText.length * 5);

        doc.setFont("helvetica", 'bold');
        doc.text("Allergies:", 15, currentY);
        doc.setFont("helvetica", 'normal');
        const allergiesText = doc.splitTextToSize((patientData as any).allergies || 'None recorded', 145);
        doc.text(allergiesText, 50, currentY);

        currentY += Math.max(7, allergiesText.length * 5);

        doc.setFont("helvetica", 'bold');
        doc.text("Medications:", 15, currentY);
        doc.setFont("helvetica", 'normal');
        const medicationsText = doc.splitTextToSize((patientData as any).medications || 'None', 145);
        doc.text(medicationsText, 50, currentY);

        currentY += Math.max(7, medicationsText.length * 5);

        // Vitals
        autoTable(doc, {
            startY: currentY,
            head: [['BP', 'Temp', 'SpO2']],
            body: [[
                vitalSigns.bloodPressure || '-',
                vitalSigns.temperature || '-',
                vitalSigns.oxygenLevel || '-'
            ]],
            theme: 'grid',
            headStyles: { fillColor: [245, 245, 245], textColor: 0, fontSize: 9, lineColor: 200 },
            bodyStyles: { fontSize: 9, minCellHeight: 10 },
            styles: { lineColor: 220, lineWidth: 0.1 }
        });

        currentY = (doc as any).lastAutoTable.finalY + 10;

        // Diagnosis
        if (diagnosis) {
            doc.setFontSize(11);
            doc.setTextColor(0);
            doc.setFont("helvetica", 'bold');
            doc.text("Diagnosis:", 15, currentY);
            doc.setFont("helvetica", 'normal');
            doc.text(diagnosis, 15, currentY + 7);
            currentY += 15;
        }

        // Medicines
        doc.setFontSize(16);
        doc.setFont("helvetica", 'bold');
        doc.setTextColor(0, 102, 204);
        doc.text("Rx", 15, currentY + 10);

        const medRows = medicines.map(m => [m.name, m.dosage, m.frequency, m.instructions]);

        autoTable(doc, {
            startY: currentY + 15,
            head: [['Medicine', 'Dosage', 'Frequency', 'Instructions']],
            body: medRows,
            theme: 'striped',
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            styles: { fontSize: 10, cellPadding: 4 }
        });

        currentY = (doc as any).lastAutoTable.finalY + 10;

        // Notes
        if (doctorNotes) {
            doc.setFontSize(11);
            doc.setTextColor(0);
            doc.setFont("helvetica", 'bold');
            doc.text("Notes / Advice:", 15, currentY + 5);
            doc.setFont("helvetica", 'normal');
            doc.setFontSize(10);

            // Split text to fit width
            const splitNotes = doc.splitTextToSize(doctorNotes, 180);
            doc.text(splitNotes, 15, currentY + 12);
        }

        // Footer - Signature
        const pageHeight = doc.internal.pageSize.height;
        if (doctor.signature) {
            try {
                // Determine format
                const format = doctor.signature.includes('image/png') ? 'PNG' : 'JPEG';
                doc.addImage(doctor.signature, format, 140, pageHeight - 50, 40, 20);

                doc.setFontSize(10);
                doc.setTextColor(0);
                doc.text(`Dr. ${doctor.user.first_name} ${doctor.user.last_name}`, 140, pageHeight - 25);
                if (doctor.nid) doc.text(`Reg No: ${doctor.nid}`, 140, pageHeight - 20);

                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text("Digitally Signed & Verified", 140, pageHeight - 15);
            } catch (e) {
                console.error("Error adding signature to PDF", e);
            }
        }

        return doc;
    };

    const handleFinalize = async () => {
        setLoading(true);

        // Generate PDF and Upload
        try {
            const doc = generatePDF();

            // 1. Download locally
            const fileName = `Prescription_${(patientData as any).user.first_name}.pdf`;
            doc.save(fileName);

            // 2. Upload to server
            console.log("Finalizing appointment:", appointment);
            if (appointment && appointment.id) {
                const pdfBlob = doc.output('blob');
                const formData = new FormData();
                formData.append('report_file', pdfBlob, fileName);
                formData.append('title', `Prescription - ${new Date().toLocaleDateString()}`);
                formData.append('description', `Consultation report for ${(patientData as any).user.first_name} ${(patientData as any).user.last_name}`);
                formData.append('appointment', String(appointment.id)); // Ensure string

                try {
                    await appointmentsAPI.uploadMedicalReport(formData);
                    alert('✅ Prescription finalized! Saved to records and sent to patient via email.');

                    // The backend now handles completion, but we keeping this for explicit confirmation
                    try {
                        await appointmentsAPI.updateAppointmentStatus(Number(appointment.id), 'completed');
                    } catch (sError) {
                        console.log("Status update already handled or failed silently", sError);
                    }

                } catch (uploadError) {
                    console.error("Upload failed", uploadError);
                    alert('⚠️ Prescription downloaded, but failed to save to server. Please try again or contact support.');
                }
            } else {
                console.warn("No appointment ID found, skipping upload");
                alert('✅ Prescription downloaded! (Not saved to records - No Appointment ID)');
            }

            onComplete();
        } catch (error) {
            console.error("PDF Generation/Upload failed", error);
            alert("Failed to generate or upload PDF");
        } finally {
            setLoading(false);
        }
    };

    const toggleVideoCall = () => {
        setShowVideo(!showVideo);
    };

    const handleToggleRecording = () => {
        if (!isRecording) {
            setIsRecording(true);
            setAiInsights(null);
            // Simulate recording timer
            const timer = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
            (window as any).recordingTimer = timer;
        } else {
            setIsRecording(false);
            clearInterval((window as any).recordingTimer);
            setRecordingTime(0);
            // Simulate AI generating insights
            setLoading(true);
            setTimeout(() => {
                setAiInsights({
                    summary: "Patient presents with persistent cough and mild fever for 3 days. Throat examination shows slight inflammation.",
                    points: [
                        "Persistent dry cough for 72 hours",
                        "Low-grade fever (99.5°F)",
                        "No difficulty breathing reported",
                        "History of seasonal allergies noted"
                    ],
                    draft: "Prescribe Azithromycin 500mg once daily for 3 days and Cetirizine 10mg at night. Advise warm salt water gargles."
                });
                setLoading(false);
            }, 2000);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Instagram-like Patient Profile Section */}
            <Card className="border-0 shadow-sm bg-white rounded-3xl overflow-hidden p-8">
                <div className="flex flex-col md:flex-row gap-10 items-start">
                    {/* Profile Picture */}
                    <div className="relative group">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden ring-4 ring-blue-50 transition-all group-hover:ring-blue-100 shadow-xl">
                            <img
                                src={(patientData as any).profile_image || `https://ui-avatars.com/api/?name=${(patientData as any).user?.first_name || 'Patient'}+${(patientData as any).user?.last_name || ''}&background=random&size=200`}
                                alt="Patient"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="absolute bottom-2 right-2 w-8 h-8 bg-green-500 border-4 border-white rounded-full"></div>
                    </div>

                    {/* Patient Details & Stats */}
                    <div className="flex-1 space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    {(patientData as any).user?.first_name || 'Patient'} {(patientData as any).user?.last_name || ''}
                                </h1>
                                <p className="text-gray-500 font-medium">Patient ID: #{(patientData as any).patient_unique_id || (patientData as any).id || 'N/A'}</p>
                            </div>
                            <div className="flex space-x-3">
                                <Button
                                    variant="outline"
                                    onClick={toggleVideoCall}
                                    className="rounded-xl px-6 border-blue-100 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold"
                                >
                                    <Video size={18} className="mr-2" /> Start Video Call
                                </Button>
                                <Button
                                    onClick={handleToggleRecording}
                                    className={`rounded-xl px-6 font-bold shadow-lg transition-all ${isRecording
                                        ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                        }`}
                                >
                                    {isRecording ? <StopCircle size={18} className="mr-2" /> : <Mic size={18} className="mr-2" />}
                                    {isRecording ? 'Stop Recording' : 'Start Audio'}
                                </Button>
                            </div>
                        </div>

                        {/* Social-style Stats */}
                        <div className="flex flex-wrap gap-8 items-center border-y border-gray-50 py-6">
                            <div className="text-center md:text-left">
                                <span className="text-xl font-bold text-gray-900">{(patientData as any).age || 'N/A'}</span>
                                <span className="ml-2 text-gray-500 font-medium">Age</span>
                            </div>
                            <div className="text-center md:text-left">
                                <span className="text-xl font-bold text-gray-900">
                                    {String((patientData as any).gender).charAt(0) || 'N/A'}
                                </span>
                                <span className="ml-2 text-gray-500 font-medium">Gender</span>
                            </div>
                            <div className="text-center md:text-left">
                                <span className="text-xl font-bold text-gray-900">{(patientData as any).blood_group || 'N/A'}</span>
                                <span className="ml-2 text-gray-500 font-medium">Blood</span>
                            </div>
                        </div>

                        {/* Contact & Context Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <div className="flex items-center text-sm text-gray-600">
                                    <Phone size={16} className="mr-3 text-blue-400" />
                                    <span className="font-medium">{(patientData as any).user?.mobile || (patientData as any).phone_number || 'N/A'}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <Mail size={16} className="mr-3 text-blue-400" />
                                    <span className="font-medium">{(patientData as any).user?.email || 'N/A'}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <MapPin size={16} className="mr-3 text-blue-400" />
                                    <span className="font-medium">{(patientData as any).address || 'N/A'}</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Chief Complaint</h4>
                                    <p className="text-sm font-bold text-red-600 bg-red-50 px-3 py-1 rounded-lg border border-red-100 inline-block">
                                        {(patientData as any).illness_description}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Medical Details</h4>
                                    <div className="flex flex-wrap gap-2">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded ${(patientData as any).allergies ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                                            Allergies: {(patientData as any).allergies || 'None'}
                                        </span>
                                        <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded">
                                            Condition: {(patientData as any).health_condition || 'Normal'}
                                        </span>
                                        <span className="text-[10px] font-bold bg-purple-50 text-purple-600 px-2 py-1 rounded">
                                            Meds: {(patientData as any).medications || 'None'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* AI Insights (shown if recording or has data) */}
            {(isRecording || aiInsights || loading) && (
                <div className="animate-in slide-in-from-bottom duration-500">
                    <Card className={`border-0 shadow-lg overflow-hidden transition-all duration-500 ${isRecording ? 'ring-2 ring-red-400' : 'ring-2 ring-indigo-400'}`}>
                        <div className={`p-4 ${isRecording ? 'bg-red-500' : 'bg-indigo-600'} text-white flex justify-between items-center`}>
                            <div className="flex items-center space-x-2">
                                <Sparkles size={20} className={isRecording ? 'animate-spin-slow' : ''} />
                                <h3 className="font-bold">AI Scribe & Insights</h3>
                            </div>
                            {isRecording && (
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs font-bold uppercase tracking-widest animate-pulse">Recording ({formatTime(recordingTime)})</span>
                                </div>
                            )}
                        </div>
                        <div className="p-6 bg-white">
                            {loading && !aiInsights ? (
                                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                                    <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                                    <p className="text-gray-500 font-medium">Generating smart consultation summary...</p>
                                </div>
                            ) : aiInsights ? (
                                <div className="space-y-4 animate-in fade-in">
                                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                                        <h4 className="text-xs font-bold text-blue-600 uppercase mb-2">Live Summary</h4>
                                        <p className="text-sm text-gray-800 leading-relaxed font-medium">{aiInsights.summary}</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {aiInsights.points.map((p, i) => (
                                            <div key={i} className="flex items-center bg-gray-50 p-3 rounded-xl border border-gray-100 italic">
                                                <div className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></div>
                                                <span className="text-xs text-gray-700">{p}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <p className="text-gray-400 text-sm font-medium italic">Consultation summary will appear here automatically...</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            )}

            {/* Video Call Interface Overlay/Embedded */}
            {showVideo && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in zoom-in duration-300">
                    <div className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 ring-1 ring-black/5">
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                            <img src={`https://avatar.iran.liara.run/public/15`} alt="Patient" className="w-32 h-32 rounded-full ring-4 ring-blue-500/30" />
                        </div>
                        <div className="absolute top-4 left-4 flex gap-2">
                            <span className="bg-black/50 text-white text-[10px] px-2 py-1 rounded-lg backdrop-blur-md uppercase tracking-wider font-bold">Patient Link</span>
                            <span className="bg-green-500 text-white text-[10px] px-2 py-1 rounded-lg uppercase tracking-wider font-bold">Live</span>
                        </div>
                    </div>
                    <div className="relative aspect-video bg-indigo-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-blue-400/20">
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-950 to-blue-900">
                            <div className="w-32 h-32 rounded-full border-4 border-white/10 flex items-center justify-center text-4xl text-white font-bold">
                                {doctor.user.first_name[0]}
                            </div>
                        </div>
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
                            <button onClick={() => setMicOn(!micOn)} className={`p-4 rounded-full backdrop-blur-md transition-all ${micOn ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-red-500 text-white'}`}><Mic size={20} /></button>
                            <button onClick={() => setCameraOn(!cameraOn)} className={`p-4 rounded-full backdrop-blur-md transition-all ${cameraOn ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-red-500 text-white'}`}><Video size={20} /></button>
                            <button onClick={toggleVideoCall} className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-xl shadow-red-500/20"><PhoneOff size={20} /></button>
                        </div>
                    </div>
                </div>
            )}

            {/* Clinical Information Main Block - Vertical Flow */}
            <div className="space-y-8">
                {/* Vitals & Diagnosis */}
                <Card className="border-0 shadow-sm p-8 space-y-8 bg-white rounded-3xl">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                        <Activity size={24} className="mr-3 text-green-500" /> Clinical Assessment
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Temperature</label>
                            <input
                                type="text"
                                value={vitalSigns.temperature}
                                onChange={(e) => setVitalSigns({ ...vitalSigns, temperature: e.target.value })}
                                className="w-full px-5 py-4 bg-gray-50 border-0 rounded-2xl text-base font-bold focus:ring-2 focus:ring-blue-500"
                                placeholder="98.6°F"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">BP (mmHg)</label>
                            <input
                                type="text"
                                value={vitalSigns.bloodPressure}
                                onChange={(e) => setVitalSigns({ ...vitalSigns, bloodPressure: e.target.value })}
                                className="w-full px-5 py-4 bg-gray-50 border-0 rounded-2xl text-base font-bold focus:ring-2 focus:ring-blue-500"
                                placeholder="120/80"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">SPO2 (%)</label>
                            <input
                                type="text"
                                value={vitalSigns.oxygenLevel}
                                onChange={(e) => setVitalSigns({ ...vitalSigns, oxygenLevel: e.target.value })}
                                className="w-full px-5 py-4 bg-gray-50 border-0 rounded-2xl text-base font-bold focus:ring-2 focus:ring-blue-500"
                                placeholder="98%"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Diagnosis / Impression</label>
                        <textarea
                            value={diagnosis}
                            onChange={(e) => setDiagnosis(e.target.value)}
                            className="w-full p-6 bg-indigo-50/50 border-0 rounded-3xl text-base font-medium focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                            placeholder="Final clinical impression based on examination..."
                        />
                    </div>
                </Card>

                {/* Prescription Block (Medicine) */}
                <Card className="border-0 shadow-sm overflow-hidden bg-white rounded-3xl flex flex-col">
                    <div className="bg-blue-600 px-8 py-6 flex justify-between items-center text-white">
                        <div className="flex items-center">
                            <Stethoscope size={24} className="mr-3" />
                            <h3 className="font-bold text-xl">Rx Prescription</h3>
                        </div>
                        <button
                            onClick={handleAddMedicine}
                            className="bg-white/20 hover:bg-white/30 p-3 rounded-2xl backdrop-blur-md transition-all"
                        >
                            <Plus size={24} />
                        </button>
                    </div>
                    <div className="p-8 space-y-6">
                        {medicines.map((med, index) => (
                            <div key={med.id} className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 hover:border-blue-200 transition-all relative group">
                                <div className="absolute -top-3 -left-2 bg-blue-100 text-blue-700 w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black shadow-sm ring-4 ring-white">
                                    {index + 1}
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
                                    <div className="lg:col-span-5 relative space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Medicine Name</label>
                                        <div className="relative">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                value={med.name}
                                                onChange={(e) => handleMedicineChange(med.id, 'name', e.target.value)}
                                                className="w-full pl-12 pr-4 py-4 bg-white border-0 rounded-2xl text-base font-bold shadow-sm focus:ring-2 focus:ring-blue-500"
                                                placeholder="Medicine Name"
                                            />
                                            {activeMedicineId === med.id && suggestions.length > 0 && (
                                                <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                                                    {suggestions.map((s, i) => (
                                                        <div key={i} onClick={() => selectMedicine(med.id, s.name)} className="px-5 py-4 hover:bg-blue-50 cursor-pointer text-base font-bold text-gray-900 border-b last:border-0 border-gray-50">{s.name}</div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="lg:col-span-2 space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dosage</label>
                                        <input
                                            type="text"
                                            value={med.dosage}
                                            onChange={(e) => handleMedicineChange(med.id, 'dosage', e.target.value)}
                                            className="w-full px-5 py-4 bg-white border-0 rounded-2xl text-sm font-bold shadow-sm"
                                            placeholder="500mg"
                                        />
                                    </div>
                                    <div className="lg:col-span-2 space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Frequency</label>
                                        <input
                                            type="text"
                                            value={med.frequency}
                                            onChange={(e) => handleMedicineChange(med.id, 'frequency', e.target.value)}
                                            className="w-full px-5 py-4 bg-white border-0 rounded-2xl text-sm font-bold shadow-sm"
                                            placeholder="1-0-1"
                                        />
                                    </div>
                                    <div className="lg:col-span-2 space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Instructions</label>
                                        <input
                                            type="text"
                                            value={med.instructions}
                                            onChange={(e) => handleMedicineChange(med.id, 'instructions', e.target.value)}
                                            className="w-full px-5 py-4 bg-white border-0 rounded-2xl text-sm font-bold shadow-sm"
                                            placeholder="After meals"
                                        />
                                    </div>
                                    <div className="lg:col-span-1 flex justify-center pb-1">
                                        {medicines.length > 1 && (
                                            <button onClick={() => handleRemoveMedicine(med.id)} className="p-3 bg-red-50 text-red-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={20} /></button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Additional Notes & Follow Up */}
                <Card className="border-0 shadow-sm p-8 space-y-8 bg-white rounded-3xl">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                        <FileText size={24} className="mr-3 text-orange-400" /> Additional Notes & Advice
                    </h3>
                    <textarea
                        value={doctorNotes}
                        onChange={(e) => setDoctorNotes(e.target.value)}
                        className="w-full p-6 bg-orange-50/30 border-0 rounded-3xl text-base font-medium focus:ring-2 focus:ring-orange-400 min-h-[140px]"
                        placeholder="Dietary advice, lifestyle changes, or warning signs..."
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-50">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Follow up Date</label>
                            <input
                                type="date"
                                value={followUpDate}
                                onChange={(e) => setFollowUpDate(e.target.value)}
                                className="w-full px-6 py-4 bg-gray-50 border-0 rounded-2xl text-base font-bold focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Submit Consultation</label>
                            <Button
                                onClick={handleFinalize}
                                loading={loading}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 py-4 rounded-2xl text-white font-bold text-lg shadow-xl shadow-blue-200"
                            >
                                <Send size={20} className="mr-3" /> Finalize & Send Prescription
                            </Button>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">Verified Signature will be applied automatically</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
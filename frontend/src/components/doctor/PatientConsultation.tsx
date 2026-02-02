import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Appointment, Doctor, Medication, Patient } from '../../types';
import medicinesData from '../../data/medicines.json';
import {
    Plus,
    Trash2,
    Send,
    ChevronLeft,
    Calendar,
    FileText,
    Activity,
    AlertCircle,
    Video,
    Mic,
    MicOff,
    VideoOff,
    PhoneOff,
    Search,
    Heart,
    Clipboard,
    Clock,
    Thermometer,
    Droplet,
    Weight,
    Ruler,
    Eye,
    Phone,
    Mail,
    MapPin,
    Waves,
    Sparkles,
    StopCircle,
    Info
} from 'lucide-react';

interface PatientConsultationProps {
    doctor: Doctor;
    appointment?: Appointment;
    patient?: Patient;
    onBack: () => void;
    onComplete: () => void;
    hospitalName?: string;
}

export const PatientConsultation: React.FC<PatientConsultationProps> = ({
    doctor,
    appointment,
    patient: initialPatient,
    onBack,
    onComplete,
    hospitalName = "MediSEWA Hospital"
}) => {
    // Determine patient data source
    const patientData = initialPatient || {
        id: 1,
        user: {
            id: 1,
            first_name: appointment?.patient_name?.split(' ')[0] || 'John',
            last_name: appointment?.patient_name?.split(' ')[1] || 'Doe',
            email: 'john.doe@example.com',
            mobile: '+977 984-1234567',
            created_at: new Date().toISOString()
        },
        father_name: 'Robert Doe',
        illness_description: appointment?.instructions || 'General consultation',
        age: 28,
        gender: 'Male',
        blood_group: 'O+',
        address: 'Kathmandu, Nepal'
    };

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
    const [isVideoActive, setIsVideoActive] = useState(false);
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
        doc.text(`Patient: ${pName}`, 130, 45);
        doc.text(`Age/Sex: ${(patientData as any).age} / ${(patientData as any).gender}`, 130, 50);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 130, 55);

        // Vitals
        let currentY = 65;
        autoTable(doc, {
            startY: currentY,
            head: [['BP', 'Temp', 'Pulse', 'Weight', 'SpO2']],
            body: [[
                vitalSigns.bloodPressure || '-',
                vitalSigns.temperature || '-',
                vitalSigns.heartRate || '-',
                vitalSigns.weight || '-',
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

        doc.save(`Prescription_${(patientData as any).user.first_name}.pdf`);
    };

    const handleFinalize = async () => {
        setLoading(true);

        // Generate PDF
        try {
            generatePDF();

            setTimeout(() => {
                alert('✅ Prescription finalized and downloaded!\n\nA copy has been sent to medical records.');
                setLoading(false);
                onComplete();
            }, 1000);
        } catch (error) {
            console.error("PDF Generation failed", error);
            setLoading(false);
            alert("Failed to generate PDF");
        }
    };

    const toggleVideoCall = () => {
        setShowVideo(!showVideo);
        setIsVideoActive(!showVideo);
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
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Patient Consultation</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Session started at {new Date().toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                    <div className="flex space-x-3 items-center">
                        {isRecording && (
                            <div className="flex items-center space-x-2 bg-red-50 px-3 py-1.5 rounded-full border border-red-100 animate-pulse">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <span className="text-red-600 text-sm font-bold mono">{formatTime(recordingTime)}</span>
                            </div>
                        )}
                        <Button
                            variant="outline"
                            onClick={handleToggleRecording}
                            className={`${isRecording
                                ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                                : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                                } shadow-sm transition-all duration-300`}
                        >
                            {isRecording ? <StopCircle size={18} className="mr-2" /> : <Mic size={18} className="mr-2" />}
                            {isRecording ? 'Stop Session' : 'Start Session'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={toggleVideoCall}
                            className={`${showVideo
                                ? 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100'
                                : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
                                } shadow-sm transition-all duration-300`}
                        >
                            {showVideo ? <VideoOff size={18} className="mr-2" /> : <Video size={18} className="mr-2" />}
                            {showVideo ? 'End Call' : 'Start Video'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Video Call Interface */}
            {showVideo && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-top">
                    {/* Patient Video Feed */}
                    <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                                    <span className="text-4xl font-bold text-white">
                                        {(patientData as any).user.first_name[0]}
                                    </span>
                                </div>
                                <p className="text-white text-lg font-semibold">
                                    {(patientData as any).user.first_name} {(patientData as any).user.last_name}
                                </p>
                                <div className="flex items-center justify-center mt-2 space-x-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-green-400 text-sm font-medium">Connected</span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg">
                            <p className="text-white text-sm font-medium">Patient Feed</p>
                        </div>
                        <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg">
                            <p className="text-white text-xs">00:05:23</p>
                        </div>
                    </div>

                    {/* Doctor Video Feed */}
                    <div className="relative aspect-video bg-gradient-to-br from-indigo-900 to-blue-900 rounded-2xl overflow-hidden shadow-2xl border-2 border-blue-400">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-32 h-32 bg-indigo-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                                    <span className="text-4xl font-bold text-white">
                                        {doctor.user.first_name[0]}{doctor.user.last_name[0]}
                                    </span>
                                </div>
                                <p className="text-white text-lg font-semibold">You</p>
                            </div>
                        </div>

                        {/* Video Controls */}
                        <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-4">
                            <button
                                onClick={() => setMicOn(!micOn)}
                                className={`p-4 rounded-full ${micOn
                                    ? 'bg-white/20 hover:bg-white/30'
                                    : 'bg-red-500 hover:bg-red-600'
                                    } text-white backdrop-blur-md transition-all shadow-lg`}
                            >
                                {micOn ? <Mic size={22} /> : <MicOff size={22} />}
                            </button>
                            <button
                                onClick={() => setCameraOn(!cameraOn)}
                                className={`p-4 rounded-full ${cameraOn
                                    ? 'bg-white/20 hover:bg-white/30'
                                    : 'bg-red-500 hover:bg-red-600'
                                    } text-white backdrop-blur-md transition-all shadow-lg`}
                            >
                                {cameraOn ? <Video size={22} /> : <VideoOff size={22} />}
                            </button>
                            <button
                                onClick={toggleVideoCall}
                                className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-xl shadow-red-500/30 transition-all"
                            >
                                <PhoneOff size={22} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Patient Profile Sidebar */}
                <div className="xl:col-span-1 space-y-6">
                    {/* Patient Info Card */}
                    <Card className="border-0 shadow-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 shadow-xl">
                                    <span className="text-3xl font-bold">
                                        {(patientData as any).user.first_name[0]}{(patientData as any).user.last_name[0]}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold">
                                    {(patientData as any).user.first_name} {(patientData as any).user.last_name}
                                </h3>
                                <p className="text-blue-100 text-sm mt-1">Patient ID: #PT{(patientData as any).id}</p>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Quick Stats */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="text-center p-3 bg-blue-50 rounded-xl">
                                    <p className="text-2xl font-bold text-blue-600">{(patientData as any).age}</p>
                                    <p className="text-xs text-gray-600">Age</p>
                                </div>
                                <div className="text-center p-3 bg-purple-50 rounded-xl">
                                    <p className="text-xl font-bold text-purple-600">{(patientData as any).gender[0]}</p>
                                    <p className="text-xs text-gray-600">Gender</p>
                                </div>
                                <div className="text-center p-3 bg-red-50 rounded-xl">
                                    <p className="text-xl font-bold text-red-600">{(patientData as any).blood_group}</p>
                                    <p className="text-xs text-gray-600">Blood</p>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-2 pt-4 border-t border-gray-100">
                                <div className="flex items-center text-sm text-gray-700">
                                    <Phone size={16} className="mr-3 text-gray-400" />
                                    <span>{(patientData as any).user.mobile}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-700">
                                    <Mail size={16} className="mr-3 text-gray-400" />
                                    <span className="truncate">{(patientData as any).user.email}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-700">
                                    <MapPin size={16} className="mr-3 text-gray-400" />
                                    <span>{(patientData as any).address}</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Chief Complaint */}
                    <Card className="border-0 shadow-lg p-6">
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                            <AlertCircle size={18} className="mr-2 text-orange-600" />
                            Chief Complaint
                        </h3>
                        <div className="p-4 bg-orange-50 rounded-xl border-l-4 border-orange-400">
                            <p className="text-sm text-gray-800 leading-relaxed">
                                {(patientData as any).illness_description}
                            </p>
                        </div>
                    </Card>

                    {/* Medical History */}
                    <Card className="border-0 shadow-lg p-6">
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                            <Heart size={18} className="mr-2 text-red-600" />
                            Medical History
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-gray-600">
                                    <strong>Allergies:</strong> None known
                                </p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-gray-600">
                                    <strong>Chronic Conditions:</strong> Mild asthma
                                </p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-gray-600">
                                    <strong>Previous Surgeries:</strong> None
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Main Consultation Area */}
                <div className="xl:col-span-2 space-y-6">
                    {/* AI Insights & Draft Section */}
                    {(isRecording || aiInsights || loading) && (
                        <Card className={`border-0 shadow-xl overflow-hidden transition-all duration-500 ${isRecording ? 'ring-2 ring-red-400' : 'ring-2 ring-blue-400'}`}>
                            <div className={`p-4 ${isRecording ? 'bg-red-500' : 'bg-gradient-to-r from-blue-600 to-indigo-600'} text-white flex justify-between items-center`}>
                                <div className="flex items-center space-x-2">
                                    <Sparkles size={20} className={isRecording ? 'animate-spin-slow' : ''} />
                                    <h3 className="font-bold">AI Consultation Assistant</h3>
                                </div>
                                {isRecording && (
                                    <div className="flex items-center space-x-2">
                                        <Waves size={20} className="animate-pulse" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Listening...</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-6 bg-white">
                                {loading && !aiInsights ? (
                                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                                        <p className="text-gray-500 font-medium animate-pulse">AI is processing the conversation...</p>
                                    </div>
                                ) : aiInsights ? (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <h4 className="text-sm font-bold text-gray-900 flex items-center">
                                                    <Info size={16} className="mr-2 text-blue-600" />
                                                    Summary
                                                </h4>
                                                <p className="text-sm text-gray-700 bg-blue-50 p-4 rounded-2xl leading-relaxed border border-blue-100">
                                                    {aiInsights.summary}
                                                </p>
                                            </div>
                                            <div className="space-y-3">
                                                <h4 className="text-sm font-bold text-gray-900 flex items-center">
                                                    <Clipboard size={16} className="mr-2 text-indigo-600" />
                                                    Key Points
                                                </h4>
                                                <ul className="space-y-2">
                                                    {aiInsights.points.map((point, i) => (
                                                        <li key={i} className="flex items-start text-sm text-gray-700">
                                                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                                                            {point}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        {aiInsights.draft && (
                                            <div className="pt-4 border-t border-gray-100">
                                                <div className="flex justify-between items-center mb-3">
                                                    <h4 className="text-sm font-bold text-gray-900 flex items-center">
                                                        <FileText size={16} className="mr-2 text-green-600" />
                                                        Prescription Draft Suggestion
                                                    </h4>
                                                    <button
                                                        onClick={() => setDoctorNotes(prev => prev + (prev ? '\n' : '') + aiInsights.draft)}
                                                        className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors border border-blue-100"
                                                    >
                                                        Apply to Notes
                                                    </button>
                                                </div>
                                                <div className="p-4 bg-green-50 rounded-2xl border border-green-100 italic text-sm text-gray-700">
                                                    "{aiInsights.draft}"
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Mic size={48} className="mx-auto text-red-200 mb-4 animate-pulse" />
                                        <p className="text-gray-500">Audio is being recorded. AI insights will appear once the session ends.</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}
                    {/* Vital Signs */}
                    <Card className="border-0 shadow-lg p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <Activity size={20} className="mr-2 text-green-600" />
                            Vital Signs
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-600 mb-2 flex items-center">
                                    <Thermometer size={14} className="mr-1 text-red-500" />
                                    Temperature (°F)
                                </label>
                                <input
                                    type="text"
                                    value={vitalSigns.temperature}
                                    onChange={(e) => setVitalSigns({ ...vitalSigns, temperature: e.target.value })}
                                    placeholder="98.6"
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 mb-2 flex items-center">
                                    <Activity size={14} className="mr-1 text-blue-500" />
                                    BP (mmHg)
                                </label>
                                <input
                                    type="text"
                                    value={vitalSigns.bloodPressure}
                                    onChange={(e) => setVitalSigns({ ...vitalSigns, bloodPressure: e.target.value })}
                                    placeholder="120/80"
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 mb-2 flex items-center">
                                    <Heart size={14} className="mr-1 text-pink-500" />
                                    Heart Rate (bpm)
                                </label>
                                <input
                                    type="text"
                                    value={vitalSigns.heartRate}
                                    onChange={(e) => setVitalSigns({ ...vitalSigns, heartRate: e.target.value })}
                                    placeholder="72"
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 mb-2 flex items-center">
                                    <Weight size={14} className="mr-1 text-purple-500" />
                                    Weight (kg)
                                </label>
                                <input
                                    type="text"
                                    value={vitalSigns.weight}
                                    onChange={(e) => setVitalSigns({ ...vitalSigns, weight: e.target.value })}
                                    placeholder="70"
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 mb-2 flex items-center">
                                    <Ruler size={14} className="mr-1 text-indigo-500" />
                                    Height (cm)
                                </label>
                                <input
                                    type="text"
                                    value={vitalSigns.height}
                                    onChange={(e) => setVitalSigns({ ...vitalSigns, height: e.target.value })}
                                    placeholder="175"
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 mb-2 flex items-center">
                                    <Droplet size={14} className="mr-1 text-cyan-500" />
                                    SpO2 (%)
                                </label>
                                <input
                                    type="text"
                                    value={vitalSigns.oxygenLevel}
                                    onChange={(e) => setVitalSigns({ ...vitalSigns, oxygenLevel: e.target.value })}
                                    placeholder="98"
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Diagnosis */}
                    <Card className="border-0 shadow-lg p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <Clipboard size={20} className="mr-2 text-indigo-600" />
                            Diagnosis
                        </h3>
                        <textarea
                            value={diagnosis}
                            onChange={(e) => setDiagnosis(e.target.value)}
                            placeholder="Enter your diagnosis here..."
                            className="w-full p-4 bg-indigo-50 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[100px] text-sm"
                        />
                    </Card>

                    {/* Prescription */}
                    <Card className="border-0 shadow-lg overflow-hidden">
                        <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900 flex items-center">
                                <FileText className="mr-2 text-blue-600" size={20} />
                                Prescription
                            </h3>
                            <Button
                                onClick={handleAddMedicine}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 rounded-lg"
                            >
                                <Plus size={16} className="mr-2" /> Add Medicine
                            </Button>
                        </div>

                        <div className="p-6 space-y-4">
                            {medicines.map((med, index) => (
                                <div
                                    key={med.id}
                                    className="p-5 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all relative"
                                >
                                    <div className="absolute -left-4 top-6 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                                        {index + 1}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                        <div className="md:col-span-4 relative">
                                            <label className="text-xs font-bold text-gray-600 mb-2 block uppercase tracking-wider">
                                                Medicine Name
                                            </label>
                                            <div className="relative">
                                                <Search
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                                    size={16}
                                                />
                                                <input
                                                    type="text"
                                                    value={med.name}
                                                    onChange={(e) => handleMedicineChange(med.id, 'name', e.target.value)}
                                                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                    placeholder="Search medicine..."
                                                />
                                            </div>

                                            {/* Autocomplete Dropdown */}
                                            {activeMedicineId === med.id && suggestions.length > 0 && (
                                                <div className="absolute z-20 w-full mt-1 bg-white border-2 border-blue-200 rounded-xl shadow-2xl max-h-64 overflow-y-auto">
                                                    {suggestions.map((suggestion, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm flex justify-between items-center border-b border-gray-100 last:border-0"
                                                            onClick={() => selectMedicine(med.id, suggestion.name)}
                                                        >
                                                            <span className="font-semibold text-gray-800">{suggestion.name}</span>
                                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                                                {suggestion.type}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="text-xs font-bold text-gray-600 mb-2 block uppercase tracking-wider">
                                                Dosage
                                            </label>
                                            <input
                                                type="text"
                                                value={med.dosage}
                                                onChange={(e) => handleMedicineChange(med.id, 'dosage', e.target.value)}
                                                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                placeholder="500mg"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="text-xs font-bold text-gray-600 mb-2 block uppercase tracking-wider">
                                                Frequency
                                            </label>
                                            <input
                                                type="text"
                                                value={med.frequency}
                                                onChange={(e) => handleMedicineChange(med.id, 'frequency', e.target.value)}
                                                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                placeholder="1-0-1"
                                            />
                                        </div>

                                        <div className="md:col-span-3">
                                            <label className="text-xs font-bold text-gray-600 mb-2 block uppercase tracking-wider">
                                                Instructions
                                            </label>
                                            <input
                                                type="text"
                                                value={med.instructions}
                                                onChange={(e) =>
                                                    handleMedicineChange(med.id, 'instructions', e.target.value)
                                                }
                                                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                placeholder="After meals"
                                            />
                                        </div>

                                        <div className="md:col-span-1 flex items-end justify-center">
                                            {medicines.length > 1 && (
                                                <button
                                                    onClick={() => handleRemoveMedicine(med.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Doctor's Notes & Follow-up */}
                    <Card className="border-0 shadow-lg p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <FileText size={20} className="mr-2 text-yellow-600" />
                            Additional Notes & Advice
                        </h3>
                        <textarea
                            value={doctorNotes}
                            onChange={(e) => setDoctorNotes(e.target.value)}
                            placeholder="Add any additional instructions, lifestyle recommendations, or advice for the patient..."
                            className="w-full p-4 bg-yellow-50 border border-yellow-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:outline-none min-h-[120px] text-sm"
                        />

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center">
                                    <Calendar size={16} className="mr-2 text-blue-600" />
                                    Follow-up Date
                                </label>
                                <input
                                    type="date"
                                    value={followUpDate}
                                    onChange={(e) => setFollowUpDate(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center">
                                    <Clock size={16} className="mr-2 text-purple-600" />
                                    Duration (days)
                                </label>
                                <input
                                    type="number"
                                    placeholder="7"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Finalize Section */}
                    <Card className="border-0 shadow-lg overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50">
                        <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center space-x-4">
                                {doctor.signature ? (
                                    <div className="flex flex-col items-center bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                                        <img
                                            src={doctor.signature}
                                            alt="Signature"
                                            className="h-12 object-contain mb-2"
                                        />
                                        <span className="text-[10px] text-blue-700 font-bold uppercase tracking-wider">
                                            ✓ Verified Profile Signature
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-center text-blue-600 bg-blue-50 px-4 py-3 rounded-xl border border-blue-100 italic">
                                        <Info size={18} className="mr-2" />
                                        <p className="text-sm font-medium">Profile signature will be applied automatically.</p>
                                    </div>
                                )}
                                <div>
                                    <p className="font-bold text-gray-900">
                                        Dr. {doctor.user.first_name} {doctor.user.last_name}
                                    </p>
                                    <p className="text-sm text-gray-600">{doctor.specialization}</p>
                                </div>
                            </div>

                            <div className="flex space-x-3 w-full md:w-auto">
                                <Button
                                    variant="outline"
                                    className="flex-1 md:flex-none border-gray-300 hover:bg-white transition-colors"
                                >
                                    <Eye size={18} className="mr-2" />
                                    Preview
                                </Button>
                                <Button
                                    onClick={handleFinalize}
                                    loading={loading}
                                    variant="primary"
                                    className="flex-1 md:flex-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl shadow-xl shadow-blue-200"
                                >
                                    <Send size={18} className="mr-2" />
                                    Finalize & Send
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
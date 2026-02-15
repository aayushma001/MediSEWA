import React, { useState, useEffect, useRef } from 'react';
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
    MapPin,
    ChevronDown
} from 'lucide-react';

// Common dropdown options
const FREQUENCY_OPTIONS = [
    '1-0-0 (Once daily - Morning)',
    '0-1-0 (Once daily - Afternoon)',
    '0-0-1 (Once daily - Evening)',
    '1-0-1 (Twice daily - Morning & Evening)',
    '1-1-1 (Thrice daily)',
    '0-1-1 (Twice daily - Afternoon & Evening)',
    '1-1-0 (Twice daily - Morning & Afternoon)',
    '2-0-2 (4 times daily)',
    'SOS (As needed)',
    'BD (Twice a day)',
    'TDS (Three times a day)',
    'QID (Four times a day)',
    'HS (At bedtime)',
    'PRN (When necessary)'
];

const INSTRUCTION_OPTIONS = [
    'After meals',
    'Before meals',
    'With meals',
    'Empty stomach',
    'At bedtime',
    'With plenty of water',
    'Dissolve in water',
    'Chew before swallowing',
    'Do not crush',
    'Take with milk',
    'Avoid alcohol',
    'Complete the course',
    'As directed',
    'Apply locally',
    'For external use only'
];

const DOSAGE_OPTIONS = [
    '50mg', '100mg', '150mg', '200mg', '250mg', '300mg', '400mg', '500mg',
    '600mg', '650mg', '750mg', '850mg', '1000mg', '1mg', '2mg', '2.5mg',
    '5mg', '10mg', '20mg', '25mg', '40mg', '75mg', '80mg',
    '1 tablet', '2 tablets', '1 capsule', '2 capsules',
    '5ml', '10ml', '15ml', '1 teaspoon', '2 teaspoons',
    '1 puff', '2 puffs', '1 drop', '2 drops'
];

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
    // [Keep all existing state initialization code - no changes]
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
                father_name: '',
                illness_description: (appt as any)?.symptoms || (appt as any)?.patientCondition || 'General consultation',
                age: profile.age,
                gender: profile.gender,
                blood_group: profile.blood_group,
                address: profile.address || '',
                city: profile.city || '',
            } as any;
        }

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

    // [Keep patient fetch useEffect - no changes]
    useEffect(() => {
        let cancelled = false;
        const tryFetchPatient = async () => {
            if (initialPatient) return;
            const appt = appointment as any;
            const candidateId = appt?.patient_details?.id ?? appt?.patient_id ?? appt?.patient ?? (appt as any)?.id ?? null;
            if (!candidateId) return;
            const idStr = String(candidateId);
            try {
                const { patientsAPI } = await import('../../services/api');
                const data = await patientsAPI.getPatientDetail(idStr);
                if (!cancelled) setPatientData(data);
            } catch (e) {
                console.warn('Could not fetch full patient record', e);
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

    // Dropdown states
    const [activeMedicineId, setActiveMedicineId] = useState<string | null>(null);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showDosageDropdown, setShowDosageDropdown] = useState<string | null>(null);
    const [showFrequencyDropdown, setShowFrequencyDropdown] = useState<string | null>(null);
    const [showInstructionDropdown, setShowInstructionDropdown] = useState<string | null>(null);

    // [Keep video call states - no changes]
    const [showVideo, setShowVideo] = useState(false);
    const [micOn, setMicOn] = useState(true);
    const [cameraOn, setCameraOn] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [aiInsights, setAiInsights] = useState<{
        summary: string;
        points: string[];
        draft?: string;
    } | null>(null);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const socket = useRef<WebSocket | null>(null);
    const localStream = useRef<MediaStream | null>(null);

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
        setMedicines(prev => prev.map(m => (m.id === id ? { ...m, [field]: value } : m)));

        if (field === 'name') {
            setActiveMedicineId(id);
            if (value.trim()) {
                const filtered = medicinesData
                    .filter(m => m.name.toLowerCase().includes(value.toLowerCase()))
                    .slice(0, 10);
                setSuggestions(filtered);
            } else {
                setSuggestions([]);
            }
        }
    };

    const selectMedicine = (id: string, medicineData: any) => {
        setMedicines(prev => prev.map(m => m.id === id ? {
            ...m,
            name: medicineData.name,
            dosage: (medicineData.common_dosages && medicineData.common_dosages.length > 0)
                ? medicineData.common_dosages[0]
                : m.dosage
        } : m));
        setSuggestions([]);
        setActiveMedicineId(null);
    };

    const generatePDF = async () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;

        // ===== HEADER WITH LOGO =====
        try {
            // Try to fetch hospital logo from database
            const { getMediaUrl } = await import('../../services/api');
            const hospitalLogo = doctor.hospital_logo || '/assets/medisewa-logo.png';
            const logoUrl = hospitalLogo.startsWith('data:') ? hospitalLogo : getMediaUrl(hospitalLogo);

            // Add logo (top left)
            doc.addImage(logoUrl, 'PNG', 15, 10, 25, 25);
        } catch (e) {
            console.log('Logo not available, using text header');
        }

        // Hospital Name & Header
        doc.setFontSize(24);
        doc.setTextColor(0, 102, 204);
        doc.setFont('helvetica', 'bold');
        doc.text(hospitalName, 45, 20);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.setFont('helvetica', 'normal');
        doc.text("Excellence in Healthcare", 45, 27);
        doc.text("Digital Prescription System", 45, 32);

        // Horizontal divider
        doc.setLineWidth(0.5);
        doc.setDrawColor(0, 102, 204);
        doc.line(15, 38, pageWidth - 15, 38);

        // ===== DOCTOR INFO (Left Side) =====
        let currentY = 48;
        doc.setFontSize(13);
        doc.setTextColor(0);
        doc.setFont('helvetica', 'bold');
        doc.text(`Dr. ${doctor.user.first_name} ${doctor.user.last_name}`, 15, currentY);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80);
        doc.text(doctor.specialization || 'General Medicine', 15, currentY + 5);
        doc.text(doctor.qualification || 'MBBS, MD', 15, currentY + 10);
        if (doctor.nid) doc.text(`NMC Reg: ${doctor.nid}`, 15, currentY + 15);
        doc.text(`${doctor.user.email}`, 15, currentY + 20);
        doc.text(`${doctor.user.mobile}`, 15, currentY + 25);

        // ===== PATIENT INFO (Right Side) =====
        doc.setFontSize(11);
        doc.setTextColor(0);
        doc.setFont('helvetica', 'bold');
        const pName = `${patientData.user.first_name} ${patientData.user.last_name}`;
        doc.text('Patient Information', pageWidth - 15, currentY, { align: 'right' });

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Name: ${pName}`, pageWidth - 15, currentY + 5, { align: 'right' });
        doc.text(`Age/Sex: ${patientData.age} / ${patientData.gender}`, pageWidth - 15, currentY + 10, { align: 'right' });
        doc.text(`Blood Group: ${patientData.blood_group || 'N/A'}`, pageWidth - 15, currentY + 15, { align: 'right' });
        doc.text(`Mobile: ${patientData.user.mobile}`, pageWidth - 15, currentY + 20, { align: 'right' });
        doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, pageWidth - 15, currentY + 25, { align: 'right' });

        currentY += 40;

        // ===== MEDICAL CONTEXT SECTION =====
        doc.setFillColor(245, 247, 250);
        doc.rect(15, currentY - 5, pageWidth - 30, 35, 'F');

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0);

        const contextData = [
            ['Chief Complaint:', patientData.illness_description || 'General Checkup'],
            ['Allergies:', patientData.allergies || 'None recorded'],
            ['Current Medications:', patientData.medications || 'None'],
        ];

        let contextY = currentY;
        contextData.forEach(([label, value]) => {
            doc.text(label, 18, contextY);
            doc.setFont('helvetica', 'normal');
            const splitText = doc.splitTextToSize(value, 130);
            doc.text(splitText, 55, contextY);
            contextY += Math.max(6, splitText.length * 5);
        });

        currentY = contextY + 8;

        // ===== VITALS TABLE =====
        autoTable(doc, {
            startY: currentY,
            head: [['Blood Pressure', 'Temperature', 'SpO2', 'Heart Rate']],
            body: [[
                vitalSigns.bloodPressure || '-',
                vitalSigns.temperature || '-',
                vitalSigns.oxygenLevel || '-',
                vitalSigns.heartRate || '-'
            ]],
            theme: 'grid',
            headStyles: {
                fillColor: [0, 102, 204],
                textColor: 255,
                fontSize: 9,
                fontStyle: 'bold',
                halign: 'center'
            },
            bodyStyles: {
                fontSize: 10,
                halign: 'center',
                minCellHeight: 8
            },
            styles: {
                lineColor: [200, 200, 200],
                lineWidth: 0.1
            }
        });

        currentY = (doc as any).lastAutoTable.finalY + 12;

        // ===== DIAGNOSIS =====
        if (diagnosis) {
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 102, 204);
            doc.text('Diagnosis:', 15, currentY);

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0);
            const diagnosisText = doc.splitTextToSize(diagnosis, pageWidth - 35);
            doc.text(diagnosisText, 15, currentY + 6);
            currentY += 6 + (diagnosisText.length * 5) + 8;
        }

        // ===== Rx PRESCRIPTION =====
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 102, 204);
        doc.text('℞', 15, currentY);
        doc.setFontSize(16);
        doc.text('Prescription', 25, currentY);

        const medRows = medicines
            .filter(m => m.name) // Only include medicines with names
            .map((m, idx) => [
                `${idx + 1}. ${m.name}`,
                m.dosage || '-',
                m.frequency || '-',
                m.instructions || '-'
            ]);

        autoTable(doc, {
            startY: currentY + 5,
            head: [['Medicine', 'Dosage', 'Frequency', 'Instructions']],
            body: medRows,
            theme: 'striped',
            headStyles: {
                fillColor: [0, 102, 204],
                textColor: 255,
                fontSize: 10,
                fontStyle: 'bold'
            },
            styles: {
                fontSize: 9,
                cellPadding: 4,
                lineColor: [220, 220, 220]
            },
            alternateRowStyles: {
                fillColor: [245, 247, 250]
            },
            columnStyles: {
                0: { cellWidth: 55 },
                1: { cellWidth: 35 },
                2: { cellWidth: 40 },
                3: { cellWidth: 55 }
            }
        });

        currentY = (doc as any).lastAutoTable.finalY + 10;

        // ===== NOTES / ADVICE =====
        if (doctorNotes) {
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0);
            doc.text('Notes / Advice:', 15, currentY);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            const splitNotes = doc.splitTextToSize(doctorNotes, pageWidth - 30);
            doc.text(splitNotes, 15, currentY + 6);
            currentY += 6 + (splitNotes.length * 4) + 8;
        }

        // ===== FOOTER WITH SIGNATURE =====
        const footerY = pageHeight - 65;

        // Separator line
        doc.setDrawColor(230);
        doc.setLineWidth(0.5);
        doc.line(15, footerY, pageWidth - 15, footerY);

        // Doctor signature
        const signatureY = footerY + 8;
        try {
            const { getMediaUrl } = await import('../../services/api');
            const sigUrl = doctor.signature_image || doctor.signature;
            if (sigUrl) {
                const finalSigUrl = sigUrl.startsWith('data:') ? sigUrl : getMediaUrl(sigUrl);
                doc.addImage(finalSigUrl, 'PNG', pageWidth - 70, signatureY, 50, 20);
            }
        } catch (e) {
            console.error("Signature image error", e);
        }

        // Doctor details in footer
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0);
        doc.text(`Dr. ${doctor.user.first_name} ${doctor.user.last_name}`, 15, signatureY + 5);

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80);
        doc.text(doctor.specialization || 'General Physician', 15, signatureY + 10);
        doc.text(`${doctor.user.email} | ${doctor.user.mobile}`, 15, signatureY + 15);
        doc.text(`${doctor.city || 'Kathmandu'}, ${doctor.country || 'Nepal'}`, 15, signatureY + 20);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 51, 153);
        doc.text(`ID: ${doctor.doctor_unique_id || 'DOC-ID'}`, 15, signatureY + 27);

        // Digital signature line (right side)
        doc.setDrawColor(0, 102, 204);
        doc.setLineWidth(0.5);
        doc.line(pageWidth - 70, signatureY + 22, pageWidth - 20, signatureY + 22);
        doc.setFontSize(8);
        doc.setTextColor(0);
        doc.setFont('helvetica', 'normal');
        doc.text('Doctor\'s Signature', pageWidth - 45, signatureY + 27, { align: 'center' });

        // System watermark
        doc.setFontSize(7);
        doc.setTextColor(150);
        doc.setFont('helvetica', 'italic');
        doc.text('Generated by MediSEWA Digital Platform', pageWidth / 2, pageHeight - 12, { align: 'center' });
        doc.text(new Date().toLocaleString('en-GB'), pageWidth / 2, pageHeight - 7, { align: 'center' });

        return doc;
    };

    const handleFinalize = async () => {
        setLoading(true);
        try {
            const doc = await generatePDF();
            const fileName = `Prescription_${patientData.user.first_name}_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);

            if (appointment && appointment.id) {
                const pdfBlob = doc.output('blob');
                const formData = new FormData();
                formData.append('report_file', pdfBlob, fileName);
                formData.append('title', `Prescription - ${new Date().toLocaleDateString()}`);
                formData.append('description', `Consultation report for ${patientData.user.first_name} ${patientData.user.last_name}`);
                formData.append('appointment', String(appointment.id));

                try {
                    await appointmentsAPI.uploadMedicalReport(formData);
                    alert('✅ Prescription finalized! Saved to records and sent to patient via email.');
                    try {
                        await appointmentsAPI.updateAppointmentStatus(Number(appointment.id), 'completed');
                    } catch (sError) {
                        console.log("Status update handled", sError);
                    }
                } catch (uploadError) {
                    console.error("Upload failed", uploadError);
                    alert('⚠️ Prescription downloaded, but failed to save to server.');
                }
            } else {
                alert('✅ Prescription downloaded! (No appointment ID for server save)');
            }
            onComplete();
        } catch (error) {
            console.error("PDF Generation failed", error);
            alert("Failed to generate PDF");
        } finally {
            setLoading(false);
        }
    };

    // [Keep all video call functions - no changes to WebRTC code]
    const toggleVideoCall = async () => {
        if (!showVideo) {
            setShowVideo(true);
            await startWebRTC();
        } else {
            stopWebRTC();
            setShowVideo(false);
        }
    };

    const startWebRTC = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: cameraOn, audio: micOn });
            localStream.current = stream;
            if (localVideoRef.current) localVideoRef.current.srcObject = stream;

            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const signalingUrl = `${protocol}//${window.location.host}/ws/signaling/${appointment?.id}/`;
            socket.current = new WebSocket(signalingUrl);

            socket.current.onmessage = async (e) => {
                const data = JSON.parse(e.data);
                if (data.type === 'offer') await handleOffer(data.offer);
                else if (data.type === 'answer') await handleAnswer(data.answer);
                else if (data.type === 'candidate') await handleCandidate(data.candidate);
            };

            setupPeerConnection();
            const offer = await peerConnection.current!.createOffer();
            await peerConnection.current!.setLocalDescription(offer);
            socket.current.send(JSON.stringify({ type: 'offer', offer }));
        } catch (err) {
            console.error("WebRTC failed:", err);
            alert("Could not access camera/microphone");
        }
    };

    const setupPeerConnection = () => {
        const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
        peerConnection.current = new RTCPeerConnection(configuration);
        localStream.current?.getTracks().forEach(track => {
            peerConnection.current!.addTrack(track, localStream.current!);
        });
        peerConnection.current.ontrack = (event) => {
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
        };
        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate && socket.current) {
                socket.current.send(JSON.stringify({ type: 'candidate', candidate: event.candidate }));
            }
        };
    };

    const handleOffer = async (offer: RTCSessionDescriptionInit) => {
        if (!peerConnection.current) setupPeerConnection();
        await peerConnection.current!.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.current!.createAnswer();
        await peerConnection.current!.setLocalDescription(answer);
        socket.current?.send(JSON.stringify({ type: 'answer', answer }));
    };

    const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
        await peerConnection.current!.setRemoteDescription(new RTCSessionDescription(answer));
    };

    const handleCandidate = async (candidate: RTCIceCandidateInit) => {
        await peerConnection.current!.addIceCandidate(new RTCIceCandidate(candidate));
    };

    const stopWebRTC = () => {
        localStream.current?.getTracks().forEach(track => track.stop());
        peerConnection.current?.close();
        socket.current?.close();
        peerConnection.current = null;
        socket.current = null;
        localStream.current = null;
    };

    useEffect(() => {
        return () => stopWebRTC();
    }, []);

    const handleToggleRecording = () => {
        if (!isRecording) {
            setIsRecording(true);
            setAiInsights(null);
            const timer = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
            (window as any).recordingTimer = timer;
        } else {
            setIsRecording(false);
            clearInterval((window as any).recordingTimer);
            setRecordingTime(0);
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
                    draft: "Prescribe Azithromycin 500mg once daily for 3 days and Cetirizine 10mg at night."
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
            {/* [Keep Patient Profile Section - no changes] */}
            <Card className="border-0 shadow-sm bg-white rounded-3xl overflow-hidden p-8">
                <div className="flex flex-col md:flex-row gap-10 items-start">
                    <div className="relative group">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden ring-4 ring-blue-50 transition-all group-hover:ring-blue-100 shadow-xl">
                            <img
                                src={patientData.profile_image || `https://ui-avatars.com/api/?name=${patientData.user?.first_name || 'Patient'}+${patientData.user?.last_name || ''}&background=random&size=200`}
                                alt="Patient"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="absolute bottom-2 right-2 w-8 h-8 bg-green-500 border-4 border-white rounded-full"></div>
                    </div>

                    <div className="flex-1 space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    {patientData.user?.first_name || 'Patient'} {patientData.user?.last_name || ''}
                                </h1>
                                <p className="text-gray-500 font-medium">Patient ID: #{patientData.patient_unique_id || patientData.id || 'N/A'}</p>
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

                        <div className="flex flex-wrap gap-8 items-center border-y border-gray-50 py-6">
                            <div className="text-center md:text-left">
                                <span className="text-xl font-bold text-gray-900">{patientData.age || 'N/A'}</span>
                                <span className="ml-2 text-gray-500 font-medium">Age</span>
                            </div>
                            <div className="text-center md:text-left">
                                <span className="text-xl font-bold text-gray-900">
                                    {String(patientData.gender).charAt(0) || 'N/A'}
                                </span>
                                <span className="ml-2 text-gray-500 font-medium">Gender</span>
                            </div>
                            <div className="text-center md:text-left">
                                <span className="text-xl font-bold text-gray-900">{patientData.blood_group || 'N/A'}</span>
                                <span className="ml-2 text-gray-500 font-medium">Blood</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <div className="flex items-center text-sm text-gray-600">
                                    <Phone size={16} className="mr-3 text-blue-400" />
                                    <span className="font-medium">{patientData.user?.mobile || patientData.phone_number || 'N/A'}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <Mail size={16} className="mr-3 text-blue-400" />
                                    <span className="font-medium">{patientData.user?.email || 'N/A'}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <MapPin size={16} className="mr-3 text-blue-400" />
                                    <span className="font-medium">{patientData.address || 'N/A'}</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Chief Complaint</h4>
                                    <p className="text-sm font-bold text-red-600 bg-red-50 px-3 py-1 rounded-lg border border-red-100 inline-block">
                                        {patientData.illness_description}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Medical Details</h4>
                                    <div className="flex flex-wrap gap-2">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded ${patientData.allergies ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                                            Allergies: {patientData.allergies || 'None'}
                                        </span>
                                        <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded">
                                            Condition: {patientData.health_condition || 'Normal'}
                                        </span>
                                        <span className="text-[10px] font-bold bg-purple-50 text-purple-600 px-2 py-1 rounded">
                                            Meds: {patientData.medications || 'None'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* [Keep AI Insights section - no changes] */}
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
                                    <p className="text-gray-400 text-sm font-medium italic">Consultation summary will appear here...</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            )}

            {/* [Keep Video Call section - no changes] */}
            {showVideo && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in zoom-in duration-300">
                    <div className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 ring-1 ring-black/5">
                        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        <div className="absolute top-4 left-4 flex gap-2">
                            <span className="bg-black/50 text-white text-[10px] px-2 py-1 rounded-lg backdrop-blur-md uppercase tracking-wider font-bold">Patient Link</span>
                            <span className="bg-green-500 text-white text-[10px] px-2 py-1 rounded-lg uppercase tracking-wider font-bold">Live</span>
                        </div>
                    </div>
                    <div className="relative aspect-video bg-indigo-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-blue-400/20">
                        <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
                            <button onClick={() => {
                                setMicOn(!micOn);
                                if (localStream.current) localStream.current.getAudioTracks().forEach(t => t.enabled = !micOn);
                            }} className={`p-4 rounded-full backdrop-blur-md transition-all ${micOn ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-red-500 text-white'}`}><Mic size={20} /></button>
                            <button onClick={() => {
                                setCameraOn(!cameraOn);
                                if (localStream.current) localStream.current.getVideoTracks().forEach(t => t.enabled = !cameraOn);
                            }} className={`p-4 rounded-full backdrop-blur-md transition-all ${cameraOn ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-red-500 text-white'}`}><Video size={20} /></button>
                            <button onClick={toggleVideoCall} className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-xl shadow-red-500/20"><PhoneOff size={20} /></button>
                        </div>
                    </div>
                </div>
            )}

            {/* Clinical Information */}
            <div className="space-y-8">
                {/* [Keep Vitals & Diagnosis section - no changes] */}
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

                {/* IMPROVED PRESCRIPTION BLOCK WITH SMART DROPDOWNS */}
                <Card className="border-0 shadow-sm overflow-visible bg-white rounded-3xl flex flex-col">
                    <div className="bg-blue-600 px-8 py-6 flex justify-between items-center text-white rounded-t-3xl">
                        <div className="flex items-center">
                            <Stethoscope size={24} className="mr-3" />
                            <h3 className="font-bold text-xl">℞ Prescription</h3>
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
                            <div
                                key={med.id}
                                className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 hover:border-blue-200 transition-all relative group"
                                style={{
                                    zIndex: (activeMedicineId === med.id || showDosageDropdown === med.id || showFrequencyDropdown === med.id || showInstructionDropdown === med.id) ? 50 : (medicines.length - index)
                                }}
                            >
                                <div className="absolute -top-3 -left-2 bg-blue-100 text-blue-700 w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black shadow-sm ring-4 ring-white">
                                    {index + 1}
                                </div>
                                <div className="grid grid-cols-1 gap-6">
                                    {/* Medicine Name with Smart Autocomplete */}
                                    <div className="relative space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Medicine Name</label>
                                        <div className="relative">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                value={med.name}
                                                onChange={(e) => handleMedicineChange(med.id, 'name', e.target.value)}
                                                onFocus={() => {
                                                    setActiveMedicineId(med.id);
                                                    if (med.name.trim()) {
                                                        const filtered = medicinesData
                                                            .filter(m => m.name.toLowerCase().includes(med.name.toLowerCase()))
                                                            .slice(0, 10);
                                                        setSuggestions(filtered);
                                                    }
                                                }}
                                                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl text-base font-bold shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Start typing medicine name..."
                                            />
                                            {activeMedicineId === med.id && suggestions.length > 0 && (
                                                <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border-2 border-blue-200 overflow-hidden max-h-64 overflow-y-auto">
                                                    {suggestions.map((s, i) => (
                                                        <div
                                                            key={i}
                                                            onMouseDown={(e) => {
                                                                e.preventDefault();
                                                                selectMedicine(med.id, s);
                                                            }}
                                                            className="px-5 py-4 hover:bg-blue-50 cursor-pointer border-b last:border-0 border-gray-100"
                                                        >
                                                            <div className="font-bold text-gray-900">{s.name}</div>
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                {s.type} • {s.common_dosages?.join(', ')}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Dosage with Dropdown */}
                                        <div className="relative space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dosage</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={med.dosage}
                                                    onChange={(e) => handleMedicineChange(med.id, 'dosage', e.target.value)}
                                                    onFocus={() => setShowDosageDropdown(med.id)}
                                                    className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-2xl text-sm font-bold shadow-sm pr-10"
                                                    placeholder="Select or type..."
                                                />
                                                <ChevronDown
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                                                    size={18}
                                                    onClick={() => setShowDosageDropdown(showDosageDropdown === med.id ? null : med.id)}
                                                />
                                                {showDosageDropdown === med.id && (
                                                    <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border-2 border-gray-200 overflow-hidden max-h-48 overflow-y-auto">
                                                        {DOSAGE_OPTIONS.map((opt, i) => (
                                                            <div
                                                                key={i}
                                                                onMouseDown={(e) => {
                                                                    e.preventDefault();
                                                                    handleMedicineChange(med.id, 'dosage', opt);
                                                                    setShowDosageDropdown(null);
                                                                }}
                                                                className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm font-semibold text-gray-700 border-b last:border-0"
                                                            >
                                                                {opt}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Frequency with Dropdown */}
                                        <div className="relative space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Frequency</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={med.frequency}
                                                    onChange={(e) => handleMedicineChange(med.id, 'frequency', e.target.value)}
                                                    onFocus={() => setShowFrequencyDropdown(med.id)}
                                                    className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-2xl text-sm font-bold shadow-sm pr-10"
                                                    placeholder="Select or type..."
                                                />
                                                <ChevronDown
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                                                    size={18}
                                                    onClick={() => setShowFrequencyDropdown(showFrequencyDropdown === med.id ? null : med.id)}
                                                />
                                                {showFrequencyDropdown === med.id && (
                                                    <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border-2 border-gray-200 overflow-hidden max-h-48 overflow-y-auto">
                                                        {FREQUENCY_OPTIONS.map((opt, i) => (
                                                            <div
                                                                key={i}
                                                                onMouseDown={(e) => {
                                                                    e.preventDefault();
                                                                    handleMedicineChange(med.id, 'frequency', opt);
                                                                    setShowFrequencyDropdown(null);
                                                                }}
                                                                className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm font-semibold text-gray-700 border-b last:border-0"
                                                            >
                                                                {opt}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Instructions with Dropdown */}
                                        <div className="relative space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Instructions</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={med.instructions}
                                                    onChange={(e) => handleMedicineChange(med.id, 'instructions', e.target.value)}
                                                    onFocus={() => setShowInstructionDropdown(med.id)}
                                                    className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-2xl text-sm font-bold shadow-sm pr-10"
                                                    placeholder="Select or type..."
                                                />
                                                <ChevronDown
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                                                    size={18}
                                                    onClick={() => setShowInstructionDropdown(showInstructionDropdown === med.id ? null : med.id)}
                                                />
                                                {showInstructionDropdown === med.id && (
                                                    <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border-2 border-gray-200 overflow-hidden max-h-48 overflow-y-auto">
                                                        {INSTRUCTION_OPTIONS.map((opt, i) => (
                                                            <div
                                                                key={i}
                                                                onMouseDown={(e) => {
                                                                    e.preventDefault();
                                                                    handleMedicineChange(med.id, 'instructions', opt);
                                                                    setShowInstructionDropdown(null);
                                                                }}
                                                                className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm font-semibold text-gray-700 border-b last:border-0"
                                                            >
                                                                {opt}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Remove Button */}
                                    {medicines.length > 1 && (
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => handleRemoveMedicine(med.id)}
                                                className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-all"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* [Keep Additional Notes section - no changes] */}
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
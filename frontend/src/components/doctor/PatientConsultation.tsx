import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Appointment, Doctor, Medication } from '../../types';
import {
    Plus,
    Trash2,
    Send,
    ChevronLeft,
    Calendar,
    FileText,
    History,
    Activity,
    AlertCircle
} from 'lucide-react';

interface PatientConsultationProps {
    doctor: Doctor;
    appointment: Appointment;
    onBack: () => void;
    onComplete: () => void;
}

export const PatientConsultation: React.FC<PatientConsultationProps> = ({
    doctor,
    appointment,
    onBack,
    onComplete
}) => {
    const [medicines, setMedicines] = useState<Medication[]>([
        { id: '1', appointment: appointment.id, name: '', dosage: '', frequency: '', instructions: '', start_date: new Date().toISOString(), end_date: '', completed: false, timings: [] }
    ]);
    const [doctorMessage, setDoctorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAddMedicine = () => {
        setMedicines([...medicines, {
            id: Date.now().toString(),
            appointment: appointment.id,
            name: '',
            dosage: '',
            frequency: '',
            instructions: '',
            start_date: new Date().toISOString(),
            end_date: '',
            completed: false,
            timings: []
        }]);
    };

    const handleRemoveMedicine = (id: string) => {
        setMedicines(medicines.filter(m => m.id !== id));
    };

    const handleMedicineChange = (id: string, field: keyof Medication, value: any) => {
        setMedicines(medicines.map(m => m.id === id ? { ...m, [field]: value } : m));
    };

    const handleFinalize = async () => {
        setLoading(true);
        // Mock PDF generation and sending
        setTimeout(() => {
            alert('Consultation Finalized! PDF has been generated and sent to Admin and Patient.');
            setLoading(false);
            onComplete();
        }, 2000);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <button onClick={onBack} className="flex items-center text-gray-500 hover:text-gray-900 transition-colors">
                    <ChevronLeft size={20} className="mr-1" /> Back to Schedule
                </button>
                <div className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-bold flex items-center">
                    <Activity size={14} className="mr-2 animate-pulse" /> Consulting Active
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Patient Info & Condition */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-8 text-white">
                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4">
                                <FileText size={32} />
                            </div>
                            <h2 className="text-2xl font-bold">{appointment.patient_name}</h2>
                            <p className="text-blue-100 mt-1">ID: PAT-{appointment.patient.slice(0, 8)}</p>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Appointment Context</h3>
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-sm text-gray-700 font-medium">{appointment.instructions || 'No specific symptoms noted by patient.'}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center">
                                    <AlertCircle size={14} className="mr-1 text-orange-500" /> Current Condition
                                </h3>
                                <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100/50">
                                    <p className="text-sm text-orange-800 italic">
                                        {appointment.patientCondition || "Waiting for doctor's initial assessment..."}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <Button variant="ghost" size="sm" className="w-full justify-start text-gray-500">
                                    <History size={16} className="mr-2" /> View Full History
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Side: Consultation Form */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-8 shadow-xl border-0 rounded-3xl bg-white">
                        <div className="space-y-8">
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-gray-900">Prescribe Medicines</h3>
                                    <Button variant="outline" size="sm" onClick={handleAddMedicine} className="rounded-xl">
                                        <Plus size={16} className="mr-2" /> Add Medicine
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {medicines.map((med) => (
                                        <div key={med.id} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 relative group animate-in slide-in-from-right-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Input
                                                    label="Medicine Name"
                                                    value={med.name}
                                                    onChange={(e) => handleMedicineChange(med.id, 'name', e.target.value)}
                                                    placeholder="e.g. Paracetamol"
                                                />
                                                <Input
                                                    label="Dosage"
                                                    value={med.dosage}
                                                    onChange={(e) => handleMedicineChange(med.id, 'dosage', e.target.value)}
                                                    placeholder="e.g. 500mg"
                                                />
                                                <Input
                                                    label="Frequency"
                                                    value={med.frequency}
                                                    onChange={(e) => handleMedicineChange(med.id, 'frequency', e.target.value)}
                                                    placeholder="e.g. 1-0-1"
                                                />
                                                <Input
                                                    label="Instructions"
                                                    value={med.instructions}
                                                    onChange={(e) => handleMedicineChange(med.id, 'instructions', e.target.value)}
                                                    placeholder="e.g. After meal"
                                                />
                                            </div>
                                            {medicines.length > 1 && (
                                                <button
                                                    onClick={() => handleRemoveMedicine(med.id)}
                                                    className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-gray-900">Professional Advice / Message</h3>
                                <textarea
                                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[150px] text-sm"
                                    placeholder="Type your clinical assessment and advice for the patient..."
                                    value={doctorMessage}
                                    onChange={(e) => setDoctorMessage(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                                <div className="flex items-center space-x-4">
                                    {doctor.signature ? (
                                        <div className="text-center">
                                            <img src={doctor.signature} alt="Signature" className="h-10 object-contain mx-auto" />
                                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">Digitally Signed</p>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-red-500 italic">No signature found in profile</p>
                                    )}
                                </div>
                                <div className="flex space-x-3">
                                    <Button variant="ghost" onClick={onBack}>Cancel</Button>
                                    <Button
                                        variant="primary"
                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 shadow-lg shadow-blue-100"
                                        onClick={handleFinalize}
                                        loading={loading}
                                        disabled={!doctor.signature}
                                    >
                                        <Send size={18} className="mr-2" />
                                        Finalize & Send PDF
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Plus, Trash2, FileText, Send } from 'lucide-react';
import { Doctor } from '../../types';

interface Medicine {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
}

interface PrescriptionFormProps {
    doctor: Doctor;
    patient: any; // Using any for simplicity in mock
    onSend: (pdfData: any) => void;
}

export const PrescriptionForm: React.FC<PrescriptionFormProps> = ({ doctor, patient, onSend }) => {
    const [medicines, setMedicines] = useState<Medicine[]>([
        { name: '', dosage: '', frequency: '', duration: '' }
    ]);
    const [loading, setLoading] = useState(false);

    const medicineOptions = [
        'Paracetamol', 'Amoxicillin', 'Ibuprofen', 'Cetirizine', 'Metformin',
        'Atorvastatin', 'Amlodipine', 'Omeprazole', 'Losartan', 'Albuterol'
    ];

    const handleAddMedicine = () => {
        setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '' }]);
    };

    const handleRemoveMedicine = (index: number) => {
        setMedicines(medicines.filter((_, i) => i !== index));
    };

    const handleMedicineChange = (index: number, field: keyof Medicine, value: string) => {
        const newMedicines = [...medicines];
        newMedicines[index][field] = value;
        setMedicines(newMedicines);
    };

    const handleGeneratePDF = async () => {
        setLoading(true);
        // Mimic PDF generation logic
        setTimeout(() => {
            alert('PDF Generated and Sent to Patient & Admin!');
            setLoading(false);
            onSend({});
        }, 2000);
    };

    return (
        <Card className="max-w-4xl mx-auto border-0 shadow-2xl rounded-3xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl font-bold">Medical Prescription</h2>
                        <p className="text-blue-100 mt-2">MediSEWA Digital Health Records</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold">Dr. {doctor.user.first_name} {doctor.user.last_name}</p>
                        <p className="text-sm text-blue-100">{doctor.specialization}</p>
                        <p className="text-sm text-blue-100">NID: {doctor.nid}</p>
                    </div>
                </div>
            </div>

            <div className="p-8 space-y-8 bg-white">
                <div className="grid grid-cols-2 gap-8 border-b pb-8">
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Patient Information</h3>
                        <div className="space-y-2">
                            <p className="text-lg font-bold text-gray-900">{patient?.name || 'Test Patient'}</p>
                            <p className="text-sm text-gray-500">Age: 25 • Gender: Female</p>
                            <p className="text-sm text-gray-500">ID: PAT-12345</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Date</h3>
                        <p className="text-lg font-bold text-gray-900">{new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Medicines & Dosage</h3>
                        <Button variant="outline" size="sm" onClick={handleAddMedicine}>
                            <Plus size={16} className="mr-2" /> Add Medicine
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {medicines.map((med, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-2xl relative group border border-transparent hover:border-blue-200 transition-all">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Medicine Name</label>
                                    <div className="relative">
                                        <Input
                                            value={med.name}
                                            onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                                            placeholder="e.g. Paracetamol"
                                            className="bg-white"
                                        />
                                        {med.name && medicineOptions.some(opt => opt.toLowerCase().startsWith(med.name.toLowerCase()) && opt !== med.name) && (
                                            <div className="absolute top-full left-0 w-full bg-white border rounded-xl shadow-xl z-10 mt-1">
                                                {medicineOptions
                                                    .filter(opt => opt.toLowerCase().startsWith(med.name.toLowerCase()))
                                                    .map(opt => (
                                                        <button
                                                            key={opt}
                                                            className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm"
                                                            onClick={() => handleMedicineChange(index, 'name', opt)}
                                                        >
                                                            {opt}
                                                        </button>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Dosage</label>
                                    <Input
                                        value={med.dosage}
                                        onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                                        placeholder="e.g. 500mg"
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Frequency</label>
                                    <Input
                                        value={med.frequency}
                                        onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                                        placeholder="e.g. 1-0-1"
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Duration</label>
                                    <div className="flex space-x-2">
                                        <Input
                                            value={med.duration}
                                            onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                                            placeholder="e.g. 5 days"
                                            className="bg-white flex-1"
                                        />
                                        {medicines.length > 1 && (
                                            <button
                                                onClick={() => handleRemoveMedicine(index)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-end pt-8 border-t gap-8">
                    <div className="space-y-4 flex-1">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Doctor Digital Signature</h3>
                        {doctor.signature ? (
                            <div className="bg-white p-3 rounded-2xl border border-blue-100 shadow-sm w-fit">
                                <img src={doctor.signature} alt="Signature" className="h-10 object-contain" />
                                <p className="text-[10px] text-blue-600 font-bold uppercase mt-1">Verified from Profile</p>
                            </div>
                        ) : (
                            <div className="flex items-center text-blue-600 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 italic text-xs">
                                <FileText size={14} className="mr-2" />
                                <span>Signature will be applied from profile</span>
                            </div>
                        )}
                        <p className="text-sm font-bold text-gray-900 uppercase">Dr. {doctor.user.first_name} {doctor.user.last_name}</p>
                    </div>

                    <div className="flex space-x-3 w-full md:w-auto">
                        <Button variant="outline" className="flex-1 md:flex-none">
                            <FileText size={18} className="mr-2" /> Preview
                        </Button>
                        <Button
                            variant="primary"
                            className="flex-1 md:flex-none bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-200"
                            onClick={handleGeneratePDF}
                            loading={loading}
                        >
                            <Send size={18} className="mr-2" /> Finalize & Send PDF
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
};

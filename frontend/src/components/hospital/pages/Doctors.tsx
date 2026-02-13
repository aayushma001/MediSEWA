import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../../services/api';
import { DoctorProfile } from '../../../types';
import { HospitalSchedule } from '../../doctor/HospitalSchedule';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Plus, User, Calendar, Trash2, X, ArrowLeft, Loader } from 'lucide-react';

export const Doctors: React.FC = () => {
    const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [doctorIdInput, setDoctorIdInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);
    const [pendingDoctors, setPendingDoctors] = useState<any[]>([]);
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        setIsLoading(true);
        try {
            const activeData = await adminAPI.getConnections('active');
            setDoctors(activeData);

            const pendingData = await adminAPI.getConnections('pending');
            setPendingDoctors(pendingData);
        } catch (error) {
            console.error("Failed to fetch doctors:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConnect = async () => {
        if (!doctorIdInput) return;
        setIsLoading(true);
        try {
            await adminAPI.connectEntity(doctorIdInput);
            setMsg({ type: 'success', text: 'Doctor connected successfully!' });
            setDoctorIdInput('');
            setShowAddModal(false);
            fetchDoctors();
        } catch (error: any) {
            setMsg({ type: 'error', text: error.message || 'Failed to connect doctor' });
        } finally {
            setIsLoading(false);
        }
    };

    if (selectedDoctor) {
        return (
            <div className="space-y-6">
                <button
                    onClick={() => setSelectedDoctor(null)}
                    className="flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back to Doctor List
                </button>
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-blue-50">
                    <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
                        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                            {selectedDoctor.profile_picture ? (
                                <img src={selectedDoctor.profile_picture} alt="" className="w-full h-full object-cover rounded-2xl" />
                            ) : (
                                <User size={32} />
                            )}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Dr. {selectedDoctor.user.first_name} {selectedDoctor.user.last_name}</h2>
                            <p className="text-blue-600 font-medium">{selectedDoctor.specialization}</p>
                            <p className="text-gray-400 text-xs font-mono mt-1">ID: {selectedDoctor.doctor_unique_id}</p>
                        </div>
                    </div>

                    <HospitalSchedule
                        hospital={{
                            id: 'current',
                            name: 'Staff Dashboard',
                            address: 'Hospital Managed Schedule',
                            patients: 0,
                            color: 'bg-blue-600'
                        }}
                        doctorId={selectedDoctor.user.id}
                        onStartConsultation={() => { }}
                        isEditable={true}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-blue-50">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Hospital Doctors</h2>
                    <p className="text-gray-500 text-sm">Manage medical professionals affiliated with your hospital</p>
                </div>
                <Button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 flex items-center gap-2">
                    <Plus size={18} />
                    Add Doctor by ID
                </Button>
            </div>

            {msg && (
                <div className={`p-4 rounded-2xl flex items-center justify-between ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    <p className="font-medium">{msg.text}</p>
                    <button onClick={() => setMsg(null)}><X size={18} /></button>
                </div>
            )}

            {pendingDoctors.length > 0 && (
                <div className="space-y-4 mb-8">
                    <h3 className="text-lg font-bold text-amber-600 flex items-center gap-2">
                        <Loader className="w-5 h-5 animate-spin" />
                        Pending Invitations ({pendingDoctors.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pendingDoctors.map(doctor => (
                            <Card key={doctor.id} className="p-4 border-2 border-amber-100 bg-amber-50/20">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">Dr. {doctor.user.first_name} {doctor.user.last_name}</p>
                                            <p className="text-xs text-amber-600 font-medium">{doctor.specialization}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-amber-500 uppercase">Awaiting Approval</span>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {isLoading && !doctors.length && !pendingDoctors.length ? (
                <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl shadow-sm border border-blue-50">
                    <Loader className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                    <p className="text-gray-500">Loading your medical team...</p>
                </div>
            ) : !doctors.length && !pendingDoctors.length ? (
                <div className="bg-white rounded-3xl shadow-sm border border-blue-50 p-20 text-center">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <User size={40} className="text-blue-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Doctors Connected</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-8">
                        Connect with medical professionals using their unique IDs to manage their schedules and appointments.
                    </p>
                    <Button variant="outline" onClick={() => setShowAddModal(true)} className="border-blue-200 text-blue-600 hover:bg-blue-50">
                        Add Your First Doctor
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {doctors.map(doctor => (
                        <Card key={doctor.user.id} className="p-6 hover:shadow-xl transition-all border-0 shadow-sm group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg overflow-hidden">
                                    {doctor.profile_picture ? (
                                        <img src={doctor.profile_picture} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={24} />
                                    )}
                                </div>
                                <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                    Active
                                </div>
                            </div>
                            <h4 className="font-bold text-gray-900 text-lg">Dr. {doctor.user.first_name} {doctor.user.last_name}</h4>
                            <p className="text-blue-600 text-sm font-medium mb-4">{doctor.specialization}</p>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-2 text-gray-500 text-xs">
                                    <Calendar size={14} />
                                    <span>Joined {new Date(doctor.user.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400 text-[10px] font-mono">
                                    <span className="bg-gray-50 px-2 py-1 rounded">ID: {doctor.doctor_unique_id}</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={() => setSelectedDoctor(doctor)}
                                    className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border-0 py-2 text-sm font-bold"
                                >
                                    Manage Schedule
                                </Button>
                                <Button variant="outline" className="border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 px-3">
                                    <Trash2 size={18} />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md p-8 shadow-2xl relative">
                        <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Connect New Doctor</h3>
                        <p className="text-gray-500 text-sm mb-6">Enter the unique doctor ID generated during their registration.</p>

                        <div className="space-y-4">
                            <Input
                                label="Doctor Unique ID"
                                placeholder="e.g. DOC-JD-MBBS-P1D2C3W4"
                                value={doctorIdInput}
                                onChange={(e) => setDoctorIdInput(e.target.value)}
                                className="font-mono"
                            />
                            <div className="flex gap-3 pt-4">
                                <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">Cancel</Button>
                                <Button onClick={handleConnect} disabled={isLoading} className="flex-1 bg-blue-600 hover:bg-blue-700">
                                    {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : 'Connect Doctor'}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

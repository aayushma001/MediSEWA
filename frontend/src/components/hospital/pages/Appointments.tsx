import React, { useState, useEffect } from 'react';
import { appointmentsAPI } from '../../../services/api';
import { User, CheckCircle, XCircle, ExternalLink, Info } from 'lucide-react';

interface Appointment {
    id: number;
    patient_name: string;
    doctor_name: string;
    date: string;
    time_slot: string;
    status: string;
    consultation_type: string;
    symptoms: string;
    payment_screenshot: string | null;
    meeting_link: string | null;
    created_at: string;
}

export const Appointments: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const data = await appointmentsAPI.getHospitalAppointments();
            setAppointments(data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleStatusUpdate = async (id: number, status: string) => {
        try {
            await appointmentsAPI.updateAppointmentStatus(id, status);
            fetchAppointments();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update appointment status');
        }
    };

    const filteredAppointments = appointments.filter(apt =>
        filter === 'all' || apt.status === filter
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Appointment Management</h2>

                <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-100">
                    {[
                        { id: 'all', label: 'All' },
                        { id: 'pending', label: 'Pending Verification' },
                        { id: 'approved', label: 'Approved' },
                        { id: 'completed', label: 'Completed' },
                        { id: 'rejected', label: 'Rejected' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id)}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${filter === tab.id
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-20">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filteredAppointments.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="text-5xl mb-4 text-gray-300">📅</div>
                    <p className="text-gray-500 font-medium">No {filter} appointments found.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {filteredAppointments.map(apt => (
                        <div key={apt.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <div className="flex flex-col lg:flex-row gap-6">
                                    {/* Info Section */}
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${apt.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                        apt.status === 'pending' ? 'bg-blue-100 text-blue-700' :
                                                            apt.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {apt.status}
                                                    </span>
                                                    <span className="text-xs text-gray-400">ID: APT-{apt.id}</span>
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900">{apt.patient_name}</h3>
                                                <p className="text-blue-600 font-medium flex items-center gap-1">
                                                    <User size={14} /> Dr. {apt.doctor_name}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-gray-900">{apt.date}</p>
                                                <p className="text-xs text-gray-500">{apt.time_slot}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <p className="text-xs text-gray-400 font-bold uppercase mb-1 flex items-center gap-1">
                                                    <Info size={12} /> Symptoms
                                                </p>
                                                <p className="text-sm text-gray-700">{apt.symptoms || 'None reported'}</p>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Type</p>
                                                <p className="text-sm text-gray-700 capitalize">{apt.consultation_type} Consultation</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment/Action Section */}
                                    <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-6 flex flex-col justify-between">
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase mb-2">Payment Verification</p>
                                            {apt.payment_screenshot ? (
                                                <div className="relative group">
                                                    <img
                                                        src={apt.payment_screenshot}
                                                        alt="Payment"
                                                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                                    />
                                                    <a
                                                        href={apt.payment_screenshot}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-lg"
                                                    >
                                                        <ExternalLink size={20} />
                                                    </a>
                                                </div>
                                            ) : (
                                                <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-200">
                                                    <p className="text-xs text-gray-400">No screenshot uploaded</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-4 flex gap-2">
                                            {apt.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusUpdate(apt.id, 'approved')}
                                                        className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition flex items-center justify-center gap-1"
                                                    >
                                                        <CheckCircle size={14} /> Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(apt.id, 'rejected')}
                                                        className="flex-1 bg-white text-red-600 border border-red-200 py-2 rounded-lg text-sm font-bold hover:bg-red-50 transition flex items-center justify-center gap-1"
                                                    >
                                                        <XCircle size={14} /> Reject
                                                    </button>
                                                </>
                                            )}
                                            {apt.status === 'approved' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(apt.id, 'completed')}
                                                    className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition flex items-center justify-center gap-1"
                                                >
                                                    <CheckCircle size={14} /> Mark Completed
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

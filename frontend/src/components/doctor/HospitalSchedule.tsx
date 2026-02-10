import React from 'react';
import { Card } from '../ui/Card';
import { Clock, Users, ArrowRight } from 'lucide-react';
import { HospitalInfo } from './HospitalSelector';
import { Appointment } from '../../types';

interface HospitalScheduleProps {
    hospital: HospitalInfo;
    onStartConsultation: (appointment: Appointment) => void;
}

export const HospitalSchedule: React.FC<HospitalScheduleProps> = ({ hospital, onStartConsultation }) => {
    // Mock data for appointments
    const appointments: Appointment[] = [
        {
            id: 'app-1',
            patient: 'pat-1',
            doctor: 'doc-1',
            patient_name: 'Aayushma KC',
            doctor_name: 'Dr. Anish',
            date_time: '2026-02-02 09:00',
            instructions: 'Sudden high fever and body ache.',
            status: 'scheduled',
            patientCondition: 'Fever (102F), Cough, Headache',
            created_at: new Date().toISOString()
        },
        {
            id: 'app-2',
            patient: 'pat-2',
            doctor: 'doc-1',
            patient_name: 'Sushant Shrestha',
            doctor_name: 'Dr. Anish',
            date_time: '2026-02-02 10:30',
            instructions: 'Regular checkup for hypertension.',
            status: 'scheduled',
            patientCondition: 'Stable, BP 140/90',
            created_at: new Date().toISOString()
        }
    ];

    const slots = [
        { time: '09:00 AM - 10:00 AM', status: 'booked', appointment: appointments[0] },
        { time: '10:00 AM - 11:00 AM', status: 'available', appointment: null },
        { time: '11:00 AM - 12:00 PM', status: 'booked', appointment: appointments[1] },
        { time: '02:00 PM - 03:00 PM', status: 'available', appointment: null },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{hospital.name}</h2>
                    <p className="text-gray-500 text-sm mt-1">{hospital.address}</p>
                </div>
                <div className="flex space-x-2">
                    <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Active
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-900 flex items-center">
                            <Clock size={18} className="mr-2 text-blue-600" />
                            Time Slots Today
                        </h3>
                        <button className="text-blue-600 text-sm font-medium hover:underline">Edit Availability</button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {slots.map((slot, index) => (
                            <Card key={index} className={`border-l-4 ${slot.status === 'booked' ? 'border-l-blue-500 bg-blue-50/30' : 'border-l-green-500 bg-green-50/30'
                                } shadow-sm hover:shadow-md transition-shadow`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{slot.time}</p>
                                        <p className={`text-xs mt-1 ${slot.status === 'booked' ? 'text-blue-700 font-medium' : 'text-green-700 font-medium'
                                            }`}>
                                            {slot.status === 'booked' ? `Patient: ${slot.appointment?.patient_name}` : 'Available for booking'}
                                        </p>
                                    </div>
                                    {slot.status === 'booked' && (
                                        <button
                                            onClick={() => slot.appointment && onStartConsultation(slot.appointment)}
                                            className="text-blue-600 hover:bg-blue-600 hover:text-white p-2 rounded-xl transition-all shadow-sm bg-white"
                                            title="Start Consultation"
                                        >
                                            <ArrowRight size={16} />
                                        </button>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-bold text-gray-900 flex items-center mb-2">
                        <Users size={18} className="mr-2 text-indigo-600" />
                        Live Patient Queue
                    </h3>
                    <div className="bg-white rounded-3xl shadow-xl border-0 overflow-hidden">
                        {appointments.map((app, i) => (
                            <div
                                key={app.id}
                                onClick={() => onStartConsultation(app)}
                                className="p-5 flex items-center justify-between hover:bg-indigo-50/50 border-b border-gray-50 last:border-0 cursor-pointer group transition-colors"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shadow-sm">
                                        Q{i + 1}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{app.patient_name}</p>
                                        <div className="flex items-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                                            <Clock size={10} className="mr-1" /> {i * 12} MIN WAIT
                                        </div>
                                    </div>
                                </div>
                                <div className="p-2 bg-gray-50 text-gray-400 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                    <ArrowRight size={16} />
                                </div>
                            </div>
                        ))}
                        <button className="w-full py-3 text-sm text-indigo-600 font-bold hover:bg-indigo-50 transition-colors">
                            View All Patients
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

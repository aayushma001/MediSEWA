import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Clock, Users, ArrowRight, Coffee, Calendar, Plus, Trash2, Edit2, Loader } from 'lucide-react';
import { Hospital } from './DoctorDashboard';
import { Appointment } from '../../types';
import { adminAPI } from '../../services/api';
import { getStoredUser } from '../../utils/auth';

interface HospitalScheduleProps {
    hospital: Hospital;
    hospitalId?: string; // Optional if hospital prop has ID
    doctorId?: string; // Optional, defaults to current user
    onStartConsultation?: (appointment: Appointment) => void;
    isEditable?: boolean;
}

interface TimeSlot {
    id: string;
    time: string;
    status: 'available' | 'booked' | 'break' | 'emergency';
    appointment: Appointment | null;
}

interface ScheduleSession {
    id: string;
    startTime: string;
    endTime: string;
    slots: TimeSlot[];
    isFinalized: boolean;
}

export const HospitalSchedule: React.FC<HospitalScheduleProps> = ({ hospital, hospitalId: propHospitalId, doctorId: propDoctorId, onStartConsultation, isEditable = true }) => {
    const [sessions, setSessions] = useState<ScheduleSession[]>([]);
    const [newSessionStartTime, setNewSessionStartTime] = useState('09:00');
    const [newSessionEndTime, setNewSessionEndTime] = useState('17:00');
    const [showAddSession, setShowAddSession] = useState(false);
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const user = getStoredUser();
    const activeDoctorId = propDoctorId || (user?.user_type === 'doctor' ? user.doctor_profile?.id : null);
    const activeHospitalId = propHospitalId || hospital.id;

    // Calculate end date (10 days from selectedDate)
    const getEndDate = (startDateStr: string) => {
        const start = new Date(startDateStr);
        const end = new Date(start);
        end.setDate(start.getDate() + 10);
        return end.toISOString().split('T')[0];
    };

    const endDate = getEndDate(selectedDate);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    useEffect(() => {
        fetchSchedule();
    }, [activeDoctorId, activeHospitalId, selectedDate]);

    const fetchSchedule = async () => {
        if (!activeDoctorId || !activeHospitalId) return;
        setIsLoading(true);
        try {
            const data = await adminAPI.getSchedules(
                activeDoctorId,
                activeHospitalId,
                selectedDate
            );
            if (data && data.length > 0) {
                // Assuming session_data is a list of sessions or we map it
                setSessions(data[0].session_data || []);
            } else {
                setSessions([]);
                setShowAddSession(true);
            }
        } catch (error) {
            console.error("Failed to fetch schedule:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Generate time slots based on start and end time
    const generateSlots = (startTime: string, endTime: string): TimeSlot[] => {
        const generatedSlots: TimeSlot[] = [];
        const start = new Date(`${selectedDate} ${startTime}`);
        const end = new Date(`${selectedDate} ${endTime}`);

        let current = new Date(start);
        let slotIndex = 0;
        const totalMinutes = (end.getTime() - start.getTime()) / (60 * 1000);
        const totalSlots = Math.floor(totalMinutes / 10);
        const breakSlotIndex = Math.floor(totalSlots / 2); // Break in the middle

        while (current < end) {
            const nextSlot = new Date(current.getTime() + 10 * 60 * 1000);
            const hours = current.getHours().toString().padStart(2, '0');
            const minutes = current.getMinutes().toString().padStart(2, '0');
            const nextHours = nextSlot.getHours().toString().padStart(2, '0');
            const nextMinutes = nextSlot.getMinutes().toString().padStart(2, '0');

            const timeString = `${hours}:${minutes} - ${nextHours}:${nextMinutes}`;

            // All slots are available initially (no mock patients)
            const slotStatus: 'available' | 'booked' | 'break' | 'emergency' =
                slotIndex === breakSlotIndex ? 'break' : 'available';

            generatedSlots.push({
                id: `slot-${Date.now()}-${slotIndex}`,
                time: timeString,
                status: slotStatus,
                appointment: null
            });

            current = nextSlot;
            slotIndex++;
        }

        return generatedSlots;
    };

    const handleAddSession = () => {
        if (newSessionStartTime && newSessionEndTime) {
            const start = new Date(`${selectedDate} ${newSessionStartTime}`);
            const end = new Date(`${selectedDate} ${newSessionEndTime}`);

            if (end <= start) {
                alert('End time must be after start time');
                return;
            }

            // Check for overlapping sessions
            const hasOverlap = sessions.some(session => {
                const sessionStart = new Date(`${selectedDate} ${session.startTime}`);
                const sessionEnd = new Date(`${selectedDate} ${session.endTime}`);
                return (start < sessionEnd && end > sessionStart);
            });

            if (hasOverlap) {
                alert('This time range overlaps with an existing session');
                return;
            }

            const newSession: ScheduleSession = {
                id: `session-${Date.now()}`,
                startTime: newSessionStartTime,
                endTime: newSessionEndTime,
                slots: generateSlots(newSessionStartTime, newSessionEndTime),
                isFinalized: false
            };

            setSessions([...sessions, newSession]);
            setShowAddSession(false);

            // Reset form
            setNewSessionStartTime('09:00');
            setNewSessionEndTime('17:00');
        }
    };

    const handleFinalizeSession = async (sessionId: string) => {
        const updatedSessions = sessions.map(session =>
            session.id === sessionId
                ? { ...session, isFinalized: true }
                : session
        );

        setSessions(updatedSessions);

        if (!activeDoctorId || !activeHospitalId) {
            alert("Error: Missing Doctor or Hospital ID");
            return;
        }

        setIsLoading(true);
        try {
            // Generate all 10 dates
            const datesToSave: string[] = [];
            const start = new Date(selectedDate);
            for (let i = 0; i < 11; i++) { // From start to end (10 days difference = 11 days total including start/end if inclusive, or 10 days as per request)
                // The user said "if it is feb2,2026 then it will be upto 12 feb 2026" which is 11 days inclusive.
                // "it should be for 10 days"
                const current = new Date(start);
                current.setDate(start.getDate() + i);
                datesToSave.push(current.toISOString().split('T')[0]);
            }

            // Save for each date sequentially to avoid SQLite database locks
            for (const date of datesToSave) {
                await adminAPI.saveSchedule(
                    activeDoctorId,
                    activeHospitalId,
                    date,
                    updatedSessions
                );
            }

            console.log('Schedule saved successfully for the 10-day period');
            alert(`Schedule successfully saved for period: ${formatDate(selectedDate)} - ${formatDate(endDate)}`);
        } catch (error: any) {
            console.error('Failed to save schedule:', error);
            const errorMsg = error.response?.data?.error || error.message || 'Unknown error';
            alert(`Failed to save schedule: ${errorMsg}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteSession = async (sessionId: string) => {
        const session = sessions.find(s => s.id === sessionId);
        if (session && session.isFinalized) {
            if (!window.confirm('This session is finalized. Are you sure you want to delete it?')) {
                return;
            }
        }

        const updatedSessions = sessions.filter(s => s.id !== sessionId);
        setSessions(updatedSessions);

        // Auto-save if deleting a finalized session
        if (session?.isFinalized) {
            try {
                await adminAPI.saveSchedule(
                    activeDoctorId!,
                    activeHospitalId,
                    selectedDate,
                    updatedSessions
                );
            } catch (error: any) {
                console.error("Failed to update schedule after deletion:", error);
                const errorMsg = error.response?.data?.error || error.message || 'Unknown error';
                alert(`Failed to auto-save change: ${errorMsg}`);
            }
        }
    };

    const handleEditSession = (sessionId: string) => {
        const session = sessions.find(s => s.id === sessionId);
        if (session && session.isFinalized) {
            alert('Cannot edit a finalized session. Please delete and create a new one.');
            return;
        }
        setEditingSessionId(sessionId);
    };

    const handleUpdateSession = (sessionId: string, newStart: string, newEnd: string) => {
        const start = new Date(`${selectedDate} ${newStart}`);
        const end = new Date(`${selectedDate} ${newEnd}`);

        if (end <= start) {
            alert('End time must be after start time');
            return;
        }

        // Check for overlapping with other sessions
        const hasOverlap = sessions.some(session => {
            if (session.id === sessionId) return false; // Don't check against itself
            const sessionStart = new Date(`${selectedDate} ${session.startTime}`);
            const sessionEnd = new Date(`${selectedDate} ${session.endTime}`);
            return (start < sessionEnd && end > sessionStart);
        });

        if (hasOverlap) {
            alert('This time range overlaps with another session');
            return;
        }

        setSessions(sessions.map(session =>
            session.id === sessionId
                ? {
                    ...session,
                    startTime: newStart,
                    endTime: newEnd,
                    slots: generateSlots(newStart, newEnd)
                }
                : session
        ));
        setEditingSessionId(null);
    };

    const getSlotCardClasses = (status: string) => {
        switch (status) {
            case 'booked':
                return 'border-l-blue-500 bg-blue-50/30';
            case 'emergency':
                return 'border-l-red-500 bg-red-50/30';
            case 'break':
                return 'border-l-yellow-500 bg-yellow-50/30';
            default:
                return 'border-l-green-500 bg-green-50/30';
        }
    };

    const getSlotTextColor = (status: string) => {
        switch (status) {
            case 'booked':
                return 'text-blue-700';
            case 'emergency':
                return 'text-red-700';
            case 'break':
                return 'text-yellow-700';
            default:
                return 'text-green-700';
        }
    };

    const getSlotLabel = (slot: TimeSlot) => {
        if (slot.status === 'break') return 'Break Time';
        if (slot.status === 'emergency') return `EMERGENCY: ${slot.appointment?.patient_name}`;
        if (slot.status === 'booked') return `Patient: ${slot.appointment?.patient_name}`;
        return 'Available for booking';
    };

    // Get all waiting patients across all sessions
    const allWaitingPatients = sessions
        .flatMap(session => session.slots)
        .filter(slot => slot.status === 'booked' || slot.status === 'emergency');

    // Calculate total stats
    const totalSlots = sessions.reduce((acc, session) => acc + session.slots.length, 0);
    const availableSlots = sessions.reduce(
        (acc, session) => acc + session.slots.filter(s => s.status === 'available').length,
        0
    );

    if (isLoading && sessions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl shadow-xl">
                <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Loading schedule...</p>
            </div>
        );
    }

    return (
        <div className="relative space-y-6">
            {isLoading && (
                <div className="absolute top-0 right-0 p-2">
                    <Loader className="w-5 h-5 text-blue-600 animate-spin" />
                </div>
            )}
            {/* Hospital Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{hospital.name || 'Hospital Name'}</h2>
                    <p className="text-gray-500 text-sm mt-1">{hospital.address}</p>
                    <div className="mt-4 flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-600">Schedule Period (10 Days):</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <span className="text-gray-400 font-bold">to</span>
                            <div className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                                {formatDate(endDate)}
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 italic mt-1">
                            Creating a schedule will automatically apply it from {formatDate(selectedDate)} through {formatDate(endDate)}.
                        </p>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Active
                    </div>
                    <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center">
                        <Calendar size={12} className="mr-1" />
                        Today
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            {sessions.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-0">
                        <div className="text-sm text-blue-700 font-medium">Total Sessions</div>
                        <div className="text-2xl font-bold text-blue-900 mt-1">{sessions.length}</div>
                    </Card>
                    <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-0">
                        <div className="text-sm text-green-700 font-medium">Available Slots</div>
                        <div className="text-2xl font-bold text-green-900 mt-1">{availableSlots}</div>
                    </Card>
                    <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-0">
                        <div className="text-sm text-purple-700 font-medium">Total Slots</div>
                        <div className="text-2xl font-bold text-purple-900 mt-1">{totalSlots}</div>
                    </Card>
                    <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-0">
                        <div className="text-sm text-orange-700 font-medium">Patients Waiting</div>
                        <div className="text-2xl font-bold text-orange-900 mt-1">{allWaitingPatients.length}</div>
                    </Card>
                </div>
            )}

            {/* Add New Session Button */}
            {isEditable && !showAddSession && (
                <button
                    onClick={() => setShowAddSession(true)}
                    className="w-full p-4 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 text-blue-700 font-bold"
                >
                    <Plus size={20} />
                    Add Another Working Session
                </button>
            )}

            {/* Add Session Form */}
            {isEditable && showAddSession && (
                <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                        <Clock size={20} className="mr-2 text-blue-600" />
                        Add Working Hours Session for {hospital.name}
                    </h3>
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">From:</label>
                            <input
                                type="time"
                                value={newSessionStartTime}
                                onChange={(e) => setNewSessionStartTime(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">To:</label>
                            <input
                                type="time"
                                value={newSessionEndTime}
                                onChange={(e) => setNewSessionEndTime(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            onClick={handleAddSession}
                            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                        >
                            Generate Slots
                        </button>
                        {sessions.length > 0 && (
                            <button
                                onClick={() => setShowAddSession(false)}
                                className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </Card>
            )}

            {/* Display All Sessions */}
            {sessions.map((session, sessionIndex) => (
                <div key={session.id} className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <h3 className="font-bold text-gray-900 flex items-center">
                                <Clock size={18} className="mr-2 text-blue-600" />
                                Session {sessionIndex + 1}: {session.startTime} - {session.endTime}
                                <span className="ml-2 text-sm text-gray-500">
                                    ({session.slots.length} slots)
                                </span>
                            </h3>
                            {session.isFinalized && (
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                    ✓ Finalized
                                </span>
                            )}
                        </div>
                        <div className="flex gap-2">
                            {isEditable && !session.isFinalized ? (
                                <>
                                    <button
                                        onClick={() => handleEditSession(session.id)}
                                        className="px-3 py-1.5 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors text-sm flex items-center gap-1"
                                    >
                                        <Edit2 size={14} />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteSession(session.id)}
                                        className="px-3 py-1.5 bg-red-100 text-red-700 font-medium rounded-lg hover:bg-red-200 transition-colors text-sm flex items-center gap-1"
                                    >
                                        <Trash2 size={14} />
                                        Delete
                                    </button>
                                    <button
                                        onClick={() => handleFinalizeSession(session.id)}
                                        className="px-4 py-1.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors shadow-md text-sm"
                                    >
                                        Finalize
                                    </button>
                                </>
                            ) : (
                                isEditable && (
                                    <button
                                        onClick={() => handleDeleteSession(session.id)}
                                        className="px-3 py-1.5 bg-red-100 text-red-700 font-medium rounded-lg hover:bg-red-200 transition-colors text-sm flex items-center gap-1"
                                    >
                                        <Trash2 size={14} />
                                        Delete
                                    </button>
                                )
                            )}
                        </div>
                    </div>

                    {/* Edit Form */}
                    {editingSessionId === session.id && (
                        <Card className="p-4 bg-yellow-50 border-2 border-yellow-300 mb-4">
                            <h4 className="font-bold text-gray-900 mb-3 text-sm">Edit Session Times</h4>
                            <div className="flex items-center gap-3 flex-wrap">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-gray-700">From:</label>
                                    <input
                                        type="time"
                                        defaultValue={session.startTime}
                                        id={`edit-start-${session.id}`}
                                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-gray-700">To:</label>
                                    <input
                                        type="time"
                                        defaultValue={session.endTime}
                                        id={`edit-end-${session.id}`}
                                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        const startInput = document.getElementById(`edit-start-${session.id}`) as HTMLInputElement;
                                        const endInput = document.getElementById(`edit-end-${session.id}`) as HTMLInputElement;
                                        handleUpdateSession(session.id, startInput.value, endInput.value);
                                    }}
                                    className="px-4 py-1.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 text-sm"
                                >
                                    Update
                                </button>
                                <button
                                    onClick={() => setEditingSessionId(null)}
                                    className="px-4 py-1.5 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </Card>
                    )}

                    {/* Slots Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {session.slots.map((slot) => (
                            <Card
                                key={slot.id}
                                className={`border-l-4 ${getSlotCardClasses(slot.status)} shadow-sm hover:shadow-md transition-all ${slot.status !== 'break' && slot.status !== 'available' ? 'cursor-pointer' : ''
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-gray-900">{slot.time}</p>
                                        <p className={`text-[10px] mt-1 font-medium ${getSlotTextColor(slot.status)}`}>
                                            {slot.status === 'break' && <Coffee size={10} className="inline mr-1" />}
                                            {getSlotLabel(slot)}
                                        </p>
                                        {slot.appointment && slot.status !== 'break' && (
                                            <p className="text-[9px] text-gray-500 mt-1 truncate">
                                                {slot.appointment.patientCondition}
                                            </p>
                                        )}
                                    </div>
                                    {(slot.status === 'booked' || slot.status === 'emergency') && (
                                        <button
                                            onClick={() => slot.appointment && onStartConsultation?.(slot.appointment)}
                                            className={`${slot.status === 'emergency'
                                                ? 'text-red-600 hover:bg-red-600 animate-pulse'
                                                : 'text-blue-600 hover:bg-blue-600'
                                                } hover:text-white p-1.5 rounded-lg transition-all shadow-sm bg-white ml-2`}
                                            title="Start Consultation"
                                        >
                                            <ArrowRight size={14} />
                                        </button>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Divider between sessions */}
                    {sessionIndex < sessions.length - 1 && (
                        <div className="border-t-2 border-dashed border-gray-300 my-6"></div>
                    )}
                </div>
            ))}

            {/* Live Patient Queue - Only show if there are patients */}
            {allWaitingPatients.length > 0 && (
                <div className="mt-8">
                    <h3 className="font-bold text-gray-900 flex items-center mb-4">
                        <Users size={18} className="mr-2 text-indigo-600" />
                        Live Patient Queue ({allWaitingPatients.length} waiting)
                    </h3>
                    <div className="bg-white rounded-3xl shadow-xl border-0 overflow-hidden">
                        {allWaitingPatients.map((slot, i) => (
                            <div
                                key={slot.id}
                                onClick={() => slot.appointment && onStartConsultation?.(slot.appointment)}
                                className={`p-5 flex items-center justify-between border-b border-gray-50 last:border-0 cursor-pointer group transition-colors ${slot.status === 'emergency'
                                    ? 'hover:bg-red-50/50 bg-red-50/20'
                                    : 'hover:bg-indigo-50/50'
                                    }`}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-sm ${slot.status === 'emergency'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-indigo-100 text-indigo-700'
                                        }`}>
                                        {slot.status === 'emergency' ? '🚨' : `Q${i + 1}`}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{slot.appointment?.patient_name}</p>
                                        <div className="flex items-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                                            <Clock size={10} className="mr-1" />
                                            {slot.time.split(' - ')[0]} • {slot.appointment?.patientCondition}
                                        </div>
                                        {slot.status === 'emergency' && (
                                            <span className="text-[9px] text-red-600 font-bold">EMERGENCY CASE</span>
                                        )}
                                    </div>
                                </div>
                                <div className={`p-2 rounded-xl transition-all ${slot.status === 'emergency'
                                    ? 'bg-red-50 text-red-400 group-hover:bg-red-600 group-hover:text-white'
                                    : 'bg-gray-50 text-gray-400 group-hover:bg-indigo-600 group-hover:text-white'
                                    }`}>
                                    <ArrowRight size={16} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Legend - Only show if sessions exist */}
            {sessions.length > 0 && (
                <div className="flex gap-4 items-center text-xs flex-wrap bg-gray-50 p-4 rounded-lg">
                    <span className="font-bold text-gray-700">Legend:</span>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span>Available</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-blue-500 rounded"></div>
                        <span>Booked</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                        <span>Break Time</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-red-500 rounded animate-pulse"></div>
                        <span>Emergency</span>
                    </div>
                </div>
            )}

            {/* Empty State - Show when no sessions created */}
            {sessions.length === 0 && (
                <Card className="p-12 text-center border-2 border-dashed border-gray-300">
                    <Clock size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No Schedule Set</h3>
                    <p className="text-sm text-gray-500 mb-4">
                        Add your working hours to create appointment slots for {hospital.name}
                    </p>
                    <p className="text-xs text-gray-400">
                        You can add multiple sessions for different times of the day
                    </p>
                </Card>
            )}
        </div>
    );
};
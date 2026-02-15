import React, { useState, useEffect } from 'react';
import { Users, UserRound, Calendar, CreditCard, Clock, Activity } from 'lucide-react';
import { adminAPI, appointmentsAPI } from '../../../services/api';

export const DashboardHome: React.FC = () => {
    const [stats, setStats] = useState({
        appointments_today: 0,
        total_appointments: 0,
        total_patients: 0,
        active_doctors: 0,
        revenue: 0,
        emergency_cases: 0
    });
    const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                const [statsData, appointmentsData] = await Promise.all([
                    adminAPI.getDashboardStats(),
                    appointmentsAPI.getHospitalAppointments()
                ]);
                setStats(statsData);
                setRecentAppointments(Array.isArray(appointmentsData) ? appointmentsData.slice(0, 5) : []);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-NP', {
            style: 'currency',
            currency: 'NPR',
        }).format(value);
    };

    return (
        <div className="animate-in fade-in duration-500">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Hospital Overview</h2>
                <p className="text-gray-500 text-sm mt-1">Real-time metrics for your facility</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Total Doctors', value: stats.active_doctors, icon: Users, color: 'blue', fill: 65 },
                    { label: 'Unique Patients', value: stats.total_patients, icon: UserRound, color: 'green', fill: 45 },
                    { label: 'Today\'s Appointments', value: stats.appointments_today, icon: Calendar, color: 'red', fill: 80 },
                    { label: 'Calculated Revenue', value: formatCurrency(stats.revenue), icon: CreditCard, color: 'yellow', fill: 30 },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`flex items-center justify-center h-12 w-12 rounded-xl bg-${stat.color}-50 text-${stat.color}-500 group-hover:scale-110 transition-transform`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg bg-${stat.color}-50 text-${stat.color}-600`}>
                                Live
                            </span>
                        </div>
                        <div className="text-gray-500 text-sm font-medium">{stat.label}</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Appointments List */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="text-gray-900 font-bold text-lg">Recent Appointments</h3>
                        <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700">View All</button>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {isLoading ? (
                            <div className="p-12 text-center text-gray-400">Loading appointments...</div>
                        ) : recentAppointments.length > 0 ? (
                            recentAppointments.map((apt, i) => (
                                <div key={i} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${apt.is_emergency ? 'bg-red-100 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                            {apt.is_emergency ? '!' : (apt.patient_name?.charAt(0) || 'P')}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900 flex items-center gap-2">
                                                {apt.patient_name}
                                                {apt.is_emergency && (
                                                    <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full border border-red-200 font-bold">
                                                        EMERGENCY
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500 flex items-center gap-1">
                                                <Clock className="h-3 w-3" /> {apt.time_slot}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-xs font-bold px-2 py-1 rounded-full ${apt.status === 'completed' ? 'bg-green-50 text-green-600' :
                                            apt.status === 'approved' ? 'bg-blue-50 text-blue-600' :
                                                'bg-yellow-50 text-yellow-600'
                                            }`}>
                                            {apt.status.toUpperCase()}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">{apt.date}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center text-gray-400">
                                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                No recent appointments found.
                            </div>
                        )}
                    </div>
                </div>

                {/* Additional Stats / Quick Actions */}
                <div className="space-y-6">
                    <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200">
                        <h3 className="font-bold text-lg mb-2">Doctor Availability</h3>
                        <p className="text-indigo-100 text-sm mb-4">Total active doctors connected to your hospital.</p>
                        <div className="text-4xl font-bold mb-4">{stats.active_doctors}</div>
                        <button
                            onClick={() => window.location.href = '/hospital/doctors'}
                            className="w-full py-2.5 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors"
                        >
                            Manage Doctors
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900">Today's Load</h3>
                            <Activity className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs font-medium mb-1.5">
                                    <span className="text-gray-500">Appointments</span>
                                    <span className="text-gray-900">{stats.appointments_today}</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 w-[60%]"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-medium mb-1.5">
                                    <span className="text-gray-500">Emergency</span>
                                    <span className="text-gray-900">{stats.emergency_cases}</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-red-500 w-[15%]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

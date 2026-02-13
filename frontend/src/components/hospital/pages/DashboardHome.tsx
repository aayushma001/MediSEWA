import React from 'react';
import { Users, UserRound, Calendar, CreditCard } from 'lucide-react';

export const DashboardHome: React.FC = () => {
    const hasData = false;

    return (
        <div>
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
                <p className="text-gray-500 text-sm mt-1">Key metrics and latest activity</p>
            </div>

            {/* Stats Cards - Empty State (0) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Doctors', value: hasData ? 168 : 0, icon: Users, color: 'blue', fill: 0 },
                    { label: 'Patients', value: hasData ? 487 : 0, icon: UserRound, color: 'green', fill: 0 },
                    { label: 'Appointments', value: hasData ? 485 : 0, icon: Calendar, color: 'red', fill: 0 },
                    { label: 'Revenue', value: hasData ? '$62,523' : '$0.00', icon: CreditCard, color: 'yellow', fill: 0 },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`flex items-center justify-center h-12 w-12 rounded-lg bg-${stat.color}-50 text-${stat.color}-500`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full bg-${stat.color}-50 text-${stat.color}-600`}>
                                +0%
                            </span>
                        </div>
                        <div className="text-gray-500 text-sm font-medium">{stat.label}</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</div>
                        <div className={`mt-3 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden`}>
                            <div className={`h-full bg-${stat.color}-500 w-[${stat.fill}%]`}></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty Charts & Lists Placeholders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[300px] flex flex-col items-center justify-center text-center">
                    <div className="bg-gray-50 p-4 rounded-full mb-3">
                        <CreditCard className="h-8 w-8 text-gray-300" />
                    </div>
                    <h3 className="text-gray-900 font-medium">No Revenue Data</h3>
                    <p className="text-gray-400 text-sm mt-1">Revenue analytics will appear here once transactions occur.</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[300px] flex flex-col items-center justify-center text-center">
                    <div className="bg-gray-50 p-4 rounded-full mb-3">
                        <Users className="h-8 w-8 text-gray-300" />
                    </div>
                    <h3 className="text-gray-900 font-medium">No Activity Stats</h3>
                    <p className="text-gray-400 text-sm mt-1">Patient and doctor activity trends will show here.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[200px] flex flex-col items-center justify-center text-center p-8">
                <h3 className="text-gray-900 font-medium mb-1">Recent Appointments</h3>
                <p className="text-gray-400 text-sm mb-4">No appointments scheduled yet.</p>
                <button className="px-4 py-2 bg-[#00d0f1] text-white rounded-lg text-sm hover:bg-[#00c0e1] transition-colors">
                    Refresh List
                </button>
            </div>
        </div>
    );
};

import React from 'react';

export const Appointments: React.FC = () => {
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Appointments</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                <p className="text-gray-500">No appointments found.</p>
            </div>
        </div>
    );
};

import React from 'react';

export const Patients: React.FC = () => {
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Patients</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                <p className="text-gray-500">No patients found.</p>
            </div>
        </div>
    );
};

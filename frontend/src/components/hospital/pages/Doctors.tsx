import React from 'react';

export const Doctors: React.FC = () => {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Doctors</h2>
                <button className="px-4 py-2 bg-[#00d0f1] text-white rounded-lg text-sm hover:bg-[#00c0e1] transition-colors">
                    Add New Doctor
                </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                <p className="text-gray-500">No doctors registered yet.</p>
            </div>
        </div>
    );
};

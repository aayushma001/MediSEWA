import React from 'react';

export const Reviews: React.FC = () => {
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Reviews</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                <p className="text-gray-500">No reviews yet.</p>
            </div>
        </div>
    );
};

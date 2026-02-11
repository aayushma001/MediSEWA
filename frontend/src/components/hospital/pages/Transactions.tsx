import React from 'react';

export const Transactions: React.FC = () => {
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Transactions</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                <p className="text-gray-500">No transactions found.</p>
            </div>
        </div>
    );
};

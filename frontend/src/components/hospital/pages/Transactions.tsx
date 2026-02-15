import React, { useState, useEffect } from 'react';
import { appointmentsAPI, MEDIA_URL } from '../../../services/api';
import { Clock, XCircle, AlertCircle, Eye, Download } from 'lucide-react';

export const Transactions: React.FC = () => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedProof, setSelectedProof] = useState<string | null>(null);

    useEffect(() => {
        const fetchTransactions = async () => {
            setIsLoading(true);
            try {
                const data = await appointmentsAPI.getHospitalAppointments();
                setTransactions(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Failed to fetch transactions:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed': return 'bg-green-100 text-green-700';
            case 'approved': return 'bg-blue-100 text-blue-700';
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Transaction History</h2>
                    <p className="text-gray-500 text-sm mt-1">Monitor and verify patient payments</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Patient & Ref</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Payment Proof</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">Loading transactions...</td>
                                </tr>
                            ) : transactions.length > 0 ? (
                                transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{tx.patient_name}</div>
                                            <div className="text-xs text-gray-400">#{tx.booking_reference || tx.id}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-700">{tx.date}</div>
                                            <div className="text-xs text-gray-400 flex items-center gap-1">
                                                <Clock className="h-3 w-3" /> {tx.time_slot}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(tx.status)}`}>
                                                {tx.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                            Rs. {tx.doctor_details?.consultation_fee || 500}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {tx.payment_screenshot ? (
                                                <button
                                                    onClick={() => setSelectedProof(tx.payment_screenshot)}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors"
                                                >
                                                    <Eye className="h-3.5 w-3.5" /> View Proof
                                                </button>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">No proof uploaded</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                                                <AlertCircle className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">No transactions found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Proof Modal */}
            {selectedProof && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
                    onClick={() => setSelectedProof(null)}
                >
                    <div
                        className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full shadow-2xl animate-in zoom-in-95 duration-300"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-xl text-gray-900">Payment Verification</h3>
                            <button onClick={() => setSelectedProof(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <XCircle className="h-6 w-6 text-gray-400" />
                            </button>
                        </div>
                        <div className="p-4 bg-gray-50 flex items-center justify-center min-h-[400px]">
                            <img
                                src={selectedProof.startsWith('http') ? selectedProof : `${MEDIA_URL}${selectedProof}`}
                                alt="Payment Proof"
                                className="max-w-full max-h-[60vh] object-contain shadow-md rounded-lg"
                            />
                        </div>
                        <div className="p-6 bg-white flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedProof(null)}
                                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200"
                            >
                                Close
                            </button>
                            <a
                                href={selectedProof.startsWith('http') ? selectedProof : `${MEDIA_URL}${selectedProof}`}
                                download
                                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 flex items-center gap-2"
                            >
                                <Download className="h-4 w-4" /> Download Proof
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { format } from 'date-fns';
import {
    FileText, Calendar,
    Download, History, Loader2
} from 'lucide-react';
import { doctorsAPI, getMediaUrl } from '../../services/api';

interface PatientsViewProps {
    doctorId: string;
}

export const PatientsView: React.FC<PatientsViewProps> = ({ doctorId }) => {
    const [patients, setPatients] = useState<any[]>([]);
    const [filterDate, setFilterDate] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');
    const [selectedReport, setSelectedReport] = useState<any | null>(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                setLoading(true);
                const data = await doctorsAPI.getDoctorPatients();
                setPatients(data);
            } catch (err) {
                console.error('Error fetching patients:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPatients();
    }, [doctorId]);

    const filteredPatients = patients.filter(p => {
        const matchesDate = filterDate ? p.lastVisit === filterDate : true;
        const matchesTab = activeTab === 'all' ? true : p.status === 'pending';
        return matchesDate && matchesTab;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header & Filters */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Patient Management</h2>
                    <p className="text-sm text-gray-500 mt-1">Search, filter, and view medical history of all patients.</p>
                </div>

                <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                    />
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setActiveTab('pending')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'pending' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
                        >
                            Requests
                        </button>
                    </div>
                </div>
            </div>

            {/* Patient Table */}
            <Card className="border-0 shadow-sm bg-white rounded-3xl overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20">
                        <Loader2 size={40} className="text-blue-600 animate-spin mb-4" />
                        <p className="text-gray-500 font-medium">Fetching real patient data...</p>
                    </div>
                ) : filteredPatients.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-20 text-center">
                        <History size={48} className="text-gray-200 mb-4" />
                        <p className="text-gray-500 font-medium">No patients found matches your criteria.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Patient</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Condition</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Last Visit</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Reports</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredPatients.map((patient) => (
                                    <tr key={patient.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
                                                    {patient.profile_image ? (
                                                        <img src={getMediaUrl(patient.profile_image)} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span>{patient.user.first_name[0]}{patient.user.last_name[0]}</span>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-gray-900">{patient.user.first_name} {patient.user.last_name}</div>
                                                    <div className="text-xs text-gray-500">{patient.user.mobile}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                                                {patient.condition}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            <div className="flex items-center">
                                                <Calendar size={14} className="mr-2 text-gray-400" />
                                                {patient.lastVisit ? format(new Date(patient.lastVisit), 'MMM dd, yyyy') : 'No visit yet'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => setSelectedReport(patient)}
                                                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium text-sm"
                                            >
                                                <FileText size={16} />
                                                <span>{patient.reports?.length || 0} Records</span>
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <Button variant="ghost" className="text-blue-600 rounded-xl" onClick={() => setSelectedReport(patient)}>
                                                View Details
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Report Summary Modal */}
            {selectedReport && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <Card className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold">{selectedReport.user.first_name} {selectedReport.user.last_name}</h3>
                                <p className="text-blue-100 text-sm">Medical History & Reports</p>
                            </div>
                            <button
                                onClick={() => setSelectedReport(null)}
                                className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6">
                            {/* Profile Bar */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Condition</p>
                                    <p className="text-sm font-bold text-gray-900">{selectedReport.condition}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Contact</p>
                                    <p className="text-sm font-bold text-gray-900">{selectedReport.user.mobile}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Last Visit</p>
                                    <p className="text-sm font-bold text-gray-900">{selectedReport.lastVisit}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Status</p>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">ACTIVE</span>
                                </div>
                            </div>

                            {/* Reports List */}
                            <div>
                                <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                                    <History size={18} className="mr-2 text-blue-600" />
                                    Past Medical Reports
                                </h4>
                                <div className="space-y-4">
                                    {selectedReport.reports.length === 0 ? (
                                        <p className="text-sm text-gray-500 text-center py-10">No diagnostic reports available for this doctor-patient pair.</p>
                                    ) : selectedReport.reports.map((r: any) => (
                                        <div key={r.id} className="p-4 border border-gray-100 rounded-2xl hover:border-blue-200 transition-all bg-white shadow-sm">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <span className="text-xs font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded">{r.title}</span>
                                                    <h5 className="font-bold text-gray-900 mt-1">{new Date(r.created_at).toLocaleDateString()}</h5>
                                                </div>
                                                <span className="text-xs text-gray-500">By {r.doctor_name || 'System'}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 italic">
                                                "{r.description || 'No summary provided.'}"
                                            </p>
                                            <div className="mt-3 flex space-x-3">
                                                <a href={getMediaUrl(r.report_file)} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 flex items-center hover:underline">
                                                    <Download size={14} className="mr-1" /> View/Download
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 flex justify-end">
                            <Button onClick={() => setSelectedReport(null)} className="rounded-xl px-8">Close History</Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

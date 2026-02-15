import React, { useState, useEffect } from 'react';
import { patientsAPI } from '../../../services/api';
import { Search, MapPin, Phone, Mail, Calendar, ChevronRight, User } from 'lucide-react';

export const Patients: React.FC = () => {
    const [patients, setPatients] = useState<any[]>([]);
    const [filteredPatients, setFilteredPatients] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchPatients = async () => {
            setIsLoading(true);
            try {
                const data = await patientsAPI.getHospitalPatients();
                setPatients(Array.isArray(data) ? data : []);
                setFilteredPatients(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Failed to fetch patients:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPatients();
    }, []);

    useEffect(() => {
        const results = patients.filter(patient =>
            patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.patient_unique_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.mobile?.includes(searchTerm)
        );
        setFilteredPatients(results);
    }, [searchTerm, patients]);

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Patients Registry</h2>
                    <p className="text-gray-500 text-sm mt-1">View and manage all registered patients</p>
                </div>

                <div className="relative max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, ID or phone..."
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Patient Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Info</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Gender/Age</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Registered Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">Loading patients list...</td>
                                </tr>
                            ) : filteredPatients.length > 0 ? (
                                filteredPatients.map((patient) => (
                                    <tr key={patient.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100">
                                                    {patient.name?.charAt(0) || 'P'}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{patient.name || 'Unknown Patient'}</div>
                                                    <div className="text-xs text-gray-400 font-medium">#{patient.patient_unique_id || patient.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                                <Phone className="h-3.5 w-3.5 text-gray-400" /> {patient.mobile || 'N/A'}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                                <Mail className="h-3.5 w-3.5 text-gray-400" /> {patient.email || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                                <MapPin className="h-3.5 w-3.5 text-gray-400" /> {patient.city || patient.address || 'N/A'}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-0.5 ml-5">{patient.district || ''}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="text-sm font-semibold text-gray-700">{patient.gender || 'N/A'}</div>
                                            <div className="text-xs text-gray-400">{patient.age ? `${patient.age} yrs` : ''}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                                {patient.created_at ? new Date(patient.created_at).toLocaleDateString() : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="inline-flex items-center gap-1 text-indigo-600 text-xs font-bold hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                                                View Records <ChevronRight className="h-3.5 w-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">
                                        <User className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                        No patients found match your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

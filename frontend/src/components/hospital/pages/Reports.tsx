import React, { useEffect, useState } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { appointmentsAPI, MEDIA_URL } from '../../../services/api';
import { FileText, Calendar, User, Search } from 'lucide-react';

export const Reports: React.FC = () => {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const loadReports = async () => {
        try {
            setLoading(true);
            const data = await appointmentsAPI.getHospitalReports();
            setReports(data);
        } catch (error) {
            console.error('Error loading hospital reports:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReports();
    }, []);

    const filteredReports = reports.filter(r =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Medical Reports</h2>
                    <p className="text-gray-500 text-sm">View and manage all consultation reports generated in this facility</p>
                </div>
                <Button onClick={loadReports} variant="outline" className="w-full md:w-auto">
                    Refresh List
                </Button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search by title or doctor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="p-6 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </Card>
                    ))}
                </div>
            ) : filteredReports.length === 0 ? (
                <Card className="p-12 text-center border-2 border-dashed border-gray-100">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="text-gray-400" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No reports found</h3>
                    <p className="text-gray-500">
                        {searchTerm ? "Try searching with different keywords" : "No consultation reports have been generated yet."}
                    </p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredReports.map((report) => (
                        <Card key={report.id} className="p-6 hover:shadow-lg transition-shadow border-0 shadow-sm">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <FileText className="text-blue-600" size={24} />
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    ID: #{report.id}
                                </span>
                            </div>

                            <h4 className="font-bold text-gray-900 mb-2 line-clamp-1">{report.title}</h4>

                            <div className="space-y-2 mb-6">
                                <div className="flex items-center text-xs text-gray-500">
                                    <User size={14} className="mr-2" />
                                    <span>Dr. {report.doctor_name}</span>
                                </div>
                                <div className="flex items-center text-xs text-gray-500">
                                    <Calendar size={14} className="mr-2" />
                                    <span>{new Date(report.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <a
                                href={report.report_file.startsWith('http') ? report.report_file : `${MEDIA_URL}${report.report_file}`}
                                target="_blank"
                                rel="noreferrer"
                                className="block w-full text-center py-2 bg-gray-50 hover:bg-blue-50 text-blue-600 font-bold rounded-lg transition-colors text-sm"
                            >
                                View PDF Report
                            </a>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

import React, { useEffect, useState } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { appointmentsAPI, patientsAPI, MEDIA_URL } from '../../../services/api';
import { FileText, Calendar, User, Search, Upload, X, FlaskConical, Stethoscope } from 'lucide-react';

export const Reports: React.FC = () => {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [patients, setPatients] = useState<any[]>([]);
    const [patientSearch, setPatientSearch] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadData, setUploadData] = useState({
        patient_id: '',
        title: '',
        description: '',
        report_file: null as File | null,
    });
    const [selectedPatientName, setSelectedPatientName] = useState('');

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

    const loadPatients = async () => {
        try {
            const data = await patientsAPI.getHospitalPatients();
            setPatients(data);
        } catch (error) {
            console.error('Error loading patients:', error);
        }
    };

    useEffect(() => {
        loadReports();
    }, []);

    useEffect(() => {
        if (showUploadForm && patients.length === 0) {
            loadPatients();
        }
    }, [showUploadForm]);

    const filteredReports = reports.filter(r =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.patient_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredPatients = patients.filter(p => {
        const name = p.name || `${p.user?.first_name || ''} ${p.user?.last_name || ''}`;
        const uid = p.patient_unique_id || '';
        const q = patientSearch.toLowerCase();
        return name.toLowerCase().includes(q) || uid.toLowerCase().includes(q);
    });

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadData.patient_id || !uploadData.report_file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('patient_id', uploadData.patient_id);
            formData.append('title', uploadData.title);
            formData.append('description', uploadData.description);
            formData.append('report_file', uploadData.report_file);

            await appointmentsAPI.uploadHospitalReport(formData);

            setShowUploadForm(false);
            setUploadData({ patient_id: '', title: '', description: '', report_file: null });
            setSelectedPatientName('');
            setPatientSearch('');
            loadReports();
        } catch (error) {
            console.error('Error uploading report:', error);
            alert('Failed to upload report. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const getReportTypeBadge = (type: string) => {
        if (type === 'lab_report') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 uppercase tracking-wider">
                    <FlaskConical size={10} /> Lab Report
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 uppercase tracking-wider">
                <Stethoscope size={10} /> Consultation
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Medical Reports</h2>
                    <p className="text-gray-500 text-sm">View and manage all consultation & lab reports</p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={() => setShowUploadForm(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
                        <Upload size={16} className="mr-2" />
                        Upload Lab Report
                    </Button>
                    <Button onClick={loadReports} variant="outline" className="w-full md:w-auto">
                        Refresh List
                    </Button>
                </div>
            </div>

            {/* Upload Form Modal */}
            {showUploadForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <Card className="w-full max-w-lg mx-4 p-6 bg-white shadow-2xl rounded-2xl relative">
                        <button onClick={() => setShowUploadForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">Upload Lab Report</h3>
                        <p className="text-gray-500 text-sm mb-6">Send lab/test results directly to a patient</p>

                        <form onSubmit={handleUpload} className="space-y-4">
                            {/* Patient Selector */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
                                {selectedPatientName ? (
                                    <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                                        <span className="font-medium text-blue-800">{selectedPatientName}</span>
                                        <button type="button" onClick={() => { setSelectedPatientName(''); setUploadData(d => ({ ...d, patient_id: '' })); }} className="text-blue-500 hover:text-blue-700">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Search patient by name or ID..."
                                            value={patientSearch}
                                            onChange={e => setPatientSearch(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                        />
                                        {patientSearch && filteredPatients.length > 0 && (
                                            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                                {filteredPatients.map(p => {
                                                    const name = p.name || `${p.user?.first_name || ''} ${p.user?.last_name || ''}`;
                                                    return (
                                                        <button
                                                            key={p.id || p.patient_unique_id}
                                                            type="button"
                                                            onClick={() => {
                                                                setUploadData(d => ({ ...d, patient_id: String(p.id || p.patient_unique_id) }));
                                                                setSelectedPatientName(`${name} (${p.patient_unique_id || ''})`);
                                                                setPatientSearch('');
                                                            }}
                                                            className="w-full text-left px-4 py-2 hover:bg-purple-50 text-sm border-b last:border-0"
                                                        >
                                                            <span className="font-medium">{name}</span>
                                                            <span className="text-gray-400 ml-2 text-xs">{p.patient_unique_id}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                        {patientSearch && filteredPatients.length === 0 && (
                                            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-center text-gray-400 text-sm">
                                                No patient found
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Report Title *</label>
                                <input
                                    type="text"
                                    value={uploadData.title}
                                    onChange={e => setUploadData(d => ({ ...d, title: e.target.value }))}
                                    placeholder="e.g., Blood Test Report, Urine Analysis"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={uploadData.description}
                                    onChange={e => setUploadData(d => ({ ...d, description: e.target.value }))}
                                    placeholder="Optional notes about this report..."
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none"
                                />
                            </div>

                            {/* File Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Report File (PDF) *</label>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={e => setUploadData(d => ({ ...d, report_file: e.target.files?.[0] || null }))}
                                    className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="submit"
                                    disabled={uploading || !uploadData.patient_id || !uploadData.report_file}
                                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
                                >
                                    {uploading ? 'Uploading...' : 'Upload Report'}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setShowUploadForm(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search by title, doctor, or patient..."
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
                        {searchTerm ? "Try searching with different keywords" : "No reports have been generated yet. Upload a lab report to get started."}
                    </p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredReports.map((report) => (
                        <Card key={report.id} className="p-6 hover:shadow-lg transition-shadow border-0 shadow-sm">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-2 rounded-lg ${report.report_type === 'lab_report' ? 'bg-purple-50' : 'bg-blue-50'}`}>
                                    {report.report_type === 'lab_report'
                                        ? <FlaskConical className="text-purple-600" size={24} />
                                        : <FileText className="text-blue-600" size={24} />
                                    }
                                </div>
                                {getReportTypeBadge(report.report_type)}
                            </div>

                            <h4 className="font-bold text-gray-900 mb-2 line-clamp-1">{report.title}</h4>

                            <div className="space-y-2 mb-6">
                                {report.patient_name && (
                                    <div className="flex items-center text-xs text-gray-500">
                                        <User size={14} className="mr-2" />
                                        <span>Patient: {report.patient_name}</span>
                                    </div>
                                )}
                                {report.doctor_name && (
                                    <div className="flex items-center text-xs text-gray-500">
                                        <Stethoscope size={14} className="mr-2" />
                                        <span>Dr. {report.doctor_name}</span>
                                    </div>
                                )}
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
                                View Report
                            </a>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import Navbar from '../components/Layout/Navbar';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  FileText, Upload, Download, Trash2, Eye, EyeOff, Calendar, 
  Pill, Activity, Heart, Thermometer, Scale, Plus, X, Check,
  AlertCircle, Clock, ChevronRight, Shield, RefreshCw
} from 'lucide-react';

// Types
interface MedicalRecord {
  id: number;
  title: string;
  type: 'prescription' | 'lab_result' | 'imaging' | 'vaccination' | 'report' | 'other';
  date: string;
  hospital: string;
  doctor: string;
  fileUrl?: string;
  notes: string;
  isPrivate: boolean;
}

interface Prescription {
  id: number;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

const MOCK_RECORDS: MedicalRecord[] = [
  {
    id: 1,
    title: 'Annual Health Checkup',
    type: 'lab_result',
    date: '2024-01-15',
    hospital: 'Patan Hospital',
    doctor: 'Dr. Rajesh Kumar',
    notes: 'Complete blood count, lipid profile, and liver function tests. All values within normal range.',
    isPrivate: false,
  },
  {
    id: 2,
    title: 'Chest X-Ray Report',
    type: 'imaging',
    date: '2024-01-10',
    hospital: 'Grande International',
    doctor: 'Dr. Priya Sharma',
    notes: 'No abnormalities detected. Lungs clear.',
    isPrivate: true,
  },
  {
    id: 3,
    title: 'Blood Pressure Medication',
    type: 'prescription',
    date: '2024-01-08',
    hospital: 'Kathmandu Medical College',
    doctor: 'Dr. Amit Patel',
    notes: 'Amlodipine 5mg once daily for hypertension management.',
    isPrivate: false,
  },
  {
    id: 4,
    title: 'COVID-19 Vaccination',
    type: 'vaccination',
    date: '2023-12-20',
    hospital: 'Tribhuvan University Hospital',
    doctor: 'Health Worker',
    notes: 'Pfizer-BioNTech booster dose administered.',
    isPrivate: false,
  },
];

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const MedicalRecordsPage: React.FC = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [showPrivate, setShowPrivate] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New record form state
  const [newRecord, setNewRecord] = useState<Partial<MedicalRecord>>({
    title: '',
    type: 'prescription',
    date: new Date().toISOString().split('T')[0],
    hospital: '',
    doctor: '',
    notes: '',
    isPrivate: false,
  });

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [showPrescriptions, setShowPrescriptions] = useState(false);

  useEffect(() => {
    // Load records from localStorage
    const savedRecords = localStorage.getItem('medical_records');
    const savedPrescriptions = localStorage.getItem('prescriptions');
    
    if (savedRecords) {
      setRecords(JSON.parse(savedRecords));
    } else {
      setRecords(MOCK_RECORDS);
      localStorage.setItem('medical_records', JSON.stringify(MOCK_RECORDS));
    }
    
    if (savedPrescriptions) {
      setPrescriptions(JSON.parse(savedPrescriptions));
    }
  }, []);

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.hospital.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.doctor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || record.type === filterType;
    const matchesPrivate = !showPrivate ? !record.isPrivate : true;
    return matchesSearch && matchesType && matchesPrivate;
  });

  const handleSaveRecord = () => {
    if (!newRecord.title || !newRecord.hospital) return;

    const record: MedicalRecord = {
      id: Date.now(),
      title: newRecord.title!,
      type: newRecord.type as MedicalRecord['type'],
      date: newRecord.date!,
      hospital: newRecord.hospital!,
      doctor: newRecord.doctor || 'Not specified',
      notes: newRecord.notes || '',
      isPrivate: newRecord.isPrivate || false,
    };

    const updatedRecords = [record, ...records];
    setRecords(updatedRecords);
    localStorage.setItem('medical_records', JSON.stringify(updatedRecords));
    
    // Save prescriptions if any
    if (prescriptions.length > 0) {
      const savedPrescriptions = localStorage.getItem('prescriptions');
      const existingPrescriptions = savedPrescriptions ? JSON.parse(savedPrescriptions) : [];
      localStorage.setItem('prescriptions', JSON.stringify([...existingPrescriptions, ...prescriptions]));
    }

    setShowAddModal(false);
    setNewRecord({
      title: '',
      type: 'prescription',
      date: new Date().toISOString().split('T')[0],
      hospital: '',
      doctor: '',
      notes: '',
      isPrivate: false,
    });
    setPrescriptions([]);
  };

  const handleDeleteRecord = (id: number) => {
    const updatedRecords = records.filter(r => r.id !== id);
    setRecords(updatedRecords);
    localStorage.setItem('medical_records', JSON.stringify(updatedRecords));
  };

  const togglePrivate = (id: number) => {
    const updatedRecords = records.map(r => 
      r.id === id ? { ...r, isPrivate: !r.isPrivate } : r
    );
    setRecords(updatedRecords);
    localStorage.setItem('medical_records', JSON.stringify(updatedRecords));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploading(true);
      // Simulate upload
      setTimeout(() => {
        setUploading(false);
        alert('File uploaded successfully!');
      }, 1500);
    }
  };

  const addPrescription = () => {
    setPrescriptions([...prescriptions, {
      id: Date.now(),
      medication: '',
      dosage: '',
      frequency: '',
      duration: '',
    }]);
  };

  const updatePrescription = (id: number, field: keyof Prescription, value: string) => {
    setPrescriptions(prescriptions.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const removePrescription = (id: number) => {
    setPrescriptions(prescriptions.filter(p => p.id !== id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'prescription': return Pill;
      case 'lab_result': return Activity;
      case 'imaging': return FileText;
      case 'vaccination': return Shield;
      case 'report': return FileText;
      default: return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'prescription': return 'bg-purple-100 text-purple-600';
      case 'lab_result': return 'bg-blue-100 text-blue-600';
      case 'imaging': return 'bg-indigo-100 text-indigo-600';
      case 'vaccination': return 'bg-green-100 text-green-600';
      case 'report': return 'bg-amber-100 text-amber-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex justify-between items-center"
            >
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Medical Records
                </h1>
                <p className="text-indigo-100">
                  Manage your health documents and prescriptions
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold shadow-lg hover:bg-indigo-50 transition-all flex items-center gap-2"
              >
                <Plus size={20} />
                Add Record
              </button>
            </motion.div>
          </div>

          {/* Stats Cards */}
          <div className="px-8 py-6 -mt-8">
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {[
                { icon: FileText, label: 'Total Records', value: records.length, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50', iconColor: 'text-blue-600' },
                { icon: Pill, label: 'Prescriptions', value: prescriptions.length, color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50', iconColor: 'text-purple-600' },
                { icon: Activity, label: 'Lab Results', value: records.filter(r => r.type === 'lab_result').length, color: 'from-green-500 to-green-600', bgColor: 'bg-green-50', iconColor: 'text-green-600' },
                { icon: Shield, label: 'Vaccinations', value: records.filter(r => r.type === 'vaccination').length, color: 'from-amber-500 to-amber-600', bgColor: 'bg-amber-50', iconColor: 'text-amber-600' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  variants={itemVariants}
                  whileHover={{ scale: 1.03, y: -5 }}
                  className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-slate-100 group cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative p-5 flex items-center gap-4">
                    <div className={`w-14 h-14 ${stat.bgColor} rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon size={26} className={stat.iconColor} />
                    </div>
                    <div className="flex-1">
                      <motion.p 
                        className="text-3xl font-black text-slate-800"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                      >
                        {stat.value}
                      </motion.p>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{stat.label}</p>
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-tr from-indigo-100 to-purple-100 rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Filters */}
          <div className="px-8 py-4 bg-white border-b border-slate-200 sticky top-0 z-20">
            <div className="flex gap-4 flex-wrap items-center">
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  placeholder="Search records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-100 border-2 border-transparent rounded-xl focus:border-indigo-500 focus:outline-none font-semibold text-slate-800 transition-all"
                />
              </div>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2.5 rounded-xl border-2 border-slate-200 font-semibold text-sm focus:border-indigo-500 outline-none bg-white cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="prescription">Prescriptions</option>
                <option value="lab_result">Lab Results</option>
                <option value="imaging">Imaging</option>
                <option value="vaccination">Vaccinations</option>
                <option value="report">Reports</option>
              </select>

              <button
                onClick={() => setShowPrivate(!showPrivate)}
                className={`px-4 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all flex items-center gap-2 ${
                  showPrivate 
                    ? 'bg-slate-800 text-white border-slate-800' 
                    : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                {showPrivate ? <EyeOff size={16} /> : <Eye size={16} />}
                {showPrivate ? 'Show Private' : 'Hide Private'}
              </button>

              <div className="flex border-2 border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600'}`}
                >
                  <div className="grid grid-cols-2 gap-0.5 w-5 h-5">
                    <div className="bg-current rounded-sm" />
                    <div className="bg-current rounded-sm" />
                    <div className="bg-current rounded-sm" />
                    <div className="bg-current rounded-sm" />
                  </div>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600'}`}
                >
                  <div className="flex flex-col gap-0.5 w-5 h-5">
                    <div className="bg-current h-1 rounded-sm" />
                    <div className="bg-current h-1 rounded-sm" />
                    <div className="bg-current h-1 rounded-sm" />
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Records Grid/List */}
          <div className="p-8">
            {filteredRecords.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText size={40} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No records found</h3>
                <p className="text-slate-500 mb-4">Add your first medical record to get started</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
                >
                  Add Record
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <AnimatePresence mode="popLayout">
                  {filteredRecords.map((record) => {
                    const TypeIcon = getTypeIcon(record.type);
                    return (
                      <motion.div
                        key={record.id}
                        layout
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, scale: 0.9 }}
                        whileHover={{ y: -5 }}
                        className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden hover:shadow-xl transition-all"
                      >
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 ${getTypeColor(record.type)} rounded-xl flex items-center justify-center`}>
                              <TypeIcon size={24} />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => togglePrivate(record.id)}
                                className={`p-2 rounded-lg transition-all ${
                                  record.isPrivate ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400 hover:text-slate-600'
                                }`}
                              >
                                {record.isPrivate ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                              <button
                                onClick={() => handleDeleteRecord(record.id)}
                                className="p-2 rounded-lg bg-slate-100 text-slate-400 hover:text-red-600 hover:bg-red-100 transition-all"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>

                          <h3 className="text-lg font-bold text-slate-800 mb-1">{record.title}</h3>
                          <p className="text-sm text-slate-500 mb-4 capitalize">{record.type.replace('_', ' ')}</p>

                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-slate-600">
                              <Calendar size={14} className="text-indigo-500" />
                              <span>{record.date}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                              <Shield size={14} className="text-green-500" />
                              <span>{record.hospital}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                              <Activity size={14} className="text-purple-500" />
                              <span>{record.doctor}</span>
                            </div>
                          </div>

                          {record.notes && (
                            <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                              <p className="text-sm text-slate-600 line-clamp-2">{record.notes}</p>
                            </div>
                          )}

                          <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                            <button className="flex-1 py-2 bg-indigo-100 text-indigo-600 rounded-lg font-semibold text-sm hover:bg-indigo-200 transition-all flex items-center justify-center gap-2">
                              <Download size={14} />
                              Download
                            </button>
                            <button 
                              onClick={() => setSelectedRecord(record)}
                              className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-lg font-semibold text-sm hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                            >
                              <Eye size={14} />
                              View
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div 
                className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Type</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Title</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Hospital</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <AnimatePresence>
                      {filteredRecords.map((record) => {
                        const TypeIcon = getTypeIcon(record.type);
                        return (
                          <motion.tr
                            key={record.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className={`w-10 h-10 ${getTypeColor(record.type)} rounded-lg flex items-center justify-center`}>
                                <TypeIcon size={20} />
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-semibold text-slate-800">{record.title}</p>
                              <p className="text-xs text-slate-500 capitalize">{record.type.replace('_', ' ')}</p>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">{record.date}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{record.hospital}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                record.isPrivate 
                                  ? 'bg-red-100 text-red-600' 
                                  : 'bg-green-100 text-green-600'
                              }`}>
                                {record.isPrivate ? 'Private' : 'Public'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => togglePrivate(record.id)}
                                  className="p-2 rounded-lg hover:bg-slate-100 transition-all"
                                >
                                  {record.isPrivate ? <EyeOff size={16} className="text-red-600" /> : <Eye size={16} className="text-slate-400" />}
                                </button>
                                <button className="p-2 rounded-lg hover:bg-slate-100 transition-all">
                                  <Download size={16} className="text-slate-400" />
                                </button>
                                <button
                                  onClick={() => handleDeleteRecord(record.id)}
                                  className="p-2 rounded-lg hover:bg-red-100 transition-all"
                                >
                                  <Trash2 size={16} className="text-red-600" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </motion.div>
            )}
          </div>
        </main>
      </div>

      {/* Add Record Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white px-8 py-6 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">Add Medical Record</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-all"
                >
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                {/* File Upload */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all"
                >
                  <Upload size={48} className="mx-auto text-slate-400 mb-4" />
                  <p className="font-semibold text-slate-800 mb-1">Upload Document</p>
                  <p className="text-sm text-slate-500">Click to browse or drag and drop</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                  />
                  {uploading && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-indigo-600">
                      <RefreshCw size={20} className="animate-spin" />
                      <span>Uploading...</span>
                    </div>
                  )}
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Title *</label>
                    <input
                      type="text"
                      value={newRecord.title}
                      onChange={(e) => setNewRecord({ ...newRecord, title: e.target.value })}
                      placeholder="e.g., Annual Checkup"
                      className="w-full px-4 py-3 bg-slate-100 border-2 border-transparent rounded-xl focus:border-indigo-500 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Type</label>
                    <select
                      value={newRecord.type}
                      onChange={(e) => setNewRecord({ ...newRecord, type: e.target.value as MedicalRecord['type'] })}
                      className="w-full px-4 py-3 bg-slate-100 border-2 border-transparent rounded-xl focus:border-indigo-500 focus:outline-none transition-all cursor-pointer"
                    >
                      <option value="prescription">Prescription</option>
                      <option value="lab_result">Lab Result</option>
                      <option value="imaging">Imaging</option>
                      <option value="vaccination">Vaccination</option>
                      <option value="report">Report</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Date *</label>
                    <input
                      type="date"
                      value={newRecord.date}
                      onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-100 border-2 border-transparent rounded-xl focus:border-indigo-500 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Hospital *</label>
                    <input
                      type="text"
                      value={newRecord.hospital}
                      onChange={(e) => setNewRecord({ ...newRecord, hospital: e.target.value })}
                      placeholder="e.g., Patan Hospital"
                      className="w-full px-4 py-3 bg-slate-100 border-2 border-transparent rounded-xl focus:border-indigo-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Doctor</label>
                  <input
                    type="text"
                    value={newRecord.doctor}
                    onChange={(e) => setNewRecord({ ...newRecord, doctor: e.target.value })}
                    placeholder="e.g., Dr. Rajesh Kumar"
                    className="w-full px-4 py-3 bg-slate-100 border-2 border-transparent rounded-xl focus:border-indigo-500 focus:outline-none transition-all"
                  />
                </div>

                {/* Prescriptions Section */}
                {newRecord.type === 'prescription' && (
                  <div className="bg-purple-50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-purple-800 flex items-center gap-2">
                        <Pill size={20} />
                        Medications
                      </h3>
                      <button
                        onClick={addPrescription}
                        className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-all flex items-center gap-1"
                      >
                        <Plus size={14} />
                        Add
                      </button>
                    </div>

                    {prescriptions.length === 0 ? (
                      <p className="text-purple-600 text-sm text-center py-4">No medications added yet</p>
                    ) : (
                      <div className="space-y-3">
                        {prescriptions.map((rx) => (
                          <div key={rx.id} className="bg-white rounded-lg p-4 border border-purple-200">
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-semibold text-slate-800">Medication {prescriptions.indexOf(rx) + 1}</h4>
                              <button
                                onClick={() => removePrescription(rx.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X size={16} />
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <input
                                type="text"
                                placeholder="Medication name"
                                value={rx.medication}
                                onChange={(e) => updatePrescription(rx.id, 'medication', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-100 rounded-lg border-2 border-transparent focus:border-purple-500 focus:outline-none text-sm"
                              />
                              <input
                                type="text"
                                placeholder="Dosage (e.g., 500mg)"
                                value={rx.dosage}
                                onChange={(e) => updatePrescription(rx.id, 'dosage', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-100 rounded-lg border-2 border-transparent focus:border-purple-500 focus:outline-none text-sm"
                              />
                              <input
                                type="text"
                                placeholder="Frequency (e.g., Twice daily)"
                                value={rx.frequency}
                                onChange={(e) => updatePrescription(rx.id, 'frequency', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-100 rounded-lg border-2 border-transparent focus:border-purple-500 focus:outline-none text-sm"
                              />
                              <input
                                type="text"
                                placeholder="Duration (e.g., 7 days)"
                                value={rx.duration}
                                onChange={(e) => updatePrescription(rx.id, 'duration', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-100 rounded-lg border-2 border-transparent focus:border-purple-500 focus:outline-none text-sm"
                              />
                            </div>
                            <input
                              type="text"
                              placeholder="Special instructions"
                              value={rx.instructions || ''}
                              onChange={(e) => updatePrescription(rx.id, 'instructions', e.target.value)}
                              className="w-full mt-3 px-3 py-2 bg-slate-100 rounded-lg border-2 border-transparent focus:border-purple-500 focus:outline-none text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Notes</label>
                  <textarea
                    value={newRecord.notes}
                    onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                    placeholder="Add any additional notes..."
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-100 border-2 border-transparent rounded-xl focus:border-indigo-500 focus:outline-none transition-all resize-none"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setNewRecord({ ...newRecord, isPrivate: !newRecord.isPrivate })}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all ${
                      newRecord.isPrivate
                        ? 'bg-red-500 border-red-500 text-white'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    {newRecord.isPrivate ? <EyeOff size={16} /> : <Eye size={16} />}
                    {newRecord.isPrivate ? 'Private Record' : 'Public Record'}
                  </button>
                  <span className="text-sm text-slate-500">
                    {newRecord.isPrivate ? 'Only you can see this record' : 'Visible to connected doctors'}
                  </span>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white px-8 py-6 border-t border-slate-200 flex gap-4 justify-end">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveRecord}
                  disabled={!newRecord.title || !newRecord.hospital}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Check size={20} />
                  Save Record
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Record Modal */}
      <AnimatePresence>
        {selectedRecord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedRecord(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-xl"
            >
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 ${getTypeColor(selectedRecord.type)} rounded-xl flex items-center justify-center`}>
                      {React.createElement(getTypeIcon(selectedRecord.type), { size: 28 })}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800">{selectedRecord.title}</h2>
                      <p className="text-slate-500 capitalize">{selectedRecord.type.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedRecord(null)}
                    className="p-2 rounded-lg hover:bg-slate-100 transition-all"
                  >
                    <X size={24} className="text-slate-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-xs text-slate-500 uppercase font-bold mb-1">Date</p>
                      <p className="font-semibold text-slate-800">{selectedRecord.date}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-xs text-slate-500 uppercase font-bold mb-1">Hospital</p>
                      <p className="font-semibold text-slate-800">{selectedRecord.hospital}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Doctor</p>
                    <p className="font-semibold text-slate-800">{selectedRecord.doctor}</p>
                  </div>

                  {selectedRecord.notes && (
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-xs text-slate-500 uppercase font-bold mb-1">Notes</p>
                      <p className="text-slate-700">{selectedRecord.notes}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                    <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                      selectedRecord.isPrivate 
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {selectedRecord.isPrivate ? '🔒 Private' : '🌐 Public'}
                    </span>
                  </div>
                </div>

                <div className="mt-8 flex gap-4">
                  <button className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                    <Download size={18} />
                    Download
                  </button>
                  <button 
                    onClick={() => handleDeleteRecord(selectedRecord.id)}
                    className="flex-1 py-3 bg-red-100 text-red-600 rounded-xl font-semibold hover:bg-red-200 transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MedicalRecordsPage;

import React, { useState, useEffect } from 'react';
import { Doctor } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { SignatureManager } from './SignatureManager';
import {
    User,
    Shield,
    GraduationCap,
    Briefcase,
    Phone,
    Mail,
    Plus,
    Trash2,
    Save,
    Loader,
    Award,
    MapPin,
    Calendar,
    DollarSign,
    Clock,
    Languages,
    Building,
    Edit2,
    Check,
    X,
    Upload,
    Camera,
    FileText,
    Stethoscope,
    Heart,
    Activity,
    BadgeCheck
} from 'lucide-react';

interface DoctorProfileProps {
    doctor: Doctor;
    onUpdate: (updatedDoctor: Partial<Doctor>) => void;
}

export const DoctorProfile: React.FC<DoctorProfileProps> = ({ doctor, onUpdate }) => {
    const [isEditingSignature, setIsEditingSignature] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'qualifications' | 'professional' | 'settings'>('overview');

    // Form states
    const [newEducation, setNewEducation] = useState('');
    const [newCertification, setNewCertification] = useState('');
    const [newSpecialization, setNewSpecialization] = useState('');
    const [newLanguage, setNewLanguage] = useState('');
    const [editingField, setEditingField] = useState<string | null>(null);

    // Temporary edit values
    const [editValues, setEditValues] = useState<any>({});

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('http://127.0.0.1:8000/api/doctors/profile/', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                onUpdate(data);
            }
        } catch (error) {
            console.error("Failed to fetch profile:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveToBackend = async (updates: Partial<Doctor>) => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('http://127.0.0.1:8000/api/doctors/profile/', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updates)
            });

            if (response.ok) {
                const data = await response.json();
                onUpdate(data);
            } else {
                console.error("Failed to save profile");
            }
        } catch (error) {
            console.error("Error saving profile:", error);
        } finally {
            setIsSaving(false);
        }
    };

    // Education handlers
    const handleAddEducation = () => {
        if (!newEducation.trim()) return;
        const currentEducation = doctor.education || [];
        const updatedEducation = [...currentEducation, newEducation.trim()];
        handleSaveToBackend({ education: updatedEducation });
        setNewEducation('');
    };

    const handleRemoveEducation = (index: number) => {
        const currentEducation = doctor.education || [];
        const updatedEducation = currentEducation.filter((_, i) => i !== index);
        handleSaveToBackend({ education: updatedEducation });
    };

    // Certification handlers
    const handleAddCertification = () => {
        if (!newCertification.trim()) return;
        const currentCertifications = (doctor as any).certifications || [];
        const updatedCertifications = [...currentCertifications, newCertification.trim()];
        handleSaveToBackend({ certifications: updatedCertifications } as any);
        setNewCertification('');
    };

    const handleRemoveCertification = (index: number) => {
        const currentCertifications = (doctor as any).certifications || [];
        const updatedCertifications = currentCertifications.filter((_: any, i: number) => i !== index);
        handleSaveToBackend({ certifications: updatedCertifications } as any);
    };

    // Specialization handlers
    const handleAddSpecialization = () => {
        if (!newSpecialization.trim()) return;
        const currentSpecs = (doctor as any).specializations || [];
        const updatedSpecs = [...currentSpecs, newSpecialization.trim()];
        handleSaveToBackend({ specializations: updatedSpecs } as any);
        setNewSpecialization('');
    };

    const handleRemoveSpecialization = (index: number) => {
        const currentSpecs = (doctor as any).specializations || [];
        const updatedSpecs = currentSpecs.filter((_: any, i: number) => i !== index);
        handleSaveToBackend({ specializations: updatedSpecs } as any);
    };

    // Language handlers
    const handleAddLanguage = () => {
        if (!newLanguage.trim()) return;
        const currentLangs = (doctor as any).languages || [];
        const updatedLangs = [...currentLangs, newLanguage.trim()];
        handleSaveToBackend({ languages: updatedLangs } as any);
        setNewLanguage('');
    };

    const handleRemoveLanguage = (index: number) => {
        const currentLangs = (doctor as any).languages || [];
        const updatedLangs = currentLangs.filter((_: any, i: number) => i !== index);
        handleSaveToBackend({ languages: updatedLangs } as any);
    };

    const handleSignatureSave = (sig: string) => {
        handleSaveToBackend({ signature: sig });
        setIsEditingSignature(false);
    };

    // Edit field handlers
    const startEditing = (field: string, currentValue: any) => {
        setEditingField(field);
        setEditValues({ ...editValues, [field]: currentValue || '' });
    };

    const cancelEditing = () => {
        setEditingField(null);
        setEditValues({});
    };

    const saveField = (field: string) => {
        handleSaveToBackend({ [field]: editValues[field] } as any);
        setEditingField(null);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-20">
                <Loader className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Professional Profile</h1>
                    <p className="text-gray-600 mt-2">Manage your professional identity and clinical credentials</p>
                </div>
                <div className="flex items-center space-x-3">
                    {isSaving && (
                        <span className="text-sm text-blue-600 flex items-center">
                            <Loader size={16} className="animate-spin mr-2" /> Saving...
                        </span>
                    )}
                    <div className="px-4 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-semibold border border-green-200 flex items-center">
                        <BadgeCheck size={18} className="mr-2" /> Verified Doctor
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                    {[
                        { id: 'overview', label: 'Overview', icon: User },
                        { id: 'qualifications', label: 'Qualifications', icon: GraduationCap },
                        { id: 'professional', label: 'Professional Info', icon: Briefcase },
                        { id: 'settings', label: 'Settings', icon: Shield }
                    ].map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center space-x-2 pb-4 border-b-2 transition-colors ${activeTab === tab.id
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <Icon size={18} />
                                <span className="font-medium">{tab.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Card */}
                    <Card className="lg:col-span-1 p-8 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                        <div className="text-center">
                            <div className="relative inline-block mb-6">
                                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                                    {doctor.user.first_name[0]}{doctor.user.last_name[0]}
                                </div>
                                <button className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors">
                                    <Camera size={18} />
                                </button>
                                <div className="absolute top-0 right-0 w-8 h-8 bg-green-500 border-4 border-white rounded-full"></div>
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                Dr. {doctor.user.first_name} {doctor.user.last_name}
                            </h2>
                            <p className="text-blue-700 font-semibold mb-2">{doctor.specialization || 'General Physician'}</p>
                            <p className="text-sm text-gray-600 mb-6">
                                {(doctor as any).medicalDegree || 'MBBS, MD'}
                            </p>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-white rounded-xl p-4 shadow-sm">
                                    <p className="text-2xl font-bold text-gray-900">{doctor.experience || '5'}</p>
                                    <p className="text-xs text-gray-600">Years Exp.</p>
                                </div>
                                <div className="bg-white rounded-xl p-4 shadow-sm">
                                    <p className="text-2xl font-bold text-gray-900">4.8</p>
                                    <p className="text-xs text-gray-600">Rating</p>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-3 text-left">
                                <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                                    <Mail size={18} className="text-gray-400" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-500">Email</p>
                                        <p className="text-sm font-medium text-gray-900 truncate">{doctor.user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                                    <Phone size={18} className="text-gray-400" />
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500">Phone</p>
                                        <p className="text-sm font-medium text-gray-900">{doctor.user.mobile}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                                    <MapPin size={18} className="text-gray-400" />
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500">Location</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {(doctor as any).city || 'Kathmandu'}, {(doctor as any).country || 'Nepal'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Professional Summary */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* About Section */}
                        <Card className="p-6 border-0 shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                    <FileText size={20} className="mr-2 text-blue-600" />
                                    About Me
                                </h3>
                                {editingField !== 'bio' && (
                                    <button
                                        onClick={() => startEditing('bio', (doctor as any).bio)}
                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                    >
                                        <Edit2 size={16} className="inline mr-1" /> Edit
                                    </button>
                                )}
                            </div>
                            {editingField === 'bio' ? (
                                <div>
                                    <textarea
                                        value={editValues.bio}
                                        onChange={(e) => setEditValues({ ...editValues, bio: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg p-4 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        rows={4}
                                        placeholder="Write a brief professional summary..."
                                    />
                                    <div className="flex space-x-2 mt-3">
                                        <Button size="sm" onClick={() => saveField('bio')} className="bg-blue-600">
                                            <Check size={16} className="mr-1" /> Save
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={cancelEditing}>
                                            <X size={16} className="mr-1" /> Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-700 text-sm leading-relaxed">
                                    {(doctor as any).bio || 'No professional summary added yet. Click edit to add your bio.'}
                                </p>
                            )}
                        </Card>

                        {/* Specializations */}
                        <Card className="p-6 border-0 shadow-lg">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                <Stethoscope size={20} className="mr-2 text-purple-600" />
                                Specializations
                            </h3>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {((doctor as any).specializations || []).map((spec: string, idx: number) => (
                                    <div
                                        key={idx}
                                        className="px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium border border-purple-200 flex items-center group"
                                    >
                                        {spec}
                                        <button
                                            onClick={() => handleRemoveSpecialization(idx)}
                                            className="ml-2 text-purple-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={newSpecialization}
                                    onChange={(e) => setNewSpecialization(e.target.value)}
                                    placeholder="Add specialization (e.g., Cardiology)"
                                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddSpecialization()}
                                />
                                <Button onClick={handleAddSpecialization} className="bg-purple-600">
                                    <Plus size={18} />
                                </Button>
                            </div>
                        </Card>

                        {/* Languages */}
                        <Card className="p-6 border-0 shadow-lg">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                <Languages size={20} className="mr-2 text-green-600" />
                                Languages Spoken
                            </h3>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {((doctor as any).languages || ['English', 'Nepali']).map((lang: string, idx: number) => (
                                    <div
                                        key={idx}
                                        className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200 flex items-center group"
                                    >
                                        {lang}
                                        <button
                                            onClick={() => handleRemoveLanguage(idx)}
                                            className="ml-2 text-green-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={newLanguage}
                                    onChange={(e) => setNewLanguage(e.target.value)}
                                    placeholder="Add language"
                                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddLanguage()}
                                />
                                <Button onClick={handleAddLanguage} className="bg-green-600">
                                    <Plus size={18} />
                                </Button>
                            </div>
                        </Card>

                        {/* Consultation Fees */}
                        <Card className="p-6 border-0 shadow-lg">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                <DollarSign size={20} className="mr-2 text-orange-600" />
                                Consultation Fees
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                                    <p className="text-xs text-orange-600 font-semibold mb-1">In-Person Consultation</p>
                                    {editingField === 'inPersonFee' ? (
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="number"
                                                value={editValues.inPersonFee}
                                                onChange={(e) => setEditValues({ ...editValues, inPersonFee: e.target.value })}
                                                className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                                            />
                                            <button onClick={() => saveField('inPersonFee')} className="text-green-600">
                                                <Check size={16} />
                                            </button>
                                            <button onClick={cancelEditing} className="text-red-600">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <p
                                            className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-orange-600"
                                            onClick={() => startEditing('inPersonFee', (doctor as any).inPersonFee || '500')}
                                        >
                                            NPR {(doctor as any).inPersonFee || '500'}
                                        </p>
                                    )}
                                </div>
                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                                    <p className="text-xs text-blue-600 font-semibold mb-1">Video Consultation</p>
                                    {editingField === 'videoFee' ? (
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="number"
                                                value={editValues.videoFee}
                                                onChange={(e) => setEditValues({ ...editValues, videoFee: e.target.value })}
                                                className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                                            />
                                            <button onClick={() => saveField('videoFee')} className="text-green-600">
                                                <Check size={16} />
                                            </button>
                                            <button onClick={cancelEditing} className="text-red-600">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <p
                                            className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-blue-600"
                                            onClick={() => startEditing('videoFee', (doctor as any).videoFee || '300')}
                                        >
                                            NPR {(doctor as any).videoFee || '300'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {activeTab === 'qualifications' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Education */}
                    <Card className="p-8 border-0 shadow-lg">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center">
                                <GraduationCap size={24} className="mr-3 text-blue-600" />
                                Education & Degrees
                            </h3>
                        </div>

                        <div className="space-y-3 mb-6">
                            {doctor.education?.map((edu: string, idx: number) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100 group hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center flex-1">
                                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-4 shadow-sm">
                                            {idx + 1}
                                        </div>
                                        <span className="text-sm font-semibold text-gray-800">{edu}</span>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveEducation(idx)}
                                        className="text-gray-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            )) || (
                                    <p className="text-sm text-gray-500 italic text-center py-8">
                                        No education details added yet.
                                    </p>
                                )}
                        </div>

                        <div className="flex space-x-3">
                            <input
                                type="text"
                                value={newEducation}
                                onChange={(e) => setNewEducation(e.target.value)}
                                placeholder="Add degree (e.g., MBBS from Harvard Medical School)"
                                className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                onKeyPress={(e) => e.key === 'Enter' && handleAddEducation()}
                            />
                            <Button onClick={handleAddEducation} className="bg-blue-600 rounded-xl shadow-lg px-6">
                                <Plus size={18} className="mr-2" /> Add
                            </Button>
                        </div>
                    </Card>

                    {/* Certifications */}
                    <Card className="p-8 border-0 shadow-lg">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center">
                                <Award size={24} className="mr-3 text-purple-600" />
                                Certifications & Awards
                            </h3>
                        </div>

                        <div className="space-y-3 mb-6">
                            {((doctor as any).certifications || []).map((cert: string, idx: number) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-100 group hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center flex-1">
                                        <Award size={20} className="text-purple-600 mr-3" />
                                        <span className="text-sm font-semibold text-gray-800">{cert}</span>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveCertification(idx)}
                                        className="text-gray-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                            {((doctor as any).certifications || []).length === 0 && (
                                <p className="text-sm text-gray-500 italic text-center py-8">
                                    No certifications added yet.
                                </p>
                            )}
                        </div>

                        <div className="flex space-x-3">
                            <input
                                type="text"
                                value={newCertification}
                                onChange={(e) => setNewCertification(e.target.value)}
                                placeholder="Add certification (e.g., Board Certified in Cardiology)"
                                className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                onKeyPress={(e) => e.key === 'Enter' && handleAddCertification()}
                            />
                            <Button onClick={handleAddCertification} className="bg-purple-600 rounded-xl shadow-lg px-6">
                                <Plus size={18} className="mr-2" /> Add
                            </Button>
                        </div>
                    </Card>

                    {/* Professional Memberships */}
                    <Card className="p-8 border-0 shadow-lg lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center">
                                <Building size={24} className="mr-3 text-indigo-600" />
                                Professional Memberships
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                'Nepal Medical Association',
                                'Cardiological Society of Nepal',
                                'International Medical Society'
                            ].map((membership, idx) => (
                                <div key={idx} className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 text-center">
                                    <Building size={32} className="mx-auto text-indigo-600 mb-2" />
                                    <p className="text-sm font-semibold text-gray-800">{membership}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}

            {activeTab === 'professional' && (
                <div className="space-y-8">
                    {/* Medical Registration */}
                    <Card className="p-8 border-0 shadow-lg">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                            <Shield size={24} className="mr-3 text-blue-600" />
                            Medical Registration & License
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Medical Registration Number
                                </label>
                                <input
                                    type="text"
                                    value={(doctor as any).registrationNumber || ''}
                                    onChange={(e) => onUpdate({ registrationNumber: e.target.value } as any)}
                                    onBlur={(e) => handleSaveToBackend({ registrationNumber: e.target.value } as any)}
                                    placeholder="e.g., NMC-12345"
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    National ID (NID)
                                </label>
                                <input
                                    type="text"
                                    value={doctor.nid || ''}
                                    onChange={(e) => onUpdate({ nid: e.target.value })}
                                    onBlur={(e) => handleSaveToBackend({ nid: e.target.value })}
                                    placeholder="Enter National ID"
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    License Expiry Date
                                </label>
                                <input
                                    type="date"
                                    value={(doctor as any).licenseExpiry || ''}
                                    onChange={(e) => onUpdate({ licenseExpiry: e.target.value } as any)}
                                    onBlur={(e) => handleSaveToBackend({ licenseExpiry: e.target.value } as any)}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Years of Experience
                                </label>
                                <input
                                    type="text"
                                    value={doctor.experience || ''}
                                    onChange={(e) => onUpdate({ experience: e.target.value })}
                                    onBlur={(e) => handleSaveToBackend({ experience: e.target.value })}
                                    placeholder="e.g., 10 Years"
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Digital Signature */}
                    <Card className="p-8 border-0 shadow-lg">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center">
                                <Edit2 size={24} className="mr-3 text-orange-600" />
                                Digital Signature
                            </h3>
                            <Button
                                variant="outline"
                                onClick={() => setIsEditingSignature(!isEditingSignature)}
                                className="rounded-xl"
                            >
                                {isEditingSignature ? 'Close Editor' : 'Manage Signature'}
                            </Button>
                        </div>

                        {isEditingSignature ? (
                            <SignatureManager
                                onSave={handleSignatureSave}
                                initialSignature={doctor.signature}
                            />
                        ) : doctor.signature ? (
                            <div className="p-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200 flex flex-col items-center">
                                <img src={doctor.signature} alt="Signature" className="max-h-40 object-contain mb-4" />
                                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                                    Active Digital Signature
                                </p>
                            </div>
                        ) : (
                            <div className="p-12 border-2 border-dashed border-gray-300 rounded-2xl text-center">
                                <Edit2 size={48} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-sm text-gray-600 mb-4">
                                    No digital signature on file. Add your signature for prescriptions and official documents.
                                </p>
                                <Button onClick={() => setIsEditingSignature(true)} className="bg-orange-600 rounded-xl">
                                    <Plus size={18} className="mr-2" /> Create Signature
                                </Button>
                            </div>
                        )}
                    </Card>

                    {/* Clinic Timings */}
                    <Card className="p-8 border-0 shadow-lg">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                            <Clock size={24} className="mr-3 text-green-600" />
                            Consultation Hours
                        </h3>
                        <div className="space-y-4">
                            {[
                                { day: 'Monday - Friday', time: '9:00 AM - 5:00 PM' },
                                { day: 'Saturday', time: '10:00 AM - 2:00 PM' },
                                { day: 'Sunday', time: 'Closed' }
                            ].map((schedule, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
                                    <span className="font-semibold text-gray-800">{schedule.day}</span>
                                    <span className="text-gray-600">{schedule.time}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="space-y-8">
                    <Card className="p-8 border-0 shadow-lg">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                            <Shield size={24} className="mr-3 text-red-600" />
                            Privacy & Security
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div>
                                    <p className="font-semibold text-gray-900">Two-Factor Authentication</p>
                                    <p className="text-sm text-gray-600">Add extra security to your account</p>
                                </div>
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                                    Enable
                                </button>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div>
                                    <p className="font-semibold text-gray-900">Change Password</p>
                                    <p className="text-sm text-gray-600">Update your account password</p>
                                </div>
                                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300">
                                    Change
                                </button>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-8 border-0 shadow-lg">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                            <Activity size={24} className="mr-3 text-blue-600" />
                            Notification Preferences
                        </h3>
                        <div className="space-y-4">
                            {[
                                'New appointment notifications',
                                'Patient message alerts',
                                'Prescription requests',
                                'System updates'
                            ].map((pref, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <span className="text-gray-800">{pref}</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
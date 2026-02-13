import React, { useState, useEffect } from 'react';
import { Doctor } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { SignatureManager } from './SignatureManager';
import { adminAPI } from '../../services/api';
import {
    Award,
    MapPin,
    Plus,
    Trash2,
    Loader,
    Phone,
    Mail,
    Edit2,
    X,
    FileText,
    Upload,
    Stethoscope,
    BadgeCheck,
    Bookmark,
    Shield,
    GraduationCap,
    DollarSign,
    Languages,
} from 'lucide-react';

interface DoctorProfileProps {
    doctor: Doctor;
    onUpdate: (updatedDoctor: Partial<Doctor>) => void;
}

export const DoctorProfile: React.FC<DoctorProfileProps> = ({ doctor, onUpdate }) => {
    const [isEditingSignature, setIsEditingSignature] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isAddingQualification, setIsAddingQualification] = useState(false);

    // Form states
    const [newEducation, setNewEducation] = useState('');
    const [newSpecialization, setNewSpecialization] = useState('');
    const [newLanguage, setNewLanguage] = useState('');
    const [editingField, setEditingField] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<any>({});

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const data = await adminAPI.getProfile();
            onUpdate(data);
        } catch (error) {
            console.error("Failed to fetch profile:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveToBackend = async (updates: Partial<Doctor>) => {
        setIsSaving(true);
        try {
            const data = await adminAPI.updateProfile(updates);
            onUpdate(data);
        } catch (error) {
            console.error("Error saving profile:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddEducation = () => {
        if (!newEducation.trim()) return;
        const updatedEducation = [...(doctor.education || []), newEducation.trim()];
        handleSaveToBackend({ education: updatedEducation });
        setNewEducation('');
        setIsAddingQualification(false);
    };

    const handleRemoveEducation = (index: number) => {
        const updatedEducation = (doctor.education || []).filter((_edu: string, i: number) => i !== index);
        handleSaveToBackend({ education: updatedEducation });
    };

    const handleAddSpecialization = () => {
        if (!newSpecialization.trim()) return;
        const updatedSpecs = [...((doctor as any).specializations || []), newSpecialization.trim()];
        handleSaveToBackend({ specializations: updatedSpecs });
        setNewSpecialization('');
    };

    const handleRemoveSpecialization = (index: number) => {
        const updatedSpecs = ((doctor as any).specializations || []).filter((_: any, i: number) => i !== index);
        handleSaveToBackend({ specializations: updatedSpecs });
    };

    const handleAddLanguage = () => {
        if (!newLanguage.trim()) return;
        const updatedLangs = [...((doctor as any).languages || []), newLanguage.trim()];
        handleSaveToBackend({ languages: updatedLangs });
        setNewLanguage('');
    };

    const handleRemoveLanguage = (index: number) => {
        const updatedLangs = ((doctor as any).languages || []).filter((_: any, i: number) => i !== index);
        handleSaveToBackend({ languages: updatedLangs });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-20">
                <Loader className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            {/* Header Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center gap-8">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg ring-4 ring-white">
                            {doctor.user.first_name[0]}{doctor.user.last_name[0]}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center">
                            <BadgeCheck size={16} className="text-white" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-bold text-gray-900">
                                Dr. {doctor.user.first_name} {doctor.user.last_name}
                            </h1>
                            {isSaving && <Loader size={20} className="animate-spin text-blue-600" />}
                        </div>
                        <p className="text-lg text-blue-600 font-medium mb-4">{doctor.specialization || 'Medical Professional'}</p>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <Mail size={16} className="text-gray-400" />
                                <span>{doctor.user.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone size={16} className="text-gray-400" />
                                <span>{doctor.user.mobile}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin size={16} className="text-gray-400" />
                                <span>{doctor.city || 'Kathmandu'}, {doctor.country || 'Nepal'}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                                <Bookmark size={14} className="text-blue-600" />
                                <span className="font-mono font-bold text-blue-900 text-xs">ID: {doctor.doctor_unique_id || 'Generating...'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Security Settings Section (Now at the top) */}
            <Card className="p-6 border-0 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Shield size={20} className="text-red-600" />
                    Account Security & Privacy
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div>
                            <p className="font-semibold text-gray-900">Two-Factor Authentication</p>
                            <p className="text-xs text-gray-500">Protect your clinical records</p>
                        </div>
                        <Button size="sm" className="bg-blue-600">Enable</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div>
                            <p className="font-semibold text-gray-900">Update Password</p>
                            <p className="text-xs text-gray-500">Last changed 3 months ago</p>
                        </div>
                        <Button size="sm" variant="outline">Change</Button>
                    </div>
                </div>
            </Card>

            {/* Professional Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* About & Specializations */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="p-6 border-0 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <FileText size={20} className="text-blue-600" />
                                Professional Bio
                            </h3>
                            <button onClick={() => setEditingField('bio')} className="text-blue-600 text-sm hover:underline">Edit</button>
                        </div>
                        {editingField === 'bio' ? (
                            <div className="space-y-3">
                                <textarea
                                    value={editValues.bio}
                                    onChange={(e) => setEditValues({ ...editValues, bio: e.target.value })}
                                    className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    rows={4}
                                />
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={() => { handleSaveToBackend({ bio: editValues.bio }); setEditingField(null); }}>Save</Button>
                                    <Button size="sm" variant="outline" onClick={() => setEditingField(null)}>Cancel</Button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-700 text-sm leading-relaxed">
                                {doctor.bio || 'Please add your professional summary to help patients know you better.'}
                            </p>
                        )}
                    </Card>

                    <Card className="p-6 border-0 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Stethoscope size={20} className="text-purple-600" />
                            Clinical Expertise
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {((doctor as any).specializations || []).map((spec: string, idx: number) => (
                                <div key={idx} className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs font-semibold flex items-center gap-2">
                                    {spec}
                                    <button onClick={() => handleRemoveSpecialization(idx)} className="hover:text-red-600">
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newSpecialization}
                                onChange={(e) => setNewSpecialization(e.target.value)}
                                placeholder="Add specialization..."
                                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            />
                            <Button onClick={handleAddSpecialization} size="sm" className="bg-purple-600">
                                <Plus size={16} />
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Sidebar Info: Fees & Languages */}
                <div className="space-y-6">
                    <Card className="p-6 border-0 shadow-sm bg-blue-50/50">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                            <DollarSign size={18} className="text-blue-600" />
                            Consultation Fees
                        </h3>
                        <div className="space-y-3">
                            <div className="p-3 bg-white rounded-lg border border-blue-100">
                                <p className="text-[10px] text-blue-600 font-bold uppercase">In-Person</p>
                                <p className="text-xl font-bold text-gray-900">NPR {doctor.in_person_fee || '500'}</p>
                            </div>
                            <div className="p-3 bg-white rounded-lg border border-blue-100">
                                <p className="text-[10px] text-blue-600 font-bold uppercase">Video Call</p>
                                <p className="text-xl font-bold text-gray-900">NPR {doctor.video_fee || '300'}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 border-0 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                            <Languages size={18} className="text-green-600" />
                            Languages
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {((doctor as any).languages || []).map((lang: string, idx: number) => (
                                <div key={idx} className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium flex items-center gap-1">
                                    {lang}
                                    <button onClick={() => handleRemoveLanguage(idx)} className="hover:text-red-600">
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newLanguage}
                                onChange={(e) => setNewLanguage(e.target.value)}
                                placeholder="Add lang..."
                                className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none"
                            />
                            <Button onClick={handleAddLanguage} size="sm" className="bg-green-600 p-1.5">
                                <Plus size={14} />
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Qualifications Section */}
            <Card className="p-8 border-0 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                        <GraduationCap size={24} className="text-blue-600" />
                        Credentials & Qualifications
                    </h3>
                    <Button
                        onClick={() => setIsAddingQualification(!isAddingQualification)}
                        className="bg-blue-600 ring-4 ring-blue-50"
                    >
                        <Plus size={18} className="mr-2" />
                        Add Qualification
                    </Button>
                </div>

                {isAddingQualification && (
                    <div className="mb-8 p-6 bg-blue-50 rounded-2xl border-2 border-dashed border-blue-200 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Degree/Certification Name</label>
                                <input
                                    type="text"
                                    value={newEducation}
                                    onChange={(e) => setNewEducation(e.target.value)}
                                    placeholder="e.g. MD in Cardiology"
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Upload Document (Verification Required)</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        className="hidden"
                                        id="qual-upload"
                                    />
                                    <label
                                        htmlFor="qual-upload"
                                        className="w-full flex items-center justify-center gap-2 border border-gray-200 bg-white rounded-lg px-4 py-2 text-sm text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors"
                                    >
                                        <Upload size={16} />
                                        Choose File
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button size="sm" onClick={handleAddEducation}>Submit for Review</Button>
                            <Button size="sm" variant="outline" onClick={() => setIsAddingQualification(false)}>Cancel</Button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(doctor.education || []).map((edu: string, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-5 bg-white rounded-xl border border-gray-100 shadow-sm group hover:border-blue-200 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                    <Award size={24} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{edu}</p>
                                    <p className="text-xs text-emerald-600 font-medium">Verified Credential</p>
                                </div>
                            </div>
                            <button onClick={() => handleRemoveEducation(idx)} className="text-gray-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Medical Registration Info */}
            <Card className="p-8 border-0 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <Shield size={22} className="text-blue-600" />
                    Medical Registration Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Registration Number</label>
                        <input
                            type="text"
                            value={doctor.registration_number || ''}
                            onChange={(e) => onUpdate({ registration_number: e.target.value })}
                            onBlur={(e) => handleSaveToBackend({ registration_number: e.target.value })}
                            className="w-full border-b border-gray-200 py-2 focus:border-blue-600 outline-none text-lg font-medium"
                            placeholder="Not Provided"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">License Expiry</label>
                        <input
                            type="date"
                            value={doctor.license_expiry || ''}
                            onChange={(e) => onUpdate({ license_expiry: e.target.value })}
                            onBlur={(e) => handleSaveToBackend({ license_expiry: e.target.value })}
                            className="w-full border-b border-gray-200 py-2 focus:border-blue-600 outline-none text-lg font-medium"
                        />
                    </div>
                </div>
            </Card>

            {/* Digital Signature (Now at the bottom) */}
            <Card className="p-8 border-0 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                            <Edit2 size={24} className="text-orange-600" />
                            Digital Signature
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Used for prescriptions and official medical reports</p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => setIsEditingSignature(!isEditingSignature)}
                        className="rounded-xl border-orange-200 text-orange-600 hover:bg-orange-50"
                    >
                        {isEditingSignature ? 'Close Editor' : 'Manage Signature'}
                    </Button>
                </div>

                {isEditingSignature ? (
                    <SignatureManager
                        onSave={(sig) => { handleSaveToBackend({ signature: sig }); setIsEditingSignature(false); }}
                        initialSignature={doctor.signature}
                    />
                ) : doctor.signature ? (
                    <div className="p-12 bg-white rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center">
                        <img src={doctor.signature} alt="Signature" className="max-h-32 object-contain" />
                    </div>
                ) : (
                    <div className="p-12 border-2 border-dashed border-gray-300 rounded-2xl text-center bg-gray-50">
                        <Edit2 size={40} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-sm text-gray-600 mb-6">No digital signature found on your profile.</p>
                        <Button onClick={() => setIsEditingSignature(true)} className="bg-orange-600">
                            Create Digital Signature
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
};
import React, { useState, useEffect } from 'react';
import { Doctor } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { SignatureManager } from './SignatureManager';
import { User, Shield, GraduationCap, Briefcase, Phone, Mail, Plus, Trash2, Save, Loader } from 'lucide-react';

interface DoctorProfileProps {
    doctor: Doctor;
    onUpdate: (updatedDoctor: Partial<Doctor>) => void;
}

export const DoctorProfile: React.FC<DoctorProfileProps> = ({ doctor, onUpdate }) => {
    const [isEditingSignature, setIsEditingSignature] = useState(false);
    const [newEducation, setNewEducation] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

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

    const handleSignatureSave = (sig: string) => {
        handleSaveToBackend({ signature: sig });
        setIsEditingSignature(false);
    };

    if (isLoading) {
        return <div className="flex justify-center p-10"><Loader className="animate-spin text-blue-600" /></div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Professional Profile</h2>
                    <p className="text-gray-500 mt-1">Manage your professional identity and clinical credentials</p>
                </div>
                <div className="flex space-x-2">
                    {isSaving && <span className="text-xs text-blue-500 flex items-center"><Loader size={12} className="animate-spin mr-1" /> Saving...</span>}
                    <div className="px-4 py-2 bg-green-50 text-green-700 rounded-2xl text-xs font-bold border border-green-100 flex items-center">
                        <Shield size={14} className="mr-2" /> Verified Practitioner
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Personal & Contact Card */}
                <div className="lg:col-span-1 space-y-8">
                    <Card className="p-8 border-0 shadow-xl rounded-3xl bg-white">
                        <div className="flex flex-col items-center text-center mb-8">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl shadow-lg flex items-center justify-center text-white mb-4 rotate-3">
                                <User size={48} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Dr. {doctor.user.first_name} {doctor.user.last_name}</h3>
                            <p className="text-blue-600 font-medium text-sm">{doctor.specialization}</p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <Mail className="text-gray-400" size={20} />
                                <div className="overflow-hidden">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email</p>
                                    <p className="text-sm font-medium text-gray-700 truncate">{doctor.user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <Phone className="text-gray-400" size={20} />
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mobile</p>
                                    <p className="text-sm font-medium text-gray-700">{doctor.user.mobile}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <Briefcase className="text-gray-400" size={20} />
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Experience</p>
                                    <input
                                        className="text-sm font-medium text-gray-700 bg-transparent border-b border-dashed border-gray-300 focus:outline-none focus:border-blue-500 w-full"
                                        value={doctor.experience || ''}
                                        placeholder="Set experience (e.g. 5 Years)"
                                        onChange={(e) => onUpdate({ experience: e.target.value })}
                                        onBlur={(e) => handleSaveToBackend({ experience: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-8 border-0 shadow-xl rounded-3xl bg-white">
                        <div className="flex items-center mb-6 text-gray-900">
                            <Shield className="mr-3 text-indigo-600" size={24} />
                            <h3 className="text-lg font-bold">Government ID</h3>
                        </div>
                        <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">National ID (NID)</p>
                            <input
                                className="text-lg font-mono font-bold text-indigo-900 bg-transparent border-b border-dashed border-indigo-200 focus:outline-none focus:border-indigo-500 w-full"
                                value={doctor.nid || ''}
                                placeholder="Enter NID"
                                onChange={(e) => onUpdate({ nid: e.target.value })}
                                onBlur={(e) => handleSaveToBackend({ nid: e.target.value })}
                            />
                        </div>
                    </Card>
                </div>

                {/* Right Side: Education & Signature */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Education Section */}
                    <Card className="p-8 border-0 shadow-xl rounded-3xl bg-white">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center">
                                <GraduationCap className="mr-3 text-blue-600" size={24} />
                                <h3 className="text-lg font-bold text-gray-900">Education & Degrees</h3>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            {doctor.education?.map((edu: string, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-blue-50/50 rounded-2xl border border-blue-100 group">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-blue-600 shadow-sm mr-4 font-bold text-xs">
                                            {idx + 1}
                                        </div>
                                        <span className="text-sm font-semibold text-gray-700">{edu}</span>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveEducation(idx)}
                                        className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            )) || <p className="text-sm text-gray-400 italic">No education details added yet.</p>}
                        </div>

                        <div className="flex space-x-3">
                            <input
                                type="text"
                                value={newEducation}
                                onChange={(e) => setNewEducation(e.target.value)}
                                placeholder="Add degree (e.g. MBBS from AIIMS)"
                                className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-6 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                            <Button variant="primary" onClick={handleAddEducation} className="rounded-2xl shadow-lg">
                                <Plus size={18} />
                            </Button>
                        </div>
                    </Card>

                    {/* Signature Section */}
                    <Card className="p-8 border-0 shadow-xl rounded-3xl bg-white">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center">
                                <div className="p-2 bg-orange-100 rounded-lg text-orange-600 mr-3">
                                    <Shield size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Digital Validation</h3>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsEditingSignature(!isEditingSignature)}
                                className="text-blue-600 hover:bg-blue-50"
                            >
                                {isEditingSignature ? 'Close Manager' : 'Manage Signature'}
                            </Button>
                        </div>

                        {isEditingSignature ? (
                            <SignatureManager
                                onSave={handleSignatureSave}
                                initialSignature={doctor.signature}
                            />
                        ) : (
                            doctor.signature ? (
                                <div className="p-10 bg-gray-50 rounded-3xl border border-gray-100 flex flex-col items-center">
                                    <img src={doctor.signature} alt="Signature" className="max-h-32 object-contain" />
                                    <p className="mt-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">Active Verification Signature</p>
                                </div>
                            ) : (
                                <div className="p-10 border-2 border-dashed border-gray-200 rounded-3xl text-center">
                                    <p className="text-sm text-gray-400 mb-4">No digital signature linked to your profile.</p>
                                    <Button variant="outline" onClick={() => setIsEditingSignature(true)} className="rounded-xl">
                                        Add Signature Now
                                    </Button>
                                </div>
                            )
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};



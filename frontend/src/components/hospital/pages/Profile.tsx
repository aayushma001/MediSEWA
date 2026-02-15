import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User } from '../../../types';

interface ProfileProps {
    user: User;
    onUpdateProfile?: (updatedProfile: any) => Promise<void>;
}

export const Profile: React.FC<ProfileProps> = ({ user, onUpdateProfile: propOnUpdateProfile }) => {
    const context = useOutletContext<{ onUpdateProfile: (updatedProfile: any) => Promise<void> }>();
    const onUpdateProfile = propOnUpdateProfile || context?.onUpdateProfile;

    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState(user.hospital_profile);
    const [isSaving, setIsSaving] = useState(false);
    const [newSpeciality, setNewSpeciality] = useState('');

    const profile = isEditing ? editedProfile : user.hospital_profile;

    const handleEdit = () => {
        setEditedProfile({ ...user.hospital_profile });
        setIsEditing(true);
    };

    const handleCancel = () => {
        setEditedProfile(user.hospital_profile);
        setIsEditing(false);
        setNewSpeciality('');
    };

    const handleSave = async () => {
        if (!onUpdateProfile) return;

        setIsSaving(true);
        try {
            await onUpdateProfile(editedProfile);
            setIsEditing(false);
            setNewSpeciality('');
        } catch (error) {
            console.error('Failed to update profile:', error);
            // Handle error (show toast/notification)
        } finally {
            setIsSaving(false);
        }
    };

    const handleFieldChange = (field: string, value: any) => {
        setEditedProfile(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                [field]: value
            };
        });
    };

    const handleAddSpeciality = () => {
        if (!newSpeciality.trim()) return;

        const newDept = {
            id: `temp-${Date.now()}`, // temporary ID, backend should generate proper ID
            name: newSpeciality.trim(),
            description: '' // Required by Department interface
        };

        setEditedProfile(prev => {
            if (!prev) return prev;
            const currentDepts = prev.departments || [];
            return {
                ...prev,
                departments: [...currentDepts, newDept]
            };
        });
        setNewSpeciality('');
    };

    const handleRemoveSpeciality = (deptId: string) => {
        setEditedProfile(prev => {
            if (!prev) return prev;
            const updatedDepts = prev.departments?.filter(dept => dept.id !== deptId) || [];
            return {
                ...prev,
                departments: updatedDepts
            };
        });
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddSpeciality();
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Hospital Profile</h2>
                <div className="flex gap-2">
                    {!isEditing ? (
                        <button
                            onClick={handleEdit}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Edit Profile
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                disabled={isSaving}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-blue-400"
                                disabled={isSaving}
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="h-20 w-20 rounded-lg bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-blue-50">
                            {profile?.logo ? (
                                <img src={profile.logo} alt="Logo" className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-blue-600 font-bold text-3xl">{profile?.hospital_name?.charAt(0)}</span>
                            )}
                        </div>
                        <div className="flex-1">
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedProfile?.hospital_name || ''}
                                    onChange={(e) => handleFieldChange('hospital_name', e.target.value)}
                                    className="text-xl font-bold text-gray-900 border-b-2 border-blue-500 focus:outline-none w-full"
                                    placeholder="Hospital Name"
                                />
                            ) : (
                                <h3 className="text-xl font-bold text-gray-900">{profile?.hospital_name}</h3>
                            )}
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedProfile?.hospital_type || ''}
                                    onChange={(e) => handleFieldChange('hospital_type', e.target.value)}
                                    className="text-gray-500 border-b border-gray-300 focus:outline-none focus:border-blue-500 mt-1"
                                    placeholder="Hospital Type"
                                />
                            ) : (
                                <p className="text-gray-500">{profile?.hospital_type || 'General Hospital'}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InfoField label="Hospital Unique ID" value={profile?.hospital_unique_id || profile?.hospital_id} editable={false} />
                        <EditableInfoField
                            label="Hospital Type"
                            value={profile?.hospital_type}
                            isEditing={isEditing}
                            onChange={(val) => handleFieldChange('hospital_type', val)}
                        />
                        <InfoField label="Email" value={user.email} editable={false} />
                        <EditableInfoField
                            label="Contact Number"
                            value={profile?.contact_number || user.mobile}
                            isEditing={isEditing}
                            onChange={(val) => handleFieldChange('contact_number', val)}
                        />
                        <InfoField label="PAN Number" value={profile?.pan_number} editable={false} />
                        <InfoField label="Registration Number" value={profile?.registration_number} editable={false} />
                        <EditableInfoField
                            label="Website"
                            value={profile?.website}
                            isEditing={isEditing}
                            onChange={(val) => handleFieldChange('website', val)}
                            isLink={!isEditing}
                        />
                        <EditableInfoField
                            label="Opening Hours"
                            value={profile?.opening_hours}
                            isEditing={isEditing}
                            onChange={(val) => handleFieldChange('opening_hours', val)}
                        />
                    </div>
                </div>

                {/* Location Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Location Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <EditableInfoField
                            label="Province"
                            value={profile?.province}
                            isEditing={isEditing}
                            onChange={(val) => handleFieldChange('province', val)}
                        />
                        <EditableInfoField
                            label="District"
                            value={profile?.district}
                            isEditing={isEditing}
                            onChange={(val) => handleFieldChange('district', val)}
                        />
                        <EditableInfoField
                            label="City"
                            value={profile?.city}
                            isEditing={isEditing}
                            onChange={(val) => handleFieldChange('city', val)}
                        />
                        <EditableInfoField
                            label="Ward"
                            value={profile?.ward}
                            isEditing={isEditing}
                            onChange={(val) => handleFieldChange('ward', val)}
                        />
                        <EditableInfoField
                            label="Tole"
                            value={profile?.tole}
                            isEditing={isEditing}
                            onChange={(val) => handleFieldChange('tole', val)}
                        />
                        <div className="md:col-span-3">
                            <EditableInfoField
                                label="Full Address"
                                value={profile?.address}
                                isEditing={isEditing}
                                onChange={(val) => handleFieldChange('address', val)}
                                multiline
                            />
                        </div>
                    </div>
                </div>

                {/* Departments / Specialities */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">Medical Specialities</h4>
                        {isEditing && (
                            <span className="text-sm text-gray-500">
                                {profile?.departments?.length || 0} specialit{profile?.departments?.length === 1 ? 'y' : 'ies'}
                            </span>
                        )}
                    </div>

                    {isEditing && (
                        <div className="mb-4 flex gap-2">
                            <input
                                type="text"
                                value={newSpeciality}
                                onChange={(e) => setNewSpeciality(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Enter speciality name (e.g., Cardiology, Neurology)"
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            />
                            <button
                                onClick={handleAddSpeciality}
                                disabled={!newSpeciality.trim()}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                Add
                            </button>
                        </div>
                    )}

                    {profile?.departments && profile.departments.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {profile.departments.map((dept) => (
                                <div key={dept.id} className="relative flex flex-col items-center p-3 bg-blue-50 rounded-lg text-center group">
                                    {isEditing && (
                                        <button
                                            onClick={() => handleRemoveSpeciality(dept.id)}
                                            className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center text-sm font-bold shadow-md"
                                            title="Remove speciality"
                                        >
                                            ×
                                        </button>
                                    )}
                                    <div className="h-10 w-10 flex items-center justify-center text-blue-600 font-bold bg-white rounded-full mb-2">
                                        {dept.name.charAt(0)}
                                    </div>
                                    <span className="text-sm font-semibold text-blue-900">{dept.name}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                            <p className="text-gray-500 italic">
                                {isEditing ? 'No specialities added yet. Add your first speciality above.' : 'No specialities added yet.'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Additional Details */}
                {(profile?.description || profile?.beds || isEditing) && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h4>
                        <div className="space-y-4">
                            <EditableInfoField
                                label="Total Beds"
                                value={profile?.beds?.toString()}
                                isEditing={isEditing}
                                onChange={(val) => handleFieldChange('beds', parseInt(val) || 0)}
                                type="number"
                            />
                            {isEditing ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">About Hospital</label>
                                    <textarea
                                        value={editedProfile?.description || ''}
                                        onChange={(e) => handleFieldChange('description', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 min-h-[100px]"
                                        placeholder="Enter hospital description..."
                                    />
                                </div>
                            ) : profile?.description ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">About Hospital</label>
                                    <div className="mt-1 text-gray-900 leading-relaxed">{profile.description}</div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const InfoField: React.FC<{ label: string; value?: string; isLink?: boolean; editable?: boolean }> = ({
    label,
    value,
    isLink,
    editable = true
}) => (
    <div>
        <label className="block text-sm font-medium text-gray-500">
            {label}
            {!editable && <span className="ml-1 text-xs text-gray-400">(Non-editable)</span>}
        </label>
        <div className="mt-1 text-gray-900 font-medium">
            {value ? (
                isLink ? (
                    <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                        {value}
                    </a>
                ) : value
            ) : (
                <span className="text-gray-400 italic">Not set</span>
            )}
        </div>
    </div>
);

const EditableInfoField: React.FC<{
    label: string;
    value?: string;
    isEditing: boolean;
    onChange: (value: string) => void;
    isLink?: boolean;
    type?: string;
    multiline?: boolean;
}> = ({ label, value, isEditing, onChange, isLink, type = "text", multiline = false }) => (
    <div>
        <label className="block text-sm font-medium text-gray-500">{label}</label>
        {isEditing ? (
            multiline ? (
                <textarea
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 min-h-[80px]"
                    placeholder={`Enter ${label.toLowerCase()}...`}
                />
            ) : (
                <input
                    type={type}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder={`Enter ${label.toLowerCase()}...`}
                />
            )
        ) : (
            <div className="mt-1 text-gray-900 font-medium">
                {value ? (
                    isLink ? (
                        <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                            {value}
                        </a>
                    ) : value
                ) : (
                    <span className="text-gray-400 italic">Not set</span>
                )}
            </div>
        )}
    </div>
);
import React, { useState, useRef } from "react";
import { Patient } from "../../types";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import {
    Camera,
    Save,
    X,
    Edit2,
    Mail,
    Phone,
    MapPin,
    Calendar,
    User,
    Heart,
    Pill,
    AlertCircle,
    FileText,
    Lock,
    Trash2,
    Upload,
    Check
} from "lucide-react";

interface Props {
    patient: Patient;
    onUpdate?: (updatedData: Partial<Patient>) => Promise<void>;
    onDelete?: () => Promise<void>;
}

export const PatientProfileSettings: React.FC<Props> = ({
    patient,
    onUpdate,
    onDelete
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        // Personal Info
        firstName: patient.user?.first_name || "",
        lastName: patient.user?.last_name || "",
        email: patient.user?.email || "",
        dateOfBirth: patient.date_of_birth || "",
        gender: patient.gender || "",

        // Contact Info
        mobile: patient.phone_number || patient.mobile || "",
        alternatePhone: patient.alternate_phone || "",

        // Health Info
        bloodGroup: patient.blood_group || patient.bloodGroup || "",
        nidNumberPatient: patient.nid_number || patient.nidNumberPatient || "",
        healthCondition: patient.health_condition || patient.healthCondition || "",
        medications: patient.medications || "",
        allergies: patient.allergies || "",
        emergencyContact: patient.emergency_contact || "",
        emergencyContactName: patient.emergency_contact_name || "",

        // Location
        province: patient.province || "",
        district: patient.district || "",
        city: patient.city || "",
        address: patient.address || "",
        postalCode: patient.postal_code || "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert("Image size should be less than 5MB");
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert("Please upload a valid image file");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Prepare update payload
            const updatePayload: Partial<Patient> = {
                user: {
                    ...patient.user,
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    email: formData.email,
                },
                date_of_birth: formData.dateOfBirth,
                gender: formData.gender,
                phone_number: formData.mobile,
                alternate_phone: formData.alternatePhone,
                blood_group: formData.bloodGroup,
                nid_number: formData.nidNumberPatient,
                health_condition: formData.healthCondition,
                medications: formData.medications,
                allergies: formData.allergies,
                emergency_contact: formData.emergencyContact,
                emergency_contact_name: formData.emergencyContactName,
                province: formData.province,
                district: formData.district,
                city: formData.city,
                address: formData.address,
                postal_code: formData.postalCode,
            };

            // If profile image changed, include it
            if (profileImage) {
                // TODO: Upload image to backend first, then include URL in payload
                // updatePayload.profile_image = uploadedImageUrl;
            }

            // Call the update function passed from parent
            if (onUpdate) {
                await onUpdate(updatePayload);
            } else {
                // Default: call your API endpoint
                // await fetch(`/api/patients/${patient.id}`, {
                //   method: 'PATCH',
                //   headers: { 'Content-Type': 'application/json' },
                //   body: JSON.stringify(updatePayload)
                // });
            }

            setIsEditing(false);
            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!showDeleteConfirm) {
            setShowDeleteConfirm(true);
            return;
        }

        setLoading(true);
        try {
            if (onDelete) {
                await onDelete();
            } else {
                // Default: call your API endpoint
                // await fetch(`/api/patients/${patient.id}`, { method: 'DELETE' });
            }
            alert("Account deleted successfully");
            // Redirect to login or home
        } catch (error) {
            console.error("Error deleting account:", error);
            alert("Failed to delete account. Please try again.");
        } finally {
            setLoading(false);
            setShowDeleteConfirm(false);
        }
    };

    const cancelEdit = () => {
        // Reset form data to original values
        setFormData({
            firstName: patient.user?.first_name || "",
            lastName: patient.user?.last_name || "",
            email: patient.user?.email || "",
            dateOfBirth: patient.date_of_birth || "",
            gender: patient.gender || "",
            mobile: patient.phone_number || patient.mobile || "",
            alternatePhone: patient.alternate_phone || "",
            bloodGroup: patient.blood_group || patient.bloodGroup || "",
            nidNumberPatient: patient.nid_number || patient.nidNumberPatient || "",
            healthCondition: patient.health_condition || patient.healthCondition || "",
            medications: patient.medications || "",
            allergies: patient.allergies || "",
            emergencyContact: patient.emergency_contact || "",
            emergencyContactName: patient.emergency_contact_name || "",
            province: patient.province || "",
            district: patient.district || "",
            city: patient.city || "",
            address: patient.address || "",
            postalCode: patient.postal_code || "",
        });
        setProfileImage(null);
        setIsEditing(false);
    };

    const currentImage = profileImage ||
        patient.profile_image ||
        `https://ui-avatars.com/api/?name=${formData.firstName}+${formData.lastName}&background=random&size=200`;

    return (
        <div className="w-full max-w-5xl mx-auto p-4 lg:p-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
                    <p className="text-gray-600 mt-1">Manage your personal information and health data</p>
                </div>
                {!isEditing ? (
                    <Button
                        onClick={() => setIsEditing(true)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 flex items-center space-x-2"
                    >
                        <Edit2 className="h-4 w-4" />
                        <span>Edit Profile</span>
                    </Button>
                ) : (
                    <div className="flex space-x-2">
                        <Button
                            onClick={cancelEdit}
                            className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-6 flex items-center space-x-2"
                            disabled={loading}
                        >
                            <X className="h-4 w-4" />
                            <span>Cancel</span>
                        </Button>
                        <Button
                            onClick={handleSave}
                            className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 flex items-center space-x-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    <span>Save Changes</span>
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </div>

            {/* Profile Header Card */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg p-8 mb-6 text-white">
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                    {/* Profile Image */}
                    <div className="relative flex-shrink-0">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white">
                            <img
                                src={currentImage}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {isEditing && (
                            <>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 bg-white text-blue-600 p-3 rounded-full shadow-lg hover:bg-blue-50 transition-colors"
                                >
                                    <Camera className="h-5 w-5" />
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </>
                        )}
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-3xl font-bold mb-2">
                            {formData.firstName} {formData.lastName}
                        </h2>
                        <p className="text-blue-100 mb-4 flex items-center justify-center md:justify-start">
                            <Mail className="h-4 w-4 mr-2" />
                            {formData.email}
                        </p>
                        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center space-x-2">
                                <FileText className="h-4 w-4" />
                                <span className="text-sm">ID: {patient.patient_unique_id || 'N/A'}</span>
                            </div>
                            {formData.bloodGroup && (
                                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center space-x-2">
                                    <Heart className="h-4 w-4" />
                                    <span className="text-sm">{formData.bloodGroup}</span>
                                </div>
                            )}
                            {formData.gender && (
                                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center space-x-2">
                                    <User className="h-4 w-4" />
                                    <span className="text-sm">{formData.gender}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {/* Personal Information */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <div className="flex items-center mb-6">
                        <User className="h-6 w-6 text-blue-600 mr-3" />
                        <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                First Name *
                            </label>
                            <Input
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                disabled={!isEditing}
                                placeholder="Enter first name"
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Last Name *
                            </label>
                            <Input
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                disabled={!isEditing}
                                placeholder="Enter last name"
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address *
                            </label>
                            <Input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={!isEditing}
                                placeholder="Enter email"
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date of Birth
                            </label>
                            <Input
                                name="dateOfBirth"
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Gender
                            </label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                <option value="">Select gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                                <option value="Prefer not to say">Prefer not to say</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                NID Number
                            </label>
                            <Input
                                name="nidNumberPatient"
                                value={formData.nidNumberPatient}
                                onChange={handleChange}
                                disabled={!isEditing}
                                placeholder="Enter NID number"
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <div className="flex items-center mb-6">
                        <Phone className="h-6 w-6 text-green-600 mr-3" />
                        <h3 className="text-xl font-bold text-gray-900">Contact Information</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mobile Number *
                            </label>
                            <Input
                                name="mobile"
                                type="tel"
                                value={formData.mobile}
                                onChange={handleChange}
                                disabled={!isEditing}
                                placeholder="Enter mobile number"
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Alternate Phone
                            </label>
                            <Input
                                name="alternatePhone"
                                type="tel"
                                value={formData.alternatePhone}
                                onChange={handleChange}
                                disabled={!isEditing}
                                placeholder="Enter alternate phone"
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Emergency Contact Name
                            </label>
                            <Input
                                name="emergencyContactName"
                                value={formData.emergencyContactName}
                                onChange={handleChange}
                                disabled={!isEditing}
                                placeholder="Emergency contact name"
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Emergency Contact Number
                            </label>
                            <Input
                                name="emergencyContact"
                                type="tel"
                                value={formData.emergencyContact}
                                onChange={handleChange}
                                disabled={!isEditing}
                                placeholder="Emergency contact number"
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* Health Information */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <div className="flex items-center mb-6">
                        <Heart className="h-6 w-6 text-red-600 mr-3" />
                        <h3 className="text-xl font-bold text-gray-900">Health Information</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Blood Group
                            </label>
                            <select
                                name="bloodGroup"
                                value={formData.bloodGroup}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                <option value="">Select blood group</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Health Condition
                            </label>
                            <Input
                                name="healthCondition"
                                value={formData.healthCondition}
                                onChange={handleChange}
                                disabled={!isEditing}
                                placeholder="e.g., Diabetes, Hypertension"
                                className="w-full"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Pill className="h-4 w-4 inline mr-1" />
                                Current Medications
                            </label>
                            <textarea
                                name="medications"
                                value={formData.medications}
                                onChange={handleChange}
                                disabled={!isEditing}
                                placeholder="List your current medications (one per line)"
                                rows={3}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <AlertCircle className="h-4 w-4 inline mr-1" />
                                Allergies
                            </label>
                            <textarea
                                name="allergies"
                                value={formData.allergies}
                                onChange={handleChange}
                                disabled={!isEditing}
                                placeholder="List any allergies (medications, food, environmental)"
                                rows={3}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>

                {/* Location Information */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <div className="flex items-center mb-6">
                        <MapPin className="h-6 w-6 text-purple-600 mr-3" />
                        <h3 className="text-xl font-bold text-gray-900">Location</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Province
                            </label>
                            <Input
                                name="province"
                                value={formData.province}
                                onChange={handleChange}
                                disabled={!isEditing}
                                placeholder="Enter province"
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                District
                            </label>
                            <Input
                                name="district"
                                value={formData.district}
                                onChange={handleChange}
                                disabled={!isEditing}
                                placeholder="Enter district"
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                City
                            </label>
                            <Input
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                disabled={!isEditing}
                                placeholder="Enter city"
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Postal Code
                            </label>
                            <Input
                                name="postalCode"
                                value={formData.postalCode}
                                onChange={handleChange}
                                disabled={!isEditing}
                                placeholder="Enter postal code"
                                className="w-full"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Address
                            </label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                disabled={!isEditing}
                                placeholder="Enter your complete address"
                                rows={2}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>

                {/* Security & Privacy */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <div className="flex items-center mb-6">
                        <Lock className="h-6 w-6 text-gray-600 mr-3" />
                        <h3 className="text-xl font-bold text-gray-900">Security & Privacy</h3>
                    </div>

                    <div className="space-y-4">
                        <Button className="bg-gray-100 hover:bg-gray-200 text-gray-700 w-full md:w-auto">
                            Change Password
                        </Button>

                        <div className="pt-4 border-t border-gray-200">
                            <h4 className="font-semibold text-gray-900 mb-4">Danger Zone</h4>
                            {!showDeleteConfirm ? (
                                <Button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 flex items-center space-x-2"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span>Delete Account</span>
                                </Button>
                            ) : (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-start space-x-3 mb-4">
                                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                                        <div>
                                            <h5 className="font-semibold text-red-900 mb-1">
                                                Are you absolutely sure?
                                            </h5>
                                            <p className="text-sm text-red-700">
                                                This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-3">
                                        <Button
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="bg-gray-200 hover:bg-gray-300 text-gray-700"
                                            disabled={loading}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleDelete}
                                            className="bg-red-600 hover:bg-red-700 text-white"
                                            disabled={loading}
                                        >
                                            {loading ? "Deleting..." : "Yes, Delete My Account"}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Banner (Sticky at bottom when editing) */}
            {isEditing && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 lg:ml-72 z-30">
                    <div className="max-w-5xl mx-auto flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            <AlertCircle className="h-4 w-4 inline mr-1" />
                            You have unsaved changes
                        </p>
                        <div className="flex space-x-3">
                            <Button
                                onClick={cancelEdit}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700"
                                disabled={loading}
                            >
                                Discard
                            </Button>
                            <Button
                                onClick={handleSave}
                                className="bg-gradient-to-r from-green-600 to-teal-600 text-white flex items-center space-x-2"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="h-4 w-4" />
                                        <span>Save All Changes</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
import React, { useState, useEffect } from 'react';
import {
    Search,
    Camera,
    Info,
    CreditCard,
    Building,
    Smartphone,
    Shield,
    Save,
    ChevronRight,
    Globe,
    CheckCircle,
    AlertCircle,
    X,
    Loader2,
    MapPin,
    Phone,
    Mail,
    Moon,
    Sun,
    Monitor,
    Users,
    Plus,
    Trash2,
    Edit2,
    Key
} from 'lucide-react';
import { User } from '../../../types';
import { adminAPI } from '../../../services/api';

interface SettingsProps {
    user: User;
}

const NEPALI_BANKS = [
    "Nabil Bank", "NIC Asia Bank", "Global IME Bank", "Siddhartha Bank", "Laxmi Sunrise Bank",
    "Sanima Bank", "Prabhu Bank", "Nepal Investment Mega Bank", "Everest Bank", "Standard Chartered Bank",
    "Himalayan Bank", "Nepal SBI Bank", "Citizens Bank", "Prime Commercial Bank", "NMB Bank",
    "Agricultural Development Bank", "Rastriya Banijya Bank", "Nepal Bank Ltd"
];

const DIGITAL_WALLETS = ["eSewa", "Khalti", "IME Pay", "Prabhu Pay"];

export const Settings: React.FC<SettingsProps> = ({ user }) => {
    const [activeTab, setActiveTab] = useState('Account');
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Profile State
    const [profile, setProfile] = useState({
        username: user.hospital_profile?.hospital_name || '',
        handle: user.email.split('@')[0],
        phone: user.hospital_profile?.contact_number || user.mobile || '',
        bio: user.hospital_profile?.description || '',
        email: user.email || '',
        website: user.hospital_profile?.website || '',
        address: user.hospital_profile?.address || ''
    });

    // Contact State
    const [contactInfo, setContactInfo] = useState({
        emergency_phone: '',
        reception_phone: '',
        appointment_phone: '',
        billing_phone: '',
        fax_number: '',
        support_email: '',
        info_email: '',
        map_url: '',
        facebook: '',
        twitter: '',
        instagram: '',
        linkedin: '',
        operating_hours: 'Mon-Fri: 8:00 AM - 8:00 PM, Sat-Sun: 9:00 AM - 5:00 PM'
    });

    // General State
    const [generalSettings, setGeneralSettings] = useState({
        theme: 'light', // light, dark, deepblue
        language: 'English (US)',
        timezone: '(GMT+05:45) Kathmandu',
        dateFormat: 'MM/DD/YYYY',
        notifications: {
            email: true,
            sms: true,
            push: true,
            appointments: true,
            reviews: true
        },
        accessibility: {
            highContrast: false,
            largeText: false,
            reduceMotion: false
        },
        privacy: {
            profileVisibility: 'public',
            showEmail: true,
            showPhone: true
        }
    });

    // Payment State
    const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
    const [showAddPayment, setShowAddPayment] = useState(false);
    const [newPayment, setNewPayment] = useState({
        method_type: 'bank', // bank, wallet
        provider_name: '',
        account_number: '',
        account_holder_name: '',
        qr_code_file: null as File | null,
        is_default: false
    });

    // Staff State (Mock for now until backend is ready)
    const [staffList, setStaffList] = useState<any[]>([
        { id: 'HOSP-RN-001', name: 'Sarita Sharma', role: 'Head Nurse', status: 'Active' },
        { id: 'HOSP-REC-002', name: 'Ramesh Patel', role: 'Receptionist', status: 'Active' }
    ]);
    const [showAddStaff, setShowAddStaff] = useState(false);
    const [newStaff, setNewStaff] = useState({
        id: '', // Added ID to tracking for edit mode
        full_name: '',
        role: 'Nurse',
        password: ''
    });

    useEffect(() => {
        if (activeTab === 'Payment') {
            fetchPaymentMethods();
        }
    }, [activeTab]);

    const showSuccess = (msg: string) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    const showError = (msg: string) => {
        setErrorMessage(msg);
        setTimeout(() => setErrorMessage(null), 3000);
    };

    // --- Profile Handlers ---
    const handleSaveProfile = async () => {
        setIsLoading(true);
        try {
            await adminAPI.updateProfile({
                hospital_name: profile.username,
                contact_number: profile.phone,
                description: profile.bio,
                website: profile.website,
                address: profile.address
            });
            showSuccess("Profile updated successfully!");
        } catch (error) {
            console.error(error);
            showError("Failed to update profile.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- Payment Handlers ---
    const fetchPaymentMethods = async () => {
        try {
            const data = await adminAPI.getPaymentMethods();
            setPaymentMethods(data);
        } catch (error) {
            console.error("Failed to fetch payment methods", error);
        }
    };

    const handleAddPayment = async () => {
        setIsLoading(true);
        try {
            // TODO: Handle file upload for QR code when API supports multipart/form-data
            await adminAPI.addPaymentMethod({
                method_type: newPayment.method_type,
                provider_name: newPayment.provider_name,
                account_number: newPayment.account_number,
                account_holder_name: newPayment.account_holder_name,
                is_default: newPayment.is_default
            });
            await fetchPaymentMethods();
            setShowAddPayment(false);
            setNewPayment({
                method_type: 'bank',
                provider_name: '',
                account_number: '',
                account_holder_name: '',
                qr_code_file: null,
                is_default: false
            });
            showSuccess("Payment method added!");
        } catch (error) {
            console.error(error);
            showError("Failed to add payment method.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeletePayment = async (id: number) => {
        if (!window.confirm("Are you sure you want to remove this payment method?")) return;
        try {
            await adminAPI.deletePaymentMethod(id);
            await fetchPaymentMethods();
            showSuccess("Payment method removed.");
        } catch (error) {
            console.error(error);
            showError("Failed to remove payment method.");
        }
    };

    // --- Staff Handlers (Mock) ---
    const handleAddStaff = () => {
        if (newStaff.id) {
            // Edit Mode
            setStaffList(staffList.map(s => s.id === newStaff.id ? { ...newStaff, status: 'Active' } : s));
            showSuccess(`Staff member updated: ${newStaff.full_name}`);
        } else {
            // Add Mode
            const id = `HOSP-${newStaff.role.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
            setStaffList([...staffList, { ...newStaff, id, name: newStaff.full_name, status: 'Active' }]); // Map full_name to name for display
            showSuccess(`Staff member created. ID: ${id}`);
        }
        setShowAddStaff(false);
        setNewStaff({ id: '', full_name: '', role: 'Nurse', password: '' });
    };

    const handleDeleteStaff = (id: string) => {
        if (window.confirm("Are you sure you want to delete this staff member? This action cannot be undone.")) {
            setStaffList(staffList.filter(s => s.id !== id));
            showSuccess("Staff member deleted successfully.");
        }
    };

    const openEditStaffModal = (staff: any) => {
        setNewStaff({
            id: staff.id,
            full_name: staff.name,
            role: staff.role,
            password: '' // Don't show old password, only allow setting new one
        });
        setShowAddStaff(true);
    };

    const openAddStaffModal = () => {
        setNewStaff({ id: '', full_name: '', role: 'Nurse', password: '' });
        setShowAddStaff(true);
    };

    const tabs = ['General', 'Contact', 'Payment', 'Subscription', 'Staff', 'Account'];

    // --- Render Functions ---

    const renderAccountTab = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h3 className="text-2xl font-bold text-gray-900">Your Profile</h3>
                <p className="text-gray-500 text-base mt-2">Update your hospital's public information.</p>
            </div>

            <div className="space-y-5">
                <label className="text-gray-700 font-medium text-lg">Hospital Name</label>
                <input
                    type="text"
                    value={profile.username}
                    onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                    className="w-full px-5 py-4 text-base bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                    <label className="text-gray-700 font-medium text-lg">Email Address</label>
                    <input type="email" value={profile.email} readOnly className="w-full px-5 py-4 text-base bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed" />
                </div>
                <div className="space-y-3">
                    <label className="text-gray-700 font-medium text-lg">Username / Handle</label>
                    <input type="text" value={profile.handle} readOnly className="w-full px-5 py-4 text-base bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed" />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                    <label className="text-gray-700 font-medium text-lg">Phone Number</label>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl cursor-not-allowed opacity-75">
                            <span className="text-2xl">🇳🇵</span>
                            <span className="text-gray-600 font-medium text-lg">+977</span>
                        </div>
                        <input
                            type="tel"
                            value={profile.phone}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            className="flex-1 px-5 py-4 text-base bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                        />
                    </div>
                </div>
                <div className="space-y-3">
                    <label className="text-gray-700 font-medium text-lg">Website</label>
                    <input
                        type="url"
                        value={profile.website}
                        onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-5 py-4 text-base bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-gray-700 font-medium text-lg">Address</label>
                <input
                    type="text"
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className="w-full px-5 py-4 text-base bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <label className="text-gray-700 font-medium text-lg">About Hospital</label>
                    <Info className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                    rows={4}
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Describe your hospital services and facilities..."
                    className="w-full px-5 py-4 text-base bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                />
            </div>

            <div className="flex justify-end pt-5">
                <button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-medium text-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center gap-3"
                >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    Save Profile Changes
                </button>
            </div>
            <hr className="border-gray-100" />
            <div className="pt-5">
                <div className="p-8 border border-red-100 rounded-2xl bg-red-50/30 flex items-center justify-between">
                    <div>
                        <h4 className="text-red-700 font-semibold mb-2 text-lg">Delete Account</h4>
                        <p className="text-red-600/70 text-base">Target all your data and account details.</p>
                    </div>
                    <button
                        onClick={() => window.confirm("Are you sure? This is permanent.") && alert("Account deletion request sent to admin.")}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium text-base hover:bg-red-700 transition-colors shadow-sm"
                    >
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    );

    const renderPaymentTab = () => (
        <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900">Payment & Billing</h3>
                    <p className="text-gray-500 text-base mt-2">Manage accepted payment methods and QR codes</p>
                </div>
                {!showAddPayment && (
                    <button
                        onClick={() => setShowAddPayment(true)}
                        className="px-5 py-3 bg-indigo-600 text-white rounded-lg text-base font-medium hover:bg-indigo-700 flex items-center gap-2 shadow-sm"
                    >
                        <Plus className="h-5 w-5" /> Add Method
                    </button>
                )}
            </div>

            {showAddPayment && (
                <div className="p-8 bg-white rounded-2xl border border-indigo-100 shadow-sm animate-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-8">
                        <h4 className="font-bold text-gray-900 text-xl">Add New Payment Method</h4>
                        <button onClick={() => setShowAddPayment(false)} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
                    </div>

                    <div className="space-y-8">
                        {/* Type Selection - Big Cards */}
                        <div className="grid grid-cols-2 gap-6">
                            <div
                                onClick={() => setNewPayment({ ...newPayment, method_type: 'bank' })}
                                className={`p-6 border-2 rounded-xl cursor-pointer transition-all flex flex-col items-center gap-3 ${newPayment.method_type === 'bank' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-200'}`}
                            >
                                <Building className={`h-10 w-10 ${newPayment.method_type === 'bank' ? 'text-indigo-600' : 'text-gray-400'}`} />
                                <span className={`font-semibold text-lg ${newPayment.method_type === 'bank' ? 'text-indigo-700' : 'text-gray-600'}`}>Bank Account</span>
                            </div>
                            <div
                                onClick={() => setNewPayment({ ...newPayment, method_type: 'wallet' })}
                                className={`p-6 border-2 rounded-xl cursor-pointer transition-all flex flex-col items-center gap-3 ${newPayment.method_type === 'wallet' ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-green-200'}`}
                            >
                                <Smartphone className={`h-10 w-10 ${newPayment.method_type === 'wallet' ? 'text-green-600' : 'text-gray-400'}`} />
                                <span className={`font-semibold text-lg ${newPayment.method_type === 'wallet' ? 'text-green-700' : 'text-gray-600'}`}>Digital Wallet</span>
                            </div>
                        </div>

                        {/* Provider Selection */}
                        <div>
                            <label className="block text-base font-medium text-gray-700 mb-3">Provider Name</label>
                            <select
                                className="w-full p-4 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                value={newPayment.provider_name}
                                onChange={(e) => setNewPayment({ ...newPayment, provider_name: e.target.value })}
                            >
                                <option value="">Select {newPayment.method_type === 'bank' ? 'Bank' : 'Wallet'}</option>
                                {newPayment.method_type === 'bank'
                                    ? NEPALI_BANKS.map(bank => <option key={bank} value={bank}>{bank}</option>)
                                    : DIGITAL_WALLETS.map(wallet => <option key={wallet} value={wallet}>{wallet}</option>)
                                }
                            </select>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-base font-medium text-gray-700 mb-3">
                                    {newPayment.method_type === 'bank' ? 'Account Number' : 'Wallet ID / Mobile Info'}
                                </label>
                                <input
                                    type="text"
                                    className="w-full p-4 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    value={newPayment.account_number}
                                    onChange={(e) => setNewPayment({ ...newPayment, account_number: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-base font-medium text-gray-700 mb-3">Account Holder Name</label>
                                <input
                                    type="text"
                                    className="w-full p-4 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    value={newPayment.account_holder_name}
                                    onChange={(e) => setNewPayment({ ...newPayment, account_holder_name: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* QR Code Upload */}
                        <div>
                            <label className="block text-base font-medium text-gray-700 mb-3">Upload QR Code (Optional)</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-white hover:border-indigo-400 transition-all cursor-pointer">
                                <Camera className="h-10 w-10 text-gray-400 mb-3" />
                                <span className="text-base text-gray-500">Click to upload QR image</span>
                                <input type="file" className="hidden" accept="image/*" />
                            </div>
                        </div>

                        <button
                            onClick={handleAddPayment}
                            disabled={isLoading}
                            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 shadow-md"
                        >
                            {isLoading ? 'Saving...' : 'Save Payment Method'}
                        </button>
                    </div>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                {paymentMethods.map(method => (
                    <div key={method.id} className="p-6 border border-gray-200 rounded-2xl bg-white relative group hover:border-indigo-300 transition-all shadow-sm">
                        <div className="flex justify-between items-start mb-5">
                            <div className="flex items-center gap-4">
                                <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${method.method_type === 'bank' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                    {method.method_type === 'bank' ? <Building className="h-6 w-6" /> : <Smartphone className="h-6 w-6" />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-lg">{method.provider_name}</h4>
                                    <p className="text-gray-400 text-sm">{method.method_type === 'bank' ? 'Bank Account' : 'Digital Wallet'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg font-mono text-base text-gray-700 mb-3">
                            {method.account_number}
                        </div>
                        <p className="text-sm text-gray-500">{method.account_holder_name}</p>

                        <button
                            onClick={() => handleDeletePayment(method.id)}
                            className="absolute top-5 right-5 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 className="h-5 w-5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderContactTab = () => (
        <div className="space-y-10 animate-in fade-in duration-500">
            <div>
                <h3 className="text-2xl font-bold text-gray-900">Contact Information</h3>
                <p className="text-gray-500 text-base mt-2">Setup public contact details for patients</p>
            </div>

            <div className="grid gap-8">
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <label className="text-gray-700 font-medium text-lg flex items-center gap-2"><Phone className="h-5 w-5" /> Emergency Contact</label>
                        <input
                            type="tel"
                            placeholder="+977-1-xxxxxxx"
                            className="w-full px-5 py-4 text-base bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            value={contactInfo.emergency_phone}
                            onChange={(e) => setContactInfo({ ...contactInfo, emergency_phone: e.target.value })}
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-gray-700 font-medium text-lg flex items-center gap-2"><Phone className="h-5 w-5" /> Reception / Inquiry</label>
                        <input
                            type="tel"
                            placeholder="+977-1-xxxxxxx"
                            className="w-full px-5 py-4 text-base bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            value={contactInfo.reception_phone}
                            onChange={(e) => setContactInfo({ ...contactInfo, reception_phone: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-gray-700 font-medium text-lg flex items-center gap-2"><Mail className="h-5 w-5" /> Support Email</label>
                    <input
                        type="email"
                        placeholder="help@hospital.com"
                        className="w-full px-5 py-4 text-base bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        value={contactInfo.support_email}
                        onChange={(e) => setContactInfo({ ...contactInfo, support_email: e.target.value })}
                    />
                </div>

                <div className="space-y-3">
                    <label className="text-gray-700 font-medium text-lg flex items-center gap-2"><MapPin className="h-5 w-5" /> Google Map URL</label>
                    <input
                        type="url"
                        placeholder="https://maps.google.com/..."
                        className="w-full px-5 py-4 text-base bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        value={contactInfo.map_url}
                        onChange={(e) => setContactInfo({ ...contactInfo, map_url: e.target.value })}
                    />
                    <p className="text-sm text-gray-400">Paste the 'Embed Map' link or Direct Location link here.</p>
                </div>

                <div className="flex justify-end pt-5">
                    <button className="px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-medium text-lg hover:bg-indigo-700 transition-colors shadow-sm">
                        Update Contacts
                    </button>
                </div>
            </div>
        </div>
    );

    const renderGeneralTab = () => (
        <div className="space-y-10 animate-in fade-in duration-500">
            <div>
                <h3 className="text-2xl font-bold text-gray-900">Preferences</h3>
                <p className="text-gray-500 text-base mt-2">Customization according to your preferences</p>
            </div>

            {/* Theme Selection */}
            <div className="space-y-5">
                <label className="text-gray-700 font-medium text-lg">Select Theme</label>
                <div className="grid grid-cols-3 gap-6">
                    {[
                        { id: 'light', label: 'Light Mode', icon: Sun, active: generalSettings.theme === 'light' },
                        { id: 'dark', label: 'Dark Mode', icon: Moon, active: generalSettings.theme === 'dark' },
                        { id: 'system', label: 'System', icon: Monitor, active: generalSettings.theme === 'system' },
                    ].map(theme => (
                        <div
                            key={theme.id}
                            onClick={() => setGeneralSettings({ ...generalSettings, theme: theme.id })}
                            className={`p-6 border-2 rounded-xl cursor-pointer flex flex-col items-center gap-4 transition-all ${theme.active ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'}`}
                        >
                            <div className={`p-3 rounded-full ${theme.active ? 'bg-white text-indigo-600 shadow-sm' : 'bg-gray-100 text-gray-500'}`}>
                                <theme.icon className="h-8 w-8" />
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`font-semibold text-lg ${theme.active ? 'text-indigo-900' : 'text-gray-700'}`}>{theme.label}</span>
                                {theme.active && <CheckCircle className="h-5 w-5 text-indigo-600" />}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <hr className="border-gray-100" />

            {/* Localization */}
            <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <label className="text-gray-700 font-medium text-lg">Language</label>
                        <div className="relative">
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <select
                                className="w-full pl-12 pr-5 py-4 text-base bg-white border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                value={generalSettings.language}
                                onChange={(e) => setGeneralSettings({ ...generalSettings, language: e.target.value })}
                            >
                                <option>English (US)</option>
                                <option>English (UK)</option>
                                <option>Nepali</option>
                                <option>Hindi</option>
                                {/* Add more countries later */}
                            </select>
                            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 rotate-90" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-gray-700 font-medium text-lg">Time Zone</label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <select
                                className="w-full pl-12 pr-5 py-4 text-base bg-white border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                value={generalSettings.timezone}
                                onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                            >
                                <option>(GMT+05:45) Kathmandu</option>
                                <option>(GMT+00:00) UTC</option>
                                <option>(GMT-08:00) Pacific Time</option>
                                {/* Add more */}
                            </select>
                            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 rotate-90" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStaffTab = () => (
        <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900">Staff Management</h3>
                    <p className="text-gray-500 text-base mt-2">Manage access for receptionists, nurses, and general ward staff.</p>
                </div>
                <button
                    onClick={openAddStaffModal}
                    className="px-5 py-3 bg-indigo-600 text-white rounded-lg text-base font-medium hover:bg-indigo-700 flex items-center gap-2 shadow-sm"
                >
                    <Plus className="h-5 w-5" /> Add Staff Member
                </button>
            </div>

            {/* Staff List Table */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-8 py-5 text-base font-semibold text-gray-700">Staff ID</th>
                            <th className="px-8 py-5 text-base font-semibold text-gray-700">Name</th>
                            <th className="px-8 py-5 text-base font-semibold text-gray-700">Role</th>
                            <th className="px-8 py-5 text-base font-semibold text-gray-700">Status</th>
                            <th className="px-8 py-5 text-base font-semibold text-gray-700 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {staffList.map((staff, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                <td className="px-8 py-5 font-mono text-base text-indigo-600 font-medium">{staff.id}</td>
                                <td className="px-8 py-5 text-gray-900 font-medium">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                                            {staff.name.charAt(0)}
                                        </div>
                                        <span className="text-base">{staff.name}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-gray-600 text-base">
                                    <span className="px-3 py-1.5 rounded-md bg-gray-100 border border-gray-200 text-sm font-medium">
                                        {staff.role}
                                    </span>
                                </td>
                                <td className="px-8 py-5">
                                    <span className="px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-sm font-semibold border border-green-100">
                                        {staff.status}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <button
                                        onClick={() => openEditStaffModal(staff)}
                                        className="text-gray-400 hover:text-indigo-600 p-2 transition-colors"
                                        title="Edit Staff"
                                    >
                                        <Edit2 className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteStaff(staff.id)}
                                        className="text-gray-400 hover:text-red-500 p-2 transition-colors ml-3"
                                        title="Delete Staff"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {staffList.length === 0 && (
                    <div className="p-10 text-center text-gray-500 text-lg">
                        No staff members added yet.
                    </div>
                )}
            </div>

            {/* Add Staff Modal (Inline for now) */}
            {showAddStaff && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h4 className="text-2xl font-bold text-gray-900">{newStaff.id ? 'Edit Staff Details' : 'Add New Staff'}</h4>
                            <button onClick={() => setShowAddStaff(false)} className="text-gray-400 hover:text-gray-600"><X className="h-7 w-7" /></button>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-base font-medium text-gray-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    className="w-full p-4 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    value={newStaff.full_name}
                                    onChange={(e) => setNewStaff({ ...newStaff, full_name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-base font-medium text-gray-700 mb-2">Role</label>
                                <select
                                    className="w-full p-4 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    value={newStaff.role}
                                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                                >
                                    <option>Receptionist</option>
                                    <option>Nurse</option>
                                    <option>General Ward Staff</option>
                                    <option>Pharmacist</option>
                                    <option>Accountant</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-base font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Key className="h-5 w-5" /> Password
                                </label>
                                <input
                                    type="password"
                                    className="w-full p-4 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    value={newStaff.password}
                                    onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                                />
                                <p className="text-sm text-gray-500 mt-2">Staff will use their generated ID and this password to login.</p>
                            </div>

                            <button
                                onClick={handleAddStaff}
                                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 shadow-lg mt-8"
                            >
                                {newStaff.id ? 'Save Changes' : 'Create Account & Generate ID'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderSubscriptionTab = () => (
        <div className="space-y-10 animate-in fade-in duration-500">
            <div className="text-center max-w-2xl mx-auto mb-16">
                <h3 className="text-3xl font-bold text-gray-900">Premium Hospital Plan</h3>
                <p className="text-gray-500 mt-3 text-lg">Upgrade your hospital dashboard for faster support, verfied badges, and advanced analytics.</p>
            </div>

            <div className="max-w-md mx-auto relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
                <div className="relative p-10 bg-white ring-1 ring-gray-900/5 rounded-2xl leading-none flex items-top justify-start space-x-6">
                    <div className="space-y-8 w-full">
                        <div className="flex items-center justify-between">
                            <h4 className="text-2xl font-semibold text-gray-900">Annual Plan</h4>
                            <span className="px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-full">Most Popular</span>
                        </div>

                        <div className="flex items-baseline">
                            <span className="text-5xl font-bold text-gray-900">Rs 1,00,000</span>
                            <span className="text-gray-500 ml-3 text-xl">/year</span>
                        </div>

                        <ul className="space-y-5 text-gray-600 text-lg">
                            {[
                                'Verified Hospital Badge',
                                'Priority Support (24/7)',
                                'Advanced Analytics & Reports',
                                'Unlimited Doctor Profiles',
                                'SMS & Email Marketing'
                            ].map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-4">
                                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <button className="w-full py-5 bg-gray-900 text-white rounded-xl font-bold text-xl hover:bg-gray-800 transition-all shadow-lg">
                            Upgrade Now
                        </button>
                        <p className="text-sm text-center text-gray-400">Secure payment via linked bank or wallet</p>
                    </div>
                </div>
            </div>
        </div>
    )

    return (
        <div className="w-full max-w-none px-8 py-10">
            {/* Success/Error Toast */}
            {successMessage && (
                <div className="fixed top-6 right-6 bg-green-50 text-green-700 px-8 py-5 rounded-xl shadow-lg border border-green-200 animate-in slide-in-from-right z-50 flex items-center gap-4 text-lg">
                    <CheckCircle className="h-6 w-6" /> {successMessage}
                </div>
            )}
            {errorMessage && (
                <div className="fixed top-6 right-6 bg-red-50 text-red-700 px-8 py-5 rounded-xl shadow-lg border border-red-200 animate-in slide-in-from-right z-50 flex items-center gap-4 text-lg">
                    <AlertCircle className="h-6 w-6" /> {errorMessage}
                </div>
            )}

            {/* Page Header */}
            <div className="flex items-center justify-between mb-10">
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Settings</h1>
                <div className="relative hidden md:block w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search settings..."
                        className="w-full pl-12 pr-5 py-3 bg-white border border-gray-200 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm transition-all"
                    />
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-10 border-b border-gray-200 mb-10 overflow-x-auto no-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-5 text-base font-medium transition-all relative whitespace-nowrap ${activeTab === tab
                            ? 'text-indigo-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />
                        )}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="min-h-[500px] mb-24">
                {activeTab === 'Account' && renderAccountTab()}
                {activeTab === 'Payment' && renderPaymentTab()}
                {activeTab === 'Subscription' && renderSubscriptionTab()}
                {activeTab === 'Contact' && renderContactTab()}
                {activeTab === 'General' && renderGeneralTab()}
                {activeTab === 'Staff' && renderStaffTab()}
            </div>
        </div>
    );
};

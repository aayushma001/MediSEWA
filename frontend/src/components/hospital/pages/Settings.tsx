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
    Loader2
} from 'lucide-react';
import { User } from '../../../types';
import { adminAPI } from '../../../services/api';

interface SettingsProps {
    user: User;
}

export const Settings: React.FC<SettingsProps> = ({ user }) => {
    const [activeTab, setActiveTab] = useState('Account');
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Profile State
    const [profile, setProfile] = useState({
        username: user.hospital_profile?.hospital_name || '',
        handle: user.username || '',
        phone: user.hospital_profile?.contact_number || user.mobile || '',
        bio: user.hospital_profile?.description || '', // Added description field support
        email: user.email || '',
        website: user.hospital_profile?.website || '',
        address: user.hospital_profile?.address || ''
    });

    // Payment State
    const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
    const [showAddPayment, setShowAddPayment] = useState(false);
    const [newPayment, setNewPayment] = useState({
        method_type: 'bank',
        provider_name: '',
        account_number: '',
        account_holder_name: '',
        is_default: false
    });

    // Notification State
    const [notifications, setNotifications] = useState({
        email: true,
        sound: true,
        browser: false
    });
    const [notificationList, setNotificationList] = useState<any[]>([]);

    useEffect(() => {
        if (activeTab === 'Payment') {
            fetchPaymentMethods();
        } else if (activeTab === 'Account') {
            // Refresh profile data if needed, but we have it from props for now
        }
        // Fetch notifications on mount or tab change if needed
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
            await adminAPI.addPaymentMethod(newPayment);
            await fetchPaymentMethods();
            setShowAddPayment(false);
            setNewPayment({
                method_type: 'bank',
                provider_name: '',
                account_number: '',
                account_holder_name: '',
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

    const tabs = ['General', 'Contact', 'Payment', 'Subscription', 'Account'];

    const renderAccountTab = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div>
                <h3 className="text-xl font-bold text-gray-900">Your Profile</h3>
                <p className="text-gray-500 text-sm mt-1">Update your hospital's public information.</p>
            </div>

            {/* Hospital Name */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-gray-700 font-medium">Hospital Name</label>
                </div>
                <div className="flex items-center">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={profile.username}
                            onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Email & Handle (Read Only) */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-gray-700 font-medium">Email Address</label>
                    <input
                        type="email"
                        value={profile.email}
                        readOnly
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-gray-700 font-medium">Username / Handle</label>
                    <input
                        type="text"
                        value={profile.handle}
                        readOnly
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                    />
                </div>
            </div>

            {/* Phone Number & Website */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-gray-700 font-medium">Phone Number</label>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl cursor-not-allowed opacity-75">
                            <span className="text-xl">🇳🇵</span>
                            <span className="text-gray-600 font-medium">+977</span>
                        </div>
                        <input
                            type="tel"
                            value={profile.phone}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-gray-700 font-medium">Website</label>
                    <input
                        type="url"
                        value={profile.website}
                        onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
                <label className="text-gray-700 font-medium">Address</label>
                <input
                    type="text"
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
            </div>

            {/* Profile Picture */}
            <div className="space-y-2">
                <label className="text-gray-700 font-medium">Profile Picture</label>
                <div className="flex items-center gap-6 p-4 border border-gray-100 rounded-2xl bg-gray-50/50">
                    <div className="relative group cursor-pointer">
                        {user.hospital_profile?.logo ? (
                            <img src={user.hospital_profile.logo} alt="Logo" className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-sm" />
                        ) : (
                            <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-sm">
                                <span className="text-2xl font-bold text-indigo-600">{profile.username.charAt(0)}</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Camera className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-5 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200">
                            Upload New
                        </button>
                        <button className="px-5 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all">
                            Delete
                        </button>
                    </div>
                </div>
            </div>

            {/* Biography / Description */}
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <label className="text-gray-700 font-medium">About Hospital</label>
                    <Info className="h-4 w-4 text-gray-400" />
                </div>
                <div className="relative">
                    <textarea
                        rows={4}
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        placeholder="Describe your hospital services and facilities..."
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                    />
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center gap-2"
                >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Profile Changes
                </button>
            </div>

            <hr className="border-gray-100" />

            {/* Password & Security Section */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Security & Password</h3>
                    <p className="text-gray-500 text-sm mt-1">Manage your account security settings</p>
                </div>

                <div className="p-6 border border-gray-200 rounded-2xl bg-white space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                <Shield className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Password</h4>
                                <p className="text-sm text-gray-500">Last changed 3 months ago</p>
                            </div>
                        </div>
                        <button
                            onClick={() => alert("Change password functionality will be implemented with OTP verification.")}
                            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                            Change Password
                        </button>
                    </div>
                </div>
            </div>

            <hr className="border-gray-100" />

            {/* Danger Zone */}
            <div className="pt-4">
                <div className="p-6 border border-red-100 rounded-2xl bg-red-50/30 flex items-center justify-between">
                    <div>
                        <h4 className="text-red-700 font-semibold mb-1">Delete Account</h4>
                        <p className="text-red-600/70 text-sm">Target all your data and account details.</p>
                    </div>
                    <button
                        onClick={() => window.confirm("Are you sure? This is permanent.") && alert("Account deletion request sent to admin.")}
                        className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-sm"
                    >
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    );

    const renderPaymentTab = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Payment Methods</h3>
                    <p className="text-gray-500 text-sm mt-1">Manage your billing and payout methods</p>
                </div>
                {/* Quick Add Buttons */}
                {!showAddPayment && (
                    <div className="flex gap-3">
                        <button
                            onClick={() => { setShowAddPayment(true); setNewPayment({ ...newPayment, method_type: 'bank' }); }}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
                        >
                            <Building className="h-4 w-4 text-blue-600" /> Link Bank
                        </button>
                        <button
                            onClick={() => { setShowAddPayment(true); setNewPayment({ ...newPayment, method_type: 'wallet' }); }}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
                        >
                            <Smartphone className="h-4 w-4 text-green-600" /> Link Wallet
                        </button>
                    </div>
                )}
            </div>

            {/* Add Payment Form */}
            {showAddPayment && (
                <div className="p-6 bg-gray-50 rounded-2xl border border-indigo-100 animate-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-gray-900">Add New {newPayment.method_type === 'bank' ? 'Bank Account' : 'Digital Wallet'}</h4>
                        <button onClick={() => setShowAddPayment(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Provider Name</label>
                            {newPayment.method_type === 'bank' ? (
                                <select
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    value={newPayment.provider_name}
                                    onChange={(e) => setNewPayment({ ...newPayment, provider_name: e.target.value })}
                                >
                                    <option value="">Select Bank</option>
                                    <option value="Nabil Bank">Nabil Bank</option>
                                    <option value="NIC Asia Bank">NIC Asia Bank</option>
                                    <option value="Global IME Bank">Global IME Bank</option>
                                    <option value="Siddhartha Bank">Siddhartha Bank</option>
                                    <option value="Laxmi Sunrise Bank">Laxmi Sunrise Bank</option>
                                </select>
                            ) : (
                                <select
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    value={newPayment.provider_name}
                                    onChange={(e) => setNewPayment({ ...newPayment, provider_name: e.target.value })}
                                >
                                    <option value="">Select Wallet</option>
                                    <option value="eSewa">eSewa</option>
                                    <option value="Khalti">Khalti</option>
                                    <option value="IME Pay">IME Pay</option>
                                </select>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {newPayment.method_type === 'bank' ? 'Account Number' : 'Wallet ID / Mobile Info'}
                            </label>
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                value={newPayment.account_number}
                                onChange={(e) => setNewPayment({ ...newPayment, account_number: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                value={newPayment.account_holder_name}
                                onChange={(e) => setNewPayment({ ...newPayment, account_holder_name: e.target.value })}
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleAddPayment}
                        disabled={isLoading}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 shadow-sm"
                    >
                        {isLoading ? 'Saving...' : 'Save Payment Method'}
                    </button>
                </div>
            )}

            {/* Payment Methods List */}
            <div className="grid gap-4 md:grid-cols-2">
                {paymentMethods.map(method => (
                    <div key={method.id} className="p-6 border border-gray-200 rounded-2xl bg-white relative group hover:border-indigo-300 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${method.method_type === 'bank' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                {method.method_type === 'bank' ? <Building className="h-6 w-6" /> : <Smartphone className="h-6 w-6" />}
                            </div>
                            {method.is_default && (
                                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full">
                                    Default
                                </span>
                            )}
                        </div>
                        <h4 className="font-bold text-gray-900 mb-1">{method.provider_name}</h4>
                        <p className="text-gray-500 text-sm font-mono mb-1">{method.account_number}</p>
                        <p className="text-gray-400 text-xs">{method.account_holder_name}</p>

                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity mt-4">
                            <button className="text-indigo-600 text-sm font-medium hover:underline">Edit</button>
                            <span className="text-gray-300">|</span>
                            <button
                                onClick={() => handleDeletePayment(method.id)}
                                className="text-red-500 text-sm font-medium hover:underline"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderSubscriptionTab = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="text-center max-w-2xl mx-auto mb-12">
                <h3 className="text-2xl font-bold text-gray-900">Premium Hospital Plan</h3>
                <p className="text-gray-500 mt-2">Upgrade your hospital dashboard for faster support, verfied badges, and advanced analytics.</p>
            </div>

            <div className="max-w-md mx-auto relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
                <div className="relative p-8 bg-white ring-1 ring-gray-900/5 rounded-2xl leading-none flex items-top justify-start space-x-6">
                    <div className="space-y-6 w-full">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xl font-semibold text-gray-900">Annual Plan</h4>
                            <span className="px-3 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-full">Most Popular</span>
                        </div>

                        <div className="flex items-baseline">
                            <span className="text-4xl font-bold text-gray-900">Rs 1,00,000</span>
                            <span className="text-gray-500 ml-2">/year</span>
                        </div>

                        <ul className="space-y-4 text-gray-600">
                            {[
                                'Verified Hospital Badge',
                                'Priority Support (24/7)',
                                'Advanced Analytics & Reports',
                                'Unlimited Doctor Profiles',
                                'SMS & Email Marketing'
                            ].map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-3">
                                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <button className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg">
                            Upgrade Now
                        </button>
                        <p className="text-xs text-center text-gray-400">Secure payment via linked bank or wallet</p>
                    </div>
                </div>
            </div>
        </div>
    )

    const renderGeneralTab = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h3 className="text-xl font-bold text-gray-900">General Settings</h3>
                <p className="text-gray-500 text-sm mt-1">Basic configuration for your hospital dashboard</p>
            </div>

            <div className="grid gap-6">
                {[
                    { icon: Globe, label: 'Language', value: 'English (UK)' },
                    { icon: Globe, label: 'Time Zone', value: '(GMT+05:45) Kathmandu' },
                ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                <item.icon className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900">{item.label}</h4>
                                <p className="text-sm text-gray-500">{item.value}</p>
                            </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-none px-6 py-8">
            {/* Success/Error Toast - Simplified */}
            {successMessage && (
                <div className="fixed top-4 right-4 bg-green-50 text-green-700 px-6 py-4 rounded-xl shadow-lg border border-green-200 animate-in slide-in-from-right z-50 flex items-center gap-3">
                    <CheckCircle className="h-5 w-5" /> {successMessage}
                </div>
            )}
            {errorMessage && (
                <div className="fixed top-4 right-4 bg-red-50 text-red-700 px-6 py-4 rounded-xl shadow-lg border border-red-200 animate-in slide-in-from-right z-50 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5" /> {errorMessage}
                </div>
            )}

            {/* Page Header */}
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Settings</h1>
                <div className="relative hidden md:block w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search settings..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm transition-all"
                    />
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-8 border-b border-gray-200 mb-8 overflow-x-auto no-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-4 text-sm font-medium transition-all relative whitespace-nowrap ${activeTab === tab
                                ? 'text-indigo-600'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab}
                        {((tab === 'Account') || (tab === 'Home')) && (
                            <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                                {tab === 'Account' ? 12 : 10}
                            </span>
                        )}
                        {activeTab === tab && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />
                        )}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {activeTab === 'Account' && renderAccountTab()}
                {activeTab === 'Payment' && renderPaymentTab()}
                {activeTab === 'Subscription' && renderSubscriptionTab()}
                {activeTab === 'General' && renderGeneralTab()}
                {(activeTab === 'Contact') && (
                    <div className="flex flex-col items-center justify-center h-64 text-center animate-in fade-in duration-500">
                        <div className="p-4 bg-gray-50 rounded-full mb-4">
                            <Info className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Coming Soon</h3>
                        <p className="text-gray-500 max-w-sm mt-2">
                            The {activeTab} settings panel is currently under development.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

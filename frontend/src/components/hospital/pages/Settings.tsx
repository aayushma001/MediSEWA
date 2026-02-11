import React, { useState } from 'react';
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
    Globe
} from 'lucide-react';

export const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState('Account');

    // Mock User Data
    const [profile, setProfile] = useState({
        username: 'Medico General Hospital',
        handle: 'medico-gh-001',
        phone: '+977 9800000000',
        bio: 'Leading healthcare provider committed to excellence in patient care.',
        email: 'admin@medico.com',
        website: 'www.medico.com',
        address: 'Kathmandu, Nepal'
    });

    const [notifications, setNotifications] = useState({
        email: true,
        sound: true,
        browser: false
    });

    const [paymentMethods] = useState([
        { id: 1, type: 'bank', name: 'Nabil Bank', account: '**** **** **** 1234', isDefault: true },
        { id: 2, type: 'wallet', name: 'eSewa', account: '984****890', isDefault: false }
    ]);

    const tabs = ['General', 'Contact', 'Payment', 'Subscription', 'Account'];

    const renderAccountTab = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div>
                <h3 className="text-xl font-bold text-gray-900">Your Profile</h3>
                <p className="text-gray-500 text-sm mt-1">Please update your profile settings here</p>
            </div>

            {/* Username Field */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-gray-700 font-medium">Username</label>
                </div>
                <div className="flex items-center">
                    <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">medico.com/</span>
                        <input
                            type="text"
                            value={profile.handle}
                            onChange={(e) => setProfile({ ...profile, handle: e.target.value })}
                            className="w-full pl-28 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                        <Info className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 cursor-help" />
                    </div>
                </div>
            </div>

            {/* Phone Number */}
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

            {/* Profile Picture */}
            <div className="space-y-2">
                <label className="text-gray-700 font-medium">Profile Picture</label>
                <div className="flex items-center gap-6 p-4 border border-gray-100 rounded-2xl bg-gray-50/50">
                    <div className="relative group cursor-pointer">
                        <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-sm">
                            <span className="text-2xl font-bold text-indigo-600">MH</span>
                        </div>
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

            {/* Biography */}
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <label className="text-gray-700 font-medium">Biography</label>
                    <Info className="h-4 w-4 text-gray-400" />
                </div>
                <div className="relative">
                    <textarea
                        rows={4}
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                    />
                    <span className="absolute bottom-3 right-3 text-xs text-gray-400 font-medium">
                        {300 - profile.bio.length} characters remaining
                    </span>
                </div>
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
                            onClick={() => alert("Change password modal would open here")}
                            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                            Change Password
                        </button>
                    </div>
                </div>
            </div>

            <hr className="border-gray-100" />

            {/* Notifications */}
            <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900">Notifications</h3>

                <div className="space-y-4">
                    {[
                        { id: 'email', label: 'Email Notification', desc: 'You will be notified when a new email arrives.' },
                        { id: 'sound', label: 'Sound Notification', desc: 'Play a sound when you receive a notification.' },
                        { id: 'browser', label: 'Browser Notification', desc: 'Show desktop notifications.' }
                    ].map((item: any) => (
                        <div key={item.id} className="flex items-start gap-3">
                            <div className="relative flex items-center mt-1">
                                <input
                                    type="checkbox"
                                    checked={notifications[item.id as keyof typeof notifications]}
                                    onChange={(e) => setNotifications({ ...notifications, [item.id]: e.target.checked })}
                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 transition-all checked:border-indigo-600 checked:bg-indigo-600 hover:border-indigo-400"
                                />
                                <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                                    <svg className="h-3.5 w-3.5" viewBox="0 0 14 14" fill="none">
                                        <path d="M3 8L6 11L11 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900">{item.label}</h4>
                                <p className="text-sm text-gray-500">{item.desc}</p>
                            </div>
                        </div>
                    ))}
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
                        onClick={() => window.confirm("Are you sure? This is permanent.") && alert("Account deletion started")}
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
            <div>
                <h3 className="text-xl font-bold text-gray-900">Payment Methods</h3>
                <p className="text-gray-500 text-sm mt-1">Manage your billing and payout methods</p>
            </div>

            {/* Payment Methods List */}
            <div className="grid gap-4 md:grid-cols-2">
                {paymentMethods.map(method => (
                    <div key={method.id} className="p-6 border border-gray-200 rounded-2xl bg-white relative group hover:border-indigo-300 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${method.type === 'bank' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                {method.type === 'bank' ? <Building className="h-6 w-6" /> : <Smartphone className="h-6 w-6" />}
                            </div>
                            {method.isDefault && (
                                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full">
                                    Default
                                </span>
                            )}
                        </div>
                        <h4 className="font-bold text-gray-900 mb-1">{method.name}</h4>
                        <p className="text-gray-500 text-sm font-mono mb-4">{method.account}</p>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="text-indigo-600 text-sm font-medium hover:underline">Edit</button>
                            <span className="text-gray-300">|</span>
                            <button className="text-red-500 text-sm font-medium hover:underline">Remove</button>
                        </div>
                    </div>
                ))}

                {/* Add New Method Button */}
                <button className="p-6 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all min-h-[200px]">
                    <CreditCard className="h-8 w-8 mb-3" />
                    <span className="font-medium">Add Payment Method</span>
                </button>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Quick Actions</h4>
                <div className="grid gap-4 md:grid-cols-3">
                    <button className="p-4 bg-gray-50 rounded-xl flex items-center gap-3 hover:bg-gray-100 transition-colors text-left">
                        <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                            <Building className="h-5 w-5 text-gray-700" />
                        </div>
                        <div>
                            <div className="font-medium text-gray-900">Link Bank</div>
                            <div className="text-xs text-gray-500">Direct transfer</div>
                        </div>
                    </button>
                    <button className="p-4 bg-gray-50 rounded-xl flex items-center gap-3 hover:bg-gray-100 transition-colors text-left">
                        <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                            <Smartphone className="h-5 w-5 text-gray-700" />
                        </div>
                        <div>
                            <div className="font-medium text-gray-900">Link Wallet</div>
                            <div className="text-xs text-gray-500">eSewa / Khalti</div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );

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
                {activeTab === 'General' && renderGeneralTab()}
                {(activeTab === 'Contact' || activeTab === 'Subscription') && (
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

            {/* Global Actions - Optional Footer */}
            <div className="mt-12 flex justify-end gap-4">
                <button className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                    Cancel
                </button>
                <button
                    onClick={() => alert("Settings saved successfully!")}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center gap-2"
                >
                    <Save className="h-4 w-4" />
                    Save Changes
                </button>
            </div>
        </div>
    );
};

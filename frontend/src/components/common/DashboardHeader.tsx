import React, { useState } from 'react';
import {
    Search,
    Bell,
    Settings,
    ChevronDown,
    User as UserIcon,
    LogOut
} from 'lucide-react';
import { User } from '../../types';

interface DashboardHeaderProps {
    user: User;
    onLogout: () => void;
    onNavigateToProfile: () => void;
    showSearch?: boolean;
    searchPlaceholder?: string;
    onSearchChange?: (value: string) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    user,
    onLogout,
    onNavigateToProfile,
    showSearch = true,
    searchPlaceholder = "Search...",
    onSearchChange
}) => {
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const getProfileId = () => {
        if (user.user_type === 'doctor') return user.unique_id || user.doctor_profile?.doctor_unique_id;
        if (user.user_type === 'hospital') return user.unique_id || user.hospital_profile?.hospital_unique_id;
        if (user.user_type === 'patient') return user.unique_id || user.patient_profile?.patient_unique_id;
        return user.unique_id;
    };

    const profileId = getProfileId();

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm h-20 flex items-center">
            <div className="px-6 w-full flex items-center justify-between">
                {/* Search Section */}
                <div className="flex-1 max-w-xl">
                    {showSearch && (
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                onChange={(e) => onSearchChange?.(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                            />
                        </div>
                    )}
                </div>

                {/* Actions Section */}
                <div className="flex items-center space-x-3 ml-4">
                    <button className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-all group">
                        <Bell size={20} className="text-gray-600 group-hover:text-blue-600" />
                        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                    </button>
                    <button className="p-2.5 hover:bg-gray-100 rounded-xl transition-all group">
                        <Settings size={20} className="text-gray-600 group-hover:text-blue-600" />
                    </button>

                    <div className="h-8 w-px bg-gray-200 mx-2"></div>

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="flex items-center space-x-3 p-1.5 pr-3 hover:bg-gray-50 rounded-xl transition-all border border-transparent hover:border-gray-200 shadow-sm hover:shadow-md"
                        >
                            <div className="relative">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                                    {user.first_name[0]}{user.last_name[0]}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                            </div>
                            <div className="text-left hidden md:block">
                                <div className="text-sm font-bold text-gray-900 leading-tight">
                                    {user.user_type === 'doctor' ? `Dr. ${user.last_name}` : `${user.first_name} ${user.last_name}`}
                                </div>
                                <div className="text-[11px] text-blue-600 font-bold uppercase tracking-wider">
                                    {profileId || user.user_type}
                                </div>
                            </div>
                            <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {showProfileMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-[60]"
                                    onClick={() => setShowProfileMenu(false)}
                                />
                                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-[70] transform origin-top-right transition-all">
                                    <div className="px-4 pb-3 mb-3 border-b border-gray-100 md:hidden">
                                        <p className="text-sm font-bold text-gray-900">{user.first_name} {user.last_name}</p>
                                        <p className="text-xs text-blue-600 font-medium">{profileId}</p>
                                    </div>

                                    <button
                                        onClick={() => {
                                            onNavigateToProfile();
                                            setShowProfileMenu(false);
                                        }}
                                        className="w-full text-left px-4 py-2.5 hover:bg-blue-50 hover:text-blue-700 flex items-center space-x-3 text-sm font-medium transition-colors"
                                    >
                                        <div className="p-1 bg-blue-100 rounded-lg">
                                            <UserIcon size={16} className="text-blue-600" />
                                        </div>
                                        <span>My Profile</span>
                                    </button>

                                    <button
                                        onClick={onLogout}
                                        className="w-full text-left px-4 py-2.5 hover:bg-red-50 hover:text-red-700 flex items-center space-x-3 text-sm font-medium transition-colors mt-1"
                                    >
                                        <div className="p-1 bg-red-100 rounded-lg">
                                            <LogOut size={16} className="text-red-600" />
                                        </div>
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

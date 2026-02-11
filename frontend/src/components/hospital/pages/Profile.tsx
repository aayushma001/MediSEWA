import React from 'react';
import { User } from '../../../types';

interface ProfileProps {
    user: User;
}

export const Profile: React.FC<ProfileProps> = ({ user }) => {
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Hospital Profile</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Hospital Name</label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-lg">{user.hospital_profile?.hospital_name}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Hospital ID</label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-lg font-mono">{user.hospital_profile?.hospital_id}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-lg">{user.email}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-lg">{user.mobile}</div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-lg">{user.hospital_profile?.address}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

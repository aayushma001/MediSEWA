import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, X, Trash2, Search } from 'lucide-react';
import { adminAPI } from '../../../services/api';

interface Speciality {
    id: string;
    name: string;
    description: string;
    icon?: string;
    color?: string;
}

export const Specialities: React.FC = () => {
    const { refreshProfile } = useOutletContext<{ refreshProfile: () => Promise<void> }>();
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [specialities, setSpecialities] = useState<Speciality[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchSpecialities();
    }, []);

    const fetchSpecialities = async () => {
        try {
            setLoading(true);
            const data = await adminAPI.getDepartments();
            setSpecialities(data.map((d: any) => ({
                ...d,
                color: 'bg-blue-50 text-blue-600' // Default color for all
            })));
            setError(null);
        } catch (err) {
            setError('Failed to fetch specialities');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const [newSpeciality, setNewSpeciality] = useState({
        name: '',
        description: ''
    });

    const [editingSpeciality, setEditingSpeciality] = useState<Speciality | null>(null);

    const handleAddSpeciality = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const added = await adminAPI.createDepartment(newSpeciality);
            setSpecialities([...specialities, { ...added, color: 'bg-blue-50 text-blue-600' }]);
            setNewSpeciality({ name: '', description: '' });
            setShowAddModal(false);
            refreshProfile();
        } catch (err) {
            alert('Failed to add speciality');
            console.error(err);
        }
    };

    const handleUpdateSpeciality = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSpeciality) return;
        try {
            const updated = await adminAPI.updateDepartment(editingSpeciality.id, editingSpeciality);
            setSpecialities(specialities.map(s => s.id === editingSpeciality.id ? { ...s, ...updated } : s));
            setEditingSpeciality(null);
            refreshProfile();
        } catch (err) {
            alert('Failed to update speciality');
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to remove this speciality?')) {
            try {
                await adminAPI.deleteDepartment(id);
                setSpecialities(specialities.filter(s => s.id !== id));
                refreshProfile();
            } catch (err) {
                alert('Failed to delete speciality');
                console.error(err);
            }
        }
    };

    const filteredSpecialities = specialities.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Specialities</h2>
                    <p className="text-gray-500">Manage your hospital's medical departments</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-[#00d0f1] text-white rounded-lg hover:bg-[#00c0e1] transition-colors shadow-sm"
                >
                    <Plus className="h-5 w-5" />
                    <span>Add Speciality</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Search specialities..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d0f1]"
                    />
                </div>
            </div>

            {loading && (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00d0f1]"></div>
                </div>
            )}

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100">
                    {error}
                </div>
            )}

            {/* Specialities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSpecialities.map((speciality) => (
                    <div key={speciality.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group relative">
                        <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => setEditingSpeciality(speciality)}
                                className="text-gray-400 hover:text-blue-500 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => handleDelete(speciality.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </div>
                        <div className={`w-12 h-12 rounded-lg ${speciality.color} flex items-center justify-center mb-4 text-xl font-bold`}>
                            {speciality.name.charAt(0)}
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">{speciality.name}</h3>
                        <p className="text-gray-500 text-sm line-clamp-2">{speciality.description}</p>
                    </div>
                ))}

                {filteredSpecialities.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <p>No specialities found matching your search.</p>
                    </div>
                )}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-800">Add New Speciality</h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleAddSpeciality} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Speciality Name</label>
                                <input
                                    type="text"
                                    value={newSpeciality.name}
                                    onChange={(e) => setNewSpeciality({ ...newSpeciality, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d0f1]"
                                    placeholder="e.g. Dermatology"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={newSpeciality.description}
                                    onChange={(e) => setNewSpeciality({ ...newSpeciality, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d0f1] h-32 resize-none"
                                    placeholder="Brief description of the services..."
                                    required
                                />
                            </div>
                            <div className="pt-4 flex space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-[#00d0f1] text-white rounded-lg hover:bg-[#00c0e1] transition-colors"
                                >
                                    Add Speciality
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingSpeciality && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-800">Edit Speciality</h3>
                            <button
                                onClick={() => setEditingSpeciality(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateSpeciality} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Speciality Name</label>
                                <input
                                    type="text"
                                    value={editingSpeciality.name}
                                    onChange={(e) => setEditingSpeciality({ ...editingSpeciality, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d0f1]"
                                    placeholder="e.g. Dermatology"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={editingSpeciality.description}
                                    onChange={(e) => setEditingSpeciality({ ...editingSpeciality, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d0f1] h-32 resize-none"
                                    placeholder="Brief description of the services..."
                                    required
                                />
                            </div>
                            <div className="pt-4 flex space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setEditingSpeciality(null)}
                                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-[#00d0f1] text-white rounded-lg hover:bg-[#00c0e1] transition-colors"
                                >
                                    Update Speciality
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

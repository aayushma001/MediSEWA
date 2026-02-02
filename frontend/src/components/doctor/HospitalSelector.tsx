import React from 'react';
import { Button } from '../ui/Button';
import { Plus, Building2, MapPin, ChevronRight } from 'lucide-react';

export interface HospitalInfo {
    id: string;
    name: string;
    address: string;
}

interface HospitalSelectorProps {
    hospitals: HospitalInfo[];
    selectedHospitalId?: string;
    onSelect: (hospitalId: string) => void;
    onAddHospital: () => void;
}

export const HospitalSelector: React.FC<HospitalSelectorProps> = ({
    hospitals,
    selectedHospitalId,
    onSelect,
    onAddHospital
}) => {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">My Hospitals</h3>
                <button
                    onClick={onAddHospital}
                    className="text-blue-600 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50 transition-colors"
                    title="Add Hospital"
                >
                    <Plus size={18} />
                </button>
            </div>

            <div className="space-y-2">
                {hospitals.length === 0 ? (
                    <p className="text-xs text-gray-500 italic p-4 text-center border-2 border-dashed rounded-lg">
                        No hospitals added yet.
                    </p>
                ) : (
                    hospitals.map((hospital) => (
                        <button
                            key={hospital.id}
                            onClick={() => onSelect(hospital.id)}
                            className={`w-full text-left p-3 rounded-xl border-2 transition-all duration-200 group ${selectedHospitalId === hospital.id
                                ? 'border-blue-500 bg-blue-50 shadow-sm'
                                : 'border-transparent bg-white hover:border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-2 rounded-lg ${selectedHospitalId === hospital.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                        <Building2 size={16} />
                                    </div>
                                    <div>
                                        <p className={`text-sm font-bold ${selectedHospitalId === hospital.id ? 'text-blue-900' : 'text-gray-900'
                                            }`}>
                                            {hospital.name}
                                        </p>
                                        <div className="flex items-center text-xs text-gray-500 mt-1">
                                            <MapPin size={10} className="mr-1" />
                                            <span className="truncate max-w-[120px]">{hospital.address}</span>
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight size={16} className={`mt-1 transition-transform ${selectedHospitalId === hospital.id ? 'text-blue-600 translate-x-1' : 'text-gray-300'
                                    }`} />
                            </div>
                        </button>
                    ))
                )}
            </div>

            <Button
                variant="outline"
                className="w-full justify-center text-xs py-2 border-dashed"
                onClick={onAddHospital}
            >
                <Plus size={14} className="mr-1" /> Add New Hospital
            </Button>
        </div>
    );
};

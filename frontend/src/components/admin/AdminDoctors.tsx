import React, { useState, useEffect } from 'react';
import { doctorsAPI } from '../../services/api';
import { User, Trash2, Mail, Stethoscope } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface Doctor {
  id: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
  specialization: string;
}

export const AdminDoctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const data = await doctorsAPI.getDoctors();
      setDoctors(data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await doctorsAPI.deleteDoctor(id);
        fetchDoctors();
      } catch (error) {
        console.error('Error deleting doctor:', error);
        alert('Failed to delete doctor');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Doctors Management</h2>
        <Button onClick={() => alert('Use the registration page to add new doctors for now.')}>
          Add New Doctor
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8">Loading...</div>
        ) : doctors.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">No doctors found</div>
        ) : (
          doctors.map((doctor) => (
            <Card key={doctor.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">
                      Dr. {doctor.user.first_name} {doctor.user.last_name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Stethoscope className="h-3 w-3 mr-1" />
                      {doctor.specialization}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Mail className="h-3 w-3 mr-1" />
                      {doctor.user.email}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(doctor.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

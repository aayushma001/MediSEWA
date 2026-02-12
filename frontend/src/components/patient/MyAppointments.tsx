import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { appointmentsAPI } from '../../services/api';
import { Calendar, Clock, User, MapPin } from 'lucide-react';

interface Appointment {
  id: number;
  doctor: {
    user: {
      first_name: string;
      last_name: string;
    };
    specialization: string;
  };
  date_time: string;
  status: string;
}

export const MyAppointments: React.FC<{ patientId: string }> = ({ patientId }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, [patientId]);

  const fetchAppointments = async () => {
    try {
      const data = await appointmentsAPI.getPatientAppointments(patientId);
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await appointmentsAPI.updateAppointmentStatus(id.toString(), 'cancelled');
        fetchAppointments();
      } catch (error) {
        console.error('Error cancelling appointment:', error);
        alert('Failed to cancel appointment');
      }
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">My Appointments</h2>
      
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No appointments found.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {appointments.map(apt => (
            <Card key={apt.id} className="hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">
                    Dr. {apt.doctor.user.first_name} {apt.doctor.user.last_name}
                  </h3>
                  <p className="text-blue-600 text-sm">{apt.doctor.specialization}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize
                  ${apt.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 
                    apt.status === 'completed' ? 'bg-green-100 text-green-800' : 
                    'bg-red-100 text-red-800'}`}>
                  {apt.status}
                </span>
              </div>
              
              <div className="space-y-2 text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{new Date(apt.date_time).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{new Date(apt.date_time).toLocaleTimeString()}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                {apt.status === 'scheduled' && (
                  <button 
                    onClick={() => handleCancel(apt.id)}
                    className="text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    Cancel Appointment
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

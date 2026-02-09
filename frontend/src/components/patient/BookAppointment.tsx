import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { doctorsAPI, appointmentsAPI } from '../../services/api';
import { Calendar, Clock, Search, User, MapPin, ChevronRight, ArrowLeft } from 'lucide-react';

interface Doctor {
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  specialization: string;
}

interface Schedule {
  id: number;
  title: string;
  date: string;
  time: string;
  max_patients: number;
  doctor: {
    user: {
      first_name: string;
      last_name: string;
    }
  }
}

export const BookAppointment: React.FC<{ patientId: string }> = ({ patientId }) => {
  const [step, setStep] = useState<'doctors' | 'schedules' | 'confirm'>('doctors');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const data = await doctorsAPI.getDoctors();
      setDoctors(data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDoctor = async (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setLoading(true);
    try {
      const data = await doctorsAPI.getSchedules(doctor.user.id.toString());
      setSchedules(data);
      setStep('schedules');
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!selectedSchedule || !selectedDoctor) return;
    
    try {
      await appointmentsAPI.createAppointment({
        doctor_id: selectedDoctor.user.id,
        patient_id: patientId,
        date_time: `${selectedSchedule.date}T${selectedSchedule.time}`,
        schedule_id: selectedSchedule.id, // Pass schedule ID if backend supports it, otherwise date_time matches
        instructions: `Booked via session: ${selectedSchedule.title}`
      });
      alert('Appointment booked successfully!');
      setStep('doctors');
      setSelectedDoctor(null);
      setSelectedSchedule(null);
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment');
    }
  };

  const filteredDoctors = doctors.filter(doc => 
    `${doc.user.first_name} ${doc.user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {step === 'doctors' && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Book Appointment</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search doctors..."
                className="pl-10"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredDoctors.map(doctor => (
              <Card key={doctor.user.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">Dr. {doctor.user.first_name} {doctor.user.last_name}</h3>
                    <p className="text-sm text-blue-600 font-medium mb-2">{doctor.specialization}</p>
                    <Button 
                      onClick={() => handleSelectDoctor(doctor)}
                      className="w-full justify-center mt-2"
                      size="sm"
                    >
                      View Schedule
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {step === 'schedules' && selectedDoctor && (
        <>
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={() => setStep('doctors')} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Doctors
            </Button>
            <h2 className="text-2xl font-bold text-gray-900">
              Sessions for Dr. {selectedDoctor.user.first_name} {selectedDoctor.user.last_name}
            </h2>
          </div>

          {schedules.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No sessions available for this doctor.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {schedules.map(schedule => (
                <Card key={schedule.id} className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                  <h3 className="font-bold text-lg mb-2">{schedule.title}</h3>
                  <div className="space-y-2 text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{schedule.date}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{schedule.time}</span>
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      <span>Max {schedule.max_patients} Patients</span>
                    </div>
                  </div>
                  <Button onClick={() => {
                    setSelectedSchedule(schedule);
                    setStep('confirm');
                  }} className="w-full">
                    Book This Session
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {step === 'confirm' && selectedSchedule && selectedDoctor && (
        <Card className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Confirm Booking</h2>
          <div className="space-y-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Doctor Details</h3>
              <p className="text-blue-800">Dr. {selectedDoctor.user.first_name} {selectedDoctor.user.last_name}</p>
              <p className="text-blue-600 text-sm">{selectedDoctor.specialization}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Session Details</h3>
              <p className="text-green-800 font-medium">{selectedSchedule.title}</p>
              <div className="flex items-center space-x-4 mt-2 text-green-700">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{selectedSchedule.date}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{selectedSchedule.time}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <Button variant="outline" onClick={() => setStep('schedules')} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleBook} className="flex-1">
              Confirm Booking
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

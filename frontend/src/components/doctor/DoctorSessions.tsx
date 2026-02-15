import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { doctorsAPI } from '../../services/api';
import { Calendar, Clock, Users, Plus, Trash2 } from 'lucide-react';

interface Schedule {
  id: number;
  title: string;
  date: string;
  time: string;
  max_patients: number;
}

export const DoctorSessions: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    max_patients: 50
  });

  const fetchSchedules = async () => {
    try {
      const data = await doctorsAPI.getSchedules();
      setSchedules(data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await doctorsAPI.createSchedule(formData);
      setShowForm(false);
      fetchSchedules();
      setFormData({ title: '', date: '', time: '', max_patients: 50 });
    } catch (error) {
      console.error('Error creating schedule:', error);
      alert('Failed to create schedule');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        await doctorsAPI.deleteSchedule(id);
        fetchSchedules();
      } catch (error) {
        console.error('Error deleting schedule:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Sessions</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Session
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6 border-2 border-blue-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Create New Session</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session Title</label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Morning Checkup"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Patients</label>
                <Input
                  type="number"
                  required
                  value={formData.max_patients}
                  onChange={e => setFormData({ ...formData, max_patients: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <Input
                  type="date"
                  required
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <Input
                  type="time"
                  required
                  value={formData.time}
                  onChange={e => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit">Create Session</Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-8">Loading sessions...</div>
      ) : schedules.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No sessions scheduled yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {schedules.map((schedule) => (
            <Card key={schedule.id} className="hover:shadow-md transition-shadow relative">
              <div className="absolute top-4 right-4">
                <button 
                  onClick={() => handleDelete(schedule.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{schedule.title}</h3>
              <div className="space-y-2 text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                  <span>{schedule.date}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-blue-500" />
                  <span>{schedule.time}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-blue-500" />
                  <span>Max {schedule.max_patients} Patients</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

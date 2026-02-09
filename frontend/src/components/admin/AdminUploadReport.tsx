import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { patientsAPI, doctorsAPI, appointmentsAPI } from '../../services/api';
import { User, FileText, Upload } from 'lucide-react';

interface Patient {
  id: string;
  user: { first_name: string; last_name: string };
}

interface Doctor {
  id: string;
  user: { first_name: string; last_name: string };
  specialization: string;
}

export const AdminUploadReport: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patientId, setPatientId] = useState<string>('');
  const [doctorId, setDoctorId] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'pdf' | 'image' | 'text'>('pdf');
  const [description, setDescription] = useState('');
  const [textContent, setTextContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const ps = await patientsAPI.getPatients();
        setPatients(ps);
        const ds = await doctorsAPI.getDoctors();
        setDoctors(ds);
      } catch (e) {}
    };
    load();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!patientId || !doctorId) {
      setMessage('Please select patient and doctor');
      return;
    }
    if (fileType !== 'text' && !file) {
      setMessage('Please attach a file');
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('patient', patientId);
      fd.append('doctor', doctorId);
      fd.append('description', description);
      fd.append('file_type', fileType);
      if (file && fileType !== 'text') {
        fd.append('file', file);
      }
      if (fileType === 'text') {
        fd.append('file_content', textContent);
      }
      await appointmentsAPI.createPatientReport(fd);
      setMessage('Report uploaded successfully');
      setPatientId('');
      setDoctorId('');
      setFile(null);
      setDescription('');
      setTextContent('');
    } catch (e: any) {
      setMessage(e?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Upload Test Report</h2>
      </div>

      {message && (
        <Card>
          <div className="p-4">{message}</div>
        </Card>
      )}

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Patient</label>
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full border rounded-md p-2"
                required
              >
                <option value="">Choose patient</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.user.first_name} {p.user.last_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Doctor</label>
              <select
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                className="w-full border rounded-md p-2"
                required
              >
                <option value="">Choose doctor</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    Dr. {d.user.first_name} {d.user.last_name} - {d.specialization}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border rounded-md p-3"
              placeholder="Brief description of the test/report"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value as any)}
                className="w-full border rounded-md p-2"
              >
                <option value="pdf">PDF</option>
                <option value="image">Image</option>
                <option value="text">Text</option>
              </select>
            </div>
            {fileType !== 'text' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attach File</label>
                <input type="file" onChange={handleFileChange} className="w-full" />
              </div>
            )}
          </div>

          {fileType === 'text' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Text Content</label>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                rows={6}
                className="w-full border rounded-md p-3"
                placeholder="Paste or type textual report content"
              />
            </div>
          )}

          <Button type="submit" loading={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Upload className="h-4 w-4 mr-2" />
            Upload Report
          </Button>
        </form>
      </Card>
    </div>
  );
}

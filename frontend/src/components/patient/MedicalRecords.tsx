import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { appointmentsAPI } from '../../services/api';
import { MedicalRecord } from '../../types';
import { FileText, Calendar, User } from 'lucide-react';

interface MedicalRecordsProps {
  patientId: string;
}

export const MedicalRecords: React.FC<MedicalRecordsProps> = ({ patientId }) => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecords = async () => {
    try {
      setError(null);
      const data = await appointmentsAPI.getPatientMedicalRecords(patientId);
      setRecords(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load medical records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [patientId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Medical Records</h2>
        <Button onClick={loadRecords} variant="outline">Refresh</Button>
      </div>

      {loading && (
        <Card>
          <div className="p-6 text-gray-500">Loading records...</div>
        </Card>
      )}

      {error && (
        <Card>
          <div className="p-6 text-red-600">{error}</div>
        </Card>
      )}

      {!loading && !error && records.length === 0 && (
        <Card>
          <div className="p-6 text-gray-500">No medical records found.</div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {records.map((rec) => (
          <Card key={rec.id} className="p-6">
            <div className="flex items-start">
              <div className="p-3 bg-blue-50 rounded-lg mr-4">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(rec.record_date).toLocaleDateString()}</span>
                  </div>
                  {rec.doctor_name && (
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <User className="h-4 w-4" />
                      <span>{rec.doctor_name}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Diagnosis</p>
                  <p className="text-gray-900">{rec.diagnosis}</p>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-gray-500">Symptoms</p>
                  <p className="text-gray-900">{rec.symptoms}</p>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-gray-500">Prescription</p>
                  <p className="text-gray-900 whitespace-pre-wrap">{rec.prescription}</p>
                </div>
                {rec.attachment && (
                  <div className="mt-4">
                    <a
                      href={rec.attachment}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Attachment
                    </a>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

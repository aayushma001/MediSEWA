import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { appointmentsAPI } from '../../services/api';
import { Doctor, Hospital } from '../../types';
import { MapPin, Stethoscope, AlertTriangle } from 'lucide-react';

interface EmergencySearchProps {
  onUseLocation?: (lat: number, lon: number) => void;
}

export const EmergencySearch: React.FC<EmergencySearchProps> = () => {
  const [symptoms, setSymptoms] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
      },
      (err) => {
        setError(err.message || 'Failed to get location');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const search = async () => {
    setLoading(true);
    setError(null);
    try {
      const doctorData = await appointmentsAPI.recommendDoctors({ symptoms, latitude, longitude });
      setDoctors(doctorData);
      const hospitalData = await appointmentsAPI.nearbyHospitals({ latitude, longitude });
      setHospitals(hospitalData);
    } catch (e: any) {
      setError(e?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If we have location, do an initial nearby hospitals fetch
    if (latitude !== undefined && longitude !== undefined) {
      (async () => {
        try {
          const hospitalData = await appointmentsAPI.nearbyHospitals({ latitude, longitude });
          setHospitals(hospitalData);
        } catch {}
      })();
    }
  }, [latitude, longitude]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Emergency Search</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={useMyLocation}>
            <MapPin className="h-4 w-4 mr-2" />
            Use My Location
          </Button>
          <Button onClick={search} className="bg-red-600 hover:bg-red-700 text-white">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Search Now
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Describe your symptoms</label>
        <textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          className="w-full border rounded-md p-3"
          rows={4}
          placeholder="e.g., sudden chest pain, shortness of breath"
        />
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="number"
            value={latitude ?? ''}
            onChange={(e) => setLatitude(e.target.value ? Number(e.target.value) : undefined)}
            placeholder="Latitude"
            className="border rounded-md p-2"
          />
          <input
            type="number"
            value={longitude ?? ''}
            onChange={(e) => setLongitude(e.target.value ? Number(e.target.value) : undefined)}
            placeholder="Longitude"
            className="border rounded-md p-2"
          />
        </div>
      </Card>

      {loading && (
        <Card>
          <div className="p-6 text-gray-500">Searching...</div>
        </Card>
      )}
      {error && (
        <Card>
          <div className="p-6 text-red-600">{error}</div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Stethoscope className="h-5 w-5 mr-2" />
            Recommended Doctors
          </h3>
          {doctors.length === 0 ? (
            <p className="text-gray-500">No doctor recommendations yet.</p>
          ) : (
            <ul className="space-y-4">
              {doctors.map((doc) => (
                <li key={doc.id} className="border rounded-md p-4">
                  <div className="font-semibold">
                    {doc.user.first_name} {doc.user.last_name}
                  </div>
                  <div className="text-sm text-gray-600">{doc.specialization}</div>
                  {doc.latitude !== undefined && doc.longitude !== undefined && (
                    <div className="text-xs text-gray-400 mt-1">
                      Lat: {doc.latitude}, Lon: {doc.longitude}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Nearby Hospitals
          </h3>
          {hospitals.length === 0 ? (
            <p className="text-gray-500">No nearby hospitals found.</p>
          ) : (
            <ul className="space-y-4">
              {hospitals.map((hosp) => (
                <li key={hosp.id} className="border rounded-md p-4">
                  <div className="font-semibold">{hosp.hospital_name}</div>
                  <div className="text-sm text-gray-600">{hosp.address}</div>
                  {hosp.latitude !== undefined && hosp.longitude !== undefined && (
                    <div className="text-xs text-gray-400 mt-1">
                      Lat: {hosp.latitude}, Lon: {hosp.longitude}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

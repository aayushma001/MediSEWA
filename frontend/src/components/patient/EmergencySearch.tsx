import React, { useEffect, useState, useRef } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { appointmentsAPI } from '../../services/api';
import { Doctor, Hospital } from '../../types';
import {
  MapPin,
  Stethoscope,
  AlertTriangle,
  Phone,
  Clock,
  Building2,
  Search,
  Navigation,
  Calendar,
  Star
} from 'lucide-react';
import { locationData } from '../../utils/locationData';

interface EmergencySearchProps {
  onUseLocation?: (lat: number, lon: number) => void;
}

/* ─── LOCATION SEARCH HELPER ─────────────────────────────────────── */
/* ─── LOCATION SEARCH HELPER ─────────────────────────────────────── */
const searchLocations = (query: string) => {
  if (!query || query.length < 2) return [];

  const results: Array<{ display: string, province: string, district: string, city: string }> = [];
  const lowerQuery = query.toLowerCase();

  Object.entries(locationData).forEach(([province, districts]) => {
    // Search in province name
    if (province.toLowerCase().includes(lowerQuery)) {
      Object.entries(districts).forEach(([district, cities]) => {
        cities.forEach(city => {
          results.push({
            display: `${city}, ${district}, ${province}`,
            province,
            district,
            city
          });
        });
      });
    } else {
      // Search in districts and cities
      Object.entries(districts).forEach(([district, cities]) => {
        if (district.toLowerCase().includes(lowerQuery)) {
          cities.forEach(city => {
            results.push({
              display: `${city}, ${district}, ${province}`,
              province,
              district,
              city
            });
          });
        } else {
          // Search in cities
          cities.forEach(city => {
            if (city.toLowerCase().includes(lowerQuery)) {
              results.push({
                display: `${city}, ${district}, ${province}`,
                province,
                district,
                city
              });
            }
          });
        }
      });
    }
  });

  return results.slice(0, 10); // Limit to 10 results
};

export const EmergencySearch: React.FC<EmergencySearchProps> = () => {
  const [symptoms, setSymptoms] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);

  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const suggestionRef = useRef<HTMLDivElement>(null);

  // Location autocomplete
  useEffect(() => {
    const results = searchLocations(locationQuery);
    setLocationSuggestions(results);
    setShowSuggestions(results.length > 0 && locationQuery.length >= 2);
  }, [locationQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch all providers on mount
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [doctorData, hospitalData] = await Promise.all([
          appointmentsAPI.recommendDoctors({ symptoms: '', location: '' }),
          appointmentsAPI.nearbyHospitals({ location: '' })
        ]);
        setDoctors(doctorData);
        setHospitals(hospitalData);
      } catch (e) {
        console.error("Failed to fetch initial data", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by your browser');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setLocationQuery(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`);
        setSelectedLocation({
          display: 'Current Location',
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Failed to get location');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const search = async () => {
    if (!selectedLocation && !latitude && !longitude) {
      setError('Please select a location or use your current location');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Use selected location coordinates if available
      const searchLat = latitude || selectedLocation?.latitude;
      const searchLon = longitude || selectedLocation?.longitude;

      // Search doctors with symptoms and location
      const doctorData = await appointmentsAPI.recommendDoctors({
        symptoms,
        latitude: searchLat,
        longitude: searchLon,
        location: locationQuery
      });
      setDoctors(doctorData);

      // Search nearby hospitals
      const hospitalData = await appointmentsAPI.nearbyHospitals({
        latitude: searchLat,
        longitude: searchLon,
        location: locationQuery
      });
      setHospitals(hospitalData);
    } catch (e: any) {
      setError(e?.message || 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (loc: any) => {
    setSelectedLocation(loc);
    setLocationQuery(loc.display);
    setShowSuggestions(false);
    // Clear lat/lon when selecting text location (will use location name for filtering)
    setLatitude(undefined);
    setLongitude(undefined);
  };

  const handleEmergencyBooking = (doctor: Doctor, hospital: Hospital) => {
    setSelectedDoctor(doctor);
    setSelectedHospital(hospital);
    setShowBookingModal(true);

    // Here you can redirect to booking with emergency flag
    // or open a modal for quick emergency booking
    const doctorId = doctor.id || doctor.user?.id || doctor.doctor_unique_id;
    const hospitalId = hospital.id || hospital.hospital_unique_id || hospital.user?.id;

    const bookingUrl = `/patient/book-appointment?emergency=true&doctor=${doctorId}&hospital=${hospitalId}`;
    window.location.href = bookingUrl;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Emergency Alert Banner */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-2xl shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={28} />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">Emergency Medical Search</h1>
            <p className="text-red-100 text-sm">
              Find doctors and hospitals near you for urgent medical care. For life-threatening emergencies, call 102 immediately.
            </p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <Card className="p-6 border-0 shadow-lg">
        <div className="space-y-4">
          {/* Location Search */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              📍 Your Location
            </label>
            <div className="flex gap-3">
              <div className="flex-1 relative" ref={suggestionRef}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Type: Kathmandu, Budhanilkantha, or use current location..."
                  value={locationQuery}
                  onChange={e => {
                    setLocationQuery(e.target.value);
                    setSelectedLocation(null);
                  }}
                  onFocus={() => {
                    if (locationSuggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-400 focus:outline-none text-sm font-medium"
                />
                {showSuggestions && locationSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-10 mt-2 max-h-60 overflow-y-auto">
                    {locationSuggestions.map((loc, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleLocationSelect(loc)}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-50 font-medium transition border-b border-gray-100 last:border-0">
                        <div className="flex items-start gap-3">
                          <MapPin size={16} className="text-red-600 mt-0.5" />
                          <div>
                            <div className="font-semibold text-gray-800">{loc.city}</div>
                            <div className="text-xs text-gray-500">{loc.district}, {loc.province}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                onClick={useMyLocation}
                className="border-red-200 text-red-700 hover:bg-red-50 whitespace-nowrap">
                <Navigation className="h-4 w-4 mr-2" />
                Use My Location
              </Button>
            </div>
            {selectedLocation && (
              <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-red-900">
                    {selectedLocation.display || 'Current Location'}
                  </p>
                  {selectedLocation.city && (
                    <p className="text-xs text-red-700">{selectedLocation.district}, {selectedLocation.province}</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedLocation(null);
                    setLocationQuery('');
                  }}
                  className="w-7 h-7 bg-red-200 hover:bg-red-300 text-red-800 rounded-full flex items-center justify-center transition font-bold text-sm">
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Symptoms Description */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              🩺 Describe Your Symptoms
            </label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl p-4 focus:border-red-400 focus:outline-none text-sm"
              rows={4}
              placeholder="e.g., sudden chest pain, shortness of breath, high fever, severe headache..."
            />
          </div>

          {/* Search Button */}
          <Button
            onClick={search}
            disabled={loading || (!selectedLocation && !latitude)}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 text-base font-bold shadow-lg disabled:opacity-50">
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Searching...
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 mr-2" />
                Find Emergency Care
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="p-4 bg-red-50 border-2 border-red-200">
          <div className="flex items-center gap-3 text-red-800">
            <AlertTriangle size={20} />
            <p className="font-medium">{error}</p>
          </div>
        </Card>
      )}

      {/* Results Section - Doctors First */}
      {doctors.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Stethoscope className="h-6 w-6 mr-2 text-red-600" />
              Available Doctors
            </h2>
            <span className="text-sm text-gray-500">{doctors.length} doctors found</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {doctors.map((doc) => {
              const fullName = `Dr. ${doc.user.first_name} ${doc.user.last_name}`;
              return (
                <Card key={doc.id} className="p-5 border-0 shadow-md hover:shadow-xl transition-all">
                  <div className="flex gap-4">
                    <img
                      src={doc.profile_picture || "https://avatar.iran.liara.run/public/11"}
                      alt={fullName}
                      className="w-16 h-16 rounded-xl object-cover border-4 border-red-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-base">{fullName}</h3>
                      <p className="text-red-600 font-semibold text-sm">{doc.specialization}</p>
                      <p className="text-gray-500 text-xs mt-1">{doc.qualification}</p>

                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                        <div className="flex items-center">
                          <Star size={14} className="text-amber-500 fill-amber-500 mr-1" />
                          <span className="font-semibold">4.8</span>
                        </div>
                        <div className="flex items-center">
                          <Clock size={14} className="mr-1" />
                          <span>{doc.experience_years} years exp</span>
                        </div>
                      </div>

                      {doc.departments && doc.departments.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {doc.departments.slice(0, 2).map((dept: any) => (
                            <span key={dept.id} className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full">
                              {dept.name}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            // Find hospital for this doctor or use first available
                            const hospital = hospitals.find(h =>
                              h.id === doc.hospital_id
                            ) || hospitals[0];
                            if (hospital) {
                              handleEmergencyBooking(doc, hospital);
                            }
                          }}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs">
                          <Calendar size={14} className="mr-1" />
                          Emergency Booking
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-700 hover:bg-red-50 text-xs">
                          <Phone size={14} className="mr-1" />
                          Call
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Results Section - Hospitals Below */}
      {hospitals.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Building2 className="h-6 w-6 mr-2 text-blue-600" />
              Nearby Hospitals
            </h2>
            <span className="text-sm text-gray-500">{hospitals.length} hospitals found</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {hospitals.map((hosp) => (
              <Card key={hosp.id} className="p-5 border-0 shadow-md hover:shadow-xl transition-all">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-2xl shadow-md flex-shrink-0">
                    {hosp.logo ? (
                      <img src={hosp.logo} alt="" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      "🏥"
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-base">{hosp.hospital_name}</h3>
                    <p className="text-gray-600 text-sm">{hosp.hospital_type || 'Hospital'}</p>

                    {hosp.address && (
                      <div className="flex items-start gap-1 mt-2 text-xs text-gray-500">
                        <MapPin size={12} className="mt-0.5 flex-shrink-0" />
                        <span>{hosp.address}</span>
                      </div>
                    )}

                    {hosp.city && (
                      <p className="text-xs text-gray-500 mt-1">
                        {hosp.city}, {hosp.district}
                      </p>
                    )}

                    {hosp.opening_hours && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600 font-semibold">
                        <Clock size={12} />
                        <span>{hosp.opening_hours}</span>
                      </div>
                    )}

                    {hosp.departments && hosp.departments.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {hosp.departments.slice(0, 3).map((dept: any) => (
                          <span key={dept.id} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                            {dept.name}
                          </span>
                        ))}
                        {hosp.departments.length > 3 && (
                          <span className="text-xs text-gray-400">+{hosp.departments.length - 3}</span>
                        )}
                      </div>
                    )}

                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          // Redirect to booking with this hospital pre-selected
                          window.location.href = `/patient/book-appointment?emergency=true&hospital=${hosp.id}`;
                        }}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs">
                        <Calendar size={14} className="mr-1" />
                        Book Emergency
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-200 text-blue-700 hover:bg-blue-50 text-xs">
                        <MapPin size={14} className="mr-1" />
                        Directions
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-200 text-blue-700 hover:bg-blue-50 text-xs">
                        <Phone size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && doctors.length === 0 && hospitals.length === 0 && selectedLocation && (
        <Card className="p-12 text-center border-0 shadow-lg">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={40} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Results Found</h3>
          <p className="text-gray-600 mb-4">
            We couldn't find any doctors or hospitals near your location.
          </p>
          <Button
            onClick={() => {
              setSelectedLocation(null);
              setLocationQuery('');
              setDoctors([]);
              setHospitals([]);
            }}
            variant="outline"
            className="border-red-200 text-red-700 hover:bg-red-50">
            Try Different Location
          </Button>
        </Card>
      )}

      {/* Emergency Helpline */}
      <Card className="p-6 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Phone size={24} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-1">Emergency Helpline</h3>
            <p className="text-gray-700 text-sm mb-3">
              For immediate life-threatening emergencies, please call:
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="tel:102" className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition">
                <Phone size={18} />
                102 - Ambulance
              </a>
              <a href="tel:100" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition">
                <Phone size={18} />
                100 - Police
              </a>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
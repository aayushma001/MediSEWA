import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TimeSlot {
  id: number;
  day_of_week: number;
  day_name: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface DoctorAvailabilityCalendarProps {
  doctorId: number;
  onDateSelect: (date: string, time: string) => void;
  selectedDate?: string;
  selectedTime?: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DoctorAvailabilityCalendar: React.FC<DoctorAvailabilityCalendarProps> = ({
  doctorId,
  onDateSelect,
  selectedDate,
  selectedTime
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availability, setAvailability] = useState<{
    default_availability: {
      days: string;
      start_time: string;
      end_time: string;
      slot_duration: number;
    };
    time_slots: TimeSlot[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  useEffect(() => {
    fetchAvailability();
  }, [doctorId]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://127.0.0.1:8001/api/doctors/${doctorId}/availability/`);
      if (!response.ok) throw new Error('Failed to fetch availability');
      const data = await response.json();
      setAvailability(data);
      
      // Calculate available dates for the current month
      calculateAvailableDates(data, new Date());
    } catch (err) {
      setError('Failed to load doctor availability');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateAvailableDates = (
    availabilityData: { default_availability: { days: string }; time_slots: TimeSlot[] },
    date: Date
  ) => {
    const dates = new Set<string>();
    const availableDays = availabilityData.default_availability.days.split(',').map(d => d.trim());
    
    // Get year and month
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Iterate through days of the month
    for (let day = 1; day <= 31; day++) {
      try {
        const currentDayDate = new Date(year, month, day);
        if (currentDayDate.getMonth() !== month) break;
        
        const dayOfWeek = currentDayDate.getDay();
        const dayName = DAYS[dayOfWeek];
        
        // Check if this day is in the doctor's availability
        if (availableDays.includes(dayName) || availableDays.includes(dayName.toUpperCase())) {
          // Check if there's a time slot for this day
          const hasSlot = availabilityData.time_slots.some(
            slot => slot.day_of_week === dayOfWeek && slot.is_available
          );
          
          if (hasSlot) {
            dates.add(currentDayDate.toISOString().split('T')[0]);
          }
        }
      } catch {
        // Date might be invalid
      }
    }
    
    setAvailableDates(dates);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const formatTime = (timeStr: string) => {
    try {
      // Handle different time formats
      if (timeStr.includes(':')) {
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${ampm}`;
      }
      return timeStr;
    } catch {
      return timeStr;
    }
  };

  const getTimeSlotsForDate = (date: Date) => {
    if (!availability) return [];
    
    const dayOfWeek = date.getDay();
    
    return availability.time_slots.filter(
      slot => slot.day_of_week === dayOfWeek && slot.is_available
    );
  };

  const generateTimeSlotsForDisplay = (date: Date) => {
    if (!availability) return [];
    
    const dayOfWeek = date.getDay();
    const slotsForDay = availability.time_slots.filter(
      slot => slot.day_of_week === dayOfWeek && slot.is_available
    );
    
    if (slotsForDay.length > 0) {
      return slotsForDay;
    }
    
    // Generate slots based on default availability
    const defaultAvail = availability.default_availability;
    const slotDuration = defaultAvail.slot_duration || 30;
    
    try {
      const startParts = defaultAvail.start_time.split(':');
      const endParts = defaultAvail.end_time.split(':');
      
      let startHour = parseInt(startParts[0]);
      let startMin = parseInt(startParts[1]);
      const endHour = parseInt(endParts[0]);
      const endMin = parseInt(endParts[1]);
      
      // Convert to 12-hour format for display
      const slots = [];
      let currentHour = startHour;
      let currentMin = startMin;
      
      while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
        const ampm = currentHour >= 12 ? 'PM' : 'AM';
        const h12 = currentHour % 12 || 12;
        const timeStr = `${h12}:${currentMin.toString().padStart(2, '0')} ${ampm}`;
        
        slots.push({
          id: slots.length + 1,
          day_of_week: dayOfWeek,
          day_name: DAYS[dayOfWeek],
          start_time: timeStr,
          end_time: timeStr,
          is_available: true
        });
        
        currentMin += slotDuration;
        if (currentMin >= 60) {
          currentHour += Math.floor(currentMin / 60);
          currentMin = currentMin % 60;
        }
      }
      
      return slots;
    } catch {
      return [];
    }
  };

  const handleDateClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    if (availableDates.has(dateStr)) {
      // Find first available time slot
      const slots = generateTimeSlotsForDisplay(date);
      if (slots.length > 0) {
        onDateSelect(dateStr, slots[0].start_time);
      } else {
        onDateSelect(dateStr, '');
      }
    }
  };

  const handleTimeSlotClick = (time: string) => {
    if (selectedDate) {
      onDateSelect(selectedDate, time);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedMonth);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedMonth(newDate);
    calculateAvailableDates(availability!, newDate);
  };

  const isDateAvailable = (date: Date | null) => {
    if (!date) return false;
    const dateStr = date.toISOString().split('T')[0];
    return availableDates.has(dateStr);
  };

  const isDateSelected = (date: Date | null) => {
    if (!date || !selectedDate) return false;
    return date.toISOString().split('T')[0] === selectedDate;
  };

  const isDatePast = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const days = getDaysInMonth(selectedMonth);
  const timeSlots = selectedDate ? generateTimeSlotsForDisplay(new Date(selectedDate)) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        <span className="ml-3 text-slate-500">Loading availability...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <CalendarIcon size={20} className="text-blue-600" />
          Select Date & Time
        </h3>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft size={20} className="text-slate-600" />
          </button>
          
          <span className="text-sm font-bold text-slate-700 min-w-[140px] text-center">
            {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ChevronRight size={20} className="text-slate-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendar Grid */}
        <div>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map(day => (
              <div key={day} className="text-center text-xs font-bold text-slate-400 py-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              const available = date ? isDateAvailable(date) : false;
              const selected = date ? isDateSelected(date) : false;
              const past = date ? isDatePast(date) : false;
              
              return (
                <button
                  key={index}
                  disabled={!available || past}
                  onClick={() => date && handleDateClick(date)}
                  className={`
                    aspect-square flex items-center justify-center rounded-xl text-sm font-bold
                    transition-all duration-200
                    ${!date ? '' : available && !past ? 'hover:bg-blue-50 cursor-pointer' : 'cursor-not-allowed'}
                    ${selected ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : ''}
                    ${!selected && available && !past ? 'bg-slate-50 text-slate-700' : ''}
                    ${past ? 'bg-slate-50 text-slate-300' : ''}
                    ${!available && !past ? 'bg-transparent' : ''}
                  `}
                >
                  {date?.getDate()}
                  {available && !past && !selected && (
                    <span className="absolute bottom-1 w-1 h-1 bg-green-500 rounded-full"></span>
                  )}
                </button>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
              <span>Unavailable</span>
            </div>
          </div>
        </div>

        {/* Time Slots */}
        <div>
          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Clock size={16} />
            Available Times
          </h4>
          
          {selectedDate ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedDate}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                {timeSlots.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlots.map((slot, index) => (
                      <button
                        key={index}
                        onClick={() => handleTimeSlotClick(slot.start_time)}
                        className={`
                          p-3 rounded-xl text-sm font-bold transition-all duration-200
                          flex items-center justify-center gap-2
                          ${selectedTime === slot.start_time
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                            : 'bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-600'
                          }
                        `}
                      >
                        {selectedTime === slot.start_time && (
                          <Check size={14} />
                        )}
                        {formatTime(slot.start_time)}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <Clock size={40} className="mx-auto mb-2 opacity-50" />
                    <p>No time slots available for this date</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-2xl">
              <CalendarIcon size={40} className="mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500 font-medium">Select a date to see available times</p>
            </div>
          )}
        </div>
      </div>

      {/* Selected Summary */}
      {selectedDate && selectedTime && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Selected Appointment</p>
            <p className="font-bold text-slate-800">
              {new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })} at {selectedTime}
            </p>
          </div>
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Check size={20} className="text-blue-600" />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DoctorAvailabilityCalendar;


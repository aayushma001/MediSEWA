
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Video, Mic, MicOff, VideoOff, Phone, Clock, Calendar, User, AlertCircle } from 'lucide-react';
import Sidebar from '../components/Layout/Sidebar';
import Navbar from '../components/Layout/Navbar';

interface VideoCallPageProps {
  appointmentId?: number;
  doctorName?: string;
  patientName?: string;
  scheduledTime?: string;
  duration?: number;
}

// Admin-set time slots for video calls
const ADMIN_TIME_SLOTS = [
  { time: '09:00 AM', available: true },
  { time: '10:00 AM', available: true },
  { time: '11:00 AM', available: true },
  { time: '12:00 PM', available: false },
  { time: '01:00 PM', available: true },
  { time: '02:00 PM', available: true },
  { time: '03:00 PM', available: true },
  { time: '04:00 PM', available: true },
  { time: '05:00 PM', available: false },
];

const VideoCallPage: React.FC<VideoCallPageProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get appointment details from location state or props
  const appointmentId = location.state?.appointmentId as number | undefined;
  const doctorName = location.state?.doctorName as string | undefined;
  const patientName = location.state?.patientName as string | undefined;
  const scheduledTime = location.state?.scheduledTime as string | undefined;
  const duration = location.state?.duration as number | undefined || 30; // Default 30 minutes

  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [callStatus, setCallStatus] = useState<'waiting' | 'connecting' | 'connected' | 'ended'>('waiting');
  const [countdown, setCountdown] = useState(60); // 1 minute countdown
  const [elapsedTime, setElapsedTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Get user details
  const userDetails = JSON.parse(localStorage.getItem('userDetails') || '{}');
  const displayName = patientName || userDetails.fullName || 'Patient';

  // Countdown timer before call starts
  useEffect(() => {
    if (callStatus === 'waiting') {
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setCallStatus('connecting');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [callStatus]);

  // Connecting phase - simulate connection
  useEffect(() => {
    if (callStatus === 'connecting') {
      const connectingTimer = setTimeout(() => {
        startCall();
      }, 2000);
      return () => clearTimeout(connectingTimer);
    }
  }, [callStatus]);

  // Session timer when connected
  useEffect(() => {
    if (callStatus === 'connected') {
      sessionRef.current = setInterval(() => {
        setElapsedTime((prev) => {
          if (prev >= (duration || 30) * 60) {
            endCall();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => {
      if (sessionRef.current) {
        clearInterval(sessionRef.current);
      }
    };
  }, [callStatus, duration]);

  const startCall = async () => {
    try {
      // Request camera and microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setCallStatus('connected');
    } catch (err: any) {
      console.error('Error accessing media devices:', err);
      setError('Could not access camera/microphone. Please check permissions.');
      // Continue without video if permission denied
      setCallStatus('connected');
    }
  };

  const endCall = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (sessionRef.current) {
      clearInterval(sessionRef.current);
    }
    setCallStatus('ended');
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  const toggleMic = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const goToAppointments = () => {
    navigate('/appointments');
  };

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Camera Access Error</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={startCall}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Continue Without Video
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          {callStatus === 'waiting' && (
            <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
              <Clock className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Your Video Call</h2>
              <p className="text-gray-600 mb-4">
                Your appointment with <strong>Dr. {doctorName}</strong> starts in:
              </p>
              <div className="text-4xl font-bold text-blue-600 mb-6">
                {formatCountdown(countdown)}
              </div>
              <div className="flex items-center justify-center gap-4 mb-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Today
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {scheduledTime || 'Scheduled Time'}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Duration: {duration} minutes
              </p>
            </div>
          )}

          {callStatus === 'connecting' && (
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h2 className="text-xl font-bold mb-2">Connecting...</h2>
              <p className="text-gray-600">Please wait while we connect you to Dr. {doctorName}</p>
            </div>
          )}

          {(callStatus === 'connected' || callStatus === 'ended') && (
            <div className="w-full max-w-4xl">
              {/* Video Area */}
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video mb-6">
                {/* Remote Video (Doctor) */}
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <div className="text-center">
                    <User className="w-24 h-24 text-gray-600 mx-auto mb-4" />
                    <p className="text-white text-lg">Dr. {doctorName}</p>
                  </div>
                </div>

                {/* Local Video (Patient) */}
                <div className="absolute bottom-4 right-4 w-48 aspect-video bg-gray-700 rounded-lg overflow-hidden shadow-lg">
                  {isVideoOn ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <VideoOff className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Call Timer */}
                <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-lg flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(elapsedTime)}</span>
                </div>

                {/* Session Duration Info */}
                <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
                  Session: {duration} min
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={toggleMic}
                  className={`p-4 rounded-full ${isMicOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'} text-white transition-colors`}
                >
                  {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                </button>
                
                <button
                  onClick={toggleVideo}
                  className={`p-4 rounded-full ${isVideoOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'} text-white transition-colors`}
                >
                  {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                </button>
                
                <button
                  onClick={endCall}
                  className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
                >
                  <Phone className="w-6 h-6 transform rotate-135" />
                </button>
              </div>

              {callStatus === 'ended' && (
                <div className="mt-6 text-center">
                  <p className="text-white text-lg mb-4">Call ended after {formatTime(elapsedTime)}</p>
                  <button
                    onClick={goToAppointments}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Back to Appointments
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCallPage;

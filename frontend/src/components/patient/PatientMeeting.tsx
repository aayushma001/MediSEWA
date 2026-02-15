import React, { useState, useEffect, useRef } from 'react';
import { Mic, Video, PhoneOff, VideoOff, MicOff } from 'lucide-react';

interface PatientMeetingProps {
    appointmentId: string;
    doctorName: string;
    onClose: () => void;
}

export const PatientMeeting: React.FC<PatientMeetingProps> = ({ appointmentId, doctorName, onClose }) => {
    const [micOn, setMicOn] = useState(true);
    const [cameraOn, setCameraOn] = useState(true);
    const [connected, setConnected] = useState(false);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const socket = useRef<WebSocket | null>(null);
    const localStream = useRef<MediaStream | null>(null);

    useEffect(() => {
        startWebRTC();
        return () => stopWebRTC();
    }, []);

    const startWebRTC = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localStream.current = stream;
            if (localVideoRef.current) localVideoRef.current.srcObject = stream;

            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const signalingUrl = `${protocol}//${window.location.host}/ws/signaling/${appointmentId}/`;
            socket.current = new WebSocket(signalingUrl);

            socket.current.onmessage = async (e) => {
                const data = JSON.parse(e.data);
                if (data.type === 'offer') {
                    await handleOffer(data.offer);
                } else if (data.type === 'answer') {
                    await handleAnswer(data.answer);
                } else if (data.type === 'candidate') {
                    await handleCandidate(data.candidate);
                }
            };

            setupPeerConnection();
        } catch (err) {
            console.error("Failed to start WebRTC:", err);
            alert("Could not access camera/microphone");
        }
    };

    const setupPeerConnection = () => {
        const configuration = {
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        };
        peerConnection.current = new RTCPeerConnection(configuration);

        localStream.current?.getTracks().forEach(track => {
            peerConnection.current!.addTrack(track, localStream.current!);
        });

        peerConnection.current.ontrack = (event) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
                setConnected(true);
            }
        };

        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate && socket.current) {
                socket.current.send(JSON.stringify({ type: 'candidate', candidate: event.candidate }));
            }
        };
    };

    const handleOffer = async (offer: RTCSessionDescriptionInit) => {
        if (!peerConnection.current) setupPeerConnection();
        await peerConnection.current!.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.current!.createAnswer();
        await peerConnection.current!.setLocalDescription(answer);
        socket.current?.send(JSON.stringify({ type: 'answer', answer }));
    };

    const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
        await peerConnection.current!.setRemoteDescription(new RTCSessionDescription(answer));
    };

    const handleCandidate = async (candidate: RTCIceCandidateInit) => {
        await peerConnection.current!.addIceCandidate(new RTCIceCandidate(candidate));
    };

    const stopWebRTC = () => {
        localStream.current?.getTracks().forEach(track => track.stop());
        peerConnection.current?.close();
        socket.current?.close();
    };

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                <div className="relative aspect-video bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border-2 border-white/10">
                    <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    {!connected && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-gray-900/50 backdrop-blur-sm">
                            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                            <p className="font-bold">Waiting for Dr. {doctorName}...</p>
                        </div>
                    )}
                </div>
                <div className="relative aspect-video bg-gray-800 rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20">
                    <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
                        <button
                            onClick={() => {
                                setMicOn(!micOn);
                                localStream.current?.getAudioTracks().forEach(t => t.enabled = !micOn);
                            }}
                            className={`p-4 rounded-full transition-all ${micOn ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-red-500 text-white'}`}
                        >
                            {micOn ? <Mic size={24} /> : <MicOff size={24} />}
                        </button>
                        <button
                            onClick={() => {
                                setCameraOn(!cameraOn);
                                localStream.current?.getVideoTracks().forEach(t => t.enabled = !cameraOn);
                            }}
                            className={`p-4 rounded-full transition-all ${cameraOn ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-red-500 text-white'}`}
                        >
                            {cameraOn ? <Video size={24} /> : <VideoOff size={24} />}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-xl"
                        >
                            <PhoneOff size={24} />
                        </button>
                    </div>
                </div>
            </div>
            <div className="mt-8 text-center text-white">
                <h2 className="text-2xl font-bold">Consultation with Dr. {doctorName}</h2>
                <p className="text-gray-400">Appointment ID: #{appointmentId}</p>
            </div>
        </div>
    );
};

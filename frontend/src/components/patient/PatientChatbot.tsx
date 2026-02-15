import React, { useState, useRef, useEffect } from 'react';
import { Patient } from '../../types';
import {
    X,
    Send,
    Paperclip,
    Mic,
    Bot,
    User,
    Calendar,
    FileText,
    Heart,
    Pill,
    AlertCircle,
    Sparkles,
    ChevronDown,
    MapPin,
    Phone
} from 'lucide-react';

interface Message {
    id: string;
    type: 'user' | 'bot';
    content: string;
    timestamp: Date;
    suggestions?: string[];
    quickActions?: QuickAction[];
}

interface QuickAction {
    label: string;
    icon: any;
    action: string;
}

interface PatientChatbotProps {
    patient?: Patient;
    patientId?: string;
    onClose: () => void;
}

export const PatientChatbot: React.FC<PatientChatbotProps> = ({ patient, patientId, onClose }) => {
    const firstName = patient?.user?.first_name || 'Guest';

    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            type: 'bot',
            content: `Hello ${firstName}! 👋 I'm your AI Health Assistant by MediSewa. I can help you with appointments, medical questions, prescriptions, and more. How can I assist you today?`,
            timestamp: new Date(),
            suggestions: [
                'Book an appointment',
                'Check my vitals',
                'View prescriptions',
                'Emergency help'
            ]
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const simulateBotResponse = (userMessage: string) => {
        setIsTyping(true);

        setTimeout(() => {
            let botResponse = '';
            let suggestions: string[] = [];
            let quickActions: QuickAction[] = [];

            const lowerMessage = userMessage.toLowerCase();

            if (lowerMessage.includes('appointment') || lowerMessage.includes('book')) {
                botResponse = "I can help you book an appointment! 📅\n\nI found several available doctors based on your needs. Would you like to:\n\n1. See cardiologists (based on your heart condition)\n2. See general practitioners\n3. Search for a specific specialist\n\nWhat works best for you?";
                suggestions = ['Show cardiologists', 'General practitioners', 'Search specialists'];
                quickActions = [
                    { label: 'Book Now', icon: Calendar, action: 'book_appointment' },
                    { label: 'View Doctors', icon: User, action: 'view_doctors' }
                ];
            } else if (lowerMessage.includes('vital') || lowerMessage.includes('health')) {
                botResponse = "Here's your latest health vitals summary:\n\n❤️ Heart Rate: 72 bpm (Normal)\n🩺 Blood Pressure: 120/80 mmHg (Normal)\n🌡️ Temperature: 98.6°F (Normal)\n💉 Glucose: 95 mg/dL (Normal)\n\nYour overall health status looks good! All vitals are within normal range.";
                suggestions = ['View detailed history', 'Update vitals', 'Set health goals'];
                quickActions = [
                    { label: 'Full Report', icon: FileText, action: 'health_report' },
                    { label: 'Track Vitals', icon: Heart, action: 'track_vitals' }
                ];
            } else if (lowerMessage.includes('prescription') || lowerMessage.includes('medication')) {
                botResponse = "You have 3 active prescriptions:\n\n💊 Lisinopril 10mg - Once daily\n💊 Metformin 500mg - Twice daily\n⚠️ Atorvastatin 20mg - Refill needed\n\nWould you like me to help you request a refill for Atorvastatin?";
                suggestions = ['Request refill', 'View all medications', 'Medication reminders'];
                quickActions = [
                    { label: 'Refill Now', icon: Pill, action: 'refill_prescription' },
                    { label: 'View Details', icon: FileText, action: 'prescription_details' }
                ];
            } else if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent')) {
                botResponse = "🚨 For medical emergencies, please:\n\n1. Call 911 immediately for life-threatening conditions\n2. Visit the nearest emergency room\n3. Contact your primary care physician\n\nNearest Emergency Rooms:\n📍 City Hospital ER - 2.3 miles\n📍 Mercy Medical Center - 3.1 miles\n\nWould you like directions or should I help you contact emergency services?";
                suggestions = ['Get directions', 'Call emergency', 'Contact doctor'];
                quickActions = [
                    { label: 'Emergency Call', icon: Phone, action: 'emergency_call' },
                    { label: 'Find ER', icon: MapPin, action: 'find_emergency' }
                ];
            } else if (lowerMessage.includes('record') || lowerMessage.includes('history')) {
                botResponse = "I can help you access your medical records. You have:\n\n📄 5 consultation reports\n🧪 3 lab test results\n💊 2 prescription histories\n📋 1 surgical record\n\nWhich records would you like to view?";
                suggestions = ['Lab results', 'Consultation reports', 'All records'];
            } else if (lowerMessage.includes('doctor') || lowerMessage.includes('specialist')) {
                botResponse = "I can help you find the right specialist! We have:\n\n🩺 Cardiologists - 12 available\n🦴 Orthopedists - 8 available\n🧠 Neurologists - 6 available\n👶 Pediatricians - 10 available\n\nWhich specialty are you interested in?";
                suggestions = ['Cardiologists', 'All specialists', 'By location'];
            } else if (lowerMessage.includes('symptom') || lowerMessage.includes('sick') || lowerMessage.includes('pain')) {
                botResponse = "I understand you're not feeling well. While I can provide general information, it's important to consult with a healthcare professional for proper diagnosis.\n\nCan you describe your symptoms? This will help me:\n1. Provide relevant information\n2. Suggest appropriate specialists\n3. Determine if you need urgent care";
                suggestions = ['Book urgent appointment', 'Symptom checker', 'Call nurse line'];
                quickActions = [
                    { label: 'Find Doctor', icon: User, action: 'find_doctor' },
                    { label: 'Emergency', icon: AlertCircle, action: 'emergency' }
                ];
            } else if (lowerMessage.includes('insurance') || lowerMessage.includes('coverage')) {
                botResponse = "I can help with insurance information! Your coverage includes:\n\n✅ General consultations\n✅ Specialist visits\n✅ Lab tests\n✅ Prescription medications\n\nWould you like to:\n- Check coverage for a specific procedure\n- View your insurance card\n- Update insurance information";
                suggestions = ['Check coverage', 'View card', 'Update info'];
            } else if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
                botResponse = "You're very welcome! 😊 I'm here 24/7 whenever you need assistance with your health care. Is there anything else I can help you with?";
                suggestions = ['Book appointment', 'View vitals', 'Check medications'];
            } else {
                botResponse = "I'm here to help! I can assist you with:\n\n📅 Booking and managing appointments\n💊 Prescription refills and medication info\n📊 Viewing your health vitals and records\n🩺 Finding doctors and specialists\n🚨 Emergency assistance\n📋 Lab results and reports\n\nWhat would you like help with today?";
                suggestions = ['Book appointment', 'View prescriptions', 'Check vitals', 'Emergency help'];
            }

            const newMessage: Message = {
                id: Date.now().toString(),
                type: 'bot',
                content: botResponse,
                timestamp: new Date(),
                suggestions,
                quickActions
            };

            setMessages(prev => [...prev, newMessage]);
            setIsTyping(false);
        }, 1500);
    };

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            content: inputValue,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');

        simulateBotResponse(inputValue);
    };

    const handleSuggestionClick = (suggestion: string) => {
        setInputValue(suggestion);
        inputRef.current?.focus();
    };

    const handleQuickAction = (action: string) => {
        console.log('Quick action:', action);
        // Handle quick actions - integrate with your app's navigation/state
    };

    if (isMinimized) {
        return (
            <button
                onClick={() => setIsMinimized(false)}
                className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all hover:scale-105 flex items-center space-x-2 z-[9999]"
            >
                <Bot size={20} />
                <span className="font-semibold">AI Assistant</span>
                {messages.filter(m => m.type === 'bot').length > 1 && (
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                )}
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-[420px] h-[580px] bg-white rounded-2xl shadow-2xl flex flex-col z-[9999] overflow-hidden border border-gray-200">            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                            <Bot className="text-blue-600" size={24} />
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-base flex items-center">
                            MediSewa Health Assistant
                            <Sparkles size={14} className="ml-1.5 text-yellow-300" />
                        </h3>
                        <p className="text-blue-100 text-xs">Always here to help</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setIsMinimized(true)}
                        className="p-1.5 hover:bg-blue-500 rounded-lg transition-colors"
                    >
                        <ChevronDown className="text-white" size={18} />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-blue-500 rounded-lg transition-colors"
                    >
                        <X className="text-white" size={18} />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((message) => (
                    <div key={message.id}>
                        <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex items-start space-x-2 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.type === 'user'
                                    ? 'bg-blue-600'
                                    : 'bg-gradient-to-br from-blue-500 to-blue-600'
                                    }`}>
                                    {message.type === 'user' ? (
                                        <User className="text-white" size={16} />
                                    ) : (
                                        <Bot className="text-white" size={16} />
                                    )}
                                </div>
                                <div className="flex flex-col space-y-1">
                                    <div className={`px-4 py-2.5 rounded-2xl ${message.type === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-sm'
                                        : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-sm'
                                        }`}>
                                        <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
                                    </div>
                                    <span className={`text-xs text-gray-400 px-2 ${message.type === 'user' ? 'text-right' : ''}`}>
                                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        {message.quickActions && message.quickActions.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3 ml-10">
                                {message.quickActions.map((action, idx) => {
                                    const Icon = action.icon;
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleQuickAction(action.action)}
                                            className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 rounded-lg text-xs font-semibold transition-all border border-blue-200 hover:border-blue-300 hover:shadow-sm"
                                        >
                                            <Icon size={14} />
                                            <span>{action.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Suggestions */}
                        {message.suggestions && message.suggestions.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3 ml-10">
                                {message.suggestions.map((suggestion, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 rounded-full text-xs font-medium transition-all border border-gray-200 hover:border-blue-300 hover:text-blue-700"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {isTyping && (
                    <div className="flex items-start space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                            <Bot className="text-white" size={16} />
                        </div>
                        <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100">
                            <div className="flex space-x-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Paperclip className="text-gray-400" size={20} />
                    </button>
                    <div className="flex-1 relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type your message..."
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Mic className="text-gray-400" size={20} />
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={!inputValue.trim()}
                        className="p-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-300 rounded-xl transition-all disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                    >
                        <Send className="text-white" size={18} />
                    </button>
                </div>

                {/* Quick Access Buttons */}
                <div className="flex items-center justify-center space-x-2 mt-3 pt-3 border-t border-gray-100">
                    {[
                        { icon: Calendar, label: 'Appointments', color: 'text-blue-500' },
                        { icon: Pill, label: 'Medications', color: 'text-emerald-500' },
                        { icon: Heart, label: 'Vitals', color: 'text-red-500' },
                        { icon: AlertCircle, label: 'Emergency', color: 'text-orange-500' },
                    ].map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={idx}
                                onClick={() => setInputValue(item.label)}
                                className={`flex-1 flex flex-col items-center space-y-1 p-2 hover:bg-gray-50 rounded-lg transition-all group`}
                            >
                                <Icon size={16} className={`${item.color} group-hover:scale-110 transition-transform`} />
                                <span className="text-[10px] text-gray-600 font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
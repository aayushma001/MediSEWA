import React, { useState, useRef, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Doctor } from '../../types';
import { MessageSquare, Send, X, Sparkles } from 'lucide-react';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

interface DoctorChatbotProps {
    doctor: Doctor;
    onClose: () => void;
}

export const DoctorChatbot: React.FC<DoctorChatbotProps> = ({ doctor, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: `Hello Dr. ${doctor.user.first_name}! I'm your AI medical assistant. I can help you with patient records, medical references, drug interactions, or scheduling. How can I assist you today?`,
            sender: 'ai',
            timestamp: new Date(),
        },
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputText.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputText('');
        setIsTyping(true);

        // TODO: Replace with actual AI API call to doctor_chatbot.py or doctor_chatbot.tsx
        // Example integration point:
        // const response = await fetch('/api/doctor-chatbot', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     message: inputText,
        //     doctorId: doctor.id,
        //     context: messages
        //   })
        // });
        // const data = await response.json();

        // Simulate AI response
        setTimeout(() => {
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: `I understand you're asking about "${inputText}". I'm here to help with medical information, patient data, and scheduling. Please integrate the actual AI backend at /api/doctor-chatbot or doctor_chatbot.py for full functionality.`,
                sender: 'ai',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiMessage]);
            setIsTyping(false);
        }, 1000);
    };

    const quickActions = [
        'Patient History',
        'Drug Interactions',
        'Lab Results',
        'Schedule',
        'Prescriptions',
        'Medical Guidelines',
    ];

    return (
        <div className="fixed bottom-6 right-6 w-[420px] h-[650px] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-600 to-purple-700">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg relative">
                        <MessageSquare size={24} className="text-purple-600" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full flex items-center justify-center">
                            <Sparkles size={10} className="text-white animate-pulse" />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg">MediSEWA AI Assistant</h3>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                            <p className="text-xs text-purple-100">Online & Ready</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="text-white hover:bg-white/20 p-2 rounded-xl transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-5 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
                <div className="space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {message.sender === 'ai' && (
                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mr-2">
                                    <Sparkles size={16} className="text-purple-600" />
                                </div>
                            )}
                            <div
                                className={`max-w-[80%] p-4 rounded-2xl ${message.sender === 'user'
                                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-br-sm'
                                        : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
                                    }`}
                            >
                                <p className="text-sm leading-relaxed">{message.text}</p>
                                <p
                                    className={`text-xs mt-2 ${message.sender === 'user' ? 'text-purple-100' : 'text-gray-400'
                                        }`}
                                >
                                    {message.timestamp.toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex items-start">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mr-2">
                                <Sparkles size={16} className="text-purple-600" />
                            </div>
                            <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-sm shadow-sm">
                                <div className="flex space-x-2">
                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                                    <div
                                        className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                                        style={{ animationDelay: '0.2s' }}
                                    ></div>
                                    <div
                                        className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                                        style={{ animationDelay: '0.4s' }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                {messages.length === 1 && (
                    <div className="mt-4">
                        <p className="text-xs text-gray-500 mb-3 font-semibold">Quick Actions:</p>
                        <div className="grid grid-cols-2 gap-2">
                            {quickActions.map((action) => (
                                <button
                                    key={action}
                                    onClick={() => setInputText(action)}
                                    className="p-3 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-700 hover:bg-purple-50 hover:border-purple-300 transition-all"
                                >
                                    {action}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-5 border-t border-gray-200 bg-white">
                <div className="flex items-center space-x-3">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Ask me anything..."
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputText.trim()}
                        className="p-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={20} />
                    </button>
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">
                    AI responses may not be medically accurate. Verify important information.
                </p>
            </div>
        </div>
    );
};

// Integration instructions:
// 1. Create backend file: doctor_chatbot.py or doctor_chatbot.tsx
// 2. Implement AI logic using OpenAI, Claude, or custom model
// 3. Replace the TODO section in handleSendMessage with actual API call
// 4. Backend should accept: { message, doctorId, context }
// 5. Backend should return: { response, suggestions?, metadata? }
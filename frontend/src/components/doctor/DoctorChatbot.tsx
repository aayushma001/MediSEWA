import React, { useState, useRef, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Doctor } from '../../types';
import {
    MessageSquare, Send, X, Sparkles, Pill, Activity,
    FileText, AlertCircle, BookOpen, Clock, CheckCircle
} from 'lucide-react';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
    sources?: Array<{ category: string; relevance_score: string }>;
    suggestions?: string[];
}

interface DoctorChatbotProps {
    doctor: Doctor;
    onClose: () => void;
}

// API Configuration
// Use import.meta.env for Vite compatibility
const API_BASE_URL = import.meta.env.VITE_CHATBOT_API_URL || 'http://localhost:5000';

export const DoctorChatbot: React.FC<DoctorChatbotProps> = ({ doctor, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: `Hello Dr. ${doctor.user.first_name}! I'm your AI medical assistant powered by advanced RAG technology. I can help you with:\n\n• Drug dosing & interactions\n• Clinical guidelines & protocols\n• Prescription writing\n• Lab value interpretation\n• Differential diagnosis support\n\nAll responses are evidence-based and sourced from medical databases. How may I assist you today?`,
            sender: 'ai',
            timestamp: new Date(),
            suggestions: [
                'Drug information',
                'Treatment guidelines',
                'Check drug interactions',
                'Write prescription'
            ]
        },
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'connecting'>('connecting');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Check API health on mount
    useEffect(() => {
        checkApiHealth();
    }, []);

    const checkApiHealth = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/health`);
            if (response.ok) {
                setConnectionStatus('online');
            } else {
                setConnectionStatus('offline');
            }
        } catch (error) {
            console.error('API health check failed:', error);
            setConnectionStatus('offline');
        }
    };

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

        try {
            // Prepare context (last 10 messages for API efficiency)
            const context = messages.slice(-10).map(msg => ({
                sender: msg.sender,
                text: msg.text,
                timestamp: msg.timestamp.toISOString()
            }));

            // Call the actual API
            const response = await fetch(`${API_BASE_URL}/api/doctor-chatbot`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: inputText,
                    doctorId: doctor.id,
                    context: context
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: data.response,
                sender: 'ai',
                timestamp: new Date(data.timestamp),
                sources: data.sources,
                suggestions: data.suggestions
            };

            setMessages((prev) => [...prev, aiMessage]);
            setConnectionStatus('online');
        } catch (error) {
            console.error('Error calling chatbot API:', error);

            // Fallback error message
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: `⚠️ I apologize, but I'm having trouble connecting to the medical knowledge base. Please check:\n\n1. The API server is running (python api_server.py)\n2. The backend is accessible at ${API_BASE_URL}\n3. Your GOOGLE_API_KEY is set in .env file\n\nError: ${error instanceof Error ? error.message : 'Connection failed'}`,
                sender: 'ai',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
            setConnectionStatus('offline');
        } finally {
            setIsTyping(false);
        }
    };

    const handleQuickAction = (action: string) => {
        setInputText(action);
    };

    const CategoryIcon = ({ category }: { category: string }) => {
        switch (category) {
            case 'antibiotics':
            case 'drug_interactions':
                return <Pill className="w-3 h-3" />;
            case 'guidelines':
                return <BookOpen className="w-3 h-3" />;
            case 'lab_values':
                return <Activity className="w-3 h-3" />;
            case 'prescriptions':
                return <FileText className="w-3 h-3" />;
            default:
                return <Sparkles className="w-3 h-3" />;
        }
    };

    const quickActions = [
        { text: 'Drug Interactions', icon: Pill },
        { text: 'Treatment Guidelines', icon: BookOpen },
        { text: 'Lab Interpretation', icon: Activity },
        { text: 'Write Prescription', icon: FileText },
    ];

    return (
        <div className="fixed bottom-6 right-6 w-[440px] h-[700px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden">
            {/* Header - Clean Medical Blue Theme */}
            <div className="p-5 border-b border-slate-200 bg-gradient-to-br from-blue-600 to-cyan-600">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-white/95 rounded-xl flex items-center justify-center shadow-lg relative">
                            <Activity size={26} className="text-blue-600" strokeWidth={2.5} />
                            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${connectionStatus === 'online'
                                ? 'bg-emerald-400 animate-pulse'
                                : connectionStatus === 'connecting'
                                    ? 'bg-amber-400'
                                    : 'bg-red-400'
                                }`} />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg tracking-tight">Medical AI Assistant</h3>
                            <div className="flex items-center space-x-2 text-xs">
                                <div className={`w-1.5 h-1.5 rounded-full ${connectionStatus === 'online'
                                    ? 'bg-emerald-300'
                                    : connectionStatus === 'connecting'
                                        ? 'bg-amber-300'
                                        : 'bg-red-300'
                                    }`} />
                                <span className="text-blue-100 font-medium">
                                    {connectionStatus === 'online'
                                        ? 'RAG-Powered • Ready'
                                        : connectionStatus === 'connecting'
                                            ? 'Connecting...'
                                            : 'Offline'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all"
                        aria-label="Close assistant"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-5 overflow-y-auto bg-gradient-to-b from-slate-50 to-white">
                <div className="space-y-4">
                    {messages.map((message) => (
                        <div key={message.id}>
                            <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {message.sender === 'ai' && (
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0 mr-2 shadow-sm">
                                        <Activity size={16} className="text-blue-600" strokeWidth={2.5} />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[82%] ${message.sender === 'user'
                                        ? 'bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-2xl rounded-br-md shadow-md'
                                        : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-md shadow-sm'
                                        }`}
                                >
                                    <div className="p-4">
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                                    </div>

                                    {/* Sources Badge */}
                                    {message.sender === 'ai' && message.sources && message.sources.length > 0 && (
                                        <div className="px-4 pb-3">
                                            <div className="flex flex-wrap gap-1.5">
                                                {message.sources.map((source, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium"
                                                    >
                                                        <CategoryIcon category={source.category} />
                                                        {source.category}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Timestamp */}
                                    <div className={`px-4 pb-2 flex items-center gap-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-slate-400'
                                        }`}>
                                        <Clock size={10} />
                                        <span className="text-xs">
                                            {message.timestamp.toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* AI Suggestions */}
                            {message.sender === 'ai' && message.suggestions && message.suggestions.length > 0 && (
                                <div className="ml-10 mt-2">
                                    <p className="text-xs text-slate-500 font-semibold mb-2">Suggested follow-ups:</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {message.suggestions.map((suggestion, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleQuickAction(suggestion)}
                                                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all"
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex items-start">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0 mr-2 shadow-sm">
                                <Activity size={16} className="text-blue-600" strokeWidth={2.5} />
                            </div>
                            <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-md shadow-sm">
                                <div className="flex space-x-1.5">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions - Only on First Load */}
                {messages.length === 1 && (
                    <div className="mt-5">
                        <p className="text-xs text-slate-600 font-bold mb-3 uppercase tracking-wide">Quick Actions</p>
                        <div className="grid grid-cols-2 gap-2">
                            {quickActions.map((action) => {
                                const Icon = action.icon;
                                return (
                                    <button
                                        key={action.text}
                                        onClick={() => handleQuickAction(action.text)}
                                        className="group p-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-gradient-to-br hover:from-blue-50 hover:to-cyan-50 hover:border-blue-300 hover:text-blue-700 transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
                                    >
                                        <Icon size={16} className="text-slate-400 group-hover:text-blue-500" />
                                        {action.text}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-200 bg-white">
                {connectionStatus === 'offline' && (
                    <div className="mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                        <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800 leading-relaxed">
                            Connection lost. Please start the API server: <code className="font-mono bg-amber-100 px-1 rounded">python api_server.py</code>
                        </p>
                    </div>
                )}

                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                        placeholder="Ask about drugs, guidelines, prescriptions..."
                        className="flex-1 px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"
                        disabled={isTyping}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputText.trim() || isTyping}
                        className="p-3 bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        aria-label="Send message"
                    >
                        <Send size={20} />
                    </button>
                </div>

                <div className="mt-2 flex items-start gap-1.5">
                    <AlertCircle size={12} className="text-slate-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-500 leading-relaxed">
                        AI assistant for medical professionals. Verify critical information. Not a substitute for clinical judgment.
                    </p>
                </div>
            </div>
        </div>
    );
};
import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Minimize2 } from 'lucide-react';

export const DoctorChatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
        { role: 'bot', text: 'Hello Dr! I am your AI assistant. How can I help you with your clinical tasks today?' }
    ]);
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isThinking]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = input;
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setInput('');
        setIsThinking(true);

        try {
            // Get the auth token from localStorage (assuming standard JWT storage)
            const token = localStorage.getItem('access_token');

            const response = await fetch('http://127.0.0.1:8000/api/doctors/chatbot/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message: userMessage })
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();

            setMessages(prev => [...prev, { role: 'bot', text: data.response }]);

        } catch (error) {
            console.error("Chatbot Error:", error);
            setMessages(prev => [...prev, { role: 'bot', text: "I apologize, but I'm having trouble connecting to the server. Please check your connection or try again later." }]);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <>
            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform z-50 group"
            >
                <div className="absolute -top-12 right-0 bg-white text-blue-600 px-3 py-1 rounded-xl text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    AI Clinical Assistant
                </div>
                <Bot size={32} />
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-96 h-[550px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden z-50 border border-gray-100 animate-in slide-in-from-bottom-4">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <Bot size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold">MediSEWA AI</h3>
                                <p className="text-[10px] text-blue-100 flex items-center">
                                    <span className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                                    Ready to assist
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                            <Minimize2 size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${m.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                    : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none'
                                    }`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {isThinking && (
                            <div className="flex justify-start">
                                <div className="bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none rounded-2xl p-4 text-sm flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-75"></div>
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-150"></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-gray-100">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask me anything..."
                                disabled={isThinking}
                                className="w-full bg-gray-100 border-none rounded-2xl py-3 pl-4 pr-12 focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-50"
                            />
                            <button
                                onClick={handleSend}
                                disabled={isThinking || !input.trim()}
                                className="absolute right-2 p-2 text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-400 text-center mt-3">
                            Experimental Medical AI. Verify all critical clinical decisions.
                        </p>
                    </div>
                </div>
            )}
        </>
    );
};

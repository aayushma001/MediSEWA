import React, { useState } from 'react';
import { Patient } from '../../types';
import {
    Activity,
    Brain,
    Heart,
    Users,
    Smile,
    Frown,
    Meh,
    Sparkles,
    Video,
    Clock
} from 'lucide-react';
import { Button } from '../ui/Button';

interface TherapyWellnessProps {
    patient: Patient;
}

export const TherapyWellness: React.FC<TherapyWellnessProps> = ({ patient }) => {
    const [selectedMood, setSelectedMood] = useState<number | null>(null);
    const [sessionType, setSessionType] = useState<string | null>(null);

    const sessionTypes = [
        { id: 'stress', label: 'Stress Management', icon: Activity, color: 'from-red-500 to-orange-500' },
        { id: 'anxiety', label: 'Anxiety Relief', icon: Brain, color: 'from-purple-500 to-pink-500' },
        { id: 'depression', label: 'Depression Support', icon: Heart, color: 'from-blue-500 to-cyan-500' },
        { id: 'relationship', label: 'Relationship Help', icon: Users, color: 'from-green-500 to-teal-500' },
        { id: 'general', label: 'General Wellness', icon: Smile, color: 'from-yellow-500 to-orange-500' },
    ];

    const moods = [
        { value: 1, icon: Frown, label: 'Very Bad', color: 'text-red-500' },
        { value: 3, icon: Frown, label: 'Bad', color: 'text-orange-500' },
        { value: 5, icon: Meh, label: 'Okay', color: 'text-yellow-500' },
        { value: 7, icon: Smile, label: 'Good', color: 'text-green-500' },
        { value: 10, icon: Smile, label: 'Great', color: 'text-blue-500' },
    ];

    return (
        <div className="w-full max-w-5xl mx-auto p-4 lg:p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Therapy & Wellness Center</h1>
                <p className="text-gray-600">Your mental health journey starts here</p>
            </div>

            {/* Mood Tracker */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Heart className="h-6 w-6 mr-2 text-red-500" />
                    How are you feeling today?
                </h2>
                <div className="grid grid-cols-5 gap-4">
                    {moods.map((mood) => {
                        const Icon = mood.icon;
                        return (
                            <button
                                key={mood.value}
                                onClick={() => setSelectedMood(mood.value)}
                                className={`
                  flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200
                  ${selectedMood === mood.value
                                        ? 'border-blue-500 bg-blue-50 scale-105'
                                        : 'border-gray-200 hover:border-gray-300 hover:scale-105'
                                    }
                `}
                            >
                                <Icon className={`h-10 w-10 ${mood.color} mb-2`} />
                                <span className="text-sm font-medium text-gray-700">{mood.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Session Types */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Brain className="h-6 w-6 mr-2 text-purple-500" />
                    Choose Your Session Type
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sessionTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                            <button
                                key={type.id}
                                onClick={() => setSessionType(type.id)}
                                className={`
                  p-6 rounded-xl border-2 transition-all duration-200 text-left
                  ${sessionType === type.id
                                        ? 'border-blue-500 bg-blue-50 scale-105'
                                        : 'border-gray-200 hover:border-gray-300 hover:scale-105'
                                    }
                `}
                            >
                                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${type.color} text-white mb-3`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">{type.label}</h3>
                                <p className="text-sm text-gray-600">Professional AI-guided support</p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Start Session */}
            {sessionType && (
                <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg p-8 text-white text-center">
                    <Sparkles className="h-12 w-12 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Ready to Begin?</h2>
                    <p className="text-purple-100 mb-6">
                        You've selected {sessionTypes.find(t => t.id === sessionType)?.label}
                    </p>
                    <Button className="bg-white text-purple-600 hover:bg-purple-50 px-8 py-3 text-lg">
                        <Video className="h-5 w-5 mr-2" />
                        Start Therapy Session
                    </Button>
                </div>
            )}

            {/* Session History */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Clock className="h-6 w-6 mr-2 text-gray-500" />
                    Your Session History
                </h2>
                <div className="text-center py-8 text-gray-500">
                    <p>No previous sessions yet</p>
                    <p className="text-sm mt-2">Your therapy journey will be tracked here</p>
                </div>
            </div>
        </div>
    );
};

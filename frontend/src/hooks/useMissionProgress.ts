import { useState, useEffect } from 'react';
import { Mission, MissionStep } from '../types/Mission';
import apiClient from '../services/apiClient';

interface UseMissionProgressProps {
    missionId: string;
    studentId: string;
}

export const useMissionProgress = ({ missionId, studentId }: UseMissionProgressProps) => {
    const [mission, setMission] = useState<Mission | null>(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [code, setCode] = useState('');
    const [feedback, setFeedback] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [validating, setValidating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadMission();
    }, [missionId]);

    const loadMission = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/missions/${missionId}`);
            if (response.data.success) {
                setMission(response.data.data);
                // Load initial template for the first step
                if (response.data.data.steps.length > 0) {
                    setCode(response.data.data.steps[0].template);
                }
            }
        } catch (err: any) {
            console.error('❌ Failed to load mission:', err);

            if (err.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error('Response Status:', err.response.status);
                console.error('Response Data:', err.response.data);
                console.error('Response Headers:', err.response.headers);
            } else if (err.request) {
                // The request was made but no response was received
                console.error('No response received (Network Error?):', err.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('Error Message:', err.message);
            }

            if (err.config) {
                console.error('Request URL:', err.config.url);
                console.error('Request Headers:', err.config.headers);
            }

            setError(`Failed to load mission: ${err.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const submitCode = async () => {
        if (!mission) return;

        try {
            setValidating(true);
            setFeedback(null);

            // 1. Validate code (Client-side or Server-side)
            // For Phase 3, we use the NookAIService via backend
            const response = await apiClient.post(`/missions/${missionId}/submit`, {
                studentId,
                code,
                stepId: mission.steps[currentStepIndex].id,
                language: 'javascript' // Default to JS for now
            });

            if (response.data.success) {
                setFeedback(response.data.data);

                // If passed, allow moving to next step
                if (response.data.data.passed) {
                    // Logic to unlock next step or complete mission
                }
            }
        } catch (err) {
            console.error('Code submission failed:', err);
            setError('Failed to submit code');
        } finally {
            setValidating(false);
        }
    };

    const nextStep = () => {
        if (mission && currentStepIndex < mission.steps.length - 1) {
            const nextIndex = currentStepIndex + 1;
            setCurrentStepIndex(nextIndex);
            setCode(mission.steps[nextIndex].template);
            setFeedback(null);
        }
    };

    return {
        mission,
        currentStep: mission?.steps[currentStepIndex],
        currentStepIndex,
        code,
        setCode,
        feedback,
        loading,
        validating,
        error,
        submitCode,
        nextStep,
        isLastStep: mission ? currentStepIndex === mission.steps.length - 1 : false
    };
};

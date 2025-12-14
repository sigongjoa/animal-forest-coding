import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Mission } from '../types/Mission';
import apiClient from '../services/apiClient';
import { addBells } from '../store/slices/economySlice';
import { setTile } from '../store/slices/worldSlice';

interface UseMissionProgressProps {
    missionId: string;
    studentId: string;
}

export const useMissionProgress = ({ missionId, studentId }: UseMissionProgressProps) => {
    const dispatch = useDispatch();
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

    const loadLocalUnit1 = async () => {
        console.log('📦 Loading Local Unit 1 Data...');
        try {
            const { unit1Mission } = await import('../data/missions/unit1');
            setMission(unit1Mission as any);
            if (unit1Mission.steps.length > 0) {
                setCode(unit1Mission.steps[0].template);
            }
            setLoading(false);
            setError(null);
            return true;
        } catch (err) {
            console.error('Failed to import local unit 1:', err);
            return false;
        }
    };

    const loadLocalUnit2 = async () => {
        console.log('📦 Loading Local Unit 2 Data (Fishing)...');
        try {
            const { unit2Mission } = await import('../data/missions/unit2');
            setMission(unit2Mission as any);
            if (unit2Mission.steps.length > 0) {
                setCode(unit2Mission.steps[0].template);
            }
            setLoading(false);
            setError(null);
            return true;
        } catch (err) {
            console.error('Failed to import local unit 2:', err);
            return false;
        }
    };

    const loadMission = async () => {
        // 1. Check for Unit Match (Local)
        const path = window.location.pathname;
        const isUnit1 = (missionId && (missionId.includes('unit-1') || missionId.includes('economics') || missionId === 'mission-001')) || (path && (path.includes('unit-1') || path.includes('mission-001')));
        const isUnit2 = (missionId && (missionId.includes('unit-2') || missionId.includes('fish') || missionId === 'mission-002')) || (path && (path.includes('unit-2') || path.includes('mission-002')));

        if (isUnit1) {
            if (await loadLocalUnit1()) return;
        }

        if (isUnit2) {
            if (await loadLocalUnit2()) {
                return;
            } else {
                setLoading(false);
                setError('Failed to load local Unit 2 mission. Check console for details.');
                return;
            }
        }

        if (!missionId) return;

        // 2. Remote Load
        try {
            setLoading(true);
            setError(null);
            console.log('🌍 Loading remote mission:', missionId);

            const response = await apiClient.get(`/missions/${missionId}`);
            if (response.data.success) {
                setMission(response.data.data);
                if (response.data.data.steps.length > 0) {
                    setCode(response.data.data.steps[0].template);
                }
            }
        } catch (err: any) {
            console.error('❌ Remote load failed:', err);

            // 3. Fallback
            if (isUnit1 && await loadLocalUnit1()) return;
            if (isUnit2 && await loadLocalUnit2()) return;

            const msg = err.response?.data?.message || err.message || 'Unknown error';
            setError(`Failed to load mission: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    const submitCode = async () => {
        if (!mission) return;

        try {
            setValidating(true);
            setFeedback(null);

            // SPECIAL: Unit 1 Local Validation
            if (mission.id === 'unit-1-economics') {
                const { unit1Mission } = await import('../data/missions/unit1');
                await new Promise(resolve => setTimeout(resolve, 800));
                const result = unit1Mission.validator(code);
                setFeedback(result);
                // Unit 1 Local doesn't have GameBridge support yet unless we mock it here
                if (result.passed) {
                    dispatch(addBells(100));
                }
                setValidating(false);
                return;
            }

            // Remote Validation
            const response = await apiClient.post(`/java/validate`, {
                missionId: mission.id,
                stepId: mission.steps[currentStepIndex].id,
                code
            });

            if (response.data.success) {
                const data = response.data.data;
                setFeedback(data);

                // Handle Game State Updates from Backend
                if (data.gameUpdate) {
                    if (data.gameUpdate.bellsDelta) {
                        dispatch(addBells(data.gameUpdate.bellsDelta));
                    }
                    if (data.gameUpdate.tileUpdates) {
                        data.gameUpdate.tileUpdates.forEach((update: any) => {
                            dispatch(setTile({
                                x: update.x,
                                y: update.y,
                                type: update.type || 'grass',
                                object: update.object
                            }));
                        });
                    }
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

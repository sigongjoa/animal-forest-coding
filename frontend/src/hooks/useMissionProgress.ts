import { useState, useEffect } from 'react';
import axios from 'axios';
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

    const loadLocalUnit3 = async () => {
        console.log('📦 Loading Local Unit 3 Data (Variables Mock)...');
        try {
            // Dynamic import of JSON requires enabling "resolveJsonModule": true in tsconfig
            // or we use a workaround if it's not enabled. But let's try direct import.
            const unit3Mission = await import('../data/mock/unit-3-variable-world.json');
            setMission(unit3Mission as any); // JSON imports often need 'as any' or defined types
            if (unit3Mission.steps && unit3Mission.steps.length > 0) {
                setCode(unit3Mission.steps[0].template);
            }
            setLoading(false);
            setError(null);
            return true;
        } catch (err) {
            console.error('Failed to import local unit 3:', err);
            return false;
        }
    };

    const loadMission = async () => {
        // 0. Check for MOCK Mode
        const useMock = process.env.REACT_APP_USE_MOCK === 'true';
        console.log('Use Mock:', useMock);

        // 1. Check for Unit Match
        const path = window.location.pathname;
        const isUnit1 = (missionId && (missionId.includes('unit-1') || missionId.includes('economics') || missionId === 'mission-001')) || (path && (path.includes('unit-1') || path.includes('mission-001')));
        const isUnit2 = (missionId && (missionId.includes('unit-2') || missionId.includes('fish') || missionId === 'mission-002')) || (path && (path.includes('unit-2') || path.includes('mission-002')));
        const isUnit3 = (missionId && (missionId.includes('unit-3') || missionId.includes('variable') || missionId === 'mission-003')) || (path && (path.includes('unit-3') || path.includes('mission-003')));

        // Mock Logic Override
        if (useMock) {
            if (isUnit1) { await loadLocalUnit1(); return; }
            if (isUnit2) { await loadLocalUnit2(); return; }
            if (isUnit3) { await loadLocalUnit3(); return; }
        }

        if (isUnit1 && !useMock) {
            if (await loadLocalUnit1()) return;
        }

        if (isUnit2 && !useMock) {
            if (await loadLocalUnit2()) {
                return;
            } else {
                setLoading(false);
                setError('Failed to load local Unit 2 mission. Check console for details.');
                return;
            }
        }

        // Unit 3 (Variables) - Try Remote first, fallback to mock if fails

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
            // Unit 3 Fallback
            if (isUnit3 && await loadLocalUnit3()) {
                console.warn('⚠️ Falling back to Unit 3 Mock Data');
                return;
            }

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
        } catch (err: any) {
            console.error('❌ Code submission failed!');

            // --- FALLBACK MOCK VALIDATOR FOR DEMO ---
            const isMockMode = process.env.REACT_APP_USE_MOCK === 'true';

            // Check if we are in Unit 3 and if failure is connection related
            const isUnit3 = mission?.id?.includes('unit-3');

            if (isUnit3 && (isMockMode || err.message === 'Network Error' || !err.response)) {
                console.warn('⚠️ Using Mock Validator for Unit 3');
                await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay

                let passed = false;
                let message = "Hmm... 다시 확인해보세요.";
                const step = currentStepIndex + 1; // 1-based step

                // Simple pattern matching for demo
                if (step === 1) { // Scope
                    if (code.includes('this.myBells += 4000') && !code.includes('int myBells = 4000')) {
                        passed = true;
                        message = "훌륭해요! 이제 돈이 사라지지 않아요.";
                    } else {
                        message = "지역 변수(int myBells)를 지우고 this.myBells를 사용했나요?";
                    }
                } else if (step === 2) { // Shadowing
                    if (code.includes('this.myBells -= amount') || code.includes('this.myBells -= myBells')) {
                        passed = true;
                        message = "완벽해요! 이제 빚을 정확히 갚을 수 있어요.";
                    } else {
                        message = "this.myBells를 사용해서 내 지갑을 가리키세요!";
                    }
                } else if (step === 3) { // Precondition 1
                    if (code.includes('if') && code.includes('>=') && code.includes('cost')) {
                        passed = true;
                        message = "좋습니다! 이제 돈이 부족하면 살 수 없어요.";
                    } else {
                        message = "if문을 사용해서 잔액을 확인했나요?";
                    }
                } else if (step === 4) { // Precondition 2 (InStock)
                    if (code.includes('if') && code.includes('inStock') && code.includes('품절')) {
                        passed = true;
                        message = "대단해요! 재고 관리 시스템이 완성되었습니다.";
                    } else {
                        message = "inStock 변수를 확인하고 '품절' 메시지를 출력해보세요.";
                    }
                }

                setFeedback({
                    passed,
                    message,
                    output: passed ? ["TEST_PASSED"] : ["TEST_FAILED"]
                });
                setValidating(false);
                return;
            }
            // ----------------------------------------

            if (axios.isAxiosError(err)) {
                console.error('🔍 Error Details:', {
                    url: err.config?.url,
                    method: err.config?.method,
                    baseURL: err.config?.baseURL,
                    status: err.response?.status,
                    statusText: err.response?.statusText,
                    data: err.response?.data
                });
            } else {
                console.error('🔍 Unknown Error:', err);
            }
            setError('Failed to submit code. Check console for details.');
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

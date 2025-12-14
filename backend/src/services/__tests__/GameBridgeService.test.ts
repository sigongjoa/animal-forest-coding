import { gameBridgeService, ExecutionResult } from '../GameBridgeService';

describe('GameBridgeService', () => {
    const mockSuccessResult: ExecutionResult = {
        success: true,
        output: '',
        executionTime: 100
    };

    const mockFailResult: ExecutionResult = {
        success: false,
        output: 'Error',
        executionTime: 100
    };

    describe('Mission 101 (Variables)', () => {
        it('should award 100 bells on success', () => {
            const update = gameBridgeService.calculateGameUpdate('mission-101', mockSuccessResult);
            expect(update.bellsDelta).toBe(100);
            expect(update.message).toContain('Variable declared');
            expect(update.missionComplete).toBe(true);
        });

        it('should do nothing on failure', () => {
            const update = gameBridgeService.calculateGameUpdate('mission-101', mockFailResult);
            expect(update.bellsDelta).toBe(0);
            expect(update.missionComplete).toBe(false);
        });
    });

    describe('Mission 102 (Conditionals / Weeding)', () => {
        it('should remove weeds based on output logs', () => {
            const weedResult: ExecutionResult = {
                ...mockSuccessResult,
                output: "Removed weed at 3,4\nRemoved weed at 5,5"
            };
            const update = gameBridgeService.calculateGameUpdate('mission-102', weedResult);

            expect(update.tileUpdates).toHaveLength(2);
            expect(update.tileUpdates).toContainEqual({ x: 3, y: 4, object: null });
            expect(update.tileUpdates).toContainEqual({ x: 5, y: 5, object: null });
            expect(update.bellsDelta).toBe(100); // 50 * 2
        });
    });

    describe('Mission 106 (ArrayList / Fishing)', () => {
        it('should award bells per fish caught', () => {
            const fishResult: ExecutionResult = {
                ...mockSuccessResult,
                output: "Caught Bass\nCaught Snapper\nCaught Tuna"
            };
            const update = gameBridgeService.calculateGameUpdate('mission-106', fishResult);

            expect(update.bellsDelta).toBe(900); // 300 * 3
            expect(update.message).toContain('3 fish caught');
        });
    });
});

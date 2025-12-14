import fc from 'fast-check';
import { gameBridgeService, ExecutionResult } from '../GameBridgeService';

describe('GameBridgeService Property Tests', () => {

    // Invariant 1: Bells Delta should always be an integer (no floats)
    test('Bells delta should always be an integer', () => {
        fc.assert(
            fc.property(
                fc.string(), // missionId
                fc.boolean(), // success
                fc.string(), // output
                (missionId, success, output) => {
                    const result: ExecutionResult = {
                        success,
                        output,
                        executionTime: 100
                    };
                    const update = gameBridgeService.calculateGameUpdate(missionId, result);

                    if (update.bellsDelta !== undefined) {
                        return Number.isInteger(update.bellsDelta);
                    }
                    return true;
                }
            )
        );
    });

    // Invariant 2: Failed execution should never award positive bells
    test('Failed execution should never award positive bells', () => {
        fc.assert(
            fc.property(
                fc.string(), // missionId
                fc.string(), // output
                (missionId, output) => {
                    const result: ExecutionResult = {
                        success: false, // Always fail
                        output,
                        executionTime: 100
                    };
                    const update = gameBridgeService.calculateGameUpdate(missionId, result);
                    return (update.bellsDelta || 0) <= 0;
                }
            )
        );
    });

    // Invariant 3: Tile updates should have valid coordinates (non-negative)
    // Note: This relies on the implementation logic not producing negative coords from regex
    test('Tile updates should have valid logic', () => {
        fc.assert(
            fc.property(
                fc.string(),
                fc.string(),
                (missionId, output) => {
                    // We construct a result that looks successful
                    const result: ExecutionResult = { success: true, output, executionTime: 100 };
                    const update = gameBridgeService.calculateGameUpdate(missionId, result);

                    if (update.tileUpdates) {
                        return update.tileUpdates.every(t => t.x >= 0 && t.y >= 0);
                    }
                    return true;
                }
            )
        );
    });
});

export interface ExecutionResult {
    success: boolean;
    output: string;
    error?: string;
    compilationError?: string;
    executionTime: number;
}

export interface GameTileUpdate {
    x: number;
    y: number;
    type?: string;
    object?: string | null; // null to remove
}

export interface GameStateUpdate {
    bellsDelta?: number;
    tileUpdates?: GameTileUpdate[];
    message?: string;
    missionComplete?: boolean;
}

class GameBridgeService {
    /**
     * Converts code execution results into game state changes.
     * This acts as the "Physics Engine" or "Rule Engine" of the game.
     */
    calculateGameUpdate(missionId: string, result: ExecutionResult): GameStateUpdate {
        const update: GameStateUpdate = {
            bellsDelta: 0,
            tileUpdates: [],
            message: '',
            missionComplete: result.success
        };

        if (!result.success) {
            return update;
        }

        // Logic based on Mission ID
        // In the future, this should be extracted to Mission Definitions or a Script Engine
        switch (missionId) {
            case 'mission-101': // Variable Declaration
                update.bellsDelta = 100;
                update.message = "Variable declared! You got starter funds.";
                break;

            case 'mission-102': // Conditionals (Weeding)
                // Assuming the user code output logs which weeds were removed
                // e.g., "Removed weed at 3,4"
                const weedMatches = result.output.matchAll(/Removed weed at (\d+),(\d+)/g);
                for (const match of weedMatches) {
                    const x = parseInt(match[1]);
                    const y = parseInt(match[2]);
                    update.tileUpdates?.push({ x, y, object: null });
                    update.bellsDelta! += 50;
                }
                if (update.bellsDelta! > 0) {
                    update.message = `Great weeding! You earned ${update.bellsDelta} bells.`;
                }
                break;

            case 'mission-106': // ArrayList (Fishing)
                // e.g. "Caught Bass", "Caught Snapper"
                const fishCount = (result.output.match(/Caught/g) || []).length;
                if (fishCount > 0) {
                    update.bellsDelta = fishCount * 300;
                    update.message = `Nice catch! ${fishCount} fish caught.`;
                }
                break;

            default:
                if (result.success) {
                    update.bellsDelta = 50; // Participation award
                }
        }

        return update;
    }
}

export const gameBridgeService = new GameBridgeService();

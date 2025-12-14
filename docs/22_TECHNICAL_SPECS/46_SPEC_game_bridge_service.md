# GameBridgeService Technical Specification

## 1. Overview
The **GameBridgeService** acts as the crucial link between the Code Execution Engine and the Game State Management. It translates "Technical Outcomes" (e.g., standard output, return values) into "Game Outcomes" (e.g., bells earned, world changes).

## 2. Responsibility
- **Input**: `ExecutionResult` (Success status, STDOUT, Errors) + `MissionID`
- **Output**: `GameStateUpdate` (Bells delta, Tile updates, Messages)
- **Role**:
    - Analyzes execution logs using regex patterns.
    - Applies mission-specific logic to determine rewards.
    - Formats updates for the frontend Redux store.

## 3. Architecture

### Interface: `GameStateUpdate`
```typescript
interface GameStateUpdate {
    bellsDelta?: number;       // Change in currency
    tileUpdates?: GameTileUpdate[]; // Changes to the world grid
    message?: string;          // Contextual feedback message
    missionComplete?: boolean; // Whether the step is considered "Passed"
}
```

### Supported Missions Logic

| Mission ID | Trigger Analysis | Reward / Effect |
|------------|------------------|-----------------|
| **mission-101** (Variables) | Check `success: true` | `+100 Bells`, Success Message |
| **mission-102** (Conditionals) | Regex: `Removed weed at (\d+),(\d+)` | `+50 Bells` per weed, Remove Tile Object |
| **mission-106** (Collections) | Regex: `Caught (FishName)` | `+300 Bells` per fish, Catch Message |

## 4. Error Handling
- If execution fails (`success: false`), the service returns a neutral update with no rewards.
- If regex parsing fails despite success, it falls back to a default "Participation Award" (+50 Bells).

## 5. Future Extensibility
- **Scriptable Rules**: Move hardcoded switch-cases to a JSON/Lua configuration file to allow content designers to tweak rewards without code changes.
- **Event Bus**: Emit events like `ACHIEVEMENT_UNLOCKED` based on complex analysis.

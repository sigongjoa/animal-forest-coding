# Animal Forest Coding - Project Index

## Overview
A gamified coding education platform where users learn programming concepts (Java/Python) through "Animal Crossing" style missions.

## Directory Structure

### Backend (`/backend`)
*   **`src/server.ts`**: Entry point.
*   **`src/routes/`**: API routes (missions, progression, auth).
*   **`src/services/`**: Business logic.
    *   `MissionService.ts`: Loads missions from `src/data/missions/content/`.
    *   `DatabaseService.ts`: SQLite interactions.
*   **`src/data/missions/content/`**: Individual mission JSON files [REFACTORED].
*   **`src/tests/`**: Centralized test directory [REFACTORED].

### Frontend (`/frontend`)
*   **`src/features/`**: Feature-based modules [REFACTORED].
    *   **`mission/`**: The core learning interface.
        *   `MissionPage.tsx`: Main container.
        *   `components/`: `IDEEditor`, `ScenarioPlayer`, `StoryDisplay`, `NookCompanion`.
*   **`src/pages/`**: Other pages (`MainPage`, `LoginPage` etc. - *Plan to move these to features later*).
*   **`src/store/`**: Redux state management (`progressionSlice`).
*   **`src/tests/`**: Centralized test directory [REFACTORED].

## Key Features
1.  **Mission Engine**: JSON-based mission definition with story steps and coding tasks.
2.  **Web IDE**: `react-simple-code-editor` with PrismJS highlighting.
3.  **Gamification**: Points, badges, and "Bells" currency (Nook's system).
4.  **Visual Feedback**:
    *   `MissionScenarioPlayer`: Animated sprite cutscenes.
    *   `TileGridRenderer`: Visual representation of code results (the island).

## Recent Refactoring (2025-12-16)
*   **Split `missions.json`**: Missions are now individual files in `backend/src/data/missions/content/`.
*   **Frontend Modularization**: Created `src/features/mission` and consolidated mission components there.
*   **Test Consolidation**: Moved scattered tests to root `tests/` folders.

# Animal Forest Coding - Refactoring Strategy

Based on the [SuperClaude Framework methodology](../SuperClaude_Framework/docs/next-refactor-plan.md), we are implementing a structured refactoring plan to ensure long-term maintainability, scalability, and code health.

## 1. Directory Structure Optimization

Moving from a purely "Technical Layer" structure (components/hooks/utils) to a **Hybrid Feature-First** structure. This aligns code that changes together locally.

### Current Problem
- `missions.json` is a monolith (400+ lines and growing).
- Test files are scattered or clustered in a confusing way (`test` folders everywhere).
- Logic for a single feature (like "Missions") is spread across `pages/`, `components/`, `hooks/`, and `types/`.

### Proposed Structure

```
d:/progress/animal forest coding/
├── backend/
│   ├── src/
│   │   ├── config/             # Environment & Server config
│   │   ├── modules/            # Feature-based Modules (Controller + Service + Types)
│   │   │   ├── auth/
│   │   │   ├── missions/       # Split logic for missions
│   │   │   └── progression/
│   │   ├── data/               # Static Data
│   │   │   └── missions/       # Split JSONs (e.g., mission-001.json)
│   │   └── utils/
│   └── tests/                  # Centralized Backend Tests
│       ├── unit/
│       ├── integration/
│       └── e2e/
│
├── frontend/
│   ├── src/
│   │   ├── features/           # Feature Modules
│   │   │   ├── auth/           # Login, User State
│   │   │   ├── mission/        # IDE, Scenario Player, Step Logic
│   │   │   ├── story/          # Dialogue, Characters
│   │   │   └── world/          # Tile/Island Rendering
│   │   ├── shared/             # Reusable UI Components (Buttons, Layouts)
│   │   └── app/                # Global Stores, Routing, Providers
│   └── tests/                  # Centralized Frontend Tests
│       ├── components/
│       └── features/
```

## 2. Mission Data Management (The "Content" Layer)

Breaking down the monolith `missions.json`.

*   **Action**: Split `missions.json` into individual files per mission ID.
*   **Loader**: Implement a simple loader pattern in Backend to aggregate them on startup.
*   **Validation**: Add a script (`scripts/validate-missions.ts`) to ensure IDs and references are valid (The "Doctor" Check).

## 3. Test Consolidation

Addressing the "Too many test folders" issue.

*   **Strategy**: Adopt a centralized `tests/` directory at the root of `backend` and `frontend` respectively, mirroring the source structure where possible, OR colocation (folder-per-feature). Given the user request, **Centralized** might be cleaner for now to reduce clutter.
*   **Action**: Move all scattered `__tests__` or `test` folders into a root `tests` directory.

## 4. Documentation & Indexing

*   **Action**: Create `PROJECT_INDEX.md` at root to map high-level architecture.

## Execution Plan

1.  **Phase 1: Housekeeping (Getting Organized)**
    *   Create `PROJECT_INDEX.md`.
    *   Consolidate scattered test folders into `frontend/tests` and `backend/tests`.
2.  **Phase 2: Data Splitting**
    *   Refactor `missions.json` into multiple files.
    *   Update Backend MissionService to load from directory.
3.  **Phase 3: Frontend Feature Reorg (Incremental)**
    *   Move `MissionPage`, `MissionIDE`, `NookCompanion` into `frontend/src/features/mission/`.

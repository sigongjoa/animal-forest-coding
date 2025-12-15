# Mission Design Guidelines & Architecture

## 1. Philosophy
"Coding Island" (Animal Forest Coding) combines **Storytelling** with **Coding Challenges**.
Every mission is not just a problem to solve, but a chapter in the player's survival story.
*   **Context First**: Code is the tool to solve survival problems (e.g., fishing, building, trading).
*   **Visual Feedback**: Show, don't just print. If the code fails, the character should react (shock, confusion).
*   **Seamless Flow**: Transition smoothly between Narrative Slides (Visual Novel style) and the IDE.

## 2. Standard Mission Flow
A typical mission follows this "Sandwich" pattern:

1.  **Intro Scene (The 'Why')**:
    *   **Format**: Dialogue / Cutscene.
    *   **Goal**: Present a problem (e.g., "We need to catch fish to eat").
    *   **Asset**: Background + Character Emotes.

2.  **The Trap (The 'First Try')**:
    *   **Format**: Coding Challenge (light).
    *   **Goal**: Let the user try a naive approach or observe a bug (e.g., "My money disappeared!").

3.  **The Lesson (The 'Aha!' Moment)**:
    *   **Format**: Dialogue / Explanation.
    *   **Goal**: Explain the concept (e.g., Scope, Loop) using game metaphors (Pocket vs. Ground).

4.  **The Solution (The 'Real Code')**:
    *   **Format**: Coding Challenge (Main).
    *   **Goal**: Apply the fix. The code must be correct and robust.

5.  **Outro Scene (The 'Reward')**:
    *   **Format**: Dialogue / Animation.
    *   **Goal**: Visual reward (bells increasing, house built) and setup for the next mission.

## 3. Directory & Naming Conventions
To keep the project organized as it scales, follow these rules:

### 3.1 Documentation
*   **Path**: `docs/mission/{Mission_ID}/`
*   **File**: `MISSION_{Mission_ID}_DESIGN.md`
*   **Content**:
    *   Scenario Script (Timeline)
    *   Learning Objectives
    *   Required Assets List
    *   Specific Logic Requirements (Shadowing, specific errors to catch)

### 3.2 Assets
*   **Path**: `frontend/public/assets/mission{Mission_ID}/`
*   **Types**:
    *   Backgrounds: `bg_{name}.png` (Pixel art, approx 800x600 or scalable)
    *   Icons/Items: `icon_{name}.png`
    *   Character variations if needed.

## 4. Mission JSON Schema Structure
The `missions.json` (or database equivalent) drives the engine.

```json
{
  "missionId": "string",
  "title": "string",
  "script": [
    {
      "type": "scene",
      "background": "asset_name",
      "dialogue": [ ... ]
    },
    {
      "type": "code_challenge",
      "context": "string (unique_id)",
      "instruction": "string",
      "initialCode": "string",
      "validation": { ... }
    }
  ]
}
```

## 5. Asset Design Style Guide
*   **Visual Style**: 16-bit / 32-bit SD Pixel Art (Animal Crossing mixed with Stardew Valley vibes).
*   **Palette**: Warm, vibrant colors. Rounded corners.
*   **Characters**: 2-head tall (SD style).
*   **UI**: Clean, semi-transparent overlays for dialogue.

## 6. Checklist for New Missions
- [ ] **Topic Selection**: What is the Java concept?
- [ ] **Story Concept**: What is the survival situation?
- [ ] **Design Doc**: Create `MISSION_{N}_DESIGN.md` in `docs/mission/{N}/`.
- [ ] **Draft Script**: Write the dialogue.
- [ ] **Asset List**: Identify missing assets.
- [ ] **Generate Assets**: Create and place in `public/assets/mission{N}/`.
- [ ] **Implementation**: Add to `missions.json` and implement specific validators.

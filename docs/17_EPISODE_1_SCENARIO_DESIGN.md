# Episode 1 Scenario Implementation Design: "No Free Lunch!"

## 1. Overview
This document outlines the technical design for implementing the interactive story mode for Episode 1: "No Free Lunch!". The goal is to evolve the current static text-based mission intro into a dynamic **Visual Novel RPG** experience where characters move, emote, and interact before transitioning seamlessly into the coding interface.

## 2. Updated Data Structure (Mission Schema)

To support character movement and scripted events, we need to upgrade `storyContext` in `missions.json` to a script-based system.

### 2.1 Proposed Schema
```typescript
interface MissionStory {
  // Initial setup
  setting: {
    background: 'beach_sunset' | 'forest_day';
    bgm?: 'nook_theme';
    characters: {
      id: 'player' | 'nook';
      initialPosition: { x: number; y: number };
      sprite: string;
      direction: 'down' | 'up' | 'left' | 'right';
    }[];
  };
  
  // Script sequence
  script: ScriptAction[];
}

type ScriptAction = 
  | { type: 'dialogue'; speaker: 'nook' | 'player'; text: string; emotion?: 'happy' | 'angry' | 'shocked'; }
  | { type: 'move'; target: 'player' | 'nook'; to: { x: number; y: number }; speed?: 'walk' | 'run'; }
  | { type: 'emote'; target: 'nook'; emoji: 'money' | 'shock' | 'idea'; } // E.g., showing calculator
  | { type: 'transition'; mode: 'IDE'; } // Switch to Code Editor
  | { type: 'wait'; duration: number; };
```

### 2.2 Episode 1 Script Data Example
```json
{
  "script": [
    // Scene 1: Arrival
    { "type": "dialogue", "speaker": "nook", "text": "Welcome to *Coding Island*, yes, yes!" },
    { "type": "move", "target": "nook", "to": { "x": 120, "y": 120 } }, // Approaches player
    { "type": "emote", "target": "nook", "emoji": "calculator" }, // Tapping calculator
    { "type": "dialogue", "speaker": "nook", "text": "Let's settle the bill. Tent, NookPhone, Tax..." },
    { "type": "emote", "target": "player", "emoji": "shock" },
    { "type": "dialogue", "speaker": "nook", "text": "Total: 49,800 Bells! Pay up!" },
    { "type": "dialogue", "speaker": "nook", "text": "No bells? Then you'll have to code your own bank account." },
    { "type": "transition", "mode": "IDE" } // Opens IDE
  ]
}
```

## 3. Frontend Architecture

### 3.1 `GameStageController` (New Component)
Orchestrates the entire mission flow. Replaces the current simple state in `MissionPage`.
- **States**: `CINEMATIC` (Scenario playing) <-> `INTERACTIVE` (Coding/IDE).
- **Responsibility**: 
  - Parses the `script` array.
  - Controls the `WorldView` (Canvas/DOM) and `IDEView`.

### 3.2 `WorldView` & `StoryRenderer`
- Renders the game world (Background + Characters).
- **Sprite Animation**: Uses `SpriteCharacter` component we created.
- **Dialogue Overlay**: A typing-effect text box at the bottom.
- **Bubble Emotes**: CSS animations for emotions (💡, 💰, ❓) appearing over characters heads.

## 4. Asset Requirements (To Be Generated)

To realize this vision, we need specific assets:

1.  **Tom Nook Sprite Sheet**:
    - Style: Pixel Art, Matches Player style.
    - Actions: Idle (tapping calculator), Walking (4 directions), Shocked.
2.  **Emote Icons**:
    - Calculator, Bells (Money bag), Lightbulb, Exclamation mark.
3.  **Backgrounds**:
    - `beach_sunset.png`: For the opening scene.

## 5. Development Phases

### Phase 1: Script & Asset Prep
- Create `nook_spritesheet.png`.
- Update `missions.json` with the new script structure for Mission 1.

### Phase 2: Engine Implementation
- Implement `GameStageController` to parse script actions.
- Implement `DialogueBox` with typing effect using `Typewriter` library or custom hook.

### Phase 3: Integration
- Connect the "End of Script" event to the "Open IDE" action.
- Ensure Nook's specific feedback (e.g., catching `int` vs `double` errors) triggers specific script sequences (Success/Failure dialogues).

## 6. Testing Strategy
- **Visual Verification**: Check if Nook walks to the correct coordinates.
- **Flow Verification**: Ensure dialogue advances on click and transitions to IDE at the end.
- **State Restoration**: If user refreshes, decide whether to replay intro or skip to IDE.

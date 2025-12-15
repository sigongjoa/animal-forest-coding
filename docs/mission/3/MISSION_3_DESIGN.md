# Mission 3: Variable Scope, Lifecycle, Shadowing, Preconditions

## 1. Overview
*   **Title**: The Mystery of the Missing Bells
*   **Topic**: Variable Scope, Lifecycle, Shadowing, Preconditions
*   **Target Audience**: Students who have completed Java loops (for).
*   **Goal**: Understand why variables disappear (scope), how to keep them (instance variables), how to resolve naming conflicts (shadowing/this), and how to prevent invalid actions (preconditions).

## 2. Learning Objectives
1.  **Scope & Lifecycle**: Differentiate between local variables (temporary) and instance variables (persistent).
2.  **Shadowing**: Understand variable shadowing and use the `this` keyword to access instance variables.
3.  **Preconditions**: Implement validation logic to prevent invalid state transitions (e.g., negative balance).

## 3. Scenario Script
The story is divided into 4 chapters, transitioning between narrative slides/dialogue and code interaction.

### Chapter 1: The Disappearing Money (Scope)
*   **Context**: The player caught 10 fish and sells them at Nook's Cranny.
*   **Problem**: Money is gained in `sellFish()` using a local variable `int myBells`, but outside the method, money is 0.
*   **Key Concept**: Local variables die when the method ends.
*   **Solution**: Promote `myBells` to an Instance Variable.

### Chapter 2: The Doppelganger (Shadowing)
*   **Context**: Paying off a loan.
*   **Problem**: `payLoan(int myBells)` uses the same name for the parameter and the instance variable. `myBells = myBells - myBells` results in 0 change to the wallet.
*   **Key Concept**: The nearest variable (parameter) shadows the instance variable.
*   **Solution**: Use `this.myBells` to refer to the instance variable.

### Chapter 3: The Negative Balance (Precondition)
*   **Context**: Buying a Gold Fishing Rod (50,000 Bells) with only 10,000 Bells.
*   **Problem**: Purchase succeeds, resulting in -40,000 Bells.
*   **Key Concept**: Methods need safety checks.
*   **Solution**: Add `if (this.myBells < cost) return;`.

### Chapter 4: Mission - Out of Stock
*   **Context**: Buying a tool even if it's out of stock.
*   **Task**: Check `inStock` variable.
*   **Requirement**: Print "Sold out!" and prevent purchase if `inStock` is false.

## 4. Script Data (JSON Schema)

```json
{
  "missionId": "mission_3_variables",
  "title": "The Mystery of the Missing Bells",
  "script": [
    {
      "type": "scene",
      "background": "nook_store_inside",
      "characters": [
        { "id": "nook", "position": { "x": 400, "y": 300 }, "emote": "happy" },
        { "id": "player", "position": { "x": 200, "y": 300 } }
      ],
      "dialogue": [
        { "speaker": "nook", "text": "Welcome! You have so many fish! Let me buy them." },
        { "speaker": "system", "text": "You sold 10 Sea Bass for 4,000 Bells!" }
      ]
    },
    {
      "type": "code_challenge",
      "context": "scope_error",
      "instruction": "Run the sellFish() method and check your balance.",
      "code": "public void sellFish() {\n    int myBells = 4000;\n    System.out.println(\"Earned 4000 bells!\");\n}"
    },
    {
      "type": "scene",
      "background": "nook_store_outside",
      "dialogue": [
        { "speaker": "player", "text": "Huh? My pockets are empty! Where is my 4,000 Bells?", "emote": "shock" },
        { "speaker": "nook", "text": "Ah, that was a 'Local Variable' money. It disappeared when you left the counter!", "emote": "explain" }
      ]
    },
    {
      "type": "code_challenge",
      "context": "fix_scope",
      "instruction": "Move 'myBells' to the class level to make it an Instance Variable.",
      "hint": "declare 'private int myBells;' inside the class but outside methods."
    },
    {
      "type": "scene",
      "background": "nook_store_inside",
      "dialogue": [
        { "speaker": "nook", "text": "Now that your money is safe, time to pay your loan!" }
      ]
    },
    {
      "type": "code_challenge",
      "context": "shadowing_error",
      "instruction": "Fix the payLoan method so it actually deducts from your wallet.",
      "initialCode": "public void payLoan(int myBells) {\n    myBells = myBells - myBells;\n}"
    },
    {
      "type": "scene",
      "background": "nook_store_inside",
      "dialogue": [
        { "speaker": "nook", "text": "Great! Now, how about this Gold Fishing Rod? It's 50,000 Bells." }
      ]
    },
    {
      "type": "code_challenge",
      "context": "precondition_mission",
      "instruction": "Prevent buying if you don't have enough money OR if it's out of stock.",
      "validation": {
        "conditions": ["check_balance", "check_stock"]
      }
    }
  ]
}
```

## 5. Required Assets

### Backgrounds
1.  **`nook_store_inside.png`**
    *   **Description**: Interior of Nook's Cranny. Shelves with goods, a counter. Pixel art style.
    *   **Path**: `/assets/mission3/nook_store_inside.png`
2.  **`nook_store_outside.png`**
    *   **Description**: Exterior of Nook's Cranny. Day time. Pixel art style.
    *   **Path**: `/assets/mission3/nook_store_outside.png`

### Items / Icons
1.  **`icon_gold_fishing_rod.png`**
    *   **Description**: A shiny golden fishing rod.
    *   **Path**: `/assets/mission3/icon_gold_fishing_rod.png`
2.  **`icon_bell_bag.png`**
    *   **Description**: A bag of money.
    *   **Path**: `/assets/mission3/icon_bell_bag.png`

### Characters
*   Existing Nook and Player assets can be reused.

## 6. Implementation Notes
*   **State Tracking**: The game engine needs to track `myBells` (user's variable) vs actual game state if we want to show visual feedback.
*   **Parser Improvements**: We might need to detect if `this.` is used in the AST for the Shadowing mission.

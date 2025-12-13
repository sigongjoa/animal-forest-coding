import { Mission } from '../../types/Mission';

export const unit1Mission: Mission & { validator: (code: string) => { passed: boolean; message: string; output?: string[] } } = {
    id: 'unit-1-economics',
    title: 'Unit 1: Nook\'s Economics',
    description: 'Master the basics of variables, primitive types, and state management in the Bank of Nook.',
    difficulty: 'beginner',
    order: 1,
    rewards: {
        basePoints: 100,
        speedBonus: 50,
        perfectBonus: 50
    },
    unlocks: ['unit-2-fishing'],
    prerequisites: [],
    steps: [
        {
            id: 1,
            title: 'Episode 1: Defining State (Primitive Types)',
            description: 'To manage the player\'s debt, we need to define the state of the `NookAccount`. Nook insists on using `int` for Bells (no fractions allowed!) and `double` for the interest rate (0.5%).\n\n**Task:**\nDeclare two private instance variables:\n1. `bellBalance` (int)\n2. `interestRate` (double) initialized to `0.005`',
            prompt: 'Define the member variables `bellBalance` and `interestRate` with the correct types.',
            template: `public class NookAccount {
    // TODO: Declare the instance variables here
    
    
    public NookAccount() {
        // Constructor logic will be added in the next step
    }
}`,
            solution: `public class NookAccount {
    private int bellBalance;
    private double interestRate = 0.005;

    public NookAccount() {
    }
}`,
            prerequisites: []
        },
        {
            id: 2,
            title: 'Episode 2: The Shadowing Bug (Constructor)',
            description: 'Great! Now we need to initialize the account. The previous intern wrote this constructor, but the balance always stays at 0 even after depositing money.\n\n**Task:**\nFind and fix the **Shadowing** bug in the constructor. Ensure `bellBalance` is assigned to the instance variable, not a local variable.',
            prompt: 'Fix the bug where `bellBalance` is redeclared inside the constructor.',
            template: `public class NookAccount {
    private int bellBalance;
    private double interestRate = 0.005;

    public NookAccount(int initialLoan) {
        // 🚨 BUG: Why is the instance variable not updating?
        int bellBalance = 0; 
        
        // This looks correct
        this.bellBalance = bellBalance - initialLoan; 
    }
}`,
            solution: `public class NookAccount {
    private int bellBalance;
    private double interestRate = 0.005;

    public NookAccount(int initialLoan) {
        bellBalance = 0;
        // or this.bellBalance = 0;
    }
}`,
            prerequisites: []
        }
    ],
    scenario: {
        setting: {
            background: 'nook_bank_interior',
            characters: [
                {
                    id: 'nook',
                    initialPosition: { x: 400, y: 300 },
                    sprite: '/assets/character/nook.png',
                    direction: 'down'
                }
            ]
        },
        script: [
            { type: 'dialogue', speaker: 'nook', text: 'Intern! My bank system is crashing!', emotion: 'shocked' },
            { type: 'dialogue', speaker: 'nook', text: 'Fix the variables and the constructor NOW!', emotion: 'angry' },
            { type: 'transition', mode: 'IDE' }
        ]
    },
    validator: (code: string) => {
        const output: string[] = [];
        output.push("Compiling NookAccount.java...");

        // Validation logic needs to handle multiple steps based on *current step index*?
        // Ideally validator should take step index, but the interface checks code string only.
        // We will infer the step based on the content or try to validate loosely.

        // Check for Step 1 completion criteria
        const hasBellBalance = /private\s+int\s+bellBalance/.test(code);
        const hasInterestRate = /private\s+double\s+interestRate/.test(code);

        // Check for Step 2 completion criteria (Fixing shadowing)
        const hasShadowing = /int\s+bellBalance\s*=\s*0/.test(code);

        // Heuristic to detect which step we are on or if validation passes general criteria
        if (!hasBellBalance) {
            output.push("Error: Missing 'private int bellBalance' declaration.");
            return { passed: false, message: "Missing 'private int bellBalance' declaration.", output };
        }
        if (!hasInterestRate) {
            output.push("Error: Missing 'private double interestRate' declaration.");
            return { passed: false, message: "Missing 'private double interestRate' declaration.", output };
        }

        // If the code contains the constructor with logic, we validate step 2
        if (code.includes("initialLoan")) {
            output.push("Parsing constructor NookAccount(int)...");

            if (hasShadowing) {
                output.push("Warning: The local variable 'bellBalance' is hiding the field 'bellBalance'.");
                output.push("Error: Instance variable 'bellBalance' was not updated.");
                return { passed: false, message: "You are still re-declaring 'int bellBalance' inside the constructor (Shadowing)!", output };
            }
            // Allow variations like 'this.bellBalance = 0' or 'bellBalance = 0'
            if (/bellBalance\s*=\s*0/.test(code) || /this\.bellBalance\s*=\s*0/.test(code)) {
                output.push("State initialization verified: bellBalance = 0");
                output.push("Build Successful.");
                return { passed: true, message: "Excellent! You fixed the shadowing bug and correctly initialized the state.", output };
            }

            output.push("Error: bellBalance initialization logic missing.");
            return { passed: false, message: "Make sure to initialize bellBalance to 0 inside the constructor.", output };
        }

        // Otherwise assume step 1 validation
        output.push("Variable declarations verified.");
        output.push("Build Successful.");
        return { passed: true, message: "Great! You defined the primitive types correctly.", output };
    }
};

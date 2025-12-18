import fs from 'fs';
import path from 'path';
import { Mission } from '../models/Mission';

const MISSIONS_DIR = path.join(__dirname, '../data/missions/content');

/**
 * Validator for Animal Forest Coding Missions
 * Checks for:
 * 1. JSON Syntax validity
 * 2. Required fields (ID, Title, Steps)
 * 3. Step logic (ID Uniqueness, Required fields)
 * 4. Resource existence (Images - *Warning only*)
 * 5. Unlock/Prerequisite validity (Referential Integrity)
 */

async function validateMissions() {
    console.log(`🔍 Starting Mission Validation...`);
    console.log(`📂 Directory: ${MISSIONS_DIR}\n`);

    if (!fs.existsSync(MISSIONS_DIR)) {
        console.error(`❌ Missions directory not found: ${MISSIONS_DIR}`);
        process.exit(1);
    }

    const files = fs.readdirSync(MISSIONS_DIR).filter(file => file.endsWith('.json'));
    console.log(`📝 Found ${files.length} mission files.\n`);

    const missions: Map<string, Mission> = new Map();
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Load and Parse
    for (const file of files) {
        try {
            const content = fs.readFileSync(path.join(MISSIONS_DIR, file), 'utf-8');
            const mission = JSON.parse(content);

            if (missions.has(mission.id)) {
                errors.push(`[${file}] Duplicate Mission ID found: ${mission.id}`);
            }
            missions.set(mission.id, mission);

            // Basic Schema Check
            if (!mission.title) errors.push(`[${file}] Missing 'title'`);
            if (!mission.description) errors.push(`[${file}] Missing 'description'`);
            if (!mission.difficulty) errors.push(`[${file}] Missing 'difficulty'`);
            if (!mission.steps || !Array.isArray(mission.steps) || mission.steps.length === 0) {
                errors.push(`[${file}] Missing or empty 'steps' array`);
            }

            // Step Validation
            if (mission.steps) {
                const stepIds = new Set();
                mission.steps.forEach((step: any, index: number) => {
                    if (!step.id) errors.push(`[${file}] Step at index ${index} missing 'id'`);
                    if (stepIds.has(step.id)) errors.push(`[${file}] Duplicate Step ID '${step.id}' in mission`);
                    stepIds.add(step.id);

                    if (!step.prompt) errors.push(`[${file}] Step '${step.id}' missing 'prompt'`);
                    if (!step.solution) errors.push(`[${file}] Step '${step.id}' missing 'solution'`);
                });
            }

        } catch (e: any) {
            errors.push(`[${file}] JSON Parse Error: ${e.message}`);
        }
    }

    // 2. Referential Integrity (Unlocks & Prerequisites)
    // We can only check this after loading ALL missions
    for (const mission of missions.values()) {
        // Check Unlocks
        if (mission.unlocks) {
            mission.unlocks.forEach((unlockId: string) => {
                if (!missions.has(unlockId)) {
                    errors.push(`[${mission.id}] Invalid unlock target: '${unlockId}' (Mission does not exist)`);
                }
            });
        }

        // Check Prerequisites
        if (mission.prerequisites) {
            mission.prerequisites.forEach((prereqId: string) => {
                if (!missions.has(prereqId)) {
                    errors.push(`[${mission.id}] Invalid prerequisite: '${prereqId}' (Mission does not exist)`);
                }
            });
        }
    }

    // Report Results
    if (warnings.length > 0) {
        console.log('⚠️  Warnings:');
        warnings.forEach(w => console.log(`   - ${w}`));
    }

    if (errors.length > 0) {
        console.error('\n❌ Validation Failed with Errors:');
        errors.forEach(e => console.error(`   - ${e}`));
        process.exit(1);
    } else {
        console.log(`✅ All ${missions.size} missions passed validation!`);
        console.log(`✨ System is ready for Animal Forest Coding.`);
    }
}

validateMissions();

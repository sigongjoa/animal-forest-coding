/**
 * Java Execution API Routes
 *
 * POST /api/java/execute - Execute Java code
 */

import { Router, Request, Response } from 'express';
import { javaExecutionService } from '../services/JavaExecutionService';
import { MISSION_TESTS } from '../data/MissionTestScenarios';

const router = Router();

/**
 * POST /api/java/execute
 *
 * Execute Java code with sandbox
 *
 * Request body:
 * {
 *   code: string,        // Java code to execute
 *   timeout?: number     // Timeout in milliseconds (default: 5000)
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   output: string,
 *   error?: string,
 *   compilationError?: string,
 *   executionTime: number
 * }
 */
router.post('/execute', async (req: Request, res: Response) => {
  try {
    const { code, timeout = 5000 } = req.body;

    // Validate input
    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Java code is required',
      });
    }

    if (code.length > 50000) {
      return res.status(400).json({
        success: false,
        error: 'Code size exceeds maximum limit (50KB)',
      });
    }

    // Execute Java code
    const result = await javaExecutionService.executeCode(code, timeout);

    // Return result
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message || 'Unknown error',
    });
  }
});

router.post('/validate', async (req: Request, res: Response) => {
  try {
    const { missionId, stepId, code } = req.body;
    console.log(`[API] Validate request for ${missionId} Step ${stepId}`);

    if (!missionId || !stepId || !code) {
      console.warn(`[API] Missing validation parameters`);
      return res.status(400).json({
        success: false,
        error: 'MissionID, StepID, and Code are required'
      });
    }

    const scenario = MISSION_TESTS[missionId]?.[stepId];

    if (!scenario) {
      console.warn(`[API] Test scenario not found: ${missionId} / ${stepId}`);
      return res.status(404).json({
        success: false,
        error: `No test scenario found for mission ${missionId} step ${stepId}`
      });
    }

    console.log(`[API] Executing test with wrapper...`);
    const result = await javaExecutionService.executeMissionCode(
      code,
      scenario.mainClass,
      scenario.targetClassName
    );

    console.log(`[API] Execution Result success: ${result.success}`);
    if (!result.success) {
      console.warn(`[API] Execution failed: ${result.error || result.compilationError}`);
    }

    const passed = result.output.includes("TEST_PASSED");
    const outputLines = result.output ? result.output.split('\n') : [];

    // If compilation failed, outputLines might be empty but we have compilationError
    if (result.compilationError) {
      outputLines.push("=== Compilation Error ===");
      outputLines.push(result.compilationError);
    } else if (result.error) {
      outputLines.push("=== Execution Error ===");
      outputLines.push(result.error);
    }

    res.json({
      success: true,
      data: {
        passed: passed,
        message: passed ? "Test Passed! Great job." : "Tests Failed. Check the output.",
        output: outputLines
      }
    });

  } catch (error) {
    console.error(`[API] Server Error in validate:`, error);
    res.status(500).json({
      success: false,
      error: (error as Error).message || 'Unknown validation error',
    });
  }
});

export default router;

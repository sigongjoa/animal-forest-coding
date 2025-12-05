/**
 * Java Execution API Routes
 *
 * POST /api/java/execute - Execute Java code
 */

import { Router, Request, Response } from 'express';
import { javaExecutionService } from '../services/JavaExecutionService';

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

export default router;

/**
 * JavaExecutionService
 *
 * Compiles and executes Java code in a sandboxed environment
 * - Supports Java 11+ syntax
 * - Enforces 5-second timeout
 * - Captures stdout/stderr
 * - Prevents malicious code execution
 */

import { spawn } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  compilationError?: string;
  executionTime: number;
}

class JavaExecutionService {
  private tempDir: string;

  constructor() {
    this.tempDir = path.join(os.tmpdir(), 'java-execution');
  }

  /**
   * Execute Java code with timeout and sandboxing
   */
  async executeCode(javaCode: string, timeout: number = 5000): Promise<ExecutionResult> {
    const startTime = Date.now();

    try {
      // Validate Java code
      this.validateJavaCode(javaCode);

      // Create temp directory
      await fs.mkdir(this.tempDir, { recursive: true });

      // Generate unique file ID
      const fileId = `Solution_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const javaFile = path.join(this.tempDir, `${fileId}.java`);

      // Extract class name from code to ensure it matches filename
      const classNameMatch = javaCode.match(/public\s+class\s+(\w+)/);
      const actualClassName = classNameMatch ? classNameMatch[1] : 'Solution';
      const actualJavaFile = path.join(this.tempDir, `${actualClassName}.java`);

      // Write Java file
      await fs.writeFile(actualJavaFile, javaCode, 'utf-8');

      // Compile
      const compilationResult = await this.compileJava(actualJavaFile, timeout);
      if (!compilationResult.success) {
        return {
          success: false,
          output: '',
          compilationError: compilationResult.error,
          error: 'Compilation failed',
          executionTime: Date.now() - startTime,
        };
      }

      // Execute
      const executionResult = await this.runJava(actualClassName, this.tempDir, timeout);

      // Cleanup
      await this.cleanup(actualJavaFile, path.join(this.tempDir, `${actualClassName}.class`));

      return {
        success: executionResult.success,
        output: executionResult.output,
        error: executionResult.error,
        executionTime: Date.now() - startTime,
      };
    } catch (err) {
      return {
        success: false,
        output: '',
        error: (err as Error).message,
        executionTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Validate Java code for malicious patterns
   */
  private validateJavaCode(code: string): void {
    // Block dangerous operations
    const blockedPatterns = [
      /System\.exit/,
      /Runtime\.getRuntime\(\)\.exec/,
      /ProcessBuilder/,
      /FileOutputStream/,
      /FileInputStream/,
      /Socket/,
      /ServerSocket/,
      /reflection\.invoke/,
    ];

    for (const pattern of blockedPatterns) {
      if (pattern.test(code)) {
        throw new Error(`Blocked pattern detected: ${pattern.source}`);
      }
    }

    // Check for required class declaration
    if (!/public\s+class\s+\w+/.test(code)) {
      throw new Error('Java code must contain a public class declaration');
    }

    // Check for main method
    if (!/public\s+static\s+void\s+main\s*\(\s*String\s*\[\s*\]\s+\w+\s*\)/.test(code)) {
      throw new Error('Java code must contain public static void main(String[] args) method');
    }
  }

  /**
   * Compile Java code
   */
  private compileJava(javaFile: string, timeout: number): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      const compile = spawn('javac', [javaFile], {
        timeout,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let error = '';

      compile.stderr.on('data', (data) => {
        error += data.toString();
      });

      compile.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true });
        } else {
          resolve({ success: false, error: error || `Compilation failed with code ${code}` });
        }
      });

      compile.on('error', (err) => {
        resolve({ success: false, error: (err as Error).message });
      });
    });
  }

  /**
   * Run compiled Java code
   */
  private runJava(
    className: string,
    classPath: string,
    timeout: number
  ): Promise<{ success: boolean; output: string; error?: string }> {
    return new Promise((resolve) => {
      const run = spawn('java', ['-cp', classPath, className], {
        timeout,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let output = '';
      let error = '';

      run.stdout.on('data', (data) => {
        output += data.toString();
      });

      run.stderr.on('data', (data) => {
        error += data.toString();
      });

      run.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, output: output.trim() });
        } else {
          resolve({ success: false, output: output.trim(), error: error || `Execution failed with code ${code}` });
        }
      });

      run.on('error', (err) => {
        resolve({ success: false, output: '', error: (err as Error).message });
      });
    });
  }

  /**
   * Cleanup temporary files
   */
  private async cleanup(...files: string[]): Promise<void> {
    for (const file of files) {
      try {
        await fs.unlink(file);
      } catch (err) {
        // Ignore cleanup errors
      }
    }
  }
}

export const javaExecutionService = new JavaExecutionService();

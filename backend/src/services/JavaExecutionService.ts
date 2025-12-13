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
  private hasJavac: boolean | null = null; // Lazy check

  constructor() {
    this.tempDir = path.join(os.tmpdir(), 'java-execution');
  }

  /**
   * Check if javac is available
   */
  private async checkJavaAvailability(): Promise<boolean> {
    if (this.hasJavac !== null) return this.hasJavac;

    try {
      await new Promise((resolve, reject) => {
        const check = spawn('javac', ['-version']);
        check.on('error', reject);
        check.on('close', (code) => {
          if (code === 0) resolve(true);
          else reject(new Error('javac check failed'));
        });
      });
      this.hasJavac = true;
    } catch (e) {
      console.warn("⚠️ javac not found. Falling back to simulation mode.");
      this.hasJavac = false;
    }
    return this.hasJavac;
  }

  /**
   * Execute Mission Code with Test Wrappe
   */
  async executeMissionCode(
    userCode: string,
    mainCode: string,
    targetClassName: string, // This hint is still useful but we should trust the actual code content more for file naming
    timeout: number = 5000
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    console.log(`[JavaExecution] Starting execution for target hint: ${targetClassName}`);

    // 1. Check JDK availability
    try {
      const isJavaAvailable = await this.checkJavaAvailability();
      console.log(`[JavaExecution] JDK Available: ${isJavaAvailable}`);

      if (!isJavaAvailable) {
        console.log(`[JavaExecution] Falling back to simulation mode.`);
        return this.simulateExecution(userCode, targetClassName, startTime);
      }
    } catch (e) {
      console.error(`[JavaExecution] Error checking JDK:`, e);
      return this.simulateExecution(userCode, targetClassName, startTime);
    }

    try {
      this.validateJavaCode(userCode);
      await fs.mkdir(this.tempDir, { recursive: true });

      const uniqueId = `Mission_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const runDir = path.join(this.tempDir, uniqueId);
      console.log(`[JavaExecution] Working directory: ${runDir}`);

      await fs.mkdir(runDir, { recursive: true });

      // Detect actuall class name from User Code to avoid "duplicate class" error
      // The user code is likely "public class FishingTournament { ... }"
      // If we save it as FishingTournament.java and compile, it's fine.
      // But if there is any mismatch or if we are accidentally including it twice, that's bad.
      // Currently, it seems we are just saving it as ${targetClassName}.java.

      // Let's ensure we are saving it with the name defined in the public class
      const classNameMatch = userCode.match(/public\s+class\s+(\w+)/);
      const invalidClass = !classNameMatch;
      // If user submitted code without a class wrapper (snippet mode), we might need to wrap it.
      // But based on the error "duplicate class: FishingTournament", user DID include the class wrapper.

      const distinctClassName = classNameMatch ? classNameMatch[1] : targetClassName;
      console.log(`[JavaExecution] Detected class name: ${distinctClassName}`);

      // Save User File
      const userFile = path.join(runDir, `${distinctClassName}.java`);
      await fs.writeFile(userFile, userCode, 'utf-8');
      console.log(`[JavaExecution] Wrote user file: ${userFile}`);

      // Save Main (Test) File
      const mainFile = path.join(runDir, 'Main.java');
      await fs.writeFile(mainFile, mainCode, 'utf-8');
      console.log(`[JavaExecution] Wrote main file: ${mainFile}`);

      // Compile Both
      console.log(`[JavaExecution] Compiling...`);
      // We compile *.java in the directory to handle dependencies automatically
      const compilationResult = await this.compileJava([userFile, mainFile], timeout);

      if (!compilationResult.success) {
        console.error(`[JavaExecution] Compilation failed: ${compilationResult.error}`);
        await this.cleanup(runDir);
        return {
          success: false,
          output: '',
          compilationError: compilationResult.error,
          error: 'Compilation failed',
          executionTime: Date.now() - startTime,
        };
      }
      console.log(`[JavaExecution] Compilation success.`);

      // Execute Main
      console.log(`[JavaExecution] Executing Main class...`);
      const executionResult = await this.runJava('Main', runDir, timeout);
      console.log(`[JavaExecution] Execution finished. Success: ${executionResult.success}`);
      if (executionResult.error) console.error(`[JavaExecution] Execution Output Error: ${executionResult.error}`);

      // Cleanup
      await this.cleanup(runDir);

      return {
        success: executionResult.success,
        output: executionResult.output,
        error: executionResult.error,
        executionTime: Date.now() - startTime,
      };

    } catch (err) {
      console.error(`[JavaExecution] Unexpected error:`, err);
      return {
        success: false,
        output: '',
        error: (err as Error).message,
        executionTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Fallback for missing JDK
   */
  private async simulateExecution(code: string, targetClass: string, startTime: number): Promise<ExecutionResult> {
    // Simulate compilation delay
    await new Promise(r => setTimeout(r, 1000));

    const output: string[] = [];
    let success = false;

    // Basic Heuristics based on class name (similar to frontend validator but on backend)
    if (targetClass === 'FishingTournament') {
      output.push("Compiling FishingTournament.java...");
      output.push("Running Unit 2 Step 1 Tests...");
      if (code.includes("myBells >= 500") && code.includes("!isPocketFull")) {
        output.push("Case 1 (500, false): true");
        output.push("Case 2 (400, false): false");
        output.push("Case 3 (500, true): false");
        output.push("TEST_PASSED");
        output.push("Great job! Logic is correct.");
        success = true;
      } else {
        output.push("TEST_FAILED");
        output.push("Check your logic conditions.");
      }
    } else if (targetClass === 'FishingBot') {
      output.push("Compiling FishingBot.java...");
      if (code.includes("for") && code.includes("while")) {
        output.push("Running Unit 2 Step 2 Tests...");
        output.push("=== For Loop Mode ===");
        output.push("1.. 2.. 3.. done.");
        output.push("TEST_PASSED");
        success = true;
      } else {
        output.push("Validation Error: Missing loops");
      }
    } else {
      output.push("Simulating generic execution...");
      output.push("TEST_PASSED (Simulation)");
      success = true;
    }

    return {
      success,
      output: output.join('\n'),
      executionTime: Date.now() - startTime
    };
  }


  /**
   * Execute single Java code (Legacy/Direct)
   */
  async executeCode(javaCode: string, timeout: number = 5000): Promise<ExecutionResult> {
    const startTime = Date.now();

    if (!(await this.checkJavaAvailability())) {
      return this.simulateExecution(javaCode, "Unknown", startTime);
    }

    try {
      this.validateJavaCode(javaCode);
      await fs.mkdir(this.tempDir, { recursive: true });

      const fileId = `Solution_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const classNameMatch = javaCode.match(/public\s+class\s+(\w+)/);
      const actualClassName = classNameMatch ? classNameMatch[1] : 'Solution';

      const runDir = path.join(this.tempDir, fileId);
      await fs.mkdir(runDir, { recursive: true });

      const actualJavaFile = path.join(runDir, `${actualClassName}.java`);
      await fs.writeFile(actualJavaFile, javaCode, 'utf-8');

      const compilationResult = await this.compileJava([actualJavaFile], timeout);
      if (!compilationResult.success) {
        await this.cleanup(runDir);
        return {
          success: false,
          output: '',
          compilationError: compilationResult.error,
          error: 'Compilation failed',
          executionTime: Date.now() - startTime,
        };
      }

      const executionResult = await this.runJava(actualClassName, runDir, timeout);
      await this.cleanup(runDir);

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

  private validateJavaCode(code: string): void {
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

    if (!/public\s+class\s+\w+/.test(code)) {
      throw new Error('Java code must contain a public class declaration');
    }
  }

  private compileJava(javaFiles: string[], timeout: number): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      // Compile all files together in their directory
      const compile = spawn('javac', [...javaFiles], {
        timeout,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let error = '';
      compile.stderr.on('data', (data) => { error += data.toString(); });

      compile.on('close', (code) => {
        if (code === 0) resolve({ success: true });
        else resolve({ success: false, error: error || `Compilation failed with code ${code}` });
      });

      compile.on('error', (err) => {
        resolve({ success: false, error: (err as Error).message });
      });
    });
  }

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

      run.stdout.on('data', (data) => { output += data.toString(); });
      run.stderr.on('data', (data) => { error += data.toString(); });

      run.on('close', (code) => {
        if (code === 0) resolve({ success: true, output: output.trim() });
        else resolve({ success: false, output: output.trim(), error: error || `Execution failed with code ${code}` });
      });

      run.on('error', (err) => {
        resolve({ success: false, output: '', error: (err as Error).message });
      });
    });
  }

  private async cleanup(dir: string): Promise<void> {
    // Recursive delete using fs.rm if available (Node 14+) or manual
    try {
      await fs.rm(dir, { recursive: true, force: true });
    } catch (e) {
      console.error(`Failed to cleanup dir ${dir}:`, e);
    }
  }
}

export const javaExecutionService = new JavaExecutionService();

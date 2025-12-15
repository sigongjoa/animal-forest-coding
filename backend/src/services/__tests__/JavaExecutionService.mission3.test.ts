
import { javaExecutionService } from '../JavaExecutionService';

describe('JavaExecutionService - Mission 3 (The Mystery of the Missing Bells)', () => {
    const targetClass = 'Store';
    const dummyMain = 'public class Main { public static void main(String[] args) {} }';

    describe('Step 1: Scope (Instance Variable)', () => {
        it('should fail if myBells is a local variable', async () => {
            const code = `
        public class Store {
            public void sellFish() {
                int myBells = 4000;
                System.out.println("Earned 4000 bells!");
            }
        }
      `;
            const result = await javaExecutionService.executeMissionCode(code, dummyMain, targetClass);
            expect(result.output).toContain("Error: 'myBells' is still a local variable");
            expect(result.success).toBe(false); // Should be false or at least not TEST_PASSED
            if (result.success) expect(result.output).not.toContain("TEST_PASSED");
        });

        it('should pass if myBells is an instance variable', async () => {
            const code = `
        public class Store {
            private int myBells = 0;
            public void sellFish() {
                this.myBells += 4000;
            }
        }
      `;
            const result = await javaExecutionService.executeMissionCode(code, dummyMain, targetClass);
            expect(result.output).toContain("Instance variable 'myBells' found");
            expect(result.output).toContain("TEST_PASSED");
            expect(result.success).toBe(true);
        });
    });

    describe('Step 2: Shadowing', () => {
        it('should fail if shadowing is present without this keyword', async () => {
            // Step 2 assumes Step 1 is done, so instance var exists
            const code = `
        public class Store {
            private int myBells = 4000;
            public void payLoan(int myBells) {
                myBells = myBells - myBells; // Wrong
            }
            public void sellFish() {}
        }
      `;
            const result = await javaExecutionService.executeMissionCode(code, dummyMain, targetClass);
            expect(result.output).toContain("Error: value not changing");
            // expect(result.success).toBe(false); // Likely failed
        });

        it('should pass if this.myBells is used', async () => {
            const code = `
        public class Store {
            private int myBells = 4000;
            public void payLoan(int myBells) {
                this.myBells -= myBells;
            }
            public void sellFish() {}
        }
      `;
            const result = await javaExecutionService.executeMissionCode(code, dummyMain, targetClass);
            expect(result.output).toContain("Loan payment logic looks correct");
            expect(result.output).toContain("TEST_PASSED");
            expect(result.success).toBe(true);
        });

        it('should pass if parameter is renamed', async () => {
            const code = `
          public class Store {
              private int myBells = 4000;
              public void payLoan(int amount) {
                  myBells -= amount;
              }
              public void sellFish() {}
          }
        `;
            const result = await javaExecutionService.executeMissionCode(code, dummyMain, targetClass);
            expect(result.output).toContain("Loan payment logic looks correct");
            expect(result.output).toContain("TEST_PASSED");
            expect(result.success).toBe(true);
        });
    });

    describe('Step 3: Preconditions', () => {
        it('should fail if validation if-check is missing', async () => {
            const code = `
        public class Store {
            private int myBells = 1000;
            public void buyTool(int cost) {
                this.myBells -= cost;
            }
            public void payLoan(int amount) {}
            public void sellFish() {}
        }
      `;
            const result = await javaExecutionService.executeMissionCode(code, dummyMain, targetClass);
            expect(result.output).toContain("Error: You can buy even with 0 bells");
            // expect(result.success).toBe(false);
        });

        it('should pass if validation if-check is present', async () => {
            const code = `
        public class Store {
            private int myBells = 1000;
            public void buyTool(int cost) {
                if (this.myBells >= cost) {
                    this.myBells -= cost;
                }
            }
            public void payLoan(int amount) {}
            public void sellFish() {}
        }
      `;
            const result = await javaExecutionService.executeMissionCode(code, dummyMain, targetClass);
            expect(result.output).toContain("Precondition check found");
            expect(result.output).toContain("TEST_PASSED");
            expect(result.success).toBe(true);
        });
    });
});

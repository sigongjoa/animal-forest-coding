# 🚨 Critical Architectural Risk Assessment & Mitigation Plan

## 1. Security & Sandboxing (Code Execution Isolation)
**Severity: Critical (P0)**

### 🚫 Problem Definition
Currently, the **Code Execution Engine** (specifically `JavaExecutionService.ts`) executes user-submitted Java code directly on the host server's operating system using Node.js `child_process`.

*   **Vulnerability:** Run-Command-Execution (RCE). The system lacks a robust isolation layer.
*   **Attack Vectors:**
    *   **System Destruction:** `System.exit(0)`, `Runtime.getRuntime().exec("rm -rf /")` reflection attacks.
    *   **Data Exfiltration:** Reading `.env` files or database credentials.
    *   **Resource Exhaustion (DoS):** Infinite loops (`while(true)`), memory bombs (Heap space exhaustion), or Thread bombing.

### 🛡️ Mitigation Strategy

#### A. Containerization & Isolation (Backend Approach)
Code execution **MUST** be moved out of the main application context into strictly isolated environments.

1.  **Docker Containers (Recommended):** Spin up ephemeral containers for each execution request.
    *   Limit CPU/Memory usage via Cgroups.
    *   Disable network access (unless specifically required and whitelisted).
    *   Mount read-only file systems.
2.  **Java Security Manager (Legacy but useful):** Use a custom SecurityManager to block sensitive calls (File I/O, Network, System exit) at the JVM level.
3.  **MicroVMs (Firecracker):** For higher security, use AWS Firecracker to run code in lightweight micro-virtual machines.

---

## 2. Performance & Scalability (Event Loop Blocking)
**Severity: High (P1)**

### 🚫 Problem Definition
Node.js operates on a **Single-Threaded Event Loop**. The current architecture processes code compilation (`javac`) and execution (`java`) synchronously or blindly asynchronously within the main thread context.

*   **Operational Risk:** Heavy computational tasks block the event loop.
*   **Impact:** While one user's code is running, **ALL** other users utilize the server (login, navigation, chat) experience freezing or timeouts. "One heavy user kills the server for everyone."

### 🛡️ Mitigation Strategy (Asynchronous Architecture)

Decouple **Request Reception** from **Task Processing**.

1.  **Message Queue:** Introduce a broker like **Redis Streams** or **Apache Kafka**.
    *   API Server receives code -> Pushes job to Queue -> Returns "Job ID" to client immediately.
2.  **Worker Nodes:** Separate "Execution Servers" (Workers) consume jobs from the Queue.
    *   Workers perform the heavy lifting (Docker compilation, etc.).
    *   Workers update the Database/Cache with results.
3.  **Polling / WebSocket:** The Client polls for the status of "Job ID" or receives a WebSocket notification when the Worker finishes.

---

## 3. State Management & Data Integrity (Anti-Cheat)
**Severity: High (P1)**

### 🚫 Problem Definition
The current "Gamification" elements (Bells, Items, Mission Clearance) rely heavily on client-side state verification or simple API calls that trust the client's assertion.

*   **Vulnerability:** Client-side Trust.
*   **Attack Vectors:**
    *   **Memory Manipulation:** Using Browser DevTools or memory editors to change variable values (e.g., `money = 999999`).
    *   **API Replay:** Replaying a "Mission Complete" API request multiple times to farm rewards.
    *   **Logic Bypass:** Unlocking stages without passing tests by manipulating Redux state.

### 🛡️ Mitigation Strategy (Server-Authoritative)

**"The Client is a Viewer, The Server is the Reality."**

1.  **Server-Side Validation:**
    *   The client sends **Intent** (e.g., "I am submitting code X for Mission Y").
    *   The server executes the code, runs the test cases, and **decides** if it passed.
    *   The server **calculates** the reward and updates the DB.
    *   The server sends back the **Result** (new balance, unlocked status).
2.  **Immutability & Logs:**
    *   Record every transaction (Reward History table).
    *   Implement rate limiting and anomaly detection.

---

## 📅 Roadmap for Remediation

| Phase | Task | Priority | Tech Stack |
| :--- | :--- | :--- | :--- |
| **Phase 4.1** | **Docker Sandbox Impl** | 🚨 **Critical** | Docker API, Node.js Streams |
| **Phase 4.2** | **Server-Authoritative Refactor** | 🔥 **High** | Express.js, PostgreSQL Transaction |
| **Phase 4.3** | **Async Queue Architecture** | ⚡ **Medium** | Redis (BullMQ) |
| **Phase 4.4** | **Advanced Isolation (Firecracker)** | 🧪 **Experimental** | AWS Firecracker |

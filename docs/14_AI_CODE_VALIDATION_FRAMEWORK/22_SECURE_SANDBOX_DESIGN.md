# Secure Sandbox Design for Java Execution

## 1. Overview
Current implementation uses `child_process.spawn` which is vulnerable to host system access.
To achieve "Production Readiness", we must isolate code execution.

## 2. Strategy: Docker-based Ephemeral Containers

### Architecture
1. **Host**: Node.js Backend
2. **Container**: Alpine Linux + OpenJDK 17 + Limited User
3. **Volume**: Read-only mount for libraries, Temp mount for user code.

### Dockerfile (Proposed)
```dockerfile
FROM eclipse-temurin:17-alpine
RUN adduser -D -u 1000 coder
WORKDIR /app
USER coder
CMD ["java", "-version"]
```

### Execution Flow
1. **Receive Code**: Backend receives Java logic.
2. **Write to Temp**: Write `Solution.java` to `/tmp/execution/${id}/`.
3. **Spin Container**:
   ```bash
   docker run --rm \
     --network none \
     --memory 256m \
     --cpus 0.5 \
     -v /tmp/execution/${id}:/app \
     animal-forest-runner \
     javac Solution.java && java Solution
   ```
4. **Capture Output**: STDOUT/STDERR blocked after 5MB.
5. **Cleanup**: Container auto-removes (`--rm`), Host deletes temp dir.

## 3. Fallback Mechanism
If Docker is unavailable (e.g., local dev without Docker Desktop), fallback to:
1. **VM2** (for JavaScript)
2. **chroot** (Linux only)
3. **Current Spawn** (Development mode only, with warning)

## 4. Implementation Plan
- [ ] Create `runner/Dockerfile`
- [ ] Build image in CI/CD
- [ ] Update `JavaExecutionService.ts` to use `DockerExecutionStrategy` class.

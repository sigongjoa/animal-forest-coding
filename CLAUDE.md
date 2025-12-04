# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Animal Forest Coding** is an educational platform teaching coding fundamentals through an Animal Crossing-themed interactive experience. The project features story-driven coding missions with validation, AI-powered feedback, and a game-like progression system.

- **Backend**: Express.js + TypeScript (Node.js)
- **Frontend**: React + TypeScript with Tailwind CSS
- **Testing**: Jest (unit/integration), Playwright (E2E)
- **Port**: Backend on 5000, Frontend on 3000

## Quick Start Commands

### Development

```bash
# Backend
cd backend && npm run dev

# Frontend (separate terminal)
cd frontend && npm start

# Combined (monorepo root - runs both)
npm run dev
```

### Building

```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build

# Both from root
npm run build
```

### Testing

```bash
# Jest (unit + integration tests)
npm test                      # Run all Jest tests
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report
npm test -- tests/unit      # Run specific directory

# Playwright (E2E tests)
npm run e2e                 # Run E2E tests
npm run e2e:headed          # Run with visible browser

# Run single test file
npx jest tests/unit/NookAIService.test.ts
npx playwright test e2e/story-page-validated.spec.ts
```

## Project Structure

### Root Level
- `backend/` - Express server, services, API routes
- `frontend/` - React app, components, pages, services
- `tests/` - Jest test suites organized by type
- `e2e/` - Playwright end-to-end tests
- `docs/` - Technical documentation and strategy guides
- `asset/` - Image and media assets
- `episode/` - Episode-specific content
- `jest.config.ts` - Jest configuration
- `playwright.config.ts` - Playwright configuration

### Backend (`backend/src/`)
- `index.ts` - Server entry point
- `server.ts` - Express app initialization
- `routes/` - API endpoints
  - `api.ts` - Main API routes
  - `feedback.ts` - Feedback routes
- `services/` - Core business logic
  - `NookAIService.ts` - AI feedback generation for coding missions
  - `FeedbackCache.ts` - Caching system for AI feedback responses
  - `AnimalesesTTSService.ts` - Text-to-speech audio generation
  - `ContentService.ts` - Content management
  - `ImageService.ts` - Image handling
- `middleware/` - Express middleware
- `__tests__/` - Backend unit tests

### Frontend (`frontend/src/`)
- `index.tsx` - React entry point
- `App.tsx` - Main app component
- `pages/` - Page components (StoryPage, MainPage, etc.)
- `components/` - Reusable React components
- `services/` - Frontend services
  - `AssetManager.ts` - Asset loading and caching system for images/media
  - `SceneComposer.ts` - Scene/narrative composition and rendering
  - `apiClient.ts` - HTTP client for backend communication
- `hooks/` - Custom React hooks
- `styles/` - Global styles and Tailwind config

### Test Organization
- `tests/unit/` - Unit tests for services and components
- `tests/integration/` - Integration tests between modules
- `tests/product/` - Product-level scenario tests
- `tests/advanced/` - Advanced test scenarios
- `e2e/` - Playwright E2E tests for user workflows

## Key Architecture Patterns

### Service Layer
Backend services handle core business logic:
- **NookAIService**: Generates AI-powered feedback for student code submissions using configurable prompt templates
- **FeedbackCache**: Implements LRU caching to avoid redundant AI API calls
- **AssetManager** (Frontend): Preloads and manages assets with fallback handling
- **SceneComposer** (Frontend): Manages narrative scenes and UI state transitions

### API Contract
Backend API returns standardized responses:
```typescript
{
  success: boolean,
  data?: T,
  error?: string,
  message?: string
}
```

### Testing Strategy
- **Unit tests**: Individual service/component logic
- **Integration tests**: Service interactions and data flow
- **E2E tests**: Full user workflows with Playwright
- **Coverage target**: Aim for >80% coverage on critical paths

## Important Implementation Notes

### Code Validation
The story page (`frontend/public/story.html`) performs **client-side code validation** using regex patterns for educational feedback. This is by design for performance and educational responsiveness - not a security measure.

### Asset Management
- Images are loaded via `AssetManager` service with preloading strategy
- Episode images stored in `frontend/public/episode/{episodeId}/`
- Fallback handling for missing assets

### Feedback System
- AI feedback generated via `NookAIService` using LLM prompts
- Responses cached via `FeedbackCache` to reduce API calls
- Cache key: `{missionId}_{studentCode}_hash`

### E2E Testing Setup
- Tests assume frontend on port 3000, backend on port 5000
- Start servers manually before running tests (Playwright config has webServer disabled)
- Tests run across Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari

## Common Development Tasks

### Adding a New API Endpoint
1. Create route in `backend/src/routes/`
2. Implement service logic in `backend/src/services/`
3. Add TypeScript types for request/response
4. Write tests in `tests/unit/` or `tests/integration/`
5. Test with `npm test`

### Adding a New React Component
1. Create component in `frontend/src/components/`
2. Use TypeScript with prop interfaces
3. Add Tailwind CSS classes
4. Create corresponding test file
5. Test with `npm test` (frontend)

### Adding a Story Mission
1. Add mission data to backend content service
2. Create scene component with validation logic
3. Add images to appropriate episode folder
4. Update AssetManager preload list
5. Write E2E tests in Playwright

### Running Specific Tests
```bash
# Run tests matching pattern
npm test -- --testNamePattern="NookAIService"

# Run single file
npx jest tests/unit/NookAIService.test.ts

# Debug mode
node --inspect-brk node_modules/.bin/jest tests/unit/NookAIService.test.ts
```

## Performance Considerations

- **Asset preloading**: Large images should be preloaded via AssetManager
- **API response caching**: FeedbackCache reduces redundant LLM calls (configurable TTL)
- **Code validation**: Client-side validation preferred for instant feedback
- **Database queries**: Currently uses in-memory storage; consider indexing if scaling

## CI/CD & Deployment

- Tests run on: `npm test` and `npm run e2e`
- Jest + Playwright reporters configured
- Coverage reports in `./coverage/`
- Playwright HTML reports in `./playwright-report/`

## Documentation References

Key docs for understanding architecture and decisions:
- `docs/01_CORE_TECHNICAL_ARCHITECTURE.md` - System design and data flow
- `docs/02_COMPREHENSIVE_TEST_STRATEGY_ROADMAP.md` - Testing approach
- `docs/13_TECHNICAL_ENHANCEMENT_STRATEGY/` - Asset system and AI NPC design
- `START_HERE_SESSION_2.md` - Story page implementation and test results
- `NEXT_IMPLEMENTATION_PLAN.md` - Roadmap for next phases

## Debugging Tips

### Backend Issues
- Enable debug logs: `DEBUG=* npm run dev`
- Check port 5000 availability: `lsof -i :5000`
- Verify TypeScript compilation: `cd backend && npm run build`

### Frontend Issues
- Check browser console for React errors
- Verify asset paths in AssetManager
- Test API connectivity: Check Network tab in DevTools

### Test Failures
- Playwright: Use `--headed` flag to see browser
- Jest: Use `--verbose` for detailed output
- Check test timeouts if async tests fail (jest.config.ts has 30s timeout)

## Notes on Recent Work

The project recently completed Phase 3 with:
- Full story page implementation with image sequences and code validation
- NookAIService for AI-powered feedback
- FeedbackCache system for optimization
- AssetManager for efficient asset loading
- Comprehensive E2E test suite (16 story page tests)
- 360+ total tests with 96.5% pass rate

Next phases focus on expanding missions, enhancing AI feedback, and building additional episodes.

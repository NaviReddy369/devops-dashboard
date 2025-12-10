# GNK Continuum - Architecture Quick Start

## Overview

This document provides a quick reference for implementing the GNK Continuum architecture.

## Core Data Models

### 1. Task (TaskHatch)
- **Collection**: `tasks` or `taskHatchSubmissions`
- **Key Fields**: `title`, `requirements`, `acceptanceCriteria`, `status`, `readinessScore`
- **Status Flow**: `intake` → `analyzing` → `ai-processing` → `assigned` → `completed`

### 2. AIAnalysis
- **Collection**: `aiAnalyses`
- **Key Fields**: `taskId`, `proposedSolutions`, `integrationSteps`, `riskAssessment`
- **Providers**: OpenAI, Anthropic, Custom

### 3. NeuralRequest (Neural Gateway)
- **Collection**: `neuralRequests` or `neuralTasks`
- **Key Fields**: `requesterId`, `assignedAssistantId`, `status`, `messages`
- **Status Flow**: `pending` → `matched` → `accepted` → `in-progress` → `completed`

### 4. TaskAssignment
- **Collection**: `assignments`
- **Key Fields**: `taskId`, `assignedToId`, `workStatus`, `progress`
- **Types**: `ai-only`, `human-only`, `hybrid`

## Implementation Checklist

### Phase 1: Foundation
- [x] Type definitions (`src/types/index.ts`)
- [x] Firestore helpers (`src/api/firestore.ts`)
- [ ] API layer for tasks (`src/api/tasks.ts`)
- [ ] API layer for AI analysis (`src/api/aiAnalysis.ts`)
- [ ] API layer for Neural requests (`src/api/neuralRequests.ts`)

### Phase 2: Services
- [x] AI Service orchestration (`src/services/ai/aiService.ts`)
- [x] Assistant matching (`src/services/matching/matcher.ts`)
- [ ] AI provider implementations (`src/services/ai/providers/`)
- [ ] Task workflow service (`src/services/workflows/taskWorkflow.ts`)

### Phase 3: UI Integration
- [ ] Update TaskHatch to use new API
- [ ] Update Neural Gateway to use matching service
- [ ] Update Task Dashboard with real-time updates
- [ ] Add AI Analysis display components

### Phase 4: AI Integration
- [ ] Implement OpenAI provider
- [ ] Implement Anthropic provider
- [ ] Create prompt templates
- [ ] Add analysis result processing

## Quick Code Examples

### Creating a Task
```typescript
import { createDocument } from '../api/firestore';
import { COLLECTIONS } from '../api/firestore';
import { Task } from '../types';

const task: Omit<Task, 'id'> = {
  userId: currentUser.uid,
  userEmail: currentUser.email,
  userName: currentUser.displayName || 'Anonymous',
  title: 'Automate customer onboarding',
  summary: 'Build automated welcome flow',
  requirements: '...',
  acceptanceCriteria: '...',
  // ... other fields
  status: 'intake',
  readinessScore: 85,
};

const taskId = await createDocument(COLLECTIONS.TASKS, task);
```

### Triggering AI Analysis
```typescript
import { getAIService } from '../services/ai/aiService';
import { getDocument } from '../api/firestore';

const task = await getDocument<Task>(COLLECTIONS.TASKS, taskId);
const aiService = getAIService();
const analysis = await aiService.analyzeTask(task);
```

### Matching Assistant
```typescript
import { getMatcher } from '../services/matching/matcher';
import { getDocuments, queryByStatus } from '../api/firestore';

const request = await getDocument<NeuralRequest>(COLLECTIONS.NEURAL_REQUESTS, requestId);
const assistants = await getDocuments<User>(
  COLLECTIONS.USERS,
  [queryByStatus('available')]
);

const matcher = getMatcher();
const matches = await matcher.findMatches(request, assistants);
const bestMatch = matches[0];
```

## File Structure Summary

```
src/
├── types/              ✅ Complete type definitions
├── api/                ✅ Firestore helpers (partial)
│   ├── firestore.ts    ✅ Generic operations
│   ├── tasks.ts        ⏳ TODO
│   ├── aiAnalysis.ts   ⏳ TODO
│   └── neuralRequests.ts ⏳ TODO
├── services/           ✅ Service layer structure
│   ├── ai/             ✅ AI orchestration
│   ├── matching/       ✅ Assistant matching
│   └── workflows/       ⏳ TODO
└── components/         ⏳ TODO: UI components
```

## Next Steps

1. **Implement API Layer**: Create `src/api/tasks.ts`, `src/api/aiAnalysis.ts`, etc.
2. **Build AI Providers**: Implement OpenAI and Anthropic providers
3. **Create Hooks**: Build React hooks for data fetching (`useTasks`, `useAIAnalysis`)
4. **Update Pages**: Integrate new architecture into existing pages
5. **Add Real-time**: Implement Firestore listeners for live updates

## Key Design Decisions

1. **Type Safety**: All data models are strictly typed with TypeScript
2. **Separation of Concerns**: Clear boundaries between API, services, and UI
3. **Extensibility**: AI providers are pluggable via interface
4. **Real-time**: Firestore listeners for live updates
5. **Scalability**: Service layer supports multiple AI providers and matching algorithms


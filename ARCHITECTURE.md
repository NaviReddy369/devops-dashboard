# GNK Continuum Architecture

## Architecture Overview

### Core Principles
- **Separation of Concerns**: Clear boundaries between UI, business logic, and data layers
- **Type Safety**: Full TypeScript coverage with strict interfaces
- **Scalable AI Integration**: Pluggable AI provider system supporting multiple LLMs/agents
- **Real-time Updates**: Firebase Firestore for live task tracking
- **Modular Design**: Feature-based organization with shared utilities

### Technology Stack
- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage, Functions)
- **AI Integration**: OpenAI, Anthropic, Custom Agents (extensible)
- **State Management**: React Context + Custom Hooks
- **Routing**: React Router v7

### Data Flow
```
User Input → TaskHatch/NeuralGateway → Firestore → AI Service Layer → Analysis → Firestore → Dashboard (Real-time)
```

### Key Modules
1. **TaskHatch**: Task intake with structured metadata
2. **Neural Gateway**: Human-AI assistance routing
3. **AI Service Layer**: Multi-provider AI analysis orchestration
4. **Task Dashboard**: Real-time task tracking and status
5. **Assignment System**: Human expert matching and task routing

---

## Data Models

### User Model
```typescript
interface User {
  uid: string;                    // Firebase Auth UID
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: 'user' | 'assistant' | 'admin';
  isNeuralAssistant: boolean;     // Can receive Neural Gateway requests
  expertise: string[];             // Skills/domains for matching
  availability: 'available' | 'busy' | 'unavailable';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  metadata: {
    company?: string;
    timezone?: string;
    preferredContact?: string;
  };
}
```

### Task Model (TaskHatch)
```typescript
interface Task {
  id: string;                      // Firestore document ID
  userId: string;                  // Creator UID
  userEmail: string;
  userName: string;
  
  // Core Task Data
  title: string;
  summary: string;
  requirements: string;
  acceptanceCriteria: string;
  
  // Classification
  priority: 'low' | 'medium' | 'high' | 'critical';
  urgency: 'immediate' | '24h' | 'this-week' | 'flexible';
  category: string;
  impact: string;
  riskLevel: 'low' | 'moderate' | 'high';
  environment: 'development' | 'staging' | 'production' | 'sandbox';
  
  // Execution Signals
  dueDate: Timestamp | null;
  estimatedHours: number | null;
  dependencies: string;
  communicationChannel: string;
  repoUrl: string;
  tags: string[];
  
  // Security & Compliance
  dataSensitivity: 'public' | 'internal' | 'restricted';
  securityReview: boolean;
  blocked: boolean;
  
  // Status & Tracking
  status: 'intake' | 'analyzing' | 'ai-processing' | 'neural-requested' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  readinessScore: number;          // 0-100 calculated score
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt: Timestamp | null;
}
```

### AIAnalysis Model
```typescript
interface AIAnalysis {
  id: string;
  taskId: string;                  // Reference to Task
  
  // Analysis Results
  summary: string;                 // Executive summary
  proposedSolutions: Solution[];
  integrationSteps: IntegrationStep[];
  riskAssessment: RiskAssessment;
  automationOpportunities: AutomationOpportunity[];
  
  // AI Metadata
  aiProvider: 'openai' | 'anthropic' | 'custom' | 'multi';
  model: string;                    // e.g., 'gpt-4', 'claude-3-opus'
  analysisVersion: number;         // Version for iterative improvements
  confidence: number;              // 0-100 confidence score
  
  // Processing Info
  processingTime: number;          // Milliseconds
  tokensUsed: number;
  cost: number;                     // USD estimate
  
  // Status
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  
  // Timestamps
  createdAt: Timestamp;
  completedAt: Timestamp | null;
}

interface Solution {
  id: string;
  title: string;
  description: string;
  approach: string;                // Technical approach
  pros: string[];
  cons: string[];
  estimatedEffort: 'low' | 'medium' | 'high';
  estimatedHours: number | null;
  recommended: boolean;
  dependencies: string[];
}

interface IntegrationStep {
  id: string;
  order: number;
  title: string;
  description: string;
  tools: string[];                  // Tools/APIs needed
  estimatedTime: string;
  prerequisites: string[];
}

interface RiskAssessment {
  overallRisk: 'low' | 'moderate' | 'high';
  risks: Risk[];
  mitigations: Mitigation[];
}

interface Risk {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  likelihood: 'low' | 'medium' | 'high';
  impact: string;
}

interface Mitigation {
  id: string;
  riskId: string;
  strategy: string;
  steps: string[];
}

interface AutomationOpportunity {
  id: string;
  area: string;                     // e.g., 'data-processing', 'notifications'
  description: string;
  automationType: 'script' | 'workflow' | 'api-integration' | 'ml-model';
  potentialSavings: string;        // Time/cost savings estimate
  complexity: 'low' | 'medium' | 'high';
  tools: string[];
}
```

### NeuralRequest Model (Neural Gateway)
```typescript
interface NeuralRequest {
  id: string;
  taskId: string | null;            // Optional: can be standalone or linked to Task
  requesterId: string;              // User requesting help
  requesterEmail: string;
  requesterName: string;
  
  // Request Details
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  estimatedHours: number | null;
  
  // Assignment
  assignedAssistantId: string | null;
  assignedAssistantName: string | null;
  assignmentMethod: 'auto' | 'manual' | 'user-selected' | null;
  assignmentReason: string | null;  // Why this assistant was chosen
  
  // Status
  status: 'pending' | 'matched' | 'accepted' | 'in-progress' | 'completed' | 'cancelled' | 'rejected';
  rejectionReason: string | null;
  
  // Communication
  messages: NeuralMessage[];
  lastActivityAt: Timestamp;
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt: Timestamp | null;
}

interface NeuralMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'requester' | 'assistant';
  content: string;
  attachments: Attachment[];
  createdAt: Timestamp;
  readAt: Timestamp | null;
}

interface Attachment {
  id: string;
  type: 'file' | 'image' | 'code-snippet' | 'link';
  url: string;
  name: string;
  size?: number;
}
```

### TaskAssignment Model
```typescript
interface TaskAssignment {
  id: string;
  taskId: string;
  neuralRequestId: string | null;  // If assigned via Neural Gateway
  
  // Assignment Details
  assignedToId: string;             // User/Assistant UID
  assignedToName: string;
  assignedToEmail: string;
  assignedBy: string;                // Admin/system UID
  assignmentType: 'ai-only' | 'human-only' | 'hybrid';
  
  // Work Details
  workStatus: 'not-started' | 'in-progress' | 'blocked' | 'review' | 'completed';
  progress: number;                 // 0-100
  notes: string;
  deliverables: Deliverable[];
  
  // Time Tracking
  estimatedHours: number | null;
  actualHours: number | null;
  startedAt: Timestamp | null;
  completedAt: Timestamp | null;
  
  // Status
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## Folder Structure

```
src/
├── api/                          # API layer & Firebase operations
│   ├── tasks.ts                  # Task CRUD operations
│   ├── aiAnalysis.ts             # AI analysis operations
│   ├── neuralRequests.ts        # Neural Gateway operations
│   ├── assignments.ts            # Task assignment operations
│   ├── users.ts                  # User management
│   └── firestore.ts              # Firestore helpers & types
│
├── services/                     # Business logic & AI integration
│   ├── ai/                       # AI service layer
│   │   ├── providers/            # AI provider implementations
│   │   │   ├── openai.ts
│   │   │   ├── anthropic.ts
│   │   │   ├── custom.ts
│   │   │   └── index.ts          # Provider factory
│   │   ├── analyzers/            # Task analysis logic
│   │   │   ├── taskAnalyzer.ts
│   │   │   ├── solutionGenerator.ts
│   │   │   └── riskAssessor.ts
│   │   ├── prompts/              # AI prompt templates
│   │   │   ├── taskAnalysis.ts
│   │   │   ├── solutionGeneration.ts
│   │   │   └── integrationPlanning.ts
│   │   └── aiService.ts          # Main AI orchestration
│   ├── matching/                 # Assistant matching logic
│   │   ├── matcher.ts            # Expertise matching algorithm
│   │   └── scoring.ts            # Match scoring
│   ├── notifications/            # Notification service
│   │   └── notificationService.ts
│   └── workflows/                # Business workflows
│       ├── taskWorkflow.ts       # Task lifecycle management
│       └── neuralWorkflow.ts     # Neural Gateway workflow
│
├── types/                        # TypeScript type definitions
│   ├── task.ts                   # Task-related types
│   ├── ai.ts                     # AI-related types
│   ├── neural.ts                 # Neural Gateway types
│   ├── assignment.ts             # Assignment types
│   ├── user.ts                   # User types
│   └── index.ts                  # Re-export all types
│
├── hooks/                        # Custom React hooks
│   ├── useTasks.ts               # Task data hooks
│   ├── useAIAnalysis.ts          # AI analysis hooks
│   ├── useNeuralRequests.ts      # Neural Gateway hooks
│   ├── useAssignments.ts         # Assignment hooks
│   └── useRealTime.ts            # Real-time Firestore hooks
│
├── contexts/                     # React Context providers
│   ├── AuthContext.tsx           # Already exists
│   ├── TaskContext.tsx           # Task state management
│   └── NeuralContext.tsx         # Neural Gateway state
│
├── components/                   # Reusable UI components
│   ├── common/                   # Shared components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── Badge.tsx
│   ├── task/                     # Task-specific components
│   │   ├── TaskCard.tsx
│   │   ├── TaskForm.tsx
│   │   ├── TaskStatusBadge.tsx
│   │   └── TaskTimeline.tsx
│   ├── ai/                       # AI-related components
│   │   ├── AnalysisCard.tsx
│   │   ├── SolutionCard.tsx
│   │   ├── RiskAssessment.tsx
│   │   └── AutomationOpportunities.tsx
│   ├── neural/                   # Neural Gateway components
│   │   ├── RequestCard.tsx
│   │   ├── MessageThread.tsx
│   │   ├── AssistantSelector.tsx
│   │   └── AssignmentCard.tsx
│   └── dashboard/                # Dashboard components
│       ├── TaskList.tsx
│       ├── FilterBar.tsx
│       ├── StatsCard.tsx
│       └── ActivityFeed.tsx
│
├── pages/                        # Page components (existing)
│   ├── TaskHatch.tsx             # Enhanced with AI integration
│   ├── NeuralTaskGateway.tsx     # Enhanced with matching
│   ├── TaskDashboard.tsx         # Enhanced with real-time updates
│   └── ...
│
├── utils/                        # Utility functions
│   ├── date.ts                   # Date formatting
│   ├── validation.ts             # Form validation
│   ├── scoring.ts                # Readiness score calculation
│   └── constants.ts              # App constants
│
├── config/                       # Configuration
│   ├── firebase.ts               # Already exists (firebase.ts)
│   ├── ai.ts                     # AI provider configs
│   └── routes.ts                 # Route definitions
│
└── App.tsx                       # Main app component
```

---

## Integration Points

### AI Provider Integration
- **OpenAI**: GPT-4, GPT-3.5-turbo for analysis
- **Anthropic**: Claude for detailed reasoning
- **Custom Agents**: Extensible interface for custom AI tools
- **Multi-Provider**: Combine multiple providers for comprehensive analysis

### External API Integration
- **Business Tools**: Slack, Teams, Jira, GitHub (via webhooks)
- **Automation Platforms**: Zapier, Make.com, n8n
- **Cloud Services**: AWS, GCP, Azure (for deployment suggestions)

### Real-time Features
- Firestore listeners for live task updates
- WebSocket support for Neural Gateway messaging
- Push notifications for status changes

---

## API Routes (Firebase Functions)

```
/api/tasks
  POST   /tasks                    # Create task
  GET    /tasks/:id                # Get task
  PUT    /tasks/:id                # Update task
  DELETE /tasks/:id                # Delete task
  POST   /tasks/:id/analyze        # Trigger AI analysis

/api/ai
  POST   /ai/analyze                # Direct AI analysis
  GET    /ai/analysis/:id           # Get analysis results

/api/neural
  POST   /neural/requests           # Create Neural request
  GET    /neural/requests           # List requests
  POST   /neural/requests/:id/assign # Assign assistant
  POST   /neural/requests/:id/messages # Send message

/api/assignments
  POST   /assignments               # Create assignment
  PUT    /assignments/:id           # Update assignment
  GET    /assignments               # List assignments
```

---

## Security & Permissions

### Firestore Security Rules
- Users can only read/write their own tasks
- Neural assistants can read assigned requests
- Admins have full access
- AI analysis results are readable by task owner

### API Security
- Firebase Auth token validation
- Role-based access control (RBAC)
- Rate limiting for AI endpoints
- Input sanitization and validation

---

## Performance Considerations

- **Caching**: Redis for AI analysis results
- **Pagination**: Firestore pagination for large lists
- **Optimistic Updates**: UI updates before server confirmation
- **Lazy Loading**: Code splitting for routes
- **Image Optimization**: Firebase Storage with CDN

---

## Future Enhancements

- **Webhook System**: External integrations for task updates
- **Analytics Dashboard**: Task metrics and AI performance
- **Template System**: Pre-built task templates
- **Collaboration**: Multi-user task collaboration
- **Mobile App**: React Native version


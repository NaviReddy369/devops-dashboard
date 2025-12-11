# Task-Tasker Matching & Connection System Implementation

## Overview
This document outlines the implementation plan for matching tasks (from TaskHatch) with Tasker profiles and enabling connection requests between users.

## System Flow

```
TaskHatch (Submit Tasks) → Public Tasks → Neural Gateway → Match with Taskers → View Profiles → Send Connection Requests
                                ↓
                        TaskerMeta (Create Profile) → Profile Visibility → Skill Matching
```

## Implementation Steps

### Phase 1: Database Schema Updates

#### 1.1 Connection Requests Collection
```typescript
// Collection: connectionRequests
interface ConnectionRequest {
  id: string;
  fromUserId: string;      // User sending the request
  toUserId: string;        // Tasker receiving the request
  taskId?: string;         // Optional: related task
  message?: string;        // Optional message
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  respondedAt?: Timestamp;
}
```

#### 1.2 Task-Tasker Matches Collection (Optional - for caching)
```typescript
// Collection: taskTaskerMatches
interface TaskTaskerMatch {
  id: string;
  taskId: string;
  taskerId: string;        // userId of tasker
  matchScore: number;      // 0-100, calculated match score
  matchReasons: string[];  // Why they matched (skills, category, etc.)
  createdAt: Timestamp;
}
```

### Phase 2: Matching Algorithm

#### 2.1 Matching Logic
Match tasks with taskers based on:
- **Category Match**: Task category matches tasker specialties
- **Skill Match**: Task tags/requirements match tasker skills (primary > secondary)
- **Experience Level**: Match task complexity with tasker experience
- **Availability**: Tasker is available for new work
- **Profile Completion**: Higher completion % = better visibility

#### 2.2 Match Score Calculation
```typescript
function calculateMatchScore(task: Task, tasker: TaskerProfile): number {
  let score = 0;
  
  // Category match (30 points)
  if (task.category && tasker.specialties.includes(task.category)) {
    score += 30;
  }
  
  // Skill matches (40 points)
  const taskTags = task.tags || [];
  const primaryMatches = taskTags.filter(tag => 
    tasker.skills.primary.some(skill => 
      skill.toLowerCase().includes(tag.toLowerCase())
    )
  ).length;
  const secondaryMatches = taskTags.filter(tag => 
    tasker.skills.secondary.some(skill => 
      skill.toLowerCase().includes(tag.toLowerCase())
    )
  ).length;
  score += (primaryMatches * 20) + (secondaryMatches * 10);
  
  // Profile completion bonus (20 points)
  score += (tasker.completionPercentage / 100) * 20;
  
  // Experience level match (10 points)
  // Logic based on task complexity vs tasker experience
  
  return Math.min(100, score);
}
```

### Phase 3: Neural Gateway Updates

#### 3.1 Display Tasks with Matched Taskers
- Show all public tasks from TaskHatch
- For each task, show matched taskers (top 5-10 by match score)
- Display match score and reasons
- Show tasker preview cards

#### 3.2 Tasker Preview Cards
- Display: Name, photo, title, top skills, match score, completion %
- "View Profile" button → navigates to `/tasker/{userId}`
- "Send Connection Request" button

### Phase 4: Connection Request System

#### 4.1 Send Connection Request
- User clicks "Send Connection Request" on a tasker
- Modal/form to optionally add a message
- Creates connection request in Firestore
- Notification to tasker (if notifications enabled)

#### 4.2 Connection Request Management
- Taskers can view pending requests
- Accept/Reject functionality
- Connection status visible on profiles

### Phase 5: UI Components

#### 5.1 New Components Needed
1. `MatchedTaskersList.tsx` - Shows matched taskers for a task
2. `TaskerPreviewCard.tsx` - Compact tasker card with match info
3. `ConnectionRequestModal.tsx` - Form to send connection request
4. `ConnectionRequestsPage.tsx` - Manage incoming/outgoing requests

#### 5.2 Updated Components
1. `NeuralTaskGateway.tsx` - Show tasks with matched taskers
2. `Tasker.tsx` - Show connection request button (if not own profile)

### Phase 6: API Functions

#### 6.1 New API Functions
```typescript
// src/api/taskMatching.ts
export async function getMatchedTaskersForTask(taskId: string): Promise<MatchedTasker[]>
export async function getTasksForTasker(taskerId: string): Promise<MatchedTask[]>

// src/api/connections.ts
export async function sendConnectionRequest(fromUserId: string, toUserId: string, taskId?: string, message?: string)
export async function acceptConnectionRequest(requestId: string)
export async function rejectConnectionRequest(requestId: string)
export async function getConnectionRequests(userId: string, type: 'sent' | 'received')
export async function checkConnectionStatus(userId1: string, userId2: string): Promise<'connected' | 'pending' | 'none'>
```

## Security Rules Updates

### Firestore Rules
```javascript
// connectionRequests
match /connectionRequests/{requestId} {
  allow read: if request.auth != null && (
    resource.data.fromUserId == request.auth.uid ||
    resource.data.toUserId == request.auth.uid
  );
  allow create: if request.auth != null && 
    request.resource.data.fromUserId == request.auth.uid;
  allow update: if request.auth != null && 
    resource.data.toUserId == request.auth.uid &&
    request.resource.data.status in ['accepted', 'rejected'];
}

// taskTaskerMatches
match /taskTaskerMatches/{matchId} {
  allow read: if request.auth != null;
  allow write: if false; // Only Cloud Functions can write
}
```

## Implementation Order

1. ✅ Redesign Home page (DONE)
2. Create database schema and Firestore collections
3. Implement matching algorithm (can be client-side initially, move to Cloud Functions later)
4. Update Neural Gateway to show matched taskers
5. Implement connection request system
6. Add connection request management UI
7. Add notifications (optional, phase 2)

## Files to Create/Modify

### New Files:
- `src/api/taskMatching.ts` - Matching logic
- `src/api/connections.ts` - Connection requests
- `src/components/MatchedTaskersList.tsx`
- `src/components/TaskerPreviewCard.tsx`
- `src/components/ConnectionRequestModal.tsx`
- `src/pages/Connections.tsx` - Manage connections

### Modified Files:
- `src/pages/NeuralTaskGateway.tsx` - Show matched taskers
- `src/pages/Tasker.tsx` - Add connection button
- `firestore.rules` - Add connection rules

## Next Steps

1. Start with matching algorithm implementation
2. Update Neural Gateway UI
3. Add connection request functionality
4. Test end-to-end flow


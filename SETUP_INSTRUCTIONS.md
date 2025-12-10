# GNK Continuum - Setup Instructions

## Environment Variables

Create a `.env` file in the root directory with the following:

```env
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

## Firebase Firestore Collections

The system uses the following collections:

1. **taskHatchSubmissions** - Stores submitted tasks
2. **aiAnalyses** - Stores AI analysis results
3. **neuralTasks** - Stores Neural Gateway requests
4. **users** - User profiles (with role field for agents)

## Firestore Security Rules

**IMPORTANT:** Copy the rules from `firestore.rules` file in the project root, or use these:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // TaskHatch Submissions
    match /taskHatchSubmissions/{taskId} {
      allow create: if request.auth != null;
      allow read, update, delete: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // AI Analyses
    match /aiAnalyses/{analysisId} {
      allow read, create: if request.auth != null;
      allow update, delete: if false;
    }
    
    // Neural Tasks (Neural Gateway requests)
    match /neuralTasks/{taskId} {
      // Allow authenticated users to create requests
      allow create: if request.auth != null && 
        request.resource.data.requesterId == request.auth.uid;
      
      // Allow read for authenticated users
      allow read: if request.auth != null && (
        resource.data.requesterId == request.auth.uid ||
        resource.data.assignedAssistantId == request.auth.uid ||
        !('assignedAssistantId' in resource.data) ||
        resource.data.assignedAssistantId == null
      );
      
      // Allow update for requesters and assigned agents
      allow update: if request.auth != null && (
        request.auth.uid == resource.data.requesterId ||
        request.auth.uid == resource.data.assignedAssistantId
      );
      
      allow delete: if false;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null && request.auth.uid == userId;
      allow delete: if false;
    }
  }
}
```

**To apply:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project → Firestore Database → Rules tab
3. Paste the rules above
4. Click **Publish**

## Setting Up Agent Role

To make a user an agent (able to access Agent Dashboard):

1. Go to Firestore Console
2. Navigate to `users` collection
3. Find the user document
4. Add/update the `role` field to `"assistant"` or `"admin"`
5. Set `isNeuralAssistant: true`

Or programmatically:
```javascript
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

await updateDoc(doc(db, 'users', userId), {
  role: 'assistant',
  isNeuralAssistant: true
});
```

## Features Implemented

### ✅ TaskHatch
- Task submission form
- Saves to Firestore
- Triggers OpenAI analysis automatically
- Displays comprehensive AI analysis results including:
  - Full breakdown
  - Automation opportunities
  - Business model integration
  - AI workflows
  - Step-by-step implementation plan
  - Risk assessment

### ✅ Neural Gateway
- Request submission
- Saves to Firestore
- Status tracking (pending → matched → accepted → in-progress → completed)

### ✅ Agent Dashboard
- View all pending/active requests
- Pick up requests
- Send messages to requesters
- Complete requests
- Real-time updates

## Usage

1. **Submit a Task (TaskHatch)**:
   - User fills out the form
   - Task is saved to Firestore
   - AI analysis is triggered automatically
   - Results are displayed on the same page

2. **Request Human-AI Assistance (Neural Gateway)**:
   - User submits a request
   - Request is saved with status "pending"
   - Agent can pick it up from Agent Dashboard

3. **Agent Workflow**:
   - Agent logs in
   - Goes to `/agent-dashboard`
   - Sees all available requests
   - Picks up a request
   - Communicates with requester via messages
   - Completes the request

## API Requirements

- **OpenAI API Key**: Required for AI analysis
  - Get from: https://platform.openai.com/api-keys
  - Model used: `gpt-4-turbo-preview`
  - Cost: ~$0.01 per 1K tokens

## Next Steps

1. Add OpenAI API key to `.env`
2. Configure Firestore security rules
3. Set up agent users in Firestore
4. Test the flow:
   - Submit a task in TaskHatch
   - Check AI analysis results
   - Submit a Neural Gateway request
   - Test agent dashboard


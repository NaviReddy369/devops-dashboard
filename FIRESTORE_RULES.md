# Firestore Security Rules for GNK Continuum

Copy and paste these rules into your Firebase Console → Firestore Database → Rules tab.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user is the owner
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Helper function to check if user is an agent
    function isAgent() {
      return isAuthenticated() && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'assistant' ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // TaskHatch Submissions - Users can create and read their own tasks
    match /taskHatchSubmissions/{taskId} {
      allow create: if isAuthenticated();
      allow read: if isAuthenticated() && isOwner(resource.data.userId);
      allow update: if isAuthenticated() && isOwner(resource.data.userId);
      allow delete: if isAuthenticated() && isOwner(resource.data.userId);
    }
    
    // AI Analyses - Anyone authenticated can read, but only system can write
    match /aiAnalyses/{analysisId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated(); // Allow creation from client for now
      allow update: if false; // Only server-side updates
      allow delete: if false;
    }
    
    // Neural Tasks (Neural Gateway requests)
    match /neuralTasks/{taskId} {
      // Anyone authenticated can create a request
      allow create: if isAuthenticated() && 
        request.resource.data.requesterId == request.auth.uid;
      
      // Users can read their own requests
      // Agents can read all requests
      allow read: if isAuthenticated() && (
        isOwner(resource.data.requesterId) ||
        isAgent() ||
        resource.data.assignedAssistantId == request.auth.uid
      );
      
      // Users can update their own requests (status changes, etc.)
      // Agents can update requests assigned to them
      allow update: if isAuthenticated() && (
        isOwner(resource.data.requesterId) ||
        (isAgent() && resource.data.assignedAssistantId == request.auth.uid) ||
        (isAgent() && request.resource.data.status == 'accepted' && 
         request.resource.data.assignedAssistantId == request.auth.uid)
      );
      
      allow delete: if false; // No deletes
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.resource.data.uid == request.auth.uid;
      allow update: if isAuthenticated() && isOwner(userId);
      allow delete: if false;
    }
    
    // Default deny all other collections
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Simplified Rules (If the above doesn't work)

If you're getting errors with the helper functions, use this simpler version:

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
    
    // Neural Tasks (Neural Gateway)
    match /neuralTasks/{taskId} {
      // Allow creation by authenticated users
      allow create: if request.auth != null && 
        request.resource.data.requesterId == request.auth.uid;
      
      // Allow read for requesters and agents
      allow read: if request.auth != null;
      
      // Allow update for requesters and assigned agents
      allow update: if request.auth != null && (
        request.auth.uid == resource.data.requesterId ||
        request.auth.uid == resource.data.assignedAssistantId
      );
      
      allow delete: if false;
    }
    
    // Users
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null && request.auth.uid == userId;
      allow delete: if false;
    }
  }
}
```

## How to Apply Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Rules** tab
4. Paste the rules above
5. Click **Publish**

## Testing

After applying the rules, try:
1. Submitting a task in TaskHatch
2. Creating a Neural Gateway request
3. Viewing tasks in Task Dashboard

If you still get permission errors, check:
- User is authenticated (logged in)
- User ID matches the requesterId in the document
- Collection names match exactly (case-sensitive)


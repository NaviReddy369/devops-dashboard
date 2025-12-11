# Firebase Setup Guide for Tasker Profile System

This guide covers all Firebase configuration needed for the Tasker Profile and TaskerMeta functionality.

## 1. Firebase Project Configuration

### Required Services
Your Firebase project needs these services enabled:

1. **Authentication** ✅ (should already be set up)
   - Email/Password authentication
   - Google Sign-In (optional, if you're using it)

2. **Firestore Database** ✅ (should already be set up)
   - Database in production mode (or test mode for development)
   - Security rules configured (see below)

3. **Storage** (optional, for profile photos)
   - Enable Firebase Storage if you want users to upload profile pictures

## 2. Firestore Security Rules

The security rules have been updated in `firestore.rules`. Deploy them using:

```bash
firebase deploy --only firestore:rules
```

### Key Rules for Tasker Profiles:

```javascript
match /taskerProfiles/{profileId} {
  // Anyone authenticated can read profiles (for matching/discovery)
  allow read: if request.auth != null;
  
  // Users can create their own profile
  allow create: if request.auth != null && 
    request.resource.data.userId == request.auth.uid;
  
  // Users can update only their own profile
  allow update: if request.auth != null && 
    resource.data.userId == request.auth.uid &&
    request.resource.data.userId == request.auth.uid;
  
  // Prevent deletion (keep data integrity)
  allow delete: if false;
}
```

## 3. Firestore Collections Structure

### Collection: `taskerProfiles`

**Document ID**: User's `uid` (userId)

**Document Structure**:
```typescript
{
  // Profile Identifiers
  id: string;
  userId: string;
  userEmail: string;
  
  // Status
  status: 'incomplete' | 'pending' | 'approved' | 'active' | 'suspended';
  taskAchieverStatus: 'not-eligible' | 'eligible' | 'pending-approval' | 'approved' | 'active';
  completionPercentage: number; // 0-100
  isTaskAchieverEligible: boolean;
  
  // Personal Information
  personalInfo: {
    firstName: string;
    lastName: string;
    displayName: string;
    profilePhoto?: string; // URL if using Storage
    phone?: string;
    location?: string;
    timezone?: string;
    bio?: string;
  };
  
  // Professional Information
  professionalInfo: {
    title: string;
    experienceLevel: 'entry' | 'junior' | 'mid' | 'senior' | 'expert';
    yearsOfExperience: number;
    currentRole?: string;
    company?: string;
    linkedInUrl?: string;
    portfolioUrl?: string;
    githubUrl?: string;
  };
  
  // Skills & Expertise
  skills: {
    primary: string[];
    secondary: string[];
    certifications: Array<{
      id: string;
      name: string;
      issuer: string;
      issueDate: Timestamp;
      expiryDate?: Timestamp;
      credentialId?: string;
      credentialUrl?: string;
      verified: boolean;
    }>;
    languages: Array<{
      code: string;
      name: string;
      proficiency: 'basic' | 'conversational' | 'professional' | 'native';
    }>;
  };
  
  // Work Preferences
  workPreferences: {
    availability: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'on-demand';
    location: 'remote' | 'on-site' | 'hybrid' | 'flexible';
    preferredHoursPerWeek?: number;
    hourlyRate?: number;
    currency?: string;
    minimumTaskBudget?: number;
    availabilitySchedule?: {
      timezone: string;
      days: {
        monday?: { available: boolean; startTime?: string; endTime?: string; };
        tuesday?: { available: boolean; startTime?: string; endTime?: string; };
        // ... other days
      };
    };
    fastTrackAvailable: boolean;
  };
  
  // Specialties & Services
  specialties: string[];
  services: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    hourlyRate?: number;
    fixedRate?: number;
    estimatedHours?: number;
    isActive: boolean;
  }>;
  
  // Portfolio
  portfolio: {
    projects: Array<{
      id: string;
      title: string;
      description: string;
      category: string;
      technologies: string[];
      duration: string;
      role: string;
      outcome?: string;
      url?: string;
      images?: string[];
      isPublic: boolean;
      completedAt: Timestamp;
    }>;
    achievements: Array<{
      id: string;
      title: string;
      description: string;
      category: string;
      date: Timestamp;
      metrics?: string;
      proofUrl?: string;
    }>;
    testimonials: Array<{
      id: string;
      clientName: string;
      clientRole?: string;
      clientCompany?: string;
      content: string;
      rating: number;
      date: Timestamp;
      projectTitle?: string;
      verified: boolean;
    }>;
  };
  
  // Metrics (updated as tasks are completed)
  metrics: {
    tasksCompleted: number;
    tasksInProgress: number;
    averageRating: number; // 0-5
    totalRatings: number;
    slaReliability: number; // percentage 0-100
    averageTurnaroundHours: number;
    qualityScore: number; // 0-5
    responseTimeHours: number;
  };
  
  // TaskAchiever Eligibility Criteria
  taskAchieverCriteria: {
    minimumTasksCompleted: number;
    minimumRating: number;
    minimumSlaReliability: number;
    minimumCompletionRate: number;
    verifiedSkills: string[];
    certificationsRequired: string[];
    isVerified: boolean;
    verificationDate?: Timestamp;
  };
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastActiveAt: Timestamp;
  profileCompletedAt?: Timestamp;
  taskAchieverApprovedAt?: Timestamp;
}
```

## 4. Firestore Indexes

You may need to create composite indexes if you plan to query profiles by:
- Status + TaskAchiever eligibility
- Skills + Location
- Rating + Availability

**Create indexes in Firebase Console:**
1. Go to Firestore → Indexes
2. Click "Create Index"
3. Add fields as needed for your queries

**Or use `firestore.indexes.json`:**
```json
{
  "indexes": [
    {
      "collectionGroup": "taskerProfiles",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "isTaskAchieverEligible", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "taskerProfiles",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "metrics.averageRating", "order": "DESCENDING" },
        { "fieldPath": "workPreferences.availability", "order": "ASCENDING" }
      ]
    }
  ]
}
```

## 5. Environment Variables

Make sure your `.env` file (or environment) has these Firebase config values:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

## 6. Firebase Storage (Optional - for Profile Photos)

If you want to allow profile photo uploads:

### Storage Rules (`storage.rules`):
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /taskerProfiles/{userId}/profilePhoto/{fileName} {
      // Users can upload their own profile photo
      allow write: if request.auth != null && request.auth.uid == userId;
      
      // Anyone can read profile photos
      allow read: if true;
    }
  }
}
```

Deploy with:
```bash
firebase deploy --only storage
```

## 7. Testing the Setup

### Manual Test Steps:

1. **Create a Profile:**
   - Navigate to `/tasker-meta`
   - Fill out the form
   - Click "Save Draft" or "Complete Profile"
   - Check Firestore Console → `taskerProfiles` collection

2. **View Profile:**
   - Navigate to `/tasker-profile`
   - Should display your saved profile data

3. **Verify Security Rules:**
   - Try updating another user's profile (should fail)
   - Try reading profiles while logged in (should succeed)
   - Try creating profile with wrong userId (should fail)

## 8. Monitoring & Maintenance

### Firestore Quotas to Monitor:
- **Reads**: Profile views, searches
- **Writes**: Profile updates, status changes
- **Storage**: Profile documents size (especially portfolios with images)

### Recommended Indexes:
- Index on `status` for filtering active taskers
- Index on `metrics.tasksCompleted` for sorting by experience
- Index on `skills.primary` (array) for skill-based matching

## 9. Data Migration (if needed)

If you have existing user data to migrate:

```javascript
// Example migration script (run in Firebase Functions or locally)
const admin = require('firebase-admin');
const db = admin.firestore();

async function migrateUserProfiles() {
  const usersSnapshot = await db.collection('users').get();
  
  for (const userDoc of usersSnapshot.docs) {
    const userData = userDoc.data();
    
    // Check if profile already exists
    const profileDoc = await db.collection('taskerProfiles').doc(userDoc.id).get();
    
    if (!profileDoc.exists) {
      // Create basic profile structure
      await db.collection('taskerProfiles').doc(userDoc.id).set({
        userId: userDoc.id,
        userEmail: userData.email,
        status: 'incomplete',
        taskAchieverStatus: 'not-eligible',
        completionPercentage: 0,
        isTaskAchieverEligible: false,
        // ... initialize other fields
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  }
}
```

## 10. Next Steps

After setup:
1. ✅ Deploy Firestore rules: `firebase deploy --only firestore:rules`
2. ✅ Test creating a profile
3. ✅ Test viewing profiles
4. ✅ Set up indexes based on your query patterns
5. ✅ Configure Storage (if using profile photos)
6. ✅ Set up monitoring/alerts for Firestore usage

## Troubleshooting

### Common Issues:

1. **Permission Denied Errors:**
   - Check that security rules are deployed
   - Verify user is authenticated
   - Check that userId matches in the document

2. **Missing Collection:**
   - Collections are created automatically on first write
   - No need to manually create collections in Firestore

3. **Type Errors:**
   - Ensure Firestore Timestamp types are used correctly
   - Check that Date objects are converted to Timestamps

4. **Index Errors:**
   - Firestore will suggest indexes in error messages
   - Create suggested indexes in Firebase Console


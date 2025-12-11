# Firebase Functions Deployment Guide

This guide will help you deploy Firebase Cloud Functions (Python) for the GNK Continuum web app.

## Prerequisites

1. **Firebase CLI installed**: 
   ```bash
   npm install -g firebase-tools
   ```

2. **Python 3.12** installed on your system

3. **Firebase project** already set up and linked

4. **Logged into Firebase**:
   ```bash
   firebase login
   ```

## Step 1: Verify Firebase Project Link

Check if your project is linked:
```bash
firebase projects:list
firebase use gnkcontinuum-d6d58
```

If not linked, link it:
```bash
firebase use --add
# Select: gnkcontinuum-d6d58
# Enter an alias: default (or press enter)
```

## Step 2: Install Python Dependencies

Navigate to the functions directory and install dependencies (if using a virtual environment):
```bash
cd functions
python -m venv venv  # Only if you don't have venv already
venv\Scripts\activate  # On Windows
# or: source venv/bin/activate  # On Mac/Linux

pip install -r requirements.txt
```

## Step 3: Test Functions Locally (Optional)

You can test functions locally before deploying:
```bash
firebase emulators:start --only functions
```

## Step 4: Deploy Functions

From the project root directory, deploy all functions:
```bash
firebase deploy --only functions
```

Or deploy a specific function:
```bash
firebase deploy --only functions:generateDashboardData
firebase deploy --only functions:calculateProfileMetrics
```

## Step 5: Deploy Firestore Triggers

The Firestore triggers will be deployed automatically with the functions. To deploy everything:
```bash
firebase deploy --only functions,firestore
```

## Available Functions

### 1. **generateDashboardData** (Callable)
- **Purpose**: Generate comprehensive dashboard analytics for a tasker profile
- **Authentication**: Required (user must be logged in)
- **Usage**: Called from the frontend to fetch/update dashboard data
- **Returns**: Analytics, performance trends, and TaskAchiever progress

### 2. **calculateProfileMetrics** (Callable)
- **Purpose**: Calculate and update profile completion percentage and eligibility
- **Authentication**: Required
- **Usage**: Called when profile data changes
- **Returns**: Updated completion percentage and eligibility status

### 3. **on_tasker_profile_create** (Firestore Trigger)
- **Purpose**: Automatically initialize dashboard data when a profile is created
- **Trigger**: When a document is created in `taskerProfiles/{profileId}`
- **Action**: Creates initial dashboard data in `taskerDashboardData` collection

### 4. **on_tasker_profile_update** (Firestore Trigger)
- **Purpose**: Update analytics and check eligibility when profile is updated
- **Trigger**: When a document is updated in `taskerProfiles/{profileId}`
- **Action**: Updates dashboard data and TaskAchiever eligibility

## Frontend Integration

The functions are already integrated in the frontend:

### In `src/firebase.ts`:
```typescript
export const generateDashboardData = httpsCallable(functions, 'generateDashboardData');
export const calculateProfileMetrics = httpsCallable(functions, 'calculateProfileMetrics');
```

### Usage Example (from Tasker.tsx):
```typescript
const result = await generateDashboardData({});
const data = result.data as any;
if (data && data.success) {
  setDashboardData(data.data);
}
```

## Troubleshooting

### Error: "Python runtime not found"
- Ensure Python 3.12 is installed
- Check `firebase.json` has `"runtime": "python312"`

### Error: "Module not found"
- Verify `requirements.txt` has all dependencies
- Deploy again: `firebase deploy --only functions`

### Error: "Permission denied"
- Check Firebase Security Rules
- Ensure user is authenticated before calling functions

### Functions not appearing in Firebase Console
- Wait a few minutes after deployment
- Check Firebase Console → Functions
- Verify deployment was successful: `firebase functions:log`

## Monitoring Functions

View function logs:
```bash
firebase functions:log
```

View logs for a specific function:
```bash
firebase functions:log --only generateDashboardData
```

## Cost Optimization

- Functions are configured with `max_instances=10` to limit costs
- Firestore triggers only execute on actual data changes
- Consider adding caching for frequently accessed data

## Next Steps After Deployment

1. ✅ Test functions in the web app
2. ✅ Monitor logs for any errors
3. ✅ Set up alerts for function failures
4. ✅ Review Firebase Console for function metrics

## Security Notes

- All callable functions require authentication
- Firestore Security Rules control data access
- Functions use Firebase Admin SDK (full access) - secure your code


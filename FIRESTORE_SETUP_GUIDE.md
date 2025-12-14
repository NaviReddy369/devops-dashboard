# Firebase Console Setup Guide - Firestore Database

This guide will help you set up and check your Firestore database in Firebase Console for the first time.

## 📋 Table of Contents
1. [Accessing Firebase Console](#1-accessing-firebase-console)
2. [Enabling Firestore Database](#2-enabling-firestore-database)
3. [Viewing Your Data](#3-viewing-your-data)
4. [Checking Profile Documents](#4-checking-profile-documents)
5. [Understanding Your Collections](#5-understanding-your-collections)
6. [Monitoring Updates in Real-Time](#6-monitoring-updates-in-real-time)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Accessing Firebase Console

### Step 1: Go to Firebase Console
1. Open your web browser
2. Go to: **https://console.firebase.google.com/**
3. Sign in with your Google account (the same one you used when setting up Firebase)

### Step 2: Select Your Project
1. You should see a list of your Firebase projects
2. Look for your project (likely named something like `gnkcontinuum-d6d58` based on your logs)
3. Click on your project to open it

---

## 2. Enabling Firestore Database

### If Firestore is NOT enabled yet:

1. **In the left sidebar**, look for **"Firestore Database"** (or "Build" → "Firestore Database")
2. Click on **"Firestore Database"**
3. You'll see a welcome screen with two options:
   - **Start in production mode** (recommended for production)
   - **Start in test mode** (for development - allows all reads/writes for 30 days)

### For Development/Testing:
1. Click **"Start in test mode"**
2. Click **"Next"**
3. **Select a location** for your database:
   - Choose a region close to you (e.g., `us-central1`, `europe-west1`, `asia-southeast1`)
   - **Important**: This should match the region in your `firebase.json` if specified
4. Click **"Enable"**
5. Wait 1-2 minutes for Firestore to initialize

### For Production:
1. Click **"Start in production mode"**
2. You'll need to set up security rules (we'll cover this later)
3. Follow the same location selection steps

---

## 3. Viewing Your Data

Once Firestore is enabled:

1. **In the left sidebar**, click **"Firestore Database"**
2. You'll see the **Firestore Data** view with:
   - A list of **Collections** (like folders) on the left
   - Document details on the right when you select a collection

### Your Main Collections:
Based on your code, you should see these collections:

- `taskerProfiles` - User profile data
- `taskerDashboardData` - Dashboard analytics (created by cloud functions)
- `tasks` - Task data
- `users` - User accounts
- `aiAnalyses` - AI analysis results
- `neuralRequests` - Neural gateway requests
- And more...

---

## 4. Checking Profile Documents

### Step 1: Open the `taskerProfiles` Collection
1. In the left sidebar under **"Firestore Database"**, click on **`taskerProfiles`**
2. You'll see a list of documents (each document represents a user's profile)

### Step 2: Find Your Profile
1. Look for a document with ID matching your **User ID** (from Firebase Authentication)
2. Or look for documents with your email in the `userEmail` field
3. Click on a document to view its details

### Step 3: Check Key Fields
When you click on a profile document, you should see fields like:

#### Important Fields to Check:
- **`userId`** - Should match your Firebase Auth user ID
- **`userEmail`** - Your email address
- **`completionPercentage`** - Should be a number (0-100)
- **`status`** - Should be "incomplete", "pending", or "active"
- **`personalInfo`** - Your personal information (name, location, etc.)
- **`professionalInfo`** - Your professional details
- **`skills`** - Your skills array
- **`workPreferences`** - Your work preferences
- **`specialties`** - Your specialties array
- **`portfolio`** - Your portfolio projects and achievements
- **`updatedAt`** - Timestamp showing when it was last updated
- **`createdAt`** - Timestamp showing when it was created

### Step 4: Verify Data is Being Saved
1. **Fill out your profile** in the app (TaskerMeta page)
2. **Wait a few seconds** (auto-save happens after 1.5 seconds)
3. **Refresh the Firestore console** (F5 or click refresh)
4. **Click on your profile document** again
5. **Check the `updatedAt` field** - it should show a recent timestamp
6. **Check the `completionPercentage`** - it should increase as you fill more fields

---

## 5. Understanding Your Collections

### `taskerProfiles` Collection
- **Purpose**: Stores user profile information
- **Document ID**: Usually the user's Firebase Auth UID
- **Key Fields**:
  - `completionPercentage` - Profile completion (0-100)
  - `status` - Profile status
  - `isTaskAchieverEligible` - Boolean for eligibility
  - All profile form data

### `taskerDashboardData` Collection
- **Purpose**: Stores dashboard analytics (created by cloud functions)
- **Document ID**: Matches the profile ID
- **Key Fields**:
  - `analytics` - Skills distribution, experience breakdown
  - `performanceTrends` - Historical performance data
  - `taskAchieverProgress` - Progress toward TaskAchiever status
  - `completionHistory` - History of completion percentage changes

### Other Collections
- `tasks` - Task listings and details
- `users` - User account information
- `aiAnalyses` - AI analysis results
- `neuralRequests` - Neural gateway requests

---

## 6. Monitoring Updates in Real-Time

### Method 1: Manual Refresh
- Click the **refresh button** (circular arrow icon) in Firestore console
- Or press **F5** to refresh the page

### Method 2: Watch for Changes
1. Keep the Firestore console open in one browser tab
2. Make changes in your app in another tab
3. Refresh the Firestore console to see updates

### Method 3: Check Timestamps
- Look at the `updatedAt` field in your profile document
- It should update every time you save data

---

## 7. Troubleshooting

### Problem: "Permission denied" error
**Solution**: 
1. Go to **Firestore Database** → **Rules** tab
2. Check your security rules
3. For development, you can temporarily use test mode rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```
4. Click **"Publish"** to save rules

### Problem: Can't see any collections
**Solution**:
1. Make sure Firestore is enabled (see Step 2)
2. Try creating a profile in your app first
3. Wait a few seconds and refresh

### Problem: Data not updating
**Solution**:
1. Check browser console for errors
2. Verify you're logged in to the app
3. Check Firestore rules allow writes
4. Verify your Firebase project ID matches in `.env` file

### Problem: Can't find your profile
**Solution**:
1. Check the document ID - it should be your Firebase Auth UID
2. Look in the `userEmail` field to find your profile
3. Make sure you're looking in the `taskerProfiles` collection

---

## 8. Quick Verification Checklist

After setting up, verify:

- [ ] Firestore Database is enabled
- [ ] You can see the `taskerProfiles` collection
- [ ] Your profile document exists (or will be created when you fill the form)
- [ ] `completionPercentage` field exists and updates
- [ ] `updatedAt` timestamp changes when you save
- [ ] All form data fields are present (personalInfo, professionalInfo, etc.)
- [ ] No permission errors in browser console

---

## 9. Security Rules (Important for Production)

### Current Development Rules (Test Mode)
- Allows all reads/writes for 30 days
- Only works for authenticated users

### Production Rules
You should set up proper security rules. Check your `firestore.rules` file in your project.

To update rules:
1. Go to **Firestore Database** → **Rules** tab
2. Edit the rules
3. Click **"Publish"**

---

## 10. Additional Resources

- **Firebase Documentation**: https://firebase.google.com/docs/firestore
- **Firestore Console**: https://console.firebase.google.com/
- **Your Project**: Check your `.firebaserc` file for project ID

---

## Quick Start Commands

If you need to check your Firebase project from terminal:

```bash
# Check your Firebase project
firebase projects:list

# Check Firestore data (if you have gcloud CLI)
gcloud firestore databases list --project=YOUR_PROJECT_ID

# View Firestore rules
firebase firestore:rules
```

---

## Need Help?

If you encounter issues:
1. Check browser console for errors
2. Check Firebase Console → Functions → Logs for cloud function errors
3. Verify your `.env` file has correct Firebase config
4. Make sure you're logged in to the app

---

**Last Updated**: Based on your current project setup
**Project**: GNK Continuum - DevOps Dashboard

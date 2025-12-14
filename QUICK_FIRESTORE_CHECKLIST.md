# Quick Firestore Setup Checklist ✅

Follow these steps in order to set up and verify your Firestore database.

## 🚀 Initial Setup (Do This First)

### Step 1: Access Firebase Console
- [ ] Go to https://console.firebase.google.com/
- [ ] Sign in with your Google account
- [ ] Select your project (looks like `gnkcontinuum-d6d58`)

### Step 2: Enable Firestore
- [ ] Click **"Firestore Database"** in left sidebar
- [ ] Click **"Create database"** (if not already created)
- [ ] Choose **"Start in test mode"** (for development)
- [ ] Select location: **`us-central1`** (or your preferred region)
- [ ] Click **"Enable"**
- [ ] Wait 1-2 minutes for setup

---

## ✅ Verification Steps (After Setup)

### Step 3: Check Collections Exist
- [ ] Open **Firestore Database** → **Data** tab
- [ ] Look for `taskerProfiles` collection in the left sidebar
- [ ] If empty, that's OK - it will be created when you save a profile

### Step 4: Test Profile Creation
1. **In your app:**
   - [ ] Log in to your app
   - [ ] Go to TaskerMeta page (`/taskermeta`)
   - [ ] Fill out at least:
     - First Name
     - Last Name  
     - Display Name
     - Professional Title
     - Years of Experience
     - At least 1 Primary Skill
     - Availability
     - Location Preference
     - At least 1 Specialty

2. **Wait 2-3 seconds** (auto-save happens after 1.5 seconds)

3. **In Firebase Console:**
   - [ ] Refresh Firestore Database page (F5)
   - [ ] Click on `taskerProfiles` collection
   - [ ] You should see a document (ID = your user ID)
   - [ ] Click on the document to view details

### Step 5: Verify Data Fields
Check that these fields exist in your profile document:
- [ ] `userId` - Your Firebase Auth user ID
- [ ] `userEmail` - Your email address
- [ ] `completionPercentage` - A number (should be > 0 if you filled fields)
- [ ] `personalInfo` - Object with firstName, lastName, displayName
- [ ] `professionalInfo` - Object with title, yearsOfExperience
- [ ] `skills` - Object with primary array
- [ ] `workPreferences` - Object with availability, location
- [ ] `specialties` - Array with your specialties
- [ ] `updatedAt` - Recent timestamp
- [ ] `createdAt` - Timestamp

### Step 6: Test Data Persistence
1. **In your app:**
   - [ ] Fill out more profile fields
   - [ ] Wait for auto-save (2-3 seconds)

2. **In Firebase Console:**
   - [ ] Refresh the page
   - [ ] Click on your profile document
   - [ ] Check `updatedAt` - should show a new timestamp
   - [ ] Check `completionPercentage` - should have increased
   - [ ] Verify new fields you added are present

### Step 7: Test Logout/Login
1. **In your app:**
   - [ ] Log out
   - [ ] Log back in
   - [ ] Go to TaskerMeta page

2. **Verify:**
   - [ ] Your previously filled data is still there
   - [ ] No data was lost

3. **In Firebase Console:**
   - [ ] Check your profile document still exists
   - [ ] All data is still present

---

## 🔍 What to Look For

### ✅ Good Signs:
- Profile document exists in `taskerProfiles` collection
- `completionPercentage` increases as you fill fields
- `updatedAt` timestamp updates when you save
- Data persists after logout/login
- No errors in browser console

### ⚠️ Warning Signs:
- "Permission denied" errors → Check Firestore rules
- No document created → Check browser console for errors
- Data not updating → Check if you're logged in
- Completion percentage not changing → Check cloud functions are deployed

---

## 🐛 Quick Troubleshooting

### If you see "Permission denied":
1. Go to **Firestore Database** → **Rules** tab
2. Make sure rules allow authenticated users to read/write
3. Click **"Publish"**

### If no document is created:
1. Open browser console (F12)
2. Look for errors
3. Check if you're logged in
4. Verify Firebase config in `.env` file

### If data disappears:
1. Check Firestore console - is the document still there?
2. Check browser console for errors
3. Verify you're using the same user account

---

## 📊 Expected Results

After completing the checklist, you should have:

1. ✅ Firestore Database enabled
2. ✅ `taskerProfiles` collection visible
3. ✅ Your profile document created
4. ✅ `completionPercentage` field updating (0-100)
5. ✅ All form data saving correctly
6. ✅ Data persisting after logout/login
7. ✅ `taskerDashboardData` collection (created by cloud functions)

---

## 🎯 Next Steps

Once everything is working:

1. **Monitor Updates**: Keep Firestore console open while using the app
2. **Check Cloud Functions**: Go to **Functions** tab to see function logs
3. **Review Security Rules**: Update rules for production (see `FIRESTORE_RULES.md`)
4. **Set Up Indexes**: If you get index errors, create them in **Indexes** tab

---

## 📝 Notes

- **Document ID**: Your profile document ID should match your Firebase Auth user ID
- **Auto-save**: Happens 1.5 seconds after you stop typing
- **Cloud Functions**: Will create `taskerDashboardData` automatically
- **Timestamps**: All dates are stored as Firestore Timestamps

---

**Need Help?** Check `FIRESTORE_SETUP_GUIDE.md` for detailed instructions.

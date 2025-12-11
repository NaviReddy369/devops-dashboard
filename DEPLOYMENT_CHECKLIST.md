# Deployment Checklist for Tasker Profile System

## ✅ Immediate Actions Required

### 1. Fix Compilation Error (DONE)
- ✅ Fixed naming conflict: `TaskerProfile` type vs component
- ✅ Renamed type import to `TaskerProfileType`

### 2. Deploy Firestore Security Rules

```bash
# Make sure you're in the project root
firebase deploy --only firestore:rules
```

**What this does:**
- Allows authenticated users to read any tasker profile (for matching/discovery)
- Allows users to create/update only their own profile
- Prevents profile deletion (data integrity)

### 3. Verify Firebase Configuration

Check that your `src/firebase.ts` has correct Firebase config:
- ✅ API Key
- ✅ Auth Domain
- ✅ Project ID
- ✅ Storage Bucket
- ✅ App ID

## 📋 Firestore Setup

### Collections Needed:
1. **`taskerProfiles`** - Will be created automatically on first profile save
   - Document ID = User's UID (userId)
   - No need to manually create - auto-created on first write

### Data Structure:
- See `FIREBASE_SETUP_GUIDE.md` for complete structure
- All fields are optional except core identifiers
- Timestamps are auto-managed by the API

## 🔍 Testing Steps

### Test 1: Create Profile
1. Start your dev server: `npm start`
2. Login to your app
3. Navigate to `/tasker-meta`
4. Fill out Step 1 (Personal Info)
5. Click "Save Draft"
6. Check Firebase Console → Firestore → `taskerProfiles` collection
7. Should see a document with your userId

### Test 2: View Profile
1. Navigate to `/tasker-profile`
2. Should display your saved profile data
3. If no profile exists, should show "Profile Not Started" message

### Test 3: Complete Profile
1. Go through all 6 steps in `/tasker-meta`
2. Click "Complete Profile" on final step
3. Check that `status` changes to `pending`
4. Check that `completionPercentage` is calculated

### Test 4: TaskAchiever Eligibility
1. After completing profile, check `/tasker-profile`
2. Should see TaskAchiever eligibility section
3. Should show what criteria are missing (if not eligible)

## 🔧 Firebase Console Setup

### Firestore Database:
1. Go to Firebase Console → Firestore Database
2. Make sure database is created (production mode recommended)
3. Security rules should be deployed (see step 2 above)

### Indexes (Optional - Add as needed):
When you query profiles by multiple fields, Firestore will suggest indexes.
1. Go to Firestore → Indexes
2. Click on error messages to create suggested indexes
3. Or create manually:
   - Collection: `taskerProfiles`
   - Fields: Add based on your query needs

### Storage (Optional - for profile photos):
If you want to enable profile photo uploads:
1. Go to Firebase Console → Storage
2. Enable Storage if not already enabled
3. Update `storage.rules` (see FIREBASE_SETUP_GUIDE.md)
4. Deploy: `firebase deploy --only storage`

## ⚠️ Common Issues & Solutions

### Issue: "Permission denied" when saving profile
**Solution:**
- Deploy Firestore rules: `firebase deploy --only firestore:rules`
- Check that user is authenticated
- Verify userId matches in the document

### Issue: Collection not found
**Solution:**
- Collections are auto-created on first write
- No manual creation needed
- Check Firestore Console after first save

### Issue: Type errors in console
**Solution:**
- Make sure Timestamp fields use Firestore Timestamp type
- Check that all required fields are provided
- Review type definitions in `src/types/index.ts`

### Issue: Profile not loading
**Solution:**
- Check browser console for errors
- Verify user is logged in
- Check Firestore rules allow read access
- Verify document exists in Firestore Console

## 📊 Monitoring

### What to Monitor:
1. **Firestore Reads:** Profile views, searches
2. **Firestore Writes:** Profile updates, completions
3. **Storage Usage:** If using profile photos
4. **Error Rates:** Check Firebase Console → Functions → Logs

### Recommended Alerts:
- High write rate (potential abuse)
- Permission denied errors (rules issue)
- Storage quota approaching limit

## 🚀 Production Deployment

Before going to production:

1. ✅ Deploy Firestore rules
2. ✅ Test profile creation flow
3. ✅ Test profile viewing flow
4. ✅ Verify TaskAchiever eligibility logic
5. ✅ Set up indexes based on query patterns
6. ✅ Configure Storage rules (if using photos)
7. ✅ Set up monitoring/alerts
8. ✅ Review security rules for your use case

## 📝 Next Steps After Setup

1. **Profile Completion:**
   - Users complete profiles via `/tasker-meta`
   - Data saved to `taskerProfiles` collection
   - Completion percentage calculated automatically

2. **TaskAchiever Eligibility:**
   - System checks eligibility on each save
   - Criteria displayed in `/tasker-profile`
   - Users can see what's needed to become eligible

3. **Task Matching (Future):**
   - Use `taskerProfiles` collection to match tasks with taskers
   - Query by skills, availability, location
   - Filter by status and eligibility

4. **Metrics Updates (Future):**
   - When tasks are completed, update `metrics` field
   - Recalculate TaskAchiever eligibility
   - Update quality scores and ratings


# Firebase Cloud Functions Deployment Guide

## Quick Start

This guide explains how to deploy the Cloud Functions that send notifications to Android users when community updates are created.

---

## Prerequisites

1. **Firebase Project** - Already set up
2. **Node.js** - Version 18+ (Install from nodejs.org)
3. **Firebase CLI** - Install globally:
   ```bash
   npm install -g firebase-tools
   ```

---

## Setup Steps

### 1. Install Dependencies

```bash
cd functions
npm install
```

This installs:
- `firebase-functions` - Firebase Cloud Functions SDK
- `firebase-admin` - Firebase Admin SDK for server-side operations

### 2. Get Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your Samparka project
3. Click Settings ⚙️ → Project Settings
4. Go to "Service Accounts" tab
5. Click "Generate New Private Key"
6. Save the JSON file as `firebase-key.json` in your project root

⚠️ **Important**: Add to `.gitignore`:
```
firebase-key.json
node_modules/
.env
```

### 3. Test Locally (Optional)

```bash
cd functions
firebase emulators:start --only functions
```

This starts a local emulator for testing.

### 4. Deploy to Firebase

```bash
firebase deploy --only functions
```

You should see output like:
```
✔ functions[notifyNewCommunityUpdate]: Successful create operation.
✔ functions[sendTestNotification]: Successful create operation.
✔ functions[updateUserDeviceToken]: Successful create operation.
✔ functions[removeUserDeviceToken]: Successful create operation.

Deploy complete!
```

---

## Cloud Functions Explained

### 1. `notifyNewCommunityUpdate` (Trigger: Firestore Write)

**When it triggers:**
- Automatically when a new document is created in `communityUpdates` collection

**What it does:**
1. Gets the new community update details
2. Queries Firestore for all users with device tokens
3. Sends push notification to all Android devices
4. Logs success/failure counts

**Required Firestore Structure:**
```
users/
  ├── userId1/
  │   ├── deviceTokens: ["token1", "token2", ...]
  │   └── email: "user@example.com"
  ├── userId2/
  │   ├── deviceTokens: ["token3", ...]
  │   └── email: "user2@example.com"
```

### 2. `sendTestNotification` (Trigger: HTTP Request)

**Purpose:** Manually create a test community update and send notifications

**How to use:**
```bash
curl -X POST https://YOUR_FUNCTION_URL/sendTestNotification \
  -H "Content-Type: application/json" \
  -d '{
    "eventName": "Test Event",
    "date": "2025-01-20",
    "time": "09:00 AM",
    "description": "This is a test community event"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Community update created and notifications sent",
  "docId": "abc123xyz"
}
```

### 3. `updateUserDeviceToken` (Trigger: HTTP Request)

**Purpose:** Register/update device token when user logs in from Android app

**How Android app uses it:**
```kotlin
// Android code
FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
    val token = task.result
    val userId = auth.currentUser?.uid
    
    // Call this endpoint
    sendTokenToBackend(userId, token)
}
```

**Request body:**
```json
{
  "userId": "user123",
  "deviceToken": "eVt6...long_token_string...",
  "platform": "android"
}
```

### 4. `removeUserDeviceToken` (Trigger: HTTP Request)

**Purpose:** Remove device token when user logs out

**Request body:**
```json
{
  "userId": "user123",
  "deviceToken": "eVt6...long_token_string..."
}
```

---

## Scenario: Complete Flow

### Scenario: Admin creates "Health Camp 2025" event

**Step 1: Web App**
```javascript
// Admin adds community update in React dashboard
const event = {
  eventName: "Health Camp 2025",
  date: "2025-02-05",
  time: "10:00 AM",
  description: "Free health checkup for all community members..."
};

await db.collection("communityUpdates").add(event);
```

**Step 2: Cloud Function Triggers**
```javascript
// notifyNewCommunityUpdate function automatically runs
- Detects new document in communityUpdates
- Reads event: "Health Camp 2025"
- Queries Firestore for all users
- Gets device tokens: ["token1", "token2", "token3"]
- Sends FCM message to all tokens
```

**Step 3: Firebase Cloud Messaging**
```
FCM Server processes the request and sends to all devices:
- Device 1 (Rahul's phone): Receives notification
- Device 2 (Priya's phone): Receives notification  
- Device 3 (Amit's phone): Receives notification
```

**Step 4: Android App Receives**
```kotlin
// CommunityUpdateMessagingService.onMessageReceived() is called
- Extracts event details
- Saves to local Room database
- Shows system notification with:
  Title: "📢 Health Camp 2025"
  Body: "2025-02-05 • 10:00 AM"
  Description: "Free health checkup for all..."
```

**Step 5: User Sees Notification**
```
┌─────────────────────────────────┐
│ 📢 Health Camp 2025             │
│ 2025-02-05 • 10:00 AM           │
│ Free health checkup for all...  │
└─────────────────────────────────┘
```

**Step 6: User Taps Notification**
- App opens to Community Updates page
- Shows full event details
- Allows user to register/respond

---

## Monitoring & Logs

### View Function Logs

```bash
firebase functions:log
```

Or in Firebase Console:
1. Go to Functions
2. Click on function name
3. View "Logs" tab

### Monitor Function Usage

In Firebase Console:
1. Go to Functions
2. See invocation counts
3. Check for any errors

---

## Firestore Rules for Security

Add these security rules to allow notifications to work:

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection - allows read/write of own device tokens
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
    }
    
    // Community updates - readable by all authenticated users
    match /communityUpdates/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.admin == true; // Only admins can create
    }
  }
}
```

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

---

## Troubleshooting

### Issue: "Function failed on loading user code"

**Solution:**
```bash
# Check for syntax errors
cd functions
npm install
# Redeploy
firebase deploy --only functions
```

### Issue: "Cloud Functions deployment failed"

**Solution:**
1. Check Firebase CLI is updated: `firebase --version`
2. Update: `npm install -g firebase-tools@latest`
3. Login again: `firebase login`

### Issue: "Notifications not sending"

**Checklist:**
- ✅ Cloud Function is deployed
- ✅ `users/{userId}/deviceTokens` array exists in Firestore
- ✅ Device tokens are non-empty strings
- ✅ Firebase project has billing enabled (required for Cloud Functions)

### Issue: "PERMISSION_DENIED" errors

**Solution:**
1. Go to Firebase Console → Functions
2. Click on function
3. Go to "Runtime service account"
4. Add "Cloud Messaging" permission

---

## Sample Event Creation Script

After deploying functions, add test events:

```bash
# Make sure firebase-key.json is in project root
node addSampleEvents.js
```

This adds 5 sample community events to Firestore, which will:
1. Trigger the notification function
2. Send notifications to all registered Android devices
3. Show in Android app's notification tray

---

## Cost Considerations

Firebase Cloud Functions pricing:
- **Free tier**: 2 million invocations/month
- **After free tier**: $0.40 per million invocations

For a community app:
- 1 event per day = 30 invocations/month
- With 100 users per event = 3,000 notifications/month
- **Cost**: Free (well within free tier)

---

## Next Steps

1. ✅ Deploy Cloud Functions
2. ✅ Create Firestore `users` collection
3. ✅ Integrate Android app with FCM
4. ✅ Test notification flow
5. Optional: Add email notifications
6. Optional: Add webhook integrations

---

## Need Help?

- Check Firebase Documentation: https://firebase.google.com/docs/functions
- View function logs: `firebase functions:log`
- Test manually in Firebase Console under "Testing" tab

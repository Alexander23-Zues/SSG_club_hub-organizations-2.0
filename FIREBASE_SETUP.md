# Firebase Setup Guide

## 1. Create a Firebase Project
1. Go to https://console.firebase.google.com/
2. Click "Add project" → name it (e.g. `ssg-club-hub`)
3. Enable Google Analytics (optional)

## 2. Enable Authentication
1. In Firebase Console → Authentication → Get Started
2. Enable **Email/Password** provider

## 3. Create Firestore Database
1. Firestore Database → Create database
2. Start in **test mode** (you'll apply security rules later)
3. Choose a region close to you

## 4. Enable Storage
1. Storage → Get Started → Start in test mode

## 5. Get Your Config
1. Project Settings (gear icon) → Your apps → Web app (</>)
2. Register app → copy the `firebaseConfig` object

## 6. Update the Config File
Edit `src/firebase/config.js` and replace the placeholder values:

```js
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

## 7. Apply Firestore Security Rules
1. Firestore → Rules tab
2. Copy the contents of `src/firebase/firestore.rules`
3. Paste and publish

## 8. Run the App
```bash
npm run dev
```

## Firestore Collections (auto-created on first use)
- `users` — user profiles with roles
- `organizations` — org data
- `members` — membership records
- `events` — event data
- `announcements` — announcements
- `rsvps` — event RSVPs
- `activityLogs` — audit trail

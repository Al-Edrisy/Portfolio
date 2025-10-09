# Environment Variables Setup Guide

This document lists ALL environment variables needed for your portfolio project.

## 📋 Complete Environment Variables List

Create a `.env.local` file in your project root with these variables:

```env
# ============================================
# Firebase Client-Side Configuration (Public)
# ============================================
# These are exposed to the browser and used for client-side Firebase operations
# Get these from: Firebase Console → Project Settings → General → Your apps

NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# ============================================
# Firebase Admin SDK (Server-Side - Secret!)
# ============================================
# These are used for server-side operations and MUST be kept secret
# Get these from: Firebase Console → Project Settings → Service Accounts → Generate New Private Key

FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
YOUR_PRIVATE_KEY_HERE
-----END PRIVATE KEY-----"

# ============================================
# Development Settings (Optional)
# ============================================
NODE_ENV=development
```

## 🚀 How to Get Your Firebase Credentials

### 1. Client-Side Configuration (NEXT_PUBLIC_*)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click the ⚙️ (Settings) icon → **Project Settings**
4. Scroll to **"Your apps"** section
5. If no web app exists:
   - Click **"Add app"** 
   - Choose Web (</>) icon
   - Register your app
6. Copy the config values:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",              // → NEXT_PUBLIC_FIREBASE_API_KEY
     authDomain: "xxx.firebaseapp.com", // → NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
     projectId: "xxx",                  // → NEXT_PUBLIC_FIREBASE_PROJECT_ID
     storageBucket: "xxx.appspot.com",  // → NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
     messagingSenderId: "123...",       // → NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
     appId: "1:123...:web:abc..."       // → NEXT_PUBLIC_FIREBASE_APP_ID
   };
   ```

### 2. Admin SDK Configuration (FIREBASE_*)

1. Go to Firebase Console → Project Settings
2. Click **"Service Accounts"** tab
3. Click **"Generate New Private Key"** button
4. Download the JSON file
5. Extract these values from the JSON:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY`

**⚠️ Important for FIREBASE_PRIVATE_KEY:**
- Keep the quotes around the entire key
- Keep the `\n` newline characters (don't replace them)
- Format: `"-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----"`

## ✅ After Setup

1. **Save the `.env.local` file**
2. **Restart your dev server:**
   ```bash
   # Stop the server (Ctrl+C or Cmd+C)
   npm run dev
   ```
3. **Hard refresh your browser:**
   - Mac: `Cmd + Shift + R`
   - Windows/Linux: `Ctrl + Shift + R`

## 🔒 Security Notes

- ✅ `.env.local` should be in your `.gitignore` (it is by default)
- ✅ Never commit `.env.local` to Git
- ✅ `NEXT_PUBLIC_*` variables are visible in the browser (this is normal)
- ✅ `FIREBASE_*` variables are server-side only (kept secret)

## 📝 Current Status (Your Project)

Based on your current `.env.local`:

| Variable | Status |
|----------|--------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | ❌ **Needs real value** (currently dummy) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ✅ Set (`al-edrisy-8cf40`) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | ✅ Set |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | ✅ Set |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ✅ Set |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | ❌ **Needs real value** (currently dummy) |
| `FIREBASE_PROJECT_ID` | ✅ Set |
| `FIREBASE_CLIENT_EMAIL` | ✅ Set |
| `FIREBASE_PRIVATE_KEY` | ✅ Set |

## 🐛 Troubleshooting

### Error: "API key not valid"
- Your `NEXT_PUBLIC_FIREBASE_API_KEY` has a dummy/placeholder value
- Go to Firebase Console and get the real API key
- Update `.env.local` and restart the dev server

### Error: "Missing required Firebase Admin environment variables"
- Check that variable names match exactly (no `_ADMIN` suffix)
- Variables should be: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`

### Error: "Popup blocked"
- Allow popups for localhost:3000 in your browser
- The sign-in uses Google's popup authentication

## 📞 Need Help?

If you're still having issues:
1. Verify all environment variables are set correctly
2. Check that there are no extra spaces or quotes
3. Restart your development server
4. Clear browser cache and reload



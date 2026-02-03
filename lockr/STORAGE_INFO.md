# Locket - Data Storage Information

## ✅ Yes, Your Sign-In Info is Saved!

Locket uses **localStorage** (browser cookies) to persistently store your data. This means:

### 🔐 What Gets Saved:
- ✅ **User Profile** - Your name and username
- ✅ **All Capsules** - Groups you've created
- ✅ **All Moments** - Photos and videos you've shared
- ✅ **Settings** - Notification preferences

### 📦 How It Works:
1. **localStorage.setItem()** - Saves data to your browser
2. Data persists even after closing the browser
3. Data is available when you reopen the app
4. No login required - automatic sign-in

### 🌐 Current Storage Location:
```
Browser LocalStorage:
- locket_user → Your profile info
- locket_groups → All capsules and moments
```

### 🚀 After Supabase Integration:
Once you integrate Supabase (using the SUPABASE_SETUP.md guide), your data will:
- ✅ Sync across all devices
- ✅ Be stored in the cloud
- ✅ Never be lost even if you clear browser data
- ✅ Enable real-time updates with friends
- ✅ Support proper authentication

---

## 🔧 Testing Data Persistence

### To Verify Your Data Saves:
1. Sign up with a name and username
2. Create a capsule
3. Close the browser completely
4. Reopen the browser and go to the app
5. ✅ You should still be signed in with all your data!

### To Clear All Data (Fresh Start):
Open browser console (F12) and run:
```javascript
localStorage.clear();
location.reload();
```

---

## 📱 PWA Storage Benefits

As a Progressive Web App, Locket also:
- Stores assets for offline use
- Caches the app shell for instant loading
- Works even without internet (after first load)

---

**Note:** LocalStorage is browser-specific. If you switch browsers or devices, you won't see your data until you integrate Supabase for cloud sync!

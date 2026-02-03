# 🔐 Lockr - Time-Locked Photo Sharing App

A Progressive Web App (PWA) and native iOS app where friends can share photos in group chats that remain locked until a set time expires - like digital time capsules!

![Version](https://img.shields.io/badge/version-1.0.0-purple)
![Platform](https://img.shields.io/badge/platform-iOS-black)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## ✨ Features

- 📸 **Camera Integration** - Take photos directly in the app
- 🔒 **Time Locks** - Lock photos for 1 hour, 12 hours, 1 day, or custom times
- 👥 **Group Capsules** - Share with friend groups
- ⏰ **Live Countdowns** - Watch timers count down to unlock
- 🎨 **Beautiful UI** - Purple-pink gradient with glassmorphism effects
- 💾 **Cloud Storage** - Secure Supabase backend
- 📱 **Native iOS App** - Deploy to App Store with Capacitor
- 🌐 **PWA Ready** - Install from Safari as web app

---

## 🚀 Quick Start

### For Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### For iOS App Store Deployment

**See complete guides in:**
- 📘 **[QUICK_START_IOS.md](QUICK_START_IOS.md)** - Fast track guide (recommended)
- 📗 **[APP_STORE_DEPLOYMENT.md](APP_STORE_DEPLOYMENT.md)** - Comprehensive step-by-step
- ✅ **[APP_STORE_CHECKLIST.md](APP_STORE_CHECKLIST.md)** - Printable checklist

**Quick commands:**

```bash
# Make deploy script executable
chmod +x ios-deploy.sh

# Run interactive deployment helper
./ios-deploy.sh

# Or manual setup
npm install @capacitor/core @capacitor/cli @capacitor/ios
npm run build
npx cap add ios
npx cap open ios
```

---

## 📁 Project Structure

```
lockr/
├── components/          # React components
│   ├── LockrMain.tsx   # Main app logic
│   ├── CameraView.tsx  # Camera interface
│   ├── PhotoPreview.tsx # Photo preview & time selection
│   ├── GroupChat.tsx   # Group chat view
│   ├── FriendsView.tsx # Friends management
│   └── ...
├── lib/
│   └── supabase.ts     # Supabase client & API
├── styles/
│   └── globals.css     # Tailwind & global styles
├── public/             # Static assets
├── supabase/           # Supabase Edge Functions
├── ios/                # iOS native project (generated)
├── capacitor.config.ts # Capacitor configuration
├── vite.config.ts      # Vite build configuration
├── App.tsx             # Root component
└── index.html          # Entry point
```

---

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS v4 + Glassmorphism
- **Animations**: Motion (Framer Motion)
- **Backend**: Supabase (Auth, Storage, Database)
- **Native**: Capacitor 6 (iOS wrapper)
- **Build**: Vite
- **Icons**: Lucide React

---

## 📱 iOS Deployment

### Prerequisites

- Mac with Xcode
- Apple Developer Account ($99/year)
- 1024x1024 app icon

### Steps (High Level)

1. **Setup**: Run `./ios-deploy.sh` → Option 1
2. **Configure**: Set bundle ID and signing in Xcode
3. **Test**: Run on real iPhone to test camera
4. **Prepare**: Create screenshots and metadata
5. **Submit**: Archive and upload to App Store Connect
6. **Wait**: Apple reviews in 1-3 days
7. **Launch**: 🎉 Your app is live!

**Full details in [APP_STORE_DEPLOYMENT.md](APP_STORE_DEPLOYMENT.md)**

---

## 🎨 Design System

### Colors

```css
/* Primary Gradient */
--purple: #7c3aed (violet-500)
--pink: #ec4899 (fuchsia-500)

/* Background */
--bg-dark: #0f0a1e

/* Glassmorphism */
background: rgba(255, 255, 255, 0.05)
backdrop-filter: blur(20px)
border: 1px solid rgba(255, 255, 255, 0.1)
```

### Typography

- Font Family: System default (SF Pro on iOS)
- Headings: Bold, italic, uppercase, tight tracking
- Body: Regular, good readability

---

## 🔧 Configuration

### Supabase Setup

1. Create project at [supabase.com](https://supabase.com)
2. Set up authentication (email/password)
3. Create storage bucket for photos
4. Deploy Edge Functions (see [SUPABASE_SETUP.md](SUPABASE_SETUP.md))
5. Update `lib/supabase.ts` with your project URL and anon key

### Environment Variables

Create `.env`:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 📚 Documentation

- **[QUICK_START_IOS.md](QUICK_START_IOS.md)** - Get to App Store fast
- **[APP_STORE_DEPLOYMENT.md](APP_STORE_DEPLOYMENT.md)** - Complete deployment guide
- **[APP_STORE_CHECKLIST.md](APP_STORE_CHECKLIST.md)** - Submission checklist
- **[APP_ICON_GUIDE.md](APP_ICON_GUIDE.md)** - Design your app icon
- **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)** - Backend setup
- **[STORAGE_INFO.md](STORAGE_INFO.md)** - Storage configuration

---

## 🧪 Testing

### Web/PWA Testing

```bash
# Development
npm run dev
# Opens at http://localhost:5173

# Production preview
npm run build
npm run preview
```

### iOS Testing

```bash
# Build and sync
npm run build
npx cap sync ios

# Open in Xcode
npx cap open ios

# Run on simulator or real device
```

**Note**: Camera only works on real iPhone devices, not simulators.

---

## 🤝 Contributing

This is a personal project, but feel free to:
- Report bugs via issues
- Suggest features
- Fork and modify for your own use

---

## 📝 License

MIT License - feel free to use this project as a starting point for your own apps!

---

## 🆘 Support

### Common Issues

**"Camera not working"**
- Must test on real iPhone device
- Check Info.plist permissions
- Camera doesn't work in iOS Simulator

**"Build fails in Xcode"**
```bash
npx cap sync ios
# Then rebuild in Xcode
```

**"App crashes on launch"**
- Check that `dist` folder exists
- Run `npm run build`
- Verify `capacitor.config.ts` webDir is correct

**"Photos not uploading"**
- Check Supabase configuration
- Verify storage bucket exists
- Check network connection

### Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

---

## 🎯 Roadmap

- [x] Core camera functionality
- [x] Group time capsules
- [x] Custom unlock times
- [x] Friend system
- [x] iOS deployment ready
- [ ] Android version
- [ ] Push notifications when capsules unlock
- [ ] Photo reactions/comments
- [ ] Location-based capsules
- [ ] Export all memories feature

---

## 💜 Made With

Built with love for capturing moments that matter.

Perfect for:
- Birthday surprises
- Trip memories
- New Year's countdowns
- Event recaps
- Friendship anniversaries

---

## 📞 Contact

Questions about deployment? Check the guides above or open an issue!

---

**Ready to deploy? Start here:** [QUICK_START_IOS.md](QUICK_START_IOS.md) 🚀

---

*"The best moments are worth the wait."* ⏰🔐

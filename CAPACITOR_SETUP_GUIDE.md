# 🚀 Capacitor Setup Guide - Build Native iOS & Android Apps

## Overview

This guide walks you through building **iOS** and **Android** native apps from your web app using **Capacitor 6**.

**What is Capacitor?**
- Converts your web app to native iOS/Android apps
- Single codebase → Both platforms
- Uses your existing HTML/CSS/JavaScript
- Adds native capabilities (camera, location, push notifications, etc.)

---

## 📋 Prerequisites

### Mac (for iOS development):
- [ ] macOS 12.0 or higher
- [ ] Xcode 14.0+ (App Store → ~15 GB download)
- [ ] Xcode Command Line Tools
- [ ] CocoaPods
- [ ] Node.js 18+

### Windows/Mac (for Android development):
- [ ] Android Studio 2022.1.1+
- [ ] Android SDK (API 24+)
- [ ] Java JDK 11 or higher
- [ ] Node.js 18+

### Both:
- [ ] Git installed
- [ ] npm 9.0.0 or higher

---

## ⚡ QUICK START (Choose Your Path)

### Path 1: Build for iOS (Mac only)
```bash
# 1. Install Capacitor (1 min)
npm install @capacitor/core @capacitor/cli @capacitor/ios

# 2. Initialize Capacitor (1 min)
npx cap init --web-dir web

# 3. Add iOS platform (2 min)
npx cap add ios

# 4. Prepare web files (1 min)
mkdir -p web && cp -r . web/

# 5. Sync code to Xcode (2 min)
npx cap sync ios

# 6. Open in Xcode (2 min)
npx cap open ios

# 7. Build and run in Xcode
# (In Xcode: Select device → Run button)

Total time: ~15 minutes
```

### Path 2: Build for Android (Windows/Mac)
```bash
# 1. Install Capacitor (1 min)
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Initialize Capacitor (1 min)
npx cap init --web-dir web

# 3. Add Android platform (2 min)
npx cap add android

# 4. Prepare web files (1 min)
mkdir -p web && cp -r . web/

# 5. Sync code to Android Studio (2 min)
npx cap sync android

# 6. Open in Android Studio (2 min)
npx cap open android

# 7. Build and run in Android Studio
# (In Android Studio: Select emulator → Run button)

Total time: ~15 minutes
```

### Path 3: Build for Both (Recommended)
```bash
# Do Path 1 first (iOS)
# Then do Path 2 (Android)
# Both can coexist in same project

Total time: ~30 minutes
```

---

## 🔧 Step-by-Step Setup (Detailed)

### STEP 1: Install Capacitor CLI

```bash
# Option A: Using npm (recommended)
npm install -g @capacitor/cli

# Verify installation
npx cap --version
# Should show: Capacitor CLI version 6.x.x
```

### STEP 2: Install Core & Platforms

```bash
# Install core package
npm install @capacitor/core @capacitor/cli

# For iOS only:
npm install @capacitor/ios

# For Android only:
npm install @capacitor/android

# For both:
npm install @capacitor/ios @capacitor/android
```

### STEP 3: Initialize Capacitor

```bash
# From your project root directory
npx cap init

# Answer prompts:
# App name: Ultimate Sports AI
# App Package ID: com.predictmaster.sportsai
# Web assets directory: web
# (This creates capacitor.config.ts)
```

**What this creates:**
- `capacitor.config.ts` - Main config file
- `.capacitorignore` - Files to exclude
- Updates your `.gitignore`

### STEP 4: Prepare Web Assets

```bash
# Create web directory and copy files
mkdir -p web

# Copy all web files to web/ directory
# (Keep originals in root for web version)
cp -r . web/

# Remove unnecessary files from web/
rm -rf web/node_modules
rm -rf web/android
rm -rf web/ios
rm -rf web/.git
rm -rf web/backend
```

**Your structure should look like:**
```
project-root/
├── web/                    ← Web app files for native apps
│   ├── index.html
│   ├── app.js
│   ├── config.js
│   ├── styles.css
│   └── ... (all other files)
│
├── ios/                    ← Xcode project (after cap add ios)
│   └── App/
│       ├── App.xcworkspace
│       └── ...
│
├── android/                ← Android Studio project (after cap add android)
│   ├── app/
│   ├── build.gradle
│   └── ...
│
├── package.json
├── capacitor.config.ts
└── ... (root web files for web version)
```

### STEP 5: Add iOS Platform

```bash
# Only on Mac
npx cap add ios

# This creates:
# - ios/ directory with Xcode project
# - Installs CocoaPods dependencies
# - Creates App.xcworkspace

# Time: ~2-3 minutes
```

**What you get:**
- `ios/App/App.xcworkspace` - Your Xcode workspace
- iOS app template ready to build
- Native capabilities configured

### STEP 6: Add Android Platform

```bash
# Mac or Windows
npx cap add android

# This creates:
# - android/ directory with Android project
# - Syncs all dependencies
# - Creates build files

# Time: ~2-3 minutes
```

**What you get:**
- `android/` directory with complete Android project
- Android app template ready to build
- Native capabilities configured

### STEP 7: Sync Web Files

After any code changes, sync to native projects:

```bash
# Sync to iOS
npx cap sync ios

# Sync to Android
npx cap sync android

# Sync both
npx cap sync
```

### STEP 8: Build for iOS

```bash
# Open in Xcode
npx cap open ios

# In Xcode:
# 1. Select target device (top-left dropdown)
# 2. Click Play button (▶) to build and run
# 3. Wait for build to complete (~2-5 min)
# 4. App opens on simulator or device

# Alternative command-line build:
npm run build:ios
```

### STEP 9: Build for Android

```bash
# Open in Android Studio
npx cap open android

# In Android Studio:
# 1. Select target device (top toolbar)
# 2. Click Play button (▶) to build and run
# 3. Wait for build to complete (~3-10 min)
# 4. App opens on emulator or device

# Alternative command-line build:
npm run build:android:debug   # Debug APK
npm run build:android         # Release AAB (for stores)
```

---

## 🎨 App Configuration

### Update App Icon

**iOS:**
```
ios/App/App/Assets.xcassets/AppIcon.appiconset/
├── AppIcon-20x20@1x.png
├── AppIcon-20x20@2x.png
├── AppIcon-60x60@3x.png
└── ... (multiple sizes)
```

Replace with your icon (use AppIcon template from Xcode)

**Android:**
```
android/app/src/main/res/
├── mipmap-ldpi/ic_launcher.png
├── mipmap-mdpi/ic_launcher.png
├── mipmap-hdpi/ic_launcher.png
├── mipmap-xhdpi/ic_launcher.png
├── mipmap-xxhdpi/ic_launcher.png
└── mipmap-xxxhdpi/ic_launcher.png
```

Generate using [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/)

### Update App Name

**iOS (Xcode):**
1. Open `ios/App/App.xcodeproj`
2. Select project → General tab
3. Update "Display Name"

**Android (Android Studio):**
1. Open `android/build.gradle`
2. Update `applicationLabel` in manifest
3. Or in `android/app/src/main/AndroidManifest.xml`
```xml
<application
    android:label="@string/app_name"
    ...>
```

---

## 🔐 Code Signing for Stores

### iOS App Store Signing

```bash
# 1. Create Apple Developer Account
# - Go to developer.apple.com
# - Enroll in Apple Developer Program ($99/year)
# - Create Certificate, Identifiers, Provisioning Profiles

# 2. Create App ID in Xcode
# In Xcode:
# - Window → Devices and Simulators
# - Select your device
# - Provisioning Profiles

# 3. Configure in Xcode
# - Select project → Build Settings
# - Set Team ID
# - Set Signing Certificate
# - Set Provisioning Profile

# 4. Archive for submission
# - Product → Archive
# - Organizer opens automatically
# - Click Distribute App
# - Choose App Store Connect
# - Proceed with upload
```

### Android Play Store Signing

```bash
# 1. Create Google Play Developer Account
# - Go to play.google.com/console
# - Pay $25 one-time fee
# - Create app listing

# 2. Generate Signed AAB
cd android
./gradlew bundleRelease
# Creates: android/app/build/outputs/bundle/release/app-release.aab

# 3. Upload to Google Play Console
# - Upload the .aab file
# - Add description, screenshots
# - Configure pricing
# - Submit for review

# OR use gradle with keystore:
# ./gradlew bundleRelease \
#   -Pandroid.injected.signing.store.file=path/to/keystore \
#   -Pandroid.injected.signing.store.password=password \
#   -Pandroid.injected.signing.key.alias=key_alias \
#   -Pandroid.injected.signing.key.password=key_password
```

---

## 🧪 Testing Before Store Submission

### Test on iOS Simulator

```bash
# Build for simulator (faster)
npx cap build ios --configuration Debug --simulator

# Or in Xcode:
# 1. Select simulator (e.g., iPhone 15 Pro)
# 2. Click Play button
# 3. Test in simulator

# Create device & test:
# - Create account
# - Test all features
# - Test payments (use test card)
# - Check console for errors
```

### Test on Android Emulator

```bash
# Open Android Studio
npx cap open android

# Create Virtual Device:
# 1. Tools → Device Manager
# 2. Click Create Device
# 3. Select Pixel 6 Pro (or newer)
# 4. Select Android 14 API 34
# 5. Click Create

# Run app:
# 1. Select emulator in dropdown
# 2. Click Play button
# 3. Test in emulator

# Create account & test:
# - Login/signup
# - Browse features
# - Test payment flow
# - Monitor console
```

---

## 📦 Building for Release

### iOS Release Build

```bash
# Option 1: Use Xcode (Recommended for first-time)
1. In Xcode: Select Generic iOS Device (not simulator)
2. Product → Scheme → Edit Scheme
3. Set Build Configuration to Release
4. Product → Archive
5. Organizer window opens
6. Click Distribute App
7. Choose App Store Connect
8. Follow upload wizard

# Option 2: Command line
xcodebuild archive \
  -workspace ios/App/App.xcworkspace \
  -scheme App \
  -archivePath build/App \
  -configuration Release

# Result: App submitted to App Store for review
```

### Android Release Build

```bash
# Generate signed AAB (for Google Play)
cd android
./gradlew bundleRelease

# Creates: app/build/outputs/bundle/release/app-release.aab

# Upload to Google Play Console:
# 1. Go to play.google.com/console
# 2. Select your app
# 3. Release → Production
# 4. Upload app-release.aab
# 5. Add release notes
# 6. Review and start rollout

# OR generate APK (for direct distribution)
./gradlew assembleRelease
# Creates: app/build/outputs/apk/release/app-release.apk
```

---

## ⚠️ Common Issues & Fixes

### Issue 1: "Command not found: npx"
**Solution:** Install Node.js
```bash
node --version  # Should be 18+
npm --version   # Should be 9+
```

### Issue 2: "CocoaPods not found" (macOS)
**Solution:** Install CocoaPods
```bash
sudo gem install cocoapods
pod setup
```

### Issue 3: "Android SDK not found"
**Solution:** Install Android Studio + SDK
```bash
# Download from developer.android.com
# Install Android SDK Level 34
# Set ANDROID_HOME environment variable
export ANDROID_HOME="$HOME/Library/Android/sdk"
```

### Issue 4: "Build failed: Permission denied"
**Solution:** Fix permissions
```bash
# macOS/Linux
chmod +x android/gradlew
chmod +x ios/build.sh
```

### Issue 5: "App won't load" (blank screen)
**Solution:** 
1. Check `web/` directory exists
2. Verify `index.html` is in `web/`
3. Check console logs (use DevTools)
4. Run `npx cap sync` again

### Issue 6: "Stripe not working in app"
**Solution:** Configure CSP headers
- Update `web/index.html` security policies
- Allow `https://js.stripe.com`
- Allow `https://checkout.stripe.com`

---

## 🚀 npm Scripts Cheat Sheet

```bash
# Setup
npm install                    # Install dependencies
npm run capacitor:init         # Initialize Capacitor
npm run capacitor:add:ios      # Add iOS platform
npm run capacitor:add:android  # Add Android platform

# Development
npm run capacitor:sync         # Sync web → native
npm run capacitor:open:ios     # Open Xcode
npm run capacitor:open:android # Open Android Studio

# Building
npm run build:ios              # Build iOS app
npm run build:android:debug    # Build Android debug APK
npm run build:android          # Build Android release AAB

# Cleaning
npm run clean                  # Remove all platforms
npm run clean:ios              # Clean iOS build
npm run clean:android          # Clean Android build
```

---

## 📱 App Store Submission Checklist

### Before iOS Submission
- [ ] App Icon (1024x1024 PNG)
- [ ] Screenshots (2-5 per device size)
- [ ] App Description (4000 char max)
- [ ] Keywords (100 char max)
- [ ] Support URL
- [ ] Privacy Policy URL
- [ ] Category: Education
- [ ] Age Rating (fill questionnaire)
- [ ] Version number set correctly
- [ ] All features tested on device

### Before Android Submission
- [ ] App Icon (512x512 PNG)
- [ ] Feature Graphic (1024x500 PNG)
- [ ] Screenshots (2-8 images)
- [ ] App Description (4000 char max)
- [ ] Short Description (80 char max)
- [ ] Category: Education
- [ ] Content Rating (fill questionnaire)
- [ ] Privacy Policy URL
- [ ] App version set correctly
- [ ] All features tested on emulator

---

## 🎯 Final Checklist Before Building

- [ ] Run cleanup (delete 95 .md files)
- [ ] Update app icons
- [ ] Update app name in Capacitor config
- [ ] Set correct app version (2.0.0)
- [ ] Verify web/ directory has all files
- [ ] Test on simulator/emulator
- [ ] Test payment flow (use test card)
- [ ] No console errors (F12 DevTools)
- [ ] Check internet connection works
- [ ] Stripe endpoints responding
- [ ] Backend API accessible
- [ ] Ready to submit to stores!

---

## 📞 Troubleshooting Resources

**Capacitor Docs:** https://capacitorjs.com/docs
**iOS Docs:** https://developer.apple.com/documentation
**Android Docs:** https://developer.android.com/docs
**Stripe Mobile:** https://stripe.com/docs/payments/mobile

---

## 🎊 Next Steps

1. **Install Capacitor**
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
   ```

2. **Initialize & Add Platforms**
   ```bash
   npx cap init
   npx cap add ios
   npx cap add android
   ```

3. **Prepare Web Files**
   ```bash
   mkdir -p web && cp -r . web/
   ```

4. **Sync to Native**
   ```bash
   npx cap sync
   ```

5. **Build & Test**
   ```bash
   npx cap open ios    # For iOS
   npx cap open android # For Android
   ```

6. **Submit to Stores**
   - Apple App Store
   - Google Play Store

---

**You're ready to go native! Build your first Capacitor app today! 🚀**

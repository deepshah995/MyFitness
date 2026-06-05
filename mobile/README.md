# 📱 MyFitness AI — Native iOS App Guide

This is a **real native iOS app** built with [Capacitor](https://capacitorjs.com). Your React code runs inside a native `WKWebView` — producing a genuine `.ipa` file installable on your iPhone without the App Store.

---

## How to Install Without a Developer Account ($99/yr)

You have **two free options**:

| Method | Pros | Cons |
|---|---|---|
| **Option A: Xcode (USB)** | Simple, built-in, no extra tools | Must plug in every 7 days |
| **Option B: AltStore** | Auto-refreshes over WiFi | Needs initial setup |

---

## Prerequisites — Install These First

### 1. Xcode (Required for both options)
1. Open the **Mac App Store** on your Mac
2. Search for **Xcode** → Install (~10 GB, free)
3. After install, open Xcode once to accept the license agreement
4. Run in Terminal:
   ```bash
   sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
   ```

### 2. CocoaPods (Required for Capacitor iOS)
```bash
# Option A: via Homebrew (recommended)
brew install cocoapods

# Option B: via gem
sudo gem install cocoapods
```

Verify: `pod --version` (should show 1.x)

---

## One-Time Project Setup

Run these from `MyFitness/frontend/`:

```bash
# 1. Install Capacitor packages (already done if you ran npm install)
npm install

# 2. Build the web app
npm run build

# 3. Initialize Capacitor (creates capacitor.config.ts — already done)
# Skip if capacitor.config.ts already exists

# 4. Add the iOS platform — generates the Xcode project
npx cap add ios

# This creates: MyFitness/mobile/ios/App/App.xcodeproj

# 5. Install iOS CocoaPods dependencies
cd ../mobile/ios
pod install

# 6. Sync built web assets into the iOS project
cd ../../frontend
npx cap sync ios
```

---

## Option A — Install via Xcode (USB)

1. **Plug your iPhone into your Mac** via USB cable
2. Unlock your iPhone and tap **"Trust This Computer"** if prompted
3. Open the Xcode project:
   ```bash
   cd /Users/deepshah/Desktop/MyFitness/frontend
   npx cap open ios
   ```
4. In Xcode:
   - Select your iPhone from the **device dropdown** (top-left, next to the ▶ button)
   - Go to **Signing & Capabilities** tab
   - Change **Team** to your personal Apple ID (click "Add Account..." if needed)
   - Xcode will auto-assign a signing certificate (free)
5. Click **▶ Run**
6. **First launch only:** On your iPhone go to:
   `Settings → General → VPN & Device Management → [Your Apple ID] → Trust`
7. The app launches! ✅

> **Expiry:** Free account apps expire after **7 days**. Just click ▶ Run again in Xcode to reinstall.

---

## Option B — Install via AltStore (Wireless Refresh)

AltStore is a third-party app store that uses your free Apple ID to sign apps and can auto-refresh them over WiFi so you don't need to replug every 7 days.

### Install AltStore on your Mac
1. Go to **[altstore.io](https://altstore.io)** → Download AltServer for Mac
2. Move AltServer to your Applications folder and open it
3. An ▶ icon appears in your Mac's menu bar

### Install AltStore on your iPhone
1. Plug your iPhone in via USB
2. Click the AltServer ▶ icon in the menu bar → **"Install AltStore"** → select your iPhone
3. Enter your Apple ID when prompted (AltServer uses it to sign apps locally)
4. On iPhone: `Settings → General → VPN & Device Management → [Apple ID] → Trust`
5. Open **AltStore** on your iPhone

### Sideload the MyFitness IPA

Build the IPA from Xcode:
1. In Xcode: **Product → Archive**
2. In the Organizer window: **Distribute App → Custom → Release Testing → Export**
3. Save the `.ipa` file

Install via AltStore:
1. Open **AltStore** on iPhone → **My Apps** tab → **+** button
2. Select your `.ipa` file
3. App installs ✅

> **Auto-refresh:** Keep AltServer running on your Mac. When iPhone is on the same WiFi, AltStore auto-refreshes apps before the 7-day expiry.

---

## Daily Development Workflow

After making code changes:

```bash
cd /Users/deepshah/Desktop/MyFitness/frontend

# 1. Build updated web app
npm run build

# 2. Sync to iOS project
npx cap sync ios

# 3. Open Xcode and click Run
npx cap open ios
```

---

## Connecting to Your Backend

Edit `frontend/capacitor.config.ts` and set the server URL:

```ts
server: {
  url: "https://YOUR_CLOUD_RUN_BACKEND_URL",
  cleartext: false,
}
```

Then rebuild + sync:
```bash
npm run build && npx cap sync ios
```

For local development, remove the `server.url` line — the app will use the bundled assets and talk to `localhost:8080`.

---

## File Structure

```
MyFitness/
  frontend/
    capacitor.config.ts    ← App ID, name, plugins config
    vite.config.js         ← base: './' required for WKWebView
    dist/                  ← Built web app (synced to iOS)
  mobile/
    ios/                   ← Generated Xcode project (git-ignored)
      App/
        App.xcodeproj      ← Open this in Xcode
        App/
          AppDelegate.swift
          Info.plist
          Assets.xcassets/ ← App icons
      Podfile
    README.md              ← This file
```

---

## App Icon

To set a custom icon, place a **1024×1024 PNG** at `frontend/assets/icon.png`, then:

```bash
cd frontend
npx @capacitor/assets generate --ios
npx cap sync ios
```

This generates all required iOS icon sizes automatically.

---

## Native Features Enabled

| Feature | Plugin | Status |
|---|---|---|
| Status bar theming | `@capacitor/status-bar` | ✅ Configured |
| Haptic feedback on nav taps | `@capacitor/haptics` | ✅ Wired |
| Keyboard avoidance | `@capacitor/keyboard` | ✅ Configured |
| Splash screen | `@capacitor/splash-screen` | ✅ Configured |

---

## FAQ

**Q: Do I need to pay for anything?**
No. Xcode is free. AltStore is free. Your Apple ID (existing iCloud account) is free. The only cost would be the $99/yr Apple Developer Program if you wanted to publish to the App Store or distribute to others.

**Q: Why does the app expire after 7 days?**
Apple restricts free (non-enrolled developer) signing to 7-day certificates. This is a device-level restriction. AltStore automates the re-signing so you don't have to think about it.

**Q: Can I share this with friends?**
With a free account, you can only install on up to **3 devices** that are registered to your Apple ID. For broader distribution, you'd need the Developer Program and TestFlight.

**Q: What about Android?**
Capacitor also supports Android via `npx cap add android`. No restrictions — you can install APKs directly.

---

*Built with [Capacitor](https://capacitorjs.com) · MyFitness AI*

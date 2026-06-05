#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  MyFitness AI — Native iOS Setup Script
#  Run this once in your terminal to set up the Capacitor iOS app
# ═══════════════════════════════════════════════════════════════
set -e

FRONTEND_DIR="$(cd "$(dirname "$0")/../frontend" && pwd)"
MOBILE_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "╔═══════════════════════════════════════════╗"
echo "║   MyFitness AI — iOS Setup                ║"
echo "╚═══════════════════════════════════════════╝"
echo ""

# ── Check prerequisites ──────────────────────────────────────────────
echo "▶ Checking prerequisites..."

if ! command -v xcodebuild &> /dev/null; then
  echo ""
  echo "❌  Xcode not found."
  echo "    → Install Xcode from the Mac App Store (free, ~10 GB)"
  echo "    → Then run: sudo xcode-select -s /Applications/Xcode.app/Contents/Developer"
  echo ""
  exit 1
fi
echo "  ✓ Xcode: $(xcodebuild -version | head -1)"

if ! command -v pod &> /dev/null; then
  echo ""
  echo "❌  CocoaPods not found."
  echo "    → Run: brew install cocoapods"
  echo "    → Or:  sudo gem install cocoapods"
  echo ""
  exit 1
fi
echo "  ✓ CocoaPods: $(pod --version)"

echo "  ✓ Node: $(node --version)"
echo "  ✓ npm:  $(npm --version)"
echo ""

# ── Step 1: Install Capacitor npm packages ───────────────────────────
echo "▶ Step 1/5 — Installing Capacitor packages..."
cd "$FRONTEND_DIR"
npm install \
  @capacitor/core \
  @capacitor/cli \
  @capacitor/ios \
  @capacitor/status-bar \
  @capacitor/haptics \
  @capacitor/keyboard \
  @capacitor/splash-screen
echo "  ✓ Packages installed"
echo ""

# ── Step 2: Build the web app ────────────────────────────────────────
echo "▶ Step 2/5 — Building web app..."
npm run build
echo "  ✓ Built to dist/"
echo ""

# ── Step 3: Add iOS platform (generates Xcode project) ───────────────
echo "▶ Step 3/5 — Adding iOS platform..."
mkdir -p "$MOBILE_DIR/ios"

# Run cap add ios from frontend (where capacitor.config.ts lives)
# --no-deps skips the pod install here; we'll do it explicitly next
npx cap add ios 2>&1 || true

# Capacitor puts ios/ next to capacitor.config.ts by default.
# Move it into mobile/ios/ if it ended up in frontend/ios/
if [ -d "$FRONTEND_DIR/ios" ] && [ ! -d "$MOBILE_DIR/ios/App" ]; then
  echo "  Moving ios/ → mobile/ios/ ..."
  mv "$FRONTEND_DIR/ios"/* "$MOBILE_DIR/ios/" 2>/dev/null || mv "$FRONTEND_DIR/ios" "$MOBILE_DIR/ios"
fi

echo "  ✓ iOS platform added"
echo ""

# ── Step 4: Install CocoaPods dependencies ───────────────────────────
echo "▶ Step 4/5 — Installing CocoaPods dependencies..."
# Find the Podfile
POD_DIR=""
if [ -f "$MOBILE_DIR/ios/App/Podfile" ]; then
  POD_DIR="$MOBILE_DIR/ios/App"
elif [ -f "$MOBILE_DIR/ios/Podfile" ]; then
  POD_DIR="$MOBILE_DIR/ios"
elif [ -f "$FRONTEND_DIR/ios/App/Podfile" ]; then
  POD_DIR="$FRONTEND_DIR/ios/App"
fi

if [ -n "$POD_DIR" ]; then
  cd "$POD_DIR"
  pod install
  echo "  ✓ CocoaPods installed"
else
  echo "  ⚠ Podfile not found — run 'pod install' manually in the ios/App directory"
fi
echo ""

# ── Step 5: Sync web assets into iOS project ─────────────────────────
echo "▶ Step 5/5 — Syncing web assets into iOS project..."
cd "$FRONTEND_DIR"
npx cap sync ios
echo "  ✓ Synced"
echo ""

# ── Done ─────────────────────────────────────────────────────────────
echo "╔═══════════════════════════════════════════╗"
echo "║   ✅  Setup Complete!                      ║"
echo "╚═══════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo ""
echo "  1. Plug your iPhone into your Mac via USB"
echo "  2. Open Xcode:"
echo "     cd $FRONTEND_DIR && npx cap open ios"
echo ""
echo "  3. In Xcode:"
echo "     • Select your iPhone from the device dropdown"
echo "     • Go to Signing & Capabilities → set your Apple ID as Team"
echo "     • Click ▶ Run"
echo ""
echo "  4. On iPhone (first time only):"
echo "     Settings → General → VPN & Device Management → [Your Apple ID] → Trust"
echo ""
echo "  ─────────────────────────────────────────────"
echo "  Rebuild after code changes:"
echo "  cd $FRONTEND_DIR && npm run build && npx cap sync ios"
echo "  Then click ▶ Run in Xcode again."
echo ""

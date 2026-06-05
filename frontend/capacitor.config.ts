import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  // Unique reverse-domain app identifier
  appId: "com.deepshah.myfitness",
  appName: "MyFitness AI",

  // Vite build output folder
  webDir: "dist",

  // ── Server config ───────────────────────────────────────────────────
  // When running on a real device the app talks to the deployed backend.
  // For local testing comment this out so the WKWebView uses bundled assets.
  server: {
    // Replace with your Cloud Run backend URL once deployed.
    // e.g. "https://myfitness-backend-xxx-uc.a.run.app"
    // Remove or comment out this block to use fully offline/bundled mode.
    // url: "https://YOUR_BACKEND_URL_HERE",
    cleartext: false, // Enforce HTTPS (recommended)
    allowNavigation: [],
  },

  // ── iOS-specific config ─────────────────────────────────────────────
  ios: {
    contentInset: "always",       // Respect safe areas (notch / home bar)
    backgroundColor: "#0b1220",   // Match app dark background
    preferredContentMode: "mobile",
    scrollEnabled: true,
    // Liminal WebView settings for performance
    allowsLinkPreview: false,
  },

  // ── Native plugins ──────────────────────────────────────────────────
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: "#0b1220",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      iosSpinnerStyle: "small",
      spinnerColor: "#6366f1",
    },
    StatusBar: {
      style: "Dark",              // Light text on dark background
      backgroundColor: "#0b1220",
      overlaysWebView: false,
    },
    Keyboard: {
      resize: "body",             // Shrink the WebView when keyboard appears
      style: "dark",
      resizeOnFullScreen: true,
    },
  },
};

export default config;

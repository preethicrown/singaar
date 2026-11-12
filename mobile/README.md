# SINGAAR for Android

The Android app is a native shell (Capacitor) around the SINGAAR app at `https://singaar.vercel.app/app/`
(source in `/app`). Screens, features and fixes go live as soon as Vercel deploys; the APK only needs
rebuilding when the icon, splash or shell settings here change.

**How the APK is built:** GitHub Actions (`.github/workflows/android.yml`) builds it on every push to `main`
that touches this folder, and publishes it as a GitHub Release. You can also run it by hand:
GitHub > Actions > Android app > Run workflow.

**Download link used on the website and in the app:**
`https://github.com/preethicrown/singaar/releases/latest/download/singaar.apk`

**Next steps for Google Play:** create a release signing key (keep it secret, store it as GitHub secrets),
build `bundleRelease` instead of `assembleDebug`, and upload the `.aab` in the Play Console
(one-time developer fee, then review).

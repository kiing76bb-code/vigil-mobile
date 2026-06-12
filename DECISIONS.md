# Vigil Mobile — Architectural Decisions Log

Every deviation from the scaffold spec, every placeholder, every verify fix.
Built June 12, 2026 against Expo SDK 56.

## Ground-truth conflicts resolved

1. **Declared Supabase schema does not match the live database.**
   The spec lists `products(id, name, url, target_price, current_price, user_id, created_at)`
   plus `price_alerts`, `flight_routes`, `hotel_targets` as "already live."
   Reality (checked June 11): live `products` uses `product_name`/`retail_link`/`last_updated`,
   has **no `user_id`**, and the other three tables **do not exist**.
   → App code follows the spec's declared shape (it is the right shape for a
   multi-user app). Run `supabase-migration.sql` once in the SQL Editor to
   align the live DB. The migration renames columns non-destructively,
   creates the missing tables, and restores the missing anon grants.

2. **Anon key has zero table grants (known open issue from June 11).**
   Every REST/supabase-js query 401s until grants are restored. The fix is
   included at the bottom of `supabase-migration.sql`. Without it the app
   boots fine but lists stay empty and adds fail.

3. **Stripe links are NOT placeholders.** Brain Trust (June 12) now carries
   LIVE payment links for Pro and Elite — wired into `.env`. **These charge
   real cards.**

4. **`expo-router` omitted.** The spec's install list includes expo-router,
   but the architecture map is 100% React Navigation (`AppNavigator`,
   `AuthStack`, `MainTabs`). Running both is an anti-pattern (expo-router
   owns the entry point). React Navigation implemented; expo-router and its
   plugin skipped.

5. **`expo-barcode-scanner` no longer exists.** Removed from the Expo SDK
   (merged into `expo-camera`). Barcode scanning uses
   `CameraView.barcodeScannerSettings` + `onBarcodeScanned`.

6. **`victory-native` pinned to 36.9.2 (legacy).** Modern victory-native
   (v40+) requires `@shopify/react-native-skia`, which is not in the
   approved dependency list. v36 renders via `react-native-svg`, which is.

7. **"useNativeDriver: true" → Reanimated worklets.** Reanimated 3 has no
   `useNativeDriver` option — that's the old `Animated` API. All animations
   (RadarPulse rotation, barcode pop, particle burst, savings roll, border
   flash) are Reanimated shared-value worklets, which run on the UI thread —
   the same guarantee the spec is asking for. No `setTimeout` animations
   anywhere (the only `setTimeout` is the TargetHitModal 4s auto-dismiss,
   which is a timer, not an animation).

8. **Tier source.** No subscriptions table exists, so tier is read from
   `user.user_metadata.tier` (`'pro'`/`'elite'`, default `'free'`). When
   Stripe webhooks exist, write the tier there server-side. Stripe payment
   links cannot update Supabase on their own — tier upgrades are manual
   until a webhook → Supabase function is built.

9. **Barcode → product lookup.** No Amazon Product Advertising API
   credentials exist (PA-API requires 3 qualifying sales first). Per the
   spec's fallback: a scan pre-fills AddProductModal with the barcode and
   an Amazon search URL for it.

10. **`@expo/vector-icons` added** (tab icons). Not in the install list but
    it ships inside the Expo SDK; documenting per the rules.

11. **Env var names.** Expo only exposes `EXPO_PUBLIC_*` vars to app code,
    so the spec's `SUPABASE_URL` etc. became `EXPO_PUBLIC_SUPABASE_URL` etc.

12. **No `babel.config.js`** (Axis Creative standing rule). SDK 56 doesn't
    need one — `babel-preset-expo` (including the Reanimated plugin) is the
    default.

13. **`eas.json` "local" profile**: local builds are produced by the
    `--local` flag (`eas build --platform android --local --profile local`),
    not by a profile name; the profile sets `buildType: "apk"` +
    internal distribution.

## Verify-phase fixes

- **Phase 5 tsc errors (2):** `@expo/vector-icons` missing from the blank
  template (installed); `StyleSheet.absoluteFillObject` no longer in RN
  types (replaced with explicit position-absolute styles).
- **Boot verification:** Metro started headless; full Android dev bundle
  compiled successfully (HTTP 200, ~14.2 MB). Not run on a device in this
  session.

## Placeholders / follow-ups for the developer

- [ ] Run `supabase-migration.sql` in the Supabase SQL Editor (REQUIRED —
      app has no data access until the grants are restored).
- [ ] Enable Supabase Auth email provider (Dashboard → Auth → Providers)
      if not already on; signup flow depends on it.
- [ ] Stripe webhooks → set `user_metadata.tier` after checkout (manual
      until then).
- [ ] App icons in `assets/` are the Expo defaults — replace with the Vigil
      eye before any store submission.
- [ ] iOS bundle id is set (`com.blandcreative.vigil`) but only Android is
      configured for EAS local builds per the spec.
- [ ] Enable RLS with per-user policies before public launch (template in
      the migration file).

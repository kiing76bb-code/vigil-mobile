# Vigil Mobile

Price intelligence in your pocket. **WATCH · ALERT · WIN**

React Native + Expo SDK 56 · TypeScript · Zustand · Supabase · Reanimated.

## What it does

- **Watchlist** — track products against your target price; swipe to remove,
  tap to expand a 90-day price chart; animated total-savings counter.
- **Scan** — point the camera at a barcode, get a pre-filled tracking form.
- **Travel** — flight routes + hotel targets (Pro tier and up).
- **Profile** — tier, savings, Stripe upgrade links, sign out.
- Victory screen with particle burst + haptics when a target is hit.

## Setup

1. `npm install`
2. Copy the env template and fill values (current `.env` already carries the
   live project values from Brain Trust):

   ```
   EXPO_PUBLIC_SUPABASE_URL=https://vqjrwdnffqzwhzjswvic.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon key>
   EXPO_PUBLIC_STRIPE_PRO_LINK=<Stripe payment link>
   EXPO_PUBLIC_STRIPE_ELITE_LINK=<Stripe payment link>
   EXPO_PUBLIC_AMAZON_TAG=vigildrop-20
   ```

3. **Supabase (one-time, REQUIRED):** open the SQL Editor on project
   `vqjrwdnffqzwhzjswvic` and run `supabase-migration.sql`. This aligns the
   live schema with the app and restores the anon-role grants (without it,
   every query 401s). Also make sure Auth → Email provider is enabled.
4. `npx expo start` — scan the QR with Expo Go, or press `a` for an Android
   emulator. The app boots to the login screen.

## Build (Android APK, local)

```
npm install -g eas-cli
eas login            # account: creativetwo
eas build --platform android --local --profile local
```

Output: an installable `.apk`. Bundle id: `com.blandcreative.vigil`.

## Stripe

Payment links in `.env` are **LIVE mode** — they charge real cards. After a
customer pays, set their tier manually (Supabase → Auth → user →
`user_metadata.tier = "pro" | "elite"`) until the webhook automation exists.

## Where things live

See `DECISIONS.md` for every architectural decision, schema-drift note, and
the remaining follow-ups before store submission.


## Plan

### 1. PWA Install Prompt for Admins
- Add a `manifest.json` with basic app metadata (name, icons, display: standalone)
- Register it in `index.html`
- Create an `AdminInstallPrompt` component that:
  - Only shows on the admin dashboard
  - Captures the `beforeinstallprompt` event
  - Shows a modal asking to install with a "Don't ask again" checkbox
  - Stores the "don't ask again" preference in `localStorage`

### 2. Push Notifications Infrastructure
- Generate VAPID keys and store them as secrets (`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`)
- Create a `push_subscriptions` database table to store admin push subscriptions
- Add a `PushNotificationSetup` component on the admin dashboard that prompts mobile admins to enable notifications
- Create a service worker (`sw.js`) that handles push events

### 3. Sending Notifications on New Orders
- Create an edge function `send-order-push` that:
  - Reads all admin push subscriptions
  - Sends a web push notification with "New order! €XX.XX"
- Call this edge function from the checkout success flow (alongside the existing order email)

### 4. Files to create/modify
- `public/manifest.json` (new)
- `public/sw.js` (new - service worker for push)
- `index.html` (add manifest link + SW registration)
- `src/components/admin/AdminInstallPrompt.tsx` (new)
- `src/components/admin/PushNotificationSetup.tsx` (new)
- `src/pages/admin/Dashboard.tsx` (add both components)
- `supabase/functions/send-order-push/index.ts` (new edge function)
- DB migration: `push_subscriptions` table
- Modify checkout success to also trigger push notifications

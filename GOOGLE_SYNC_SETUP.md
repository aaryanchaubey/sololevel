# Google Drive backup setup

Solo Leveling remains local-first. Google Drive support stores a portable JSON backup in Google's hidden `appDataFolder`; it does not create a Google profile or sync each keystroke. Upload and restore are manual so an upload cannot silently overwrite a newer backup.

## One-time Google setup

1. In Google Cloud Console, create or select a project and enable the **Google Drive API**.
2. Configure the OAuth consent screen. Add your account as a test user while the app is in testing mode.
3. Create an OAuth client ID for a **Web application**.
4. Add these Authorized JavaScript origins:
   - `https://solo-leveling-v1.netlify.app`
   - `http://localhost:5173`
5. Copy the client ID (it ends in `.apps.googleusercontent.com`). A client ID is public browser configuration; never put a client secret in this app.
6. `VITE_GOOGLE_CLIENT_ID` is configured in Netlify for all deploy contexts. The value is public browser configuration; never add a client secret to the app or environment variables.
7. For local development, place the same client ID in `.env.local` in the project root, then restart Vite. This file is ignored by Git.

## Using the app

Open **Profile → Google account & Drive backup**, connect Google Drive, and choose **Sync this device to Drive**. To load that backup on another device, open the app there, connect the same Google account, and choose **Restore from Drive**. Restore replaces the current device's app data, so make a local JSON backup first if needed.

Google access tokens stay in app memory only and are cleared when the app session ends. You will need to connect again after reopening the app. Drive access is limited to this app's hidden data folder. The hidden folder is not visible in the normal Drive file list; remove Solo Leveling's access from your Google Account security settings to revoke it.

Netlify configuration is in place and the production site was rebuilt and redeployed on 10 November 2026. Google OAuth remains in testing mode, so each account that will connect must be listed as a test user until the app is published.

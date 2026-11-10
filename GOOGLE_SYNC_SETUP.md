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
6. In Netlify, open **Project configuration → Environment variables** and add `VITE_GOOGLE_CLIENT_ID` with that client ID. Trigger a production deploy after saving it.
7. For local development, add the same value to `.env.local` in the project root, then restart Vite.

## Using the app

Open **Profile → Google account & Drive backup**, connect Google Drive, and choose **Sync this device to Drive**. To load that backup on another device, open the app there, connect the same Google account, and choose **Restore from Drive**. Restore replaces the current device's app data, so make a local JSON backup first if needed.

Google access tokens stay in app memory only and are cleared when the app session ends. You will need to connect again after reopening the app. Drive access is limited to this app's hidden data folder. The hidden folder is not visible in the normal Drive file list; remove Solo Leveling's access from your Google Account security settings to revoke it.

This client ID is currently not configured in Netlify, so the UI will show setup instructions until the environment variable is added and the site is redeployed.

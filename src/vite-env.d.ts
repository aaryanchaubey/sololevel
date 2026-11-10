/// <reference types="vite-plugin-pwa/client" />
interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
  readonly VITE_COMMUNITY_ADMIN_LOGIN_ID?: string;
  readonly VITE_COMMUNITY_ADMIN_EMAIL?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

import { getApp, getApps, initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from "firebase/auth";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseAuthIsConfigured = Object.values(config).every(Boolean);

const firebaseApp = firebaseAuthIsConfigured
  ? getApps().length
    ? getApp()
    : initializeApp(config)
  : undefined;

export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : undefined;

export function listenForGoogleUser(callback: (user: User | null) => void) {
  if (!firebaseAuth) return () => undefined;
  return onAuthStateChanged(firebaseAuth, callback);
}

export async function signInWithGoogle() {
  if (!firebaseAuth) {
    throw new Error(
      "Google login is not configured yet. Set the Firebase web app values and redeploy.",
    );
  }

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    await signInWithRedirect(firebaseAuth, provider);
    return;
  }
  await signInWithPopup(firebaseAuth, provider);
}

export async function signOutGoogle() {
  if (firebaseAuth) await signOut(firebaseAuth);
}

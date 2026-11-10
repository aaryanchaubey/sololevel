import { getApp, getApps, initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  type User,
} from "firebase/auth";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseAuthIsConfigured = Object.values(config).every(Boolean);

export const firebaseApp = firebaseAuthIsConfigured
  ? getApps().length
    ? getApp()
    : initializeApp(config)
  : undefined;

export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : undefined;
export const firebaseAdminApp = firebaseAuthIsConfigured
  ? (getApps().find((app) => app.name === "community-admin") ??
    initializeApp(config, "community-admin"))
  : undefined;
export const firebaseAdminAuth = firebaseAdminApp
  ? getAuth(firebaseAdminApp)
  : undefined;

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
  // Keep mobile and installed-PWA sign-in in the same browsing context. The
  // redirect helper uses cross-site storage that modern mobile browsers may
  // partition or block when the app is hosted outside Firebase Hosting.
  await signInWithPopup(firebaseAuth, provider);
}

export async function signOutGoogle() {
  if (firebaseAuth) await signOut(firebaseAuth);
}

export function listenForAdminUser(callback: (user: User | null) => void) {
  if (!firebaseAdminAuth) return () => undefined;
  return onAuthStateChanged(firebaseAdminAuth, async (user) => {
    if (!user || !firebaseAdminApp) {
      callback(null);
      return;
    }
    try {
      const { doc, getDoc, getFirestore } = await import("firebase/firestore");
      const allowed = await getDoc(
        doc(getFirestore(firebaseAdminApp), "communityAdmins", user.uid),
      );
      if (allowed.exists()) callback(user);
      else {
        await signOut(firebaseAdminAuth);
        callback(null);
      }
    } catch {
      await signOut(firebaseAdminAuth);
      callback(null);
    }
  });
}

export async function signInCommunityAdmin(loginId: string, password: string) {
  if (!firebaseAdminAuth || !firebaseAdminApp)
    throw new Error("Firebase admin login is not configured.");
  const expectedId =
    import.meta.env.VITE_COMMUNITY_ADMIN_LOGIN_ID || "aaryanchaubey";
  const email = import.meta.env.VITE_COMMUNITY_ADMIN_EMAIL;
  if (loginId.trim().toLowerCase() !== expectedId.trim().toLowerCase())
    throw new Error("Admin ID was not recognized.");
  if (!email)
    throw new Error(
      "Set VITE_COMMUNITY_ADMIN_EMAIL to the Firebase Auth email for the admin account, then rebuild the app.",
    );
  const credential = await signInWithEmailAndPassword(
    firebaseAdminAuth,
    email,
    password,
  );
  const { doc, getDoc, getFirestore } = await import("firebase/firestore");
  try {
    const allowed = await getDoc(
      doc(
        getFirestore(firebaseAdminApp),
        "communityAdmins",
        credential.user.uid,
      ),
    );
    if (allowed.exists()) return credential.user;
    await signOut(firebaseAdminAuth);
    throw new Error(
      "This Firebase Auth user is not in the community admin allowlist.",
    );
  } catch (error) {
    await signOut(firebaseAdminAuth);
    throw error;
  }
}

export async function signOutCommunityAdmin() {
  if (firebaseAdminAuth) await signOut(firebaseAdminAuth);
}

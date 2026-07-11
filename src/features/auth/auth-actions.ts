import {
  GoogleSignin,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

import { auth, db } from '@/lib/firebase';

// The OAuth "Web client" ID from the Firebase project (Authentication → Google provider).
// Native Google Sign-In exchanges this for an ID token that Firebase accepts.
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

/** Creates the Firestore user profile doc if this is the account's first sign-in. */
async function ensureUserDoc(user: User): Promise<void> {
  const ref = doc(db, 'users', user.uid);
  const snapshot = await getDoc(ref);
  if (snapshot.exists()) return;
  await setDoc(ref, {
    displayName: user.displayName ?? user.email ?? 'Anonymous',
    avatarUrl: user.photoURL ?? null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    createdAt: serverTimestamp(),
  });
}

export async function signUp(email: string, password: string, displayName: string): Promise<void> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  await setDoc(doc(db, 'users', credential.user.uid), {
    displayName,
    avatarUrl: credential.user.photoURL ?? null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    createdAt: serverTimestamp(),
  });
}

export async function signIn(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password);
}

/**
 * Native Google Sign-In → Firebase. Resolves `false` if the user dismisses the
 * account picker, `true` once Firebase auth completes.
 */
export async function signInWithGoogle(): Promise<boolean> {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();
  if (!isSuccessResponse(response)) return false; // user cancelled the picker

  const { idToken } = response.data;
  if (!idToken) throw new Error('Google sign-in did not return an ID token.');

  const credential = GoogleAuthProvider.credential(idToken);
  const { user } = await signInWithCredential(auth, credential);
  await ensureUserDoc(user);
  return true;
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function signOutUser(): Promise<void> {
  await GoogleSignin.signOut().catch(() => {}); // clear cached Google account; ignore if not signed in via Google
  await signOut(auth);
}

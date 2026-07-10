import { statusCodes } from '@react-native-google-signin/google-signin';

const MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'That email address looks invalid.',
  'auth/email-already-in-use': 'An account already exists with that email.',
  'auth/weak-password': 'Password should be at least 6 characters.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/user-not-found': 'Incorrect email or password.',
  'auth/wrong-password': 'Incorrect email or password.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/account-exists-with-different-credential':
    'An account already exists with this email. Sign in with your original method first.',
  // Native Google Sign-In status codes
  [statusCodes.PLAY_SERVICES_NOT_AVAILABLE]: 'Google Play Services is unavailable or needs an update.',
  [statusCodes.IN_PROGRESS]: 'A sign-in is already in progress.',
  '10': "Google sign-in isn't configured correctly. Check the SHA-1 and web client ID in Firebase.", // Android DEVELOPER_ERROR
};

export function friendlyAuthError(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
  return MESSAGES[code] ?? 'Something went wrong. Please try again.';
}

const env = import.meta.env

/**
 * Firebase web config. These are public identifiers, not secrets: the
 * Firestore rules decide who can read what. VITE_FIREBASE_* variables
 * override them (e.g. to point at the local emulators).
 */
export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyA-nP3QIAcqfoLDYI5xuYPeNgU0usFMZd8',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'practicehangul-58835.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'practicehangul-58835',
  appId: env.VITE_FIREBASE_APP_ID || '1:1046059406372:web:bd00b76fd083aba37234b1',
}

/** Talk to the local Firebase emulators instead of the real project. */
export const firebaseEmulators = env.VITE_FIREBASE_EMULATORS === 'true'

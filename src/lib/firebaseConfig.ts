const env = import.meta.env

/** Firebase web config, or null until the VITE_FIREBASE_* variables are set (see README). */
export const firebaseConfig =
  env.VITE_FIREBASE_API_KEY &&
  env.VITE_FIREBASE_AUTH_DOMAIN &&
  env.VITE_FIREBASE_PROJECT_ID &&
  env.VITE_FIREBASE_APP_ID
    ? {
        apiKey: env.VITE_FIREBASE_API_KEY,
        authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: env.VITE_FIREBASE_PROJECT_ID,
        appId: env.VITE_FIREBASE_APP_ID,
      }
    : null

/** Talk to the local Firebase emulators instead of the real project. */
export const firebaseEmulators = env.VITE_FIREBASE_EMULATORS === 'true'

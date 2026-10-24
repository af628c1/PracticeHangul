# Practice Hangul

Learn to read Korean: bite-size lessons that teach every letter with memory tricks, then
letter and word drills, streaks, and progress tracking.

Live: https://practicehangul.com

## Development

```sh
npm install
npm run dev
```

## Accounts & cloud save

Sign-in (Google or email) and cloud saving use the Firebase project `practicehangul-58835`,
whose web config lives in [`src/lib/firebaseConfig.ts`](src/lib/firebaseConfig.ts). The
project needs:

1. **Authentication → Sign-in method**: **Google** and **Email/Password** enabled.
2. **Authentication → Settings → Authorized domains**: `practicehangul.com` and `www.practicehangul.com` added.
3. **Firestore Database** created (production mode), with the contents of
   [`firestore.rules`](firestore.rules) published in its **Rules** tab.

`VITE_FIREBASE_*` variables (see `.env.example`) override the built-in config.
These are public identifiers, not secrets: the Firestore rules make sure each learner can
only read and write their own data.

### What gets saved

- Day streak (current and longest) and best answers-in-a-row streak
- Total answers, accuracy, and finished sessions
- Results for every letter and word (new, learning, tricky, mastered)
- Daily activity and the last 20 sessions
- Practice settings (letter categories, word difficulty, question count)
- Finished Learn lessons and their best scores

Guest progress stays in the browser and moves into the account on first sign-in.
Signed-in progress is stored in Firestore at `users/{uid}`, cached locally so practice
keeps working offline, and merged when the device reconnects.

### Local emulators (optional)

```sh
npx firebase-tools emulators:start --only auth,firestore --project demo-practice-hangul
```

Then run `npm run dev` with this `.env.local`:

```sh
VITE_FIREBASE_API_KEY=demo-key
VITE_FIREBASE_AUTH_DOMAIN=demo-practice-hangul.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=demo-practice-hangul
VITE_FIREBASE_APP_ID=demo-app
VITE_FIREBASE_EMULATORS=true
```

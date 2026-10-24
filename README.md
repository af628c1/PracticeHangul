# Practice Hangul

Learn to read Korean with quick letter and word drills, streaks, and progress tracking.

Live: https://af628c1.github.io/PracticeHangul/

## Development

```sh
npm install
npm run dev
```

## Accounts & cloud save

Without any setup the app works as a guest app and saves progress in the browser. To turn on
sign-in (Google or email) and cloud saving, connect a free Firebase project:

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com),
   then add a **Web app** and note its `apiKey`, `authDomain`, `projectId` and `appId`.
2. **Authentication → Sign-in method**: enable **Google** and **Email/Password**.
3. **Authentication → Settings → Authorized domains**: add `af628c1.github.io`.
4. **Firestore Database → Create database** (production mode). In its **Rules** tab, paste
   the contents of [`firestore.rules`](firestore.rules) and publish.
5. On GitHub, go to **Settings → Secrets and variables → Actions → Variables** and add
   `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID` and
   `VITE_FIREBASE_APP_ID`. Then re-run the **Deploy to GitHub Pages** workflow.

For local development, copy `.env.example` to `.env.local` and fill in the same values.
These are public identifiers, not secrets: the Firestore rules make sure each learner can
only read and write their own data.

### What gets saved

- Day streak (current and longest) and best answers-in-a-row streak
- Total answers, accuracy, and finished sessions
- Results for every letter and word (new, learning, tricky, mastered)
- Daily activity and the last 20 sessions
- Practice settings (letter categories, word difficulty, question count)

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

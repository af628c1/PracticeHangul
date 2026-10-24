// Loaded on demand (dynamic import) so analytics stays out of the main bundle.
import { initializeAnalytics, isSupported, logEvent, type Analytics } from 'firebase/analytics'
import { app } from './firebase'

// Page views are sent by hand, since the router lives in the URL hash
const analytics: Promise<Analytics | null> = isSupported()
  .then((ok) => (ok ? initializeAnalytics(app, { config: { send_page_view: false } }) : null))
  .catch(() => null)

export function log(name: string, params?: Record<string, string | number>) {
  void analytics.then((a) => {
    if (a) logEvent(a, name, params)
  })
}

import { Outlet, Link } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-hangul-text no-underline hover:text-hangul-accent transition-colors">
            Practice Hangul
          </Link>
          <Link
            to="/"
            className="text-sm text-hangul-muted hover:text-hangul-accent transition-colors no-underline"
          >
            Home
          </Link>
        </div>
      </header>
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4 text-center text-sm text-hangul-muted">
          Practice Hangul — Learn Korean Letters
        </div>
      </footer>
    </div>
  )
}

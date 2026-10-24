import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { track } from '../lib/track'

export default function Layout() {
  const { pathname } = useLocation()

  useEffect(() => {
    track('page_view', {
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
    })
  }, [pathname])

  return (
    <div className="min-h-screen flex flex-col bg-paper-warm">
      <Outlet />
    </div>
  )
}

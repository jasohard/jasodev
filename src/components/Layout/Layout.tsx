import { Link, Outlet, useLocation } from 'react-router-dom'
import styles from './Layout.module.css'

export default function Layout() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <Link to="/" className={styles.logo} aria-label="jasodev home">
            <span className={styles.logoIcon} aria-hidden="true">
              <svg viewBox="0 0 32 32" width="28" height="28">
                <rect width="32" height="32" rx="6" fill="var(--color-accent)" />
                <text
                  x="16"
                  y="23"
                  textAnchor="middle"
                  fontFamily="monospace"
                  fontSize="18"
                  fontWeight="bold"
                  fill="#fff"
                >
                  j
                </text>
              </svg>
            </span>
            <span className={styles.logoText}>jasodev</span>
          </Link>

          {!isHome && (
            <Link to="/" className={styles.backLink}>
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>All Games</span>
            </Link>
          )}
        </nav>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}

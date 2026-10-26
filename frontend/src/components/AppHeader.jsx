function AppHeader({
  currentUser,
  currentView,
  onOpenAuth,
  onLogout,
  onNavigateHome,
  onNavigateDashboard,
  onNavigateBilling
}) {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="header-brand-group">
          <button
            type="button"
            className="brand brand-btn"
            onClick={currentUser ? onNavigateDashboard : onNavigateHome}
            aria-label="BusinessFlow AI home"
          >
            <span className="brand-mark" aria-hidden="true">✳</span>
            <span>BusinessFlow AI</span>
          </button>
          <span className="header-tagline">
            A smarter way to move forward.
          </span>
        </div>

        <nav className="header-actions" aria-label="Account and navigation">
          {currentUser ? (
            <div className="header-user-menu">
              <button
                type="button"
                className={`header-nav-link ${currentView === "dashboard" ? "active-link" : ""}`}
                onClick={onNavigateDashboard}
              >
                Dashboard
              </button>

              <button
                type="button"
                className={`header-nav-link ${currentView === "landing" ? "active-link" : ""}`}
                onClick={onNavigateHome}
              >
                Explore Services
              </button>

              <div className="header-user-chip">
                <span className="header-user-dot" aria-hidden="true" />
                <span className="header-user-name">{currentUser.name}</span>
              </div>

              <button
                type="button"
                className="header-logout-btn"
                onClick={onLogout}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="header-guest-menu">
              <button
                type="button"
                className="header-nav-link"
                onClick={onNavigateHome}
              >
                Explore Services
              </button>

              <button
                type="button"
                className="header-login-btn"
                onClick={() => onOpenAuth("login")}
              >
                Sign In
              </button>

              <button
                type="button"
                className="header-register-btn"
                onClick={() => onOpenAuth("register")}
              >
                Get Started
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

export default AppHeader;

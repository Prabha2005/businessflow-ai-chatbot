import { useState } from "react";
import { SERVICE_CATALOG } from "../services/serviceCatalog";

function DashboardView({
  user,
  currentUser,
  activeSubscriptions = [],
  loading = false,
  error = "",
  onRetry,
  onSelectService,
  onOpenChatWithPrompt,
  onLogout,
  onExploreServicesCatalog,
  onNavigateCatalog
}) {
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "subscriptions" | "billing" | "offers" | "settings"

  const activeUser = user || currentUser;
  const handleExplore = onExploreServicesCatalog || onNavigateCatalog;

  // 1. Loading State
  if (loading) {
    return (
      <div className="dashboard-container" aria-busy="true">
        <div className="dashboard-state-card dashboard-loading-card">
          <div className="dashboard-spinner" aria-hidden="true" />
          <h2>Loading your customer dashboard...</h2>
          <p>Retrieving your account details and demonstration subscriptions.</p>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="dashboard-container" role="alert">
        <div className="dashboard-state-card dashboard-error-card">
          <span className="state-icon" aria-hidden="true">⚠</span>
          <h2>Unable to Load Dashboard</h2>
          <p>{error}</p>
          {onRetry && (
            <button
              type="button"
              className="btn-dash-primary"
              onClick={onRetry}
            >
              Retry Loading
            </button>
          )}
        </div>
      </div>
    );
  }

  // 3. Fallback if no user is authenticated (Never return blank screen)
  if (!activeUser) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-state-card">
          <span className="state-icon" aria-hidden="true">🔒</span>
          <h2>Authentication Required</h2>
          <p>Please sign in or create an account to access your customer dashboard.</p>
          <button
            type="button"
            className="btn-dash-primary"
            onClick={() => {
              window.location.hash = "login";
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const formattedDate = activeUser.created_at
    ? new Date(activeUser.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Recently registered";

  const hasSubscriptions = Array.isArray(activeSubscriptions) && activeSubscriptions.length > 0;

  return (
    <div className="dashboard-container" aria-labelledby="dashboard-heading">
      {/* Dashboard Top Header */}
      <header className="dashboard-header-area">
        <div className="dashboard-welcome-col">
          <div className="dashboard-kicker">CUSTOMER PORTAL</div>
          <h1 id="dashboard-heading" className="dashboard-main-title">
            Welcome, {activeUser.name}
          </h1>
          <p className="dashboard-subtext">
            Monitor your cloud infrastructure, inspect service subscriptions, and review real-time usage metrics.
          </p>
        </div>

        <div className="dashboard-user-card">
          <div className="dash-avatar-circle" aria-hidden="true">
            {activeUser.name ? activeUser.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <span className="dash-user-name">{activeUser.name}</span>
            <span className="dash-user-email">{activeUser.email}</span>
            <span className="dash-reg-date">Member since: {formattedDate}</span>
          </div>
        </div>
      </header>

      {/* Dashboard Navigation Tabs */}
      <nav className="dashboard-tabs-nav" aria-label="Dashboard views">
        <button
          type="button"
          className={`dash-tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          type="button"
          className={`dash-tab-btn ${activeTab === "subscriptions" ? "active" : ""}`}
          onClick={() => setActiveTab("subscriptions")}
        >
          My Subscriptions {hasSubscriptions && `(${activeSubscriptions.length})`}
        </button>
        <button
          type="button"
          className={`dash-tab-btn ${activeTab === "billing" ? "active" : ""}`}
          onClick={() => setActiveTab("billing")}
        >
          Usage & Billing
        </button>
        <button
          type="button"
          className={`dash-tab-btn ${activeTab === "offers" ? "active" : ""}`}
          onClick={() => setActiveTab("offers")}
        >
          Special Offers
        </button>
        <button
          type="button"
          className={`dash-tab-btn ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          Account Settings
        </button>
      </nav>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="dashboard-tab-content">
          {/* Active Subscriptions Banner or Empty State Notice */}
          {!hasSubscriptions ? (
            <div className="new-customer-banner">
              <div className="banner-icon" aria-hidden="true">○</div>
              <div className="banner-text">
                <h3>No Active Service Subscriptions</h3>
                <p>
                  You are registered on BusinessFlow AI, but you have not subscribed to any cloud services yet. Registration does not automatically assign paid plans. Explore our published service tiers below and view details to get started.
                </p>
                {handleExplore && (
                  <button
                    type="button"
                    className="btn-dash-primary mt-3"
                    onClick={handleExplore}
                  >
                    Explore Available Services →
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="active-customer-banner">
              <div className="banner-icon-active" aria-hidden="true">✓</div>
              <div className="banner-text">
                <h3>Active Subscriptions ({activeSubscriptions.length})</h3>
                <p>
                  You have active demonstration subscriptions. Review your resource allocations, next renewal dates, or manage service tiers.
                </p>
              </div>
            </div>
          )}

          {/* Subscribed Services Summary (if any) */}
          {hasSubscriptions && (
            <section className="dashboard-section-block">
              <div className="block-title-row">
                <h2>Your Subscribed Cloud Services</h2>
                <span className="demo-label-chip">ACTIVE DEMO PLANS</span>
              </div>

              <div className="subscribed-cards-grid">
                {activeSubscriptions.map((sub) => {
                  const serviceMeta = SERVICE_CATALOG.find(
                    (s) => s.id === sub.service_id || s.slug === sub.slug
                  );

                  return (
                    <article key={sub.service_id || sub.id} className="active-sub-card">
                      <div className="active-sub-header">
                        <span className="active-sub-tag">Active Subscription</span>
                        <span className="active-sub-renew">Renews: {sub.renewal_date}</span>
                      </div>
                      <h3>{sub.service_name}</h3>
                      <p className="active-sub-plan">
                        Plan: <strong>{sub.plan_name}</strong> • {sub.price_display} / {sub.billing_cycle}
                      </p>

                      {serviceMeta && (
                        <div className="active-sub-usage-snippet">
                          <span className="mini-metric-label">{serviceMeta.demo_usage.metric_name}:</span>
                          <span className="mini-metric-val">
                            {serviceMeta.demo_usage.used} {serviceMeta.demo_usage.unit} used (Simulated Demo)
                          </span>
                        </div>
                      )}

                      <div className="active-sub-actions">
                        <button
                          type="button"
                          className="btn-dash-primary"
                          onClick={() => onSelectService(serviceMeta?.slug || sub.service_id)}
                        >
                          View More Details →
                        </button>
                        <button
                          type="button"
                          className="btn-dash-secondary"
                          onClick={() => setActiveTab("billing")}
                        >
                          Check Usage
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {/* Published Catalog Service Cards (All 3 Services) */}
          <section className="dashboard-section-block">
            <div className="block-title-row">
              <div>
                <h2>Available Cloud Services</h2>
                <p className="block-subtitle">
                  Inspect our three published services with transparent pricing. Click "View More Details" to explore specific tier features and specifications.
                </p>
              </div>
            </div>

            <div className="catalog-cards-grid">
              {SERVICE_CATALOG.map((service) => {
                const isSubscribed = activeSubscriptions.some(
                  (s) => s.service_id === service.id
                );

                return (
                  <article key={service.id} className="catalog-service-card">
                    <div className="catalog-card-top">
                      <span className="catalog-badge">{service.badge}</span>
                      {isSubscribed && (
                        <span className="sub-status-pill">Subscribed (Demo)</span>
                      )}
                    </div>

                    <h3 className="catalog-card-name">{service.name}</h3>
                    <p className="catalog-card-desc">{service.short_description || service.description}</p>

                    <div className="catalog-card-price-box">
                      <span className="catalog-price-val">{service.price_display}</span>
                      <span className="catalog-price-term">per {service.renewal_period.toLowerCase()}</span>
                    </div>

                    <ul className="catalog-features-mini">
                      {service.features.slice(0, 3).map((feat, i) => (
                        <li key={i}>
                          <span className="check-bullet" aria-hidden="true">✓</span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="catalog-card-footer">
                      <button
                        type="button"
                        className="btn-view-details"
                        onClick={() => onSelectService(service.slug)}
                      >
                        View More Details →
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: MY SUBSCRIPTIONS */}
      {activeTab === "subscriptions" && (
        <div className="dashboard-tab-content">
          <div className="block-title-row">
            <div>
              <h2>Subscription Management</h2>
              <p className="block-subtitle">
                Overview of current cloud service allocations, billing cycles, and renewal timelines.
              </p>
            </div>
            <span className="demo-label-chip">DEMO ENVIRONMENT</span>
          </div>

          {!hasSubscriptions ? (
            <div className="empty-subscriptions-box">
              <div className="empty-icon" aria-hidden="true">📋</div>
              <h3>You have not subscribed to any plans yet</h3>
              <p>
                Browse our catalog of Web Hosting, Cloud Storage, and Email Service to review specifications and initiate a demonstration subscription.
              </p>
              <button
                type="button"
                className="btn-dash-primary"
                onClick={handleExplore || (() => setActiveTab("overview"))}
              >
                Browse Available Services
              </button>
            </div>
          ) : (
            <div className="subscriptions-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Service Name</th>
                    <th>Plan Tier</th>
                    <th>Billing Cycle</th>
                    <th>Published Price</th>
                    <th>Status</th>
                    <th>Renewal Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeSubscriptions.map((sub) => {
                    const serviceMeta = SERVICE_CATALOG.find(
                      (s) => s.id === sub.service_id || s.slug === sub.slug
                    );

                    return (
                      <tr key={sub.service_id || sub.id}>
                        <td className="font-bold">{sub.service_name}</td>
                        <td>{sub.plan_name}</td>
                        <td>{sub.billing_cycle}</td>
                        <td className="font-bold">{sub.price_display}</td>
                        <td>
                          <span className="status-pill status-active">Active (Demo)</span>
                        </td>
                        <td>{sub.renewal_date}</td>
                        <td>
                          <button
                            type="button"
                            className="table-action-link"
                            onClick={() => onSelectService(serviceMeta?.slug || sub.service_id)}
                          >
                            Manage Plan →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: USAGE & BILLING */}
      {activeTab === "billing" && (
        <div className="dashboard-tab-content">
          <div className="block-title-row">
            <div>
              <h2>Resource Utilization & Quotas</h2>
              <p className="block-subtitle">
                Inspect resource utilization, fixed recurring subscriptions, and pay-as-you-go calculation rules.
              </p>
            </div>
            <span className="demo-label-chip">SIMULATED DATA • DEMO</span>
          </div>

          {/* Usage Metrics Breakdown */}
          <div className="usage-metrics-grid">
            {SERVICE_CATALOG.map((service) => {
              const isSub = activeSubscriptions.some((s) => s.service_id === service.id);

              return (
                <div key={service.id} className="metric-card">
                  <div className="metric-card-top">
                    <span className="metric-svc-name">{service.name}</span>
                    <span className="metric-badge">
                      {isSub ? "Active Sub (Demo)" : "Catalog Baseline"}
                    </span>
                  </div>

                  <h4>{service.demo_usage.metric_name}</h4>
                  <div className="metric-numbers">
                    <span className="num-used">{service.demo_usage.used}</span>
                    <span className="num-limit">/ {service.demo_usage.limit} {service.demo_usage.unit}</span>
                  </div>

                  <div className="metric-bar-track">
                    <div
                      className="metric-bar-fill"
                      style={{ width: `${service.demo_usage.percentage}%` }}
                    />
                  </div>

                  <p className="metric-rule-text">
                    <strong>Billing Rule:</strong> {service.demo_usage.pay_as_you_go_rule}
                  </p>

                  <button
                    type="button"
                    className="metric-drilldown-btn"
                    onClick={() => onSelectService(service.slug)}
                  >
                    View Details & Rates →
                  </button>
                </div>
              );
            })}
          </div>

          {/* Sample Billing & Invoices Table */}
          <section className="billing-invoices-section">
            <h3>Recent Sample Invoices (Demo)</h3>
            <div className="subscriptions-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Invoice No</th>
                    <th>Date</th>
                    <th>Service Description</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-mono">INV-WH-2026-001</td>
                    <td>2026-10-01</td>
                    <td>Web Hosting - Starter Annual Plan</td>
                    <td>Fixed Subscription</td>
                    <td className="font-bold">₹800</td>
                    <td><span className="status-pill status-paid">Paid (Demo)</span></td>
                  </tr>
                  <tr>
                    <td className="font-mono">INV-CS-2026-002</td>
                    <td>2026-09-15</td>
                    <td>Cloud Storage - Essential 50 GB Plan</td>
                    <td>Fixed Subscription</td>
                    <td className="font-bold">₹900</td>
                    <td><span className="status-pill status-paid">Paid (Demo)</span></td>
                  </tr>
                  <tr>
                    <td className="font-mono">INV-ES-2026-003</td>
                    <td>2026-10-10</td>
                    <td>Email Service - Professional Inboxes</td>
                    <td>Monthly Subscription</td>
                    <td className="font-bold">₹400</td>
                    <td><span className="status-pill status-paid">Paid (Demo)</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* TAB 4: SPECIAL OFFERS */}
      {activeTab === "offers" && (
        <div className="dashboard-tab-content">
          <div className="block-title-row">
            <div>
              <h2>Current Service Promotions & Bundles</h2>
              <p className="block-subtitle">
                Exclusive offers available across Web Hosting, Cloud Storage, and Email Service.
              </p>
            </div>
          </div>

          <div className="dashboard-offers-grid">
            <div className="dash-offer-box">
              <div className="offer-tag">HOSTING PROMO</div>
              <h3>Multi-Year Hosting Saver</h3>
              <p>Commit to a 2-year Web Hosting plan at ₹800/year and receive free domain renewal and priority DNS.</p>
              <button
                type="button"
                className="btn-dash-primary"
                onClick={() => onSelectService("web-hosting")}
              >
                Explore Hosting Details →
              </button>
            </div>

            <div className="dash-offer-box">
              <div className="offer-tag">STORAGE BUNDLE</div>
              <h3>Early Cloud Adopter Bonus</h3>
              <p>Subscribe to Cloud Storage at ₹900/year and receive 10 GB complimentary encrypted backup storage.</p>
              <button
                type="button"
                className="btn-dash-primary"
                onClick={() => onSelectService("cloud-storage")}
              >
                Explore Storage Details →
              </button>
            </div>

            <div className="dash-offer-box">
              <div className="offer-tag">COMMUNICATION</div>
              <h3>Annual Email Plan Discount</h3>
              <p>Switch from ₹400/month to an annual billing schedule to get 2 full months included at no cost.</p>
              <button
                type="button"
                className="btn-dash-primary"
                onClick={() => onSelectService("email-service")}
              >
                Explore Email Details →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ACCOUNT SETTINGS */}
      {activeTab === "settings" && (
        <div className="dashboard-tab-content">
          <div className="block-title-row">
            <div>
              <h2>Account Settings & Profile</h2>
              <p className="block-subtitle">
                Manage your credentials and authenticated session preferences.
              </p>
            </div>
          </div>

          <div className="settings-cards-grid">
            <div className="settings-card">
              <h3>Profile Information</h3>
              <div className="settings-field">
                <span className="field-lbl">Full Name:</span>
                <span className="field-val">{activeUser.name}</span>
              </div>
              <div className="settings-field">
                <span className="field-lbl">Registered Email:</span>
                <span className="field-val">{activeUser.email}</span>
              </div>
              <div className="settings-field">
                <span className="field-lbl">Customer Account ID:</span>
                <span className="field-val font-mono">#{activeUser.id}</span>
              </div>
              <div className="settings-field">
                <span className="field-lbl">Member Since:</span>
                <span className="field-val">{formattedDate}</span>
              </div>
            </div>

            <div className="settings-card">
              <h3>Security & Session</h3>
              <p className="settings-note">
                Your session is authenticated via secure HTTP cookies directly against the PHP backend with session fixation protection.
              </p>
              {onLogout && (
                <div className="settings-actions">
                  <button
                    type="button"
                    className="btn-signout-danger"
                    onClick={onLogout}
                  >
                    Sign Out of Account
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardView;

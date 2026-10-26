import { useState } from "react";

function ServiceDetailPage({
  service,
  currentUser,
  activeSubscriptions = [],
  onSubscribeDemo,
  onOpenChatWithPrompt,
  onNavigateBack,
  onNavigateAuth
}) {
  const [selectedPlan, setSelectedPlan] = useState(
    service?.plans?.[0] || null
  );
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!service) {
    return (
      <div className="service-detail-container">
        <div className="service-not-found">
          <h2>Service Not Found</h2>
          <p>The requested business service could not be located.</p>
          <button type="button" className="btn-primary" onClick={onNavigateBack}>
            ← Return to Services
          </button>
        </div>
      </div>
    );
  }

  // Active subscription is ONLY relevant when a user is authenticated
  const activeSub = currentUser
    ? activeSubscriptions.find((sub) => sub.service_id === service.id)
    : null;

  function handleInitiateSubscribe(plan) {
    if (!currentUser) {
      onNavigateAuth("login");
      return;
    }
    setSelectedPlan(plan);
    setShowConfirmModal(true);
  }

  async function handleConfirmSubscription() {
    if (selectedPlan && !submitting) {
      setSubmitting(true);
      try {
        await onSubscribeDemo(service, selectedPlan);
        setShowConfirmModal(false);
      } catch (err) {
        console.error("Subscription confirmation error:", err);
      } finally {
        setSubmitting(false);
      }
    }
  }

  return (
    <div className="service-detail-page">
      {/* Breadcrumb / Top Navigation */}
      <nav className="detail-breadcrumbs" aria-label="Breadcrumb">
        <button
          type="button"
          className="crumb-link"
          onClick={onNavigateBack}
        >
          ← Back to Catalog
        </button>
        <span className="crumb-separator" aria-hidden="true">/</span>
        <span className="crumb-current">{service.name}</span>
      </nav>

      {/* Hero Header */}
      <header className="service-hero-header">
        <div className="service-meta-top">
          <span className="service-badge-pill">{service.badge}</span>
          <span className="service-category-tag">{service.category}</span>
        </div>

        <h1 className="service-hero-title">{service.name}</h1>
        <p className="service-hero-desc">{service.description}</p>

        <div className="service-key-bar">
          <div className="key-stat">
            <span className="stat-label">Published Base Price</span>
            <span className="stat-value price-highlight">
              {service.price_display}{" "}
              <span className="stat-cycle">/ {service.renewal_period.toLowerCase()}</span>
            </span>
          </div>

          <div className="key-stat">
            <span className="stat-label">Subscription Status</span>
            {currentUser && activeSub ? (
              <span className="stat-value status-subscribed">
                <span className="dot-pulse" aria-hidden="true" />
                Active Plan ({activeSub.plan_name} - Demo)
              </span>
            ) : currentUser ? (
              <span className="stat-value status-unsubscribed">
                ○ No Plan Selected
              </span>
            ) : (
              <span className="stat-value status-unsubscribed">
                ○ Not Signed In
              </span>
            )}
          </div>

          <div className="service-header-actions">
            <button
              type="button"
              className="btn-chat-prompt"
              onClick={() =>
                onOpenChatWithPrompt(`Can you explain the key benefits and pricing of ${service.name}?`)
              }
            >
              ✦ Ask AI About This Service
            </button>
          </div>
        </div>
      </header>

      {/* Plan Comparison Section */}
      <section className="detail-section plans-section">
        <div className="section-title-wrap">
          <span className="section-eyebrow">TRANSPARENT PLANS</span>
          <h2>Explore Available Tiers</h2>
          <p>
            Choose the tier that aligns with your operational requirements. The base published price is preserved as our entry tier.
          </p>
        </div>

        <div className="plans-cards-grid">
          {service.plans.map((plan) => {
            const isPlanActive = Boolean(
              currentUser && activeSub && activeSub.plan_id === plan.id
            );

            return (
              <article
                key={plan.id}
                className={`plan-card ${plan.is_default ? "featured-plan" : ""} ${
                  isPlanActive ? "current-active-plan" : ""
                }`}
              >
                {plan.is_default && (
                  <div className="featured-ribbon">CATALOG BASE</div>
                )}
                {isPlanActive && (
                  <div className="active-ribbon">YOUR CURRENT PLAN</div>
                )}

                <h3 className="plan-name">{plan.name}</h3>
                <p className="plan-desc">{plan.description}</p>

                <div className="plan-pricing">
                  <span className="plan-price-num">{plan.price_display}</span>
                  <span className="plan-period">per {plan.billing_cycle.toLowerCase()}</span>
                </div>

                <ul className="plan-specs-list">
                  {plan.specs.map((spec, i) => (
                    <li key={i}>
                      <span className="spec-check" aria-hidden="true">✓</span>
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  className={`plan-action-btn ${isPlanActive ? "btn-active-state" : "btn-select-plan"}`}
                  onClick={() => handleInitiateSubscribe(plan)}
                >
                  {isPlanActive
                    ? "Subscribed (Demo)"
                    : currentUser
                    ? `Select Plan (${plan.price_display})`
                    : "Sign in to Subscribe"}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      {/* Feature Capabilities Breakdown */}
      <section className="detail-section features-section">
        <div className="section-title-wrap">
          <span className="section-eyebrow">WHAT'S INCLUDED</span>
          <h2>Core Architectural Capabilities</h2>
        </div>

        <div className="features-caps-grid">
          {service.features.map((feat, i) => (
            <div key={i} className="feature-caps-item">
              <div className="feat-bullet" aria-hidden="true">✦</div>
              <span>{feat}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Usage Analytics Section (Clearly Labeled Demo Data) */}
      <section className="detail-section usage-section">
        <div className="section-title-wrap">
          <div className="demo-label-chip">SIMULATED USAGE • DEMO DATA</div>
          <h2>Live Resource Metrics</h2>
          <p>
            Real-time usage breakdown demonstrating quota tracking and pay-as-you-go calculation rules.
          </p>
        </div>

        <div className="usage-card">
          <div className="usage-stat-header">
            <div>
              <strong>{service.demo_usage.metric_name}</strong>
              <p className="usage-quota-text">
                {service.demo_usage.used} {service.demo_usage.unit} consumed of{" "}
                {service.demo_usage.limit} {service.demo_usage.unit} allocated
              </p>
            </div>
            <span className="usage-pct-badge">
              {service.demo_usage.percentage}% Allocated
            </span>
          </div>

          <div className="usage-progress-bar" role="progressbar" aria-valuenow={service.demo_usage.percentage} aria-valuemin="0" aria-valuemax="100">
            <div
              className="usage-progress-fill"
              style={{ width: `${service.demo_usage.percentage}%` }}
            />
          </div>

          <div className="usage-extra-stats">
            {service.demo_usage.uptime && (
              <div className="sub-stat">
                <span className="sub-stat-label">System Availability</span>
                <span className="sub-stat-val">{service.demo_usage.uptime}</span>
              </div>
            )}
            {service.demo_usage.requests_count && (
              <div className="sub-stat">
                <span className="sub-stat-label">HTTP Requests (30d)</span>
                <span className="sub-stat-val">{service.demo_usage.requests_count}</span>
              </div>
            )}
            {service.demo_usage.files_count && (
              <div className="sub-stat">
                <span className="sub-stat-label">Synchronized Objects</span>
                <span className="sub-stat-val">{service.demo_usage.files_count}</span>
              </div>
            )}
            {service.demo_usage.inboxes_active && (
              <div className="sub-stat">
                <span className="sub-stat-label">Configured Inboxes</span>
                <span className="sub-stat-val">{service.demo_usage.inboxes_active}</span>
              </div>
            )}
          </div>

          <div className="paygo-rule-box">
            <span className="paygo-icon" aria-hidden="true">ℹ</span>
            <div>
              <strong>Pay-As-You-Go Calculation Rule:</strong>
              <p>{service.demo_usage.pay_as_you_go_rule}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Available Offers Section */}
      {service.offers && service.offers.length > 0 && (
        <section className="detail-section offers-section">
          <div className="section-title-wrap">
            <span className="section-eyebrow">CURRENT PROMOTIONS</span>
            <h2>Exclusive Service Offers</h2>
          </div>

          <div className="offers-grid">
            {service.offers.map((offer, i) => (
              <div key={i} className="offer-banner-card">
                <div className="offer-discount-badge">{offer.discount}</div>
                <div>
                  <h3 className="offer-title">{offer.title}</h3>
                  <p className="offer-details">{offer.details}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Billing History (Clearly Labeled Demo Records) */}
      <section className="detail-section billing-section">
        <div className="section-title-wrap">
          <div className="demo-label-chip">SAMPLE INVOICES • DEMO DATA</div>
          <h2>Billing History & Invoices</h2>
        </div>

        <div className="billing-table-wrapper">
          <table className="billing-table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Billing Date</th>
                <th>Service Plan</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Renewal Date</th>
              </tr>
            </thead>
            <tbody>
              {service.demo_billing.map((inv) => (
                <tr key={inv.id}>
                  <td className="font-mono">{inv.id}</td>
                  <td>{inv.date}</td>
                  <td>{inv.item}</td>
                  <td className="font-bold">{inv.amount}</td>
                  <td>
                    <span className="status-pill status-paid">{inv.status}</span>
                  </td>
                  <td>{inv.renewal_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Subscription Workflow Confirmation Modal */}
      {showConfirmModal && selectedPlan && (
        <div
          className="auth-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget && !submitting) setShowConfirmModal(false);
          }}
        >
          <div className="auth-modal-card subscription-modal-card">
            <button
              type="button"
              className="auth-modal-close"
              onClick={() => setShowConfirmModal(false)}
              disabled={submitting}
            >
              ✕
            </button>

            <div className="subscription-modal-body">
              <span className="demo-label-chip">DEMO SUBSCRIPTION WORKFLOW</span>
              <h2 id="confirm-modal-title">Confirm Plan Selection</h2>
              <p className="modal-subtext">
                Review your selected service plan and billing details before confirming.
              </p>

              <div className="plan-summary-box">
                <div className="summary-row">
                  <span className="summary-label">Service</span>
                  <span className="summary-value font-bold">{service.name}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Selected Tier</span>
                  <span className="summary-value">{selectedPlan.name}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Billing Cycle</span>
                  <span className="summary-value">{selectedPlan.billing_cycle}</span>
                </div>
                <div className="summary-row total-row">
                  <span className="summary-label">Scheduled Amount</span>
                  <span className="summary-value price-highlight font-bold">
                    {selectedPlan.price_display}
                  </span>
                </div>
              </div>

              <div className="demo-notice-alert" role="status">
                <span className="notice-icon" aria-hidden="true">ℹ</span>
                <p>
                  <strong>Notice:</strong> This is an informational demonstration workflow. No payment gateway is connected, and no real credit card or bank charge will be incurred.
                </p>
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-modal-confirm"
                  onClick={handleConfirmSubscription}
                  disabled={submitting}
                >
                  {submitting ? "Saving Plan..." : "Confirm Demo Subscription"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ServiceDetailPage;

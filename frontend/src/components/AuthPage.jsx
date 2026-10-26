import { useState, useEffect } from "react";
import { registerUser, loginUser } from "../services/authApi";

function AuthPage({ initialMode = "login", onSuccess, onNavigateHome }) {
  const [mode, setMode] = useState(initialMode); // "login" | "register"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    setError("");
  }, [initialMode]);

  function switchMode(newMode) {
    setMode(newMode);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setSubmitting(true);

    try {
      if (mode === "register") {
        const trimmedName = name.trim();
        if (!trimmedName) {
          setError("Please enter your full name.");
          setSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setError("Password must be at least 6 characters long.");
          setSubmitting(false);
          return;
        }

        const response = await registerUser({
          name: trimmedName,
          email: trimmedEmail,
          password,
        });

        if (response && response.user) {
          onSuccess(response.user);
        }
      } else {
        const response = await loginUser({
          email: trimmedEmail,
          password,
        });

        if (response && response.user) {
          onSuccess(response.user);
        }
      }
    } catch (err) {
      setError(err.message || "Authentication failed. Please verify your credentials.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page-container">
      {/* Return home button */}
      <button
        type="button"
        className="auth-back-link"
        onClick={onNavigateHome}
        aria-label="Return to homepage"
      >
        ← Back to BusinessFlow
      </button>

      <div className="auth-split-wrapper">
        {/* Left Panel: Branding, Cloud Illustration, Value Proposition */}
        <div className="auth-brand-panel">
          <div className="auth-brand-header">
            <div className="auth-brand-logo">
              <span className="brand-mark">✳</span>
              <span className="brand-name">BusinessFlow AI</span>
            </div>
            <p className="auth-brand-tagline">
              A smarter way to manage your cloud services and move forward.
            </p>
          </div>

          {/* Cloud-related illustration */}
          <div className="auth-illustration-wrap" aria-hidden="true">
            <div className="cloud-graphic">
              <div className="cloud-node node-storage">
                <span className="node-icon">☁</span>
                <span className="node-label">Cloud Storage</span>
              </div>
              <div className="cloud-node node-hosting">
                <span className="node-icon">⚡</span>
                <span className="node-label">Web Hosting</span>
              </div>
              <div className="cloud-node node-email">
                <span className="node-icon">✉</span>
                <span className="node-label">Email Service</span>
              </div>
              <div className="cloud-center-orb">
                <span>AI</span>
              </div>
            </div>
          </div>

          {/* Platform Benefits */}
          <div className="auth-benefits-list">
            <div className="benefit-item">
              <span className="benefit-check" aria-hidden="true">✓</span>
              <div>
                <strong>Grounded Gemini AI Support</strong>
                <span>Intelligent advice based directly on our live service catalog.</span>
              </div>
            </div>

            <div className="benefit-item">
              <span className="benefit-check" aria-hidden="true">✓</span>
              <div>
                <strong>Transparent Published Pricing</strong>
                <span>Clear yearly and monthly terms with zero hidden fees.</span>
              </div>
            </div>

            <div className="benefit-item">
              <span className="benefit-check" aria-hidden="true">✓</span>
              <div>
                <strong>Self-Service Customer Portal</strong>
                <span>Explore plan details, inspect usage metrics, and simulate subscriptions.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Dedicated Authentication Forms */}
        <div className="auth-form-panel">
          <div className="auth-form-container">
            <div className="auth-tabs-toggle" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={mode === "login"}
                className={`auth-tab-switch ${mode === "login" ? "active" : ""}`}
                onClick={() => switchMode("login")}
                disabled={submitting}
              >
                Sign In
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "register"}
                className={`auth-tab-switch ${mode === "register" ? "active" : ""}`}
                onClick={() => switchMode("register")}
                disabled={submitting}
              >
                Create Account
              </button>
            </div>

            <div className="auth-form-header">
              <h2>
                {mode === "login"
                  ? "Welcome back to your workspace"
                  : "Create your BusinessFlow account"}
              </h2>
              <p>
                {mode === "login"
                  ? "Sign in to access your customer dashboard, subscriptions, and AI support."
                  : "Sign up in seconds to explore cloud services, review plans, and manage resources."}
              </p>
            </div>

            {error && (
              <div className="auth-alert-box" role="alert">
                <span className="alert-icon" aria-hidden="true">⚠</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-split-form" noValidate>
              {mode === "register" && (
                <div className="form-group">
                  <label htmlFor="auth-split-name">Full Name</label>
                  <input
                    id="auth-split-name"
                    type="text"
                    placeholder="e.g. Priya Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={submitting}
                    autoComplete="name"
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="auth-split-email">Email Address</label>
                <input
                  id="auth-split-email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="auth-split-password">Password</label>
                <input
                  id="auth-split-password"
                  type="password"
                  placeholder={mode === "register" ? "Minimum 6 characters" : "Enter your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                  autoComplete={mode === "register" ? "new-password" : "current-password"}
                  required
                />
              </div>

              <button
                type="submit"
                className="auth-primary-submit"
                disabled={submitting}
              >
                {submitting ? (
                  <span className="auth-spinner-wrap">
                    <span className="auth-spinner" aria-hidden="true" />
                    <span>Signing {mode === "login" ? "in" : "up"}...</span>
                  </span>
                ) : mode === "login" ? (
                  "Sign In to Account"
                ) : (
                  "Complete Free Registration"
                )}
              </button>
            </form>

            <div className="auth-form-subfooter">
              {mode === "login" ? (
                <p>
                  New to BusinessFlow AI?{" "}
                  <button
                    type="button"
                    className="auth-text-btn"
                    onClick={() => switchMode("register")}
                    disabled={submitting}
                  >
                    Create an account
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="auth-text-btn"
                    onClick={() => switchMode("login")}
                    disabled={submitting}
                  >
                    Sign in here
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;

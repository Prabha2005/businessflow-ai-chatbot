import { useState, useEffect } from "react";
import { registerUser, loginUser } from "../services/authApi";

function AuthModal({ isOpen, initialMode = "login", onClose, onSuccess }) {
  const [mode, setMode] = useState(initialMode); // "login" | "register"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    setError("");
  }, [initialMode, isOpen]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isOpen && !submitting) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, submitting, onClose]);

  if (!isOpen) {
    return null;
  }

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
          setName("");
          setEmail("");
          setPassword("");
          onSuccess(response.user);
        }
      } else {
        const response = await loginUser({
          email: trimmedEmail,
          password,
        });

        if (response && response.user) {
          setName("");
          setEmail("");
          setPassword("");
          onSuccess(response.user);
        }
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="auth-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) {
          onClose();
        }
      }}
    >
      <div className="auth-modal-card">
        <button
          type="button"
          className="auth-modal-close"
          onClick={onClose}
          aria-label="Close authentication modal"
          disabled={submitting}
        >
          ✕
        </button>

        <div className="auth-modal-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "login"}
            className={"auth-tab-btn" + (mode === "login" ? " active" : "")}
            onClick={() => switchMode("login")}
            disabled={submitting}
          >
            Sign In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "register"}
            className={"auth-tab-btn" + (mode === "register" ? " active" : "")}
            onClick={() => switchMode("register")}
            disabled={submitting}
          >
            Create Account
          </button>
        </div>

        <div className="auth-modal-body">
          <h2 id="auth-modal-title" className="auth-modal-title">
            {mode === "login"
              ? "Welcome back to BusinessFlow"
              : "Get started with BusinessFlow"}
          </h2>
          <p className="auth-modal-subtitle">
            {mode === "login"
              ? "Access your services, billing periods, and business recommendations."
              : "Create your free account to access business services and support."}
          </p>

          {error && (
            <div className="auth-error-banner" role="alert">
              <span className="auth-error-icon" aria-hidden="true">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {mode === "register" && (
              <div className="auth-field">
                <label htmlFor="auth-name">Full Name</label>
                <input
                  id="auth-name"
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

            <div className="auth-field">
              <label htmlFor="auth-email">Email Address</label>
              <input
                id="auth-email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                autoComplete="email"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="auth-password">Password</label>
              <input
                id="auth-password"
                type="password"
                placeholder={
                  mode === "register"
                    ? "At least 6 characters"
                    : "Enter your password"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                autoComplete={
                  mode === "register" ? "new-password" : "current-password"
                }
                required
              />
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={submitting}
            >
              {submitting ? (
                <span className="auth-submit-loading">
                  <span className="auth-spinner" aria-hidden="true" />
                  <span>Processing...</span>
                </span>
              ) : mode === "login" ? (
                "Sign In to BusinessFlow"
              ) : (
                "Create Free Account"
              )}
            </button>
          </form>

          <div className="auth-modal-footer">
            {mode === "login" ? (
              <p>
                Don't have an account yet?{" "}
                <button
                  type="button"
                  className="auth-link-btn"
                  onClick={() => switchMode("register")}
                  disabled={submitting}
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  className="auth-link-btn"
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
  );
}

export default AuthModal;

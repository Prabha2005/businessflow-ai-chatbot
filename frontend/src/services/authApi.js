const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV
    ? "http://localhost/businessflow-api/api"
    : "https://businessflowai.freedev.app/businessflow-api/api")
).replace(/\/$/, "");

/**
 * Check whether the current user has an active session.
 */
export async function getMe() {
  try {
    const response = await fetch(`${API_BASE_URL}/me.php`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      return { authenticated: false, user: null };
    }

    const data = await response.json();
    return {
      authenticated: Boolean(data.authenticated),
      user: data.user || null,
    };
  } catch (err) {
    console.warn("Unable to check session status:", err);
    return { authenticated: false, user: null };
  }
}

/**
 * Register a new user with name, email, and password.
 */
export async function registerUser({ name, email, password }) {
  const response = await fetch(`${API_BASE_URL}/register.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ name, email, password }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Registration failed with status ${response.status}.`);
  }

  return data;
}

/**
 * Login an existing user with email and password.
 */
export async function loginUser({ email, password }) {
  const response = await fetch(`${API_BASE_URL}/login.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Login failed with status ${response.status}.`);
  }

  return data;
}

/**
 * Log out the current user and destroy the session.
 */
export async function logoutUser() {
  const response = await fetch(`${API_BASE_URL}/logout.php`, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    credentials: "include",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Logout failed with status ${response.status}.`);
  }

  return data;
}

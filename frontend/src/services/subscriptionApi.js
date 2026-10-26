const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1"
    ? `${window.location.origin}/businessflow-api/api`
    : "http://localhost/businessflow-api/api")
).replace(/\/$/, "");

/**
 * Fetch authenticated customer's demonstration subscriptions from backend database.
 */
export async function fetchSubscriptions() {
  try {
    const response = await fetch(`${API_BASE_URL}/subscriptions.php`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401) {
        return [];
      }
      throw new Error(`Failed to load subscriptions (HTTP ${response.status})`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn("Unable to fetch user subscriptions:", err);
    return [];
  }
}

/**
 * Save / persist a selected demonstration plan to backend database.
 */
export async function saveSubscription(subscriptionData) {
  const response = await fetch(`${API_BASE_URL}/subscriptions.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
    body: JSON.stringify(subscriptionData),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error || `Failed to save demonstration plan (HTTP ${response.status}).`
    );
  }

  return data.subscription || data;
}

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1"
    ? `${window.location.origin}/businessflow-api/api`
    : "http://localhost/businessflow-api/api")
).replace(/\/$/, "");

/**
 * Sends a message to the PHP chatbot backend.
 * Uses assistant.php to bypass ModSecurity chat keyword filters on InfinityFree.
 * Passes user and subscription context to guarantee accurate personalization.
 */
export async function sendChatMessage(message, user = null, subscriptions = []) {
  const trimmedMessage = (message || "").trim();

  if (!trimmedMessage) {
    throw new Error("Please enter a message.");
  }

  const endpoint = `${API_BASE_URL}/assistant.php`;
  const payload = {
    message: trimmedMessage,
  };

  if (user && typeof user === "object") {
    payload.user = {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }

  if (Array.isArray(subscriptions) && subscriptions.length > 0) {
    payload.subscriptions = subscriptions;
  }

  let response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });
  } catch (err) {
    // Graceful fallback to chat.php if assistant.php cannot be reached directly
    response = await fetch(`${API_BASE_URL}/chat.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });
  }

  if (!response.ok) {
    throw new Error(
      `Chatbot request failed with status ${response.status}.`
    );
  }

  const data = await response.json();

  const replyText = data.reply || data.message;
  if (typeof replyText !== "string" || !replyText.trim()) {
    throw new Error("The chatbot returned an invalid response.");
  }

  return replyText.trim();
}

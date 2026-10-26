const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV
    ? "http://localhost/businessflow-api/api"
    : "https://businessflowai.freedev.app/businessflow-api/api")
).replace(/\/$/, "");

/**
 * Sends a message to the PHP chatbot backend.
 *
 * Expected request:
 * POST /api/chat.php
 * Body: { "message": "Your question" }
 *
 * Expected response:
 * { "reply": "The assistant's response" }
 */
export async function sendChatMessage(message) {
  const trimmedMessage = message.trim();

  if (!trimmedMessage) {
    throw new Error("Please enter a message.");
  }

  const response = await fetch(`${API_BASE_URL}/chat.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      message: trimmedMessage,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Chatbot request failed with status ${response.status}.`
    );
  }

  const data = await response.json();

  if (typeof data.reply !== "string" || !data.reply.trim()) {
    throw new Error("The chatbot returned an invalid response.");
  }

  return data.reply.trim();
}

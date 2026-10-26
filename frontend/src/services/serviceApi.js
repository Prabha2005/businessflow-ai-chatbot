const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV
    ? "http://localhost/businessflow-api/api"
    : "https://businessflowai.freedev.app/businessflow-api/api")
).replace(/\/$/, "");

export async function getServices() {
  const response = await fetch(`${API_BASE_URL}/services.php`);

  if (!response.ok) {
    throw new Error("Failed to fetch services");
  }

  return await response.json();
}

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
});

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, { headers: getHeaders(), ...options });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// Auth
export const registerUser = (body) => request("/auth/register", { method: "POST", body: JSON.stringify(body) });
export const loginUser    = (body) => request("/auth/login",    { method: "POST", body: JSON.stringify(body) });
export const googleAuth   = (body) => request("/auth/google",   { method: "POST", body: JSON.stringify(body) });

// Food
export const getFoods    = ()    => request("/food");
export const getFoodById = (id)  => request(`/food/${id}`);

// Orders
export const placeOrder  = (body) => request("/orders",    { method: "POST", body: JSON.stringify(body) });
export const getOrders   = ()     => request("/orders/my");

// Payments
export const createPaymentOrder = (body) => request("/payment/create", { method: "POST", body: JSON.stringify(body) });
export const verifyPayment      = (body) => request("/payment/verify", { method: "POST", body: JSON.stringify(body) });

// AI
export const getAIResponse    = (body) => request("/ai",          { method: "POST", body: JSON.stringify(body) });
export const getMoodSuggestion = (body) => request("/ai/mood",     { method: "POST", body: JSON.stringify(body) });
export const getEmergencyFood  = (body) => request("/ai/emergency", { method: "POST", body: JSON.stringify(body) });

// Group Orders
export const createGroupOrder = (body)   => request("/group",         { method: "POST", body: JSON.stringify(body) });
export const joinGroupOrder   = (code)   => request(`/group/${code}/join`, { method: "POST" });
export const getGroupOrder    = (code)   => request(`/group/${code}`);

// Tracking
export const getOrderTracking = (orderId) => request(`/tracking/${orderId}`);
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

export const registerUser = (body) => request("/auth/register", { method:"POST", body:JSON.stringify(body) });
export const loginUser    = (body) => request("/auth/login",    { method:"POST", body:JSON.stringify(body) });
export const getFoods     = ()     => request("/foods");
export const getFoodById  = (id)   => request(`/foods/${id}`);
export const placeOrder   = (body) => request("/orders",        { method:"POST", body:JSON.stringify(body) });
export const getOrders    = ()     => request("/orders/my");
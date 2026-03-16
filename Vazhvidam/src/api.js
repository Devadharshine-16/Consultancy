const API_BASE_URL = import.meta.env.VITE_API_URL || "https://consultancy-1-ulep.onrender.com";

async function requestJson(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const error = new Error(data?.message || data?.error || `Request failed ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

async function postJson(path, body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return requestJson(path, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

async function putJson(path, body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return requestJson(path, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });
}

async function getJson(path, token) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return requestJson(path, {
    method: "GET",
    headers,
  });
}

async function deleteJson(path, token) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return requestJson(path, {
    method: "DELETE",
    headers,
  });
}

export async function login(data) {
  return postJson("/api/auth/login", data);
}

export async function register(data) {
  // If data is FormData (file upload), send multipart directly
  if (data instanceof FormData) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: data && { "Authorization": token ? `Bearer ${token}` : undefined },
      body: data,
    });

    const text = await res.text();
    const json = text ? JSON.parse(text) : null;
    if (!res.ok) {
      const error = new Error(json?.message || json?.error || `Register failed ${res.status}`);
      error.status = res.status;
      error.data = json;
      throw error;
    }
    return json;
  }
  return postJson("/api/auth/register", data);
}

export async function fetchProperties(query = "") {
  const suffix = query ? `?${query}` : "";
  return getJson(`/api/properties${suffix}`);
}

export async function fetchPropertyById(id) {
  return getJson(`/api/properties/${id}`);
}

export async function addProperty(data, token) {
  return postJson("/api/properties/add", data, token);
}

export async function updateProperty(id, data, token) {
  return putJson(`/api/properties/${id}`, data, token);
}

export async function deleteProperty(id, token) {
  return deleteJson(`/api/properties/${id}`, token);
}

export async function fetchOwnerProperties(token) {
  return getJson("/api/properties/owner/me", token);
}

export async function createBooking(data, token) {
  return postJson("/api/bookings/add", data, token);
}

export async function fetchBookings(token) {
  return getJson("/api/bookings/owner/requests", token);
}

export async function approveBooking(id, token) {
  return putJson(`/api/bookings/approve/${id}`, {}, token);
}

export async function rejectBooking(id, token) {
  return putJson(`/api/bookings/reject/${id}`, {}, token);
}

export async function submitReview(data, token) {
  return postJson("/api/reviews/add", data, token);
}

export async function queryChatbot(message) {
  return postJson("/api/chatbot/query", { message });
}

export default {
  login,
  register,
  fetchProperties,
  fetchPropertyById,
  addProperty,
  updateProperty,
  deleteProperty,
  fetchOwnerProperties,
  createBooking,
  fetchBookings,
  approveBooking,
  rejectBooking,
  submitReview,
  queryChatbot,
};

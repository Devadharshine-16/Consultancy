import { jwtDecode } from "jwt-decode";

export const getUserRole = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded.role;
  } catch (error) {
    console.error("Error decoding token:", error);
    // Clear invalid token
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    return null;
  }
};

export const getUserId = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded.id;
  } catch (error) {
    console.error("Error decoding token:", error);
    // Clear invalid token
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    return null;
  }
};

export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    // Check if token is expired
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error decoding token:", error);
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    return false;
  }
};

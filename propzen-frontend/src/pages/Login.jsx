import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsBlocked(false);
        // Save token
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);

        setMessage("Login successful");

        // Role-based redirect
        if (data.role === "owner") {
          navigate("/owner-dashboard");
        } else if (data.role === "admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/properties");
        }
      } else {
        const msg = data.message || "Login failed";
        setMessage(msg);

        // If backend says too many attempts, mark as blocked
        if (res.status === 429) {
          setIsBlocked(true);
        }
      }
    } catch (error) {
      setMessage("Server error. Try again.");
      setIsBlocked(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleLogin}>
        <h2>Login</h2>
        <p>Access your consultancy dashboard</p>

        {message && <p className="msg">{message}</p>}

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={isBlocked}
          className={isBlocked ? "blocked-button" : ""}
          title={isBlocked ? "Too many failed attempts. Please try again after 5 minutes" : ""}
        >
          {isBlocked ? "Blocked - Try Later" : "Login"}
        </button>

        <p style={{ marginTop: "20px", textAlign: "center" }}>
          Don't have an account? <Link to="/register" style={{ color: "#0d9488", fontWeight: "500" }}>Register here</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;

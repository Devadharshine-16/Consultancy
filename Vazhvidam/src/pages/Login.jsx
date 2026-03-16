import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    // Read from form DOM to support password managers / autofill (they may not trigger onChange)
    const form = e.target;
    const emailVal = (form.elements?.email?.value || email).trim();
    const passwordVal = (form.elements?.password?.value || password).trim();

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailVal, password: passwordVal }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsBlocked(false);
        setIsError(false);

        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);

        setMessage("Login successful");
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
        setIsError(true);
        setIsBlocked(res.status === 429);
      }
    } catch (error) {
      setMessage("Server error. Try again.");
      setIsBlocked(false);
      setIsError(true);
    }
  };
  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleLogin}>
        <h2>Login</h2>
        <p>Access your consultancy dashboard</p>

        {isBlocked && (
          <div className="login-blocked-alert">
            <strong>Account temporarily locked</strong>
            <p>Too many failed attempts. Please try again after 5 minutes.</p>
          </div>
        )}

        {message && <p className={`msg ${isError ? "error" : ""}`}>{message}</p>}

        <input
          name="email"
          type="email"
          placeholder="Email address/Username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isBlocked}
          required
          autoComplete="email"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isBlocked}
          required
          autoComplete="current-password"
        />
        <button
          type="submit"
          disabled={isBlocked}
          className={isBlocked ? "blocked-button" : ""}
          title={isBlocked ? "Too many failed attempts. Please try again after 5 minutes" : ""}
        >
          {isBlocked ? "Blocked — Try again in 5 minutes" : "Login"}
        </button>

        <p style={{ marginTop: "20px", textAlign: "center" }}>
          Don't have an account? <Link to="/register" style={{ color: "#0d9488", fontWeight: "500" }}>Register here</Link>
        </p>
      </form>
    </div>
  );
}
export default Login;

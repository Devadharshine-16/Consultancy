import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../styles/login.css";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "owner",
    identityProofType: "aadhaar"
  });
  const [identityFile, setIdentityFile] = useState(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    if (!identityFile) {
      setMessage("Please upload a valid identity proof file.");
      setIsError(true);
      return;
    }

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("password", formData.password);
      data.append("role", formData.role);
      data.append("identityProofType", formData.identityProofType);
      data.append("identityProof", identityFile);

      await axios.post("http://localhost:5000/api/auth/register", data, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      setMessage("Registration successful! Redirecting to login...");
      setIsError(false);
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      console.error("Register error:", err);
      // helpful debugging message; server may not send JSON
      const serverMsg =
        err.response?.data?.message ||
        err.message ||
        "Registration failed. Please try again.";
      setMessage(serverMsg);
      setIsError(true);
    }
  };

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2>Register</h2>
        <p>Create your account to get started</p>

        {message && (
          <p className={isError ? "msg error" : "msg"}>{message}</p>
        )}

        <input
          name="name"
          type="text"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          name="email"
          type="email"
          placeholder="Email address"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
        >
          <option value="owner">Owner</option>
          <option value="user">User</option>
        </select>

        <select
          name="identityProofType"
          value={formData.identityProofType}
          onChange={handleChange}
          required
        >
          <option value="aadhaar">Aadhaar Card</option>
          <option value="ration">Ration Card</option>
          <option value="license">Driving License</option>
        </select>

        <input
          name="identityProof"
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={(e) => setIdentityFile(e.target.files[0] || null)}
          required
        />

        <button type="submit">Register</button>

        <p style={{ marginTop: "20px", textAlign: "center" }}>
          Already have an account? <Link to="/login" style={{ color: "#0d9488", fontWeight: "500" }}>Login here</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;

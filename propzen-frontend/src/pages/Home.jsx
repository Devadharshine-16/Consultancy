import "../styles/home.css";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-hero-overlay"></div>
        <div className="home-hero-content">
          <div className="home-hero-badge">100% Verified Listings</div>
          <h1 className="home-hero-title">Find Your Perfect Property</h1>
          <p className="home-hero-subtitle">
            Trusted real estate consultancy connecting verified property owners
            with genuine buyers and tenants
          </p>
          <button 
            className="home-hero-cta"
            onClick={() => navigate("/properties")}
          >
            Explore Properties
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="home-features">
        <div className="home-features-container">
          <div className="home-feature-card">
            <div className="home-feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
              </svg>
            </div>
            <h3 className="home-feature-title">Verified Listings</h3>
            <p className="home-feature-description">
              All properties are verified by our admin team with mandatory
              identity proof from owners.
            </p>
          </div>
          <div className="home-feature-card">
            <div className="home-feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 7c0-2.21-1.79-4-4-4S8 4.79 8 7s1.79 4 4 4 4-1.79 4-4zm-4 6c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>
                <path d="M20 10h-2v2h2v-2zm-1 0h-2v2h2v-2zm-1 0h-2v2h2v-2z" fill="currentColor"/>
              </svg>
            </div>
            <h3 className="home-feature-title">Expert Guidance</h3>
            <p className="home-feature-description">
              Professional consultancy for buyers and owners with transparent
              booking and approval process.
            </p>
          </div>
          <div className="home-feature-card">
            <div className="home-feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10z" fill="currentColor"/>
              </svg>
            </div>
            <h3 className="home-feature-title">Secure Process</h3>
            <p className="home-feature-description">
              Safe and transparent property transactions with role-based access
              control and secure authentication.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;

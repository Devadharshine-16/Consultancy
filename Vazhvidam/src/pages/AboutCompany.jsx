import "../styles/home.css";

function AboutCompany() {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero-section">
        <div className="about-hero-content">
          <span className="about-hero-badge">Trusted Real Estate Platform</span>
          <h1 className="about-hero-title">About VAZHVIDAM</h1>
          <p className="about-hero-description">
            VAZHVIDAM connects verified property owners with genuine buyers and
            tenants. Every part of the platform is designed around safety,
            transparency, and a simple, modern experience for college-level
            projects and real-world use.
          </p>
        </div>
      </section>

      {/* Platform Statistics */}
      <section className="about-section">
        <div className="about-section-header">
          <div className="about-section-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor"/>
            </svg>
          </div>
          <h2 className="about-section-title">Platform Snapshot</h2>
        </div>
        <p className="about-section-intro">
          These values demonstrate how VAZHVIDAM presents live platform statistics
          to users. In a full production deployment, these numbers are fetched
          directly from the database.
        </p>
        <div className="about-stats-grid">
          <div className="about-stat-card">
            <div className="about-stat-icon-wrapper">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>
              </svg>
            </div>
            <div className="about-stat-content">
              <div className="about-stat-value">25+</div>
              <div className="about-stat-label">Verified Property Owners</div>
            </div>
          </div>
          <div className="about-stat-card">
            <div className="about-stat-icon-wrapper">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill="currentColor"/>
              </svg>
            </div>
            <div className="about-stat-content">
              <div className="about-stat-value">40+</div>
              <div className="about-stat-label">Active Property Listings</div>
            </div>
          </div>
          <div className="about-stat-card">
            <div className="about-stat-icon-wrapper">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
              </svg>
            </div>
            <div className="about-stat-content">
              <div className="about-stat-value">15+</div>
              <div className="about-stat-label">
                Properties Successfully Rented / Sold
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Verification & Transparency */}
      <section className="about-section">
        <div className="about-section-header">
          <div className="about-section-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10z" fill="currentColor"/>
            </svg>
          </div>
          <h2 className="about-section-title">Verification & Transparency</h2>
        </div>
        <div className="about-section-body">
          <p>
            Every property owner on VAZHVIDAM is verified using valid
            government-issued identity proof such as Aadhaar Card, Ration Card, or
            Driving License. Identity documents are collected only for
            verification purposes and are securely stored on the server. These
            documents are <strong>never publicly visible</strong> to other users
            or visitors of the platform.
          </p>
          <p>
            By making identity verification mandatory, the platform aims to reduce
            fake listings and create a safer environment for students, families,
            and professionals who are searching for a property.
          </p>
        </div>
      </section>

      {/* Trust & Security */}
      <section className="about-section">
        <div className="about-section-header">
          <div className="about-section-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" fill="currentColor"/>
            </svg>
          </div>
          <h2 className="about-section-title">Trust & Security</h2>
        </div>
        <div className="about-section-body">
          <div className="about-feature-list">
            <div className="about-feature-item">
              <div className="about-feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 7h-4v2h4c1.65 0 3 1.35 3 3s-1.35 3-3 3h-4v2h4c2.76 0 5-2.24 5-5s-2.24-5-5-5zm-6 8H7c-1.65 0-3-1.35-3-3s1.35-3 3-3h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-2zm-3-4h8v2H8v-2z" fill="currentColor"/>
                </svg>
              </div>
              <div className="about-feature-content">
                <h3>Role-Based Access Control</h3>
                <p>
                  The platform clearly separates actions for Owners and Users.
                  Property Owners can add and manage listings, while normal Users
                  can explore properties and send booking requests.
                </p>
              </div>
            </div>
            <div className="about-feature-item">
              <div className="about-feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z" fill="currentColor"/>
                </svg>
              </div>
              <div className="about-feature-content">
                <h3>Mandatory Identity Verification</h3>
                <p>
                  Owners and Users must complete identity verification during
                  registration using approved government identity documents. This
                  helps prevent misuse of the platform.
                </p>
              </div>
            </div>
            <div className="about-feature-item">
              <div className="about-feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10z" fill="currentColor"/>
                </svg>
              </div>
              <div className="about-feature-content">
                <h3>Secure Login</h3>
                <p>
                  Authentication is handled using tokens and can be extended with
                  restricted login attempts and account-lock mechanisms to protect
                  against brute-force attacks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance & Ethics */}
      <section className="about-section">
        <div className="about-section-header">
          <div className="about-section-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 16c0 .55.45 1 1 1s1-.45 1-1-.45-1-1-1-1 .45-1 1zm10-6c0 .55.45 1 1 1s1-.45 1-1-.45-1-1-1-1 .45-1 1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" fill="currentColor"/>
            </svg>
          </div>
          <h2 className="about-section-title">Compliance & Ethics</h2>
        </div>
        <div className="about-section-body">
          <p>
            VAZHVIDAM is designed as a responsible platform that respects data
            privacy and ethical handling of documents. Identity proofs and personal
            details are used only for verification and platform-related
            communication. They are not shared with third parties and are not
            displayed publicly inside the application.
          </p>
          <p>
            The project follows the principle of collecting only the minimum
            information required for verification, storing it securely, and
            allowing access only to authorized parts of the system. This makes
            VAZHVIDAM suitable for academic evaluation as well as a solid foundation
            for future real-world deployment.
          </p>
        </div>
      </section>

      {/* Owner Details */}
      <section className="about-section">
        <div className="about-section-header">
          <div className="about-section-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor" />
            </svg>
          </div>
          <h2 className="about-section-title">Owner Contact</h2>
        </div>
        <div className="about-section-body">
          <div className="owner-details-card">
            <p><strong>Owner Name:</strong> Subramanian V & Hanikha S</p>
            <p><strong>Phone:</strong> 95242 95243</p>
            <p><strong>Email:</strong> vazhvidam@gmail.com</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutCompany;

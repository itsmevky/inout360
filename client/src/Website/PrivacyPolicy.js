import React from "react";
import "./PrivacyPolicy.css";

const PrivacyPolicy = () => {
  return (
    <div className="privacy-page">
      <header className="privacy-hero">
        <div className="privacy-hero-inner">
          <div className="privacy-hero-copy">
            <h1>
              <span className="privacy-highlight">Privacy Policy</span>
              <span className="privacy-title-rest">
                Device security with clear, human rules.
              </span>
            </h1>
            <p className="privacy-lede">
              This policy explains what Pidilite collects, why we collect it,
              and how you can control your data.
            </p>
            <div className="privacy-meta">
              <span>Effective date: 2026-01-01</span>
              <span>Last updated: 2026-01-01</span>
            </div>
          </div>
        </div>
      </header>

      <main className="privacy-content">
        <section className="privacy-card">
          <h2>Scope</h2>
          <p>
            This policy applies to the Pidilite mobile app, web dashboard, and
            backend services used to manage employee device access and workplace
            compliance.
          </p>
        </section>

        <section className="privacy-grid">
          <article className="privacy-card">
            <h3>Data we collect</h3>
            <ul>
              <li>Account details: name, employee ID, role, and contact info.</li>
              <li>Device identifiers: device ID, model, OS version, app version.</li>
              <li>Access events: login/logout time, QR usage, device status.</li>
              <li>Location status: entry/exit location and device location (if enabled).</li>
              <li>Security metadata: policy state, camera/app restrictions, audit logs.</li>
            </ul>
          </article>

          <article className="privacy-card">
            <h3>Why we collect it</h3>
            <ul>
              <li>Verify employee identity and device ownership.</li>
              <li>Enforce workplace security policies automatically.</li>
              <li>Maintain attendance and access logs.</li>
              <li>Detect abnormal or unauthorized device activity.</li>
              <li>Support audits and compliance reporting.</li>
            </ul>
          </article>
        </section>

        <section className="privacy-card">
          <h2>How the system works</h2>
          <p>
            Pidilite enables location-based security controls within company
            premises. When a user enters a protected zone, the app applies
            policy rules such as camera restriction, blocked apps, or kiosk
            mode. When a user exits, normal device access can be restored based
            on policy settings.
          </p>
        </section>

        <section className="privacy-grid">
          <article className="privacy-card">
            <h3>Data sharing</h3>
            <p>
              We do not sell personal data. Data may be shared with your
              organization, authorized administrators, and infrastructure
              providers strictly to deliver the service.
            </p>
          </article>
          <article className="privacy-card">
            <h3>Data retention</h3>
            <p>
              We retain records only as long as required for business,
              compliance, and legal obligations. Retention periods are
              configured by your organization.
            </p>
          </article>
        </section>

        <section className="privacy-card">
          <h2>Your choices</h2>
          <ul>
            <li>Request access to your stored data.</li>
            <li>Ask for correction of inaccurate information.</li>
            <li>Request deletion, subject to legal or audit requirements.</li>
            <li>Disable optional permissions if your organization allows it.</li>
          </ul>
        </section>

        <section className="privacy-card">
          <h2>Security</h2>
          <p>
            We protect data using encryption in transit, access controls, and
            audit logging. Administrators only access data required for policy
            enforcement and operational support.
          </p>
        </section>

        <section className="privacy-card privacy-contact">
          <h2>Contact</h2>
          <p>
            If you have privacy questions, contact your organization’s admin or
            email support at <span className="privacy-email">info@pidilite.com</span>.
          </p>
        </section>
      </main>
    </div>
  );
};

export default PrivacyPolicy;

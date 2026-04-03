import React, { useEffect, useMemo, useState } from "react";
import "./StaticQr.css";

const StaticQr = () => {
  const apiBase = process.env.REACT_APP_API_DOMAIN_ENDPOINT || "";
  const [selectedType, setSelectedType] = useState(null);
  const [refreshKey, setRefreshKey] = useState(Date.now());

  const qrOptions = useMemo(
    () => [
      {
        type: "login",
        title: "Login QR",
        description: "Scan to log in from any location.",
        url: `${apiBase}/qr/static-png?type=login&size=640`,
      },
      {
        type: "logout",
        title: "Logout QR",
        description: "Scan to log out from any location.",
        url: `${apiBase}/qr/static-png?type=logout&size=640`,
      },
      {
        type: "emergency-logout",
        title: "Emergency QR",
        description: "Scan to force logout and reset device controls.",
        url: `${apiBase}/qr/static-png?type=emergency-logout&size=640`,
      },
    ],
    [apiBase]
  );

  useEffect(() => {
    if (selectedType !== "emergency-logout") return undefined;

    setRefreshKey(Date.now());
    const intervalId = window.setInterval(() => {
      setRefreshKey(Date.now());
    }, 30 * 60 * 1000);

    return () => window.clearInterval(intervalId);
  }, [selectedType]);

  const selectedQr = qrOptions.find((option) => option.type === selectedType) || null;
  const selectedQrUrl = selectedQr
    ? `${selectedQr.url}${selectedType === "emergency-logout" ? `&v=${refreshKey}` : ""}`
    : "";

  return (
    <div className="static-qr-page">
      <header className="static-qr-hero">
        <div className="static-qr-hero-inner">
          <p className="static-qr-eyebrow">Pidilite</p>
          <h1>Static QR Access</h1>
          <p className="static-qr-lede">
            Permanent login/logout QR codes for testing. No login required to
            open this page.
          </p>
        </div>
      </header>

      <main className="static-qr-content">
        <section className="static-qr-actions">
          <div className="static-qr-button-row">
            {qrOptions.map((option) => (
              <button
                key={option.type}
                type="button"
                className={`static-qr-button${selectedType === option.type ? " is-active" : ""}`}
                onClick={() => setSelectedType(option.type)}
              >
                {option.title}
              </button>
            ))}
          </div>
        </section>

        {selectedQr ? (
          <section className="static-qr-card static-qr-card-single">
            <div className="static-qr-card-header">
              <h2>{selectedQr.title}</h2>
              <p>{selectedQr.description}</p>
              {selectedType === "emergency-logout" ? (
                <p className="static-qr-note">
                  This QR refreshes automatically every 30 minutes.
                </p>
              ) : null}
            </div>
            <div className="static-qr-frame">
              <img src={selectedQrUrl} alt={`${selectedQr.title} code`} />
            </div>
            <a className="static-qr-link" href={selectedQrUrl} target="_blank" rel="noreferrer">
              Open full size
            </a>
          </section>
        ) : (
          <section className="static-qr-empty">
            <p>Select a QR button to show it on screen.</p>
          </section>
        )}
      </main>
    </div>
  );
};

export default StaticQr;

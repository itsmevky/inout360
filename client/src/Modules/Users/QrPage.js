import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import QRCode from "qrcode";
import { domainpath } from "../../Helpers/api.js";

const DEFAULT_LOCATION = "Gate-1";

const QrCard = ({
  title,
  imageSrc,
  expiresAt,
  remainingSeconds,
  loading,
}) => (
  <div className="qr-card">
    <div className="qr-card-head">
      <div>
        <p className="qr-eyebrow">Secure Access</p>
        <h3 className="qr-title">{title}</h3>
      </div>
      <span className={`qr-pill ${loading ? "is-loading" : ""}`}>
        {loading ? "Refreshing..." : "Auto refresh on expiry"}
      </span>
    </div>
    <div className="qr-frame">
      <div className="qr-frame-inner">
        {imageSrc ? (
          <img src={imageSrc} alt={`${title} QR`} className="qr-image" />
        ) : (
          <span className="qr-empty">No QR generated</span>
        )}
      </div>
      <div className="qr-glow" aria-hidden="true" />
    </div>
    <div className="qr-meta">
      <div>
        <span className="qr-meta-label">Expires</span>
        <span className="qr-meta-value">
          {expiresAt ? new Date(expiresAt).toLocaleString() : "—"}
        </span>
      </div>
      <div>
        <span className="qr-meta-label">Time left</span>
        <span className="qr-meta-value">
          {remainingSeconds !== null ? `${Math.max(0, remainingSeconds)}s` : "—"}
        </span>
      </div>
    </div>
  </div>
);

const QrPage = () => {
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [loginState, setLoginState] = useState({
    token: "",
    imageSrc: "",
    expiresAt: null,
    loading: false,
  });
  const [logoutState, setLogoutState] = useState({
    token: "",
    imageSrc: "",
    expiresAt: null,
    loading: false,
  });
  const [loginRemaining, setLoginRemaining] = useState(null);
  const [logoutRemaining, setLogoutRemaining] = useState(null);
  const navigate = useNavigate();

  const loginRefreshRef = useRef(null);
  const logoutRefreshRef = useRef(null);
  const loginStatusRef = useRef(null);
  const logoutStatusRef = useRef(null);
  const loginTimerRef = useRef(null);
  const logoutTimerRef = useRef(null);

  const clearTimer = (ref) => {
    if (ref.current) {
      clearTimeout(ref.current);
      ref.current = null;
    }
  };

  const clearIntervalRef = (ref) => {
    if (ref.current) {
      clearInterval(ref.current);
      ref.current = null;
    }
  };

  const revokeImage = (src) => {
    if (src) {
      URL.revokeObjectURL(src);
    }
  };

  const fetchQrPng = useCallback(
    async (action, setState) => {
      setState((prev) => ({ ...prev, loading: true }));
      try {
        const response = await axios.post(`${domainpath}/qr/generate`, {
          action,
          location,
        });

        const token = response?.data?.token || "";
        const expiresAt = response?.data?.expiresAt || null;
        const imageSrc = token
          ? await QRCode.toDataURL(token, { width: 300, margin: 2 })
          : "";

        setState((prev) => {
          return {
            token,
            imageSrc,
            expiresAt,
            loading: false,
          };
        });
      } catch (error) {
        setState((prev) => ({ ...prev, loading: false }));
      }
    },
    [location]
  );

  const scheduleRefresh = useCallback((expiresAt, action) => {
    if (!expiresAt) return;
    const expiresMs = new Date(expiresAt).getTime() - Date.now();
    if (!Number.isFinite(expiresMs) || expiresMs <= 0) return;

    const timeout = setTimeout(() => {
      if (action === "login") {
        fetchQrPng("login", setLoginState);
      } else {
        fetchQrPng("logout", setLogoutState);
      }
    }, expiresMs + 500);

    if (action === "login") {
      clearTimer(loginRefreshRef);
      loginRefreshRef.current = timeout;
    } else {
      clearTimer(logoutRefreshRef);
      logoutRefreshRef.current = timeout;
    }
  }, [fetchQrPng]);

  const startCountdown = useCallback((expiresAt, action) => {
    if (!expiresAt) return;
    const endTime = new Date(expiresAt).getTime();
    const update = () => {
      const secondsLeft = Math.ceil((endTime - Date.now()) / 1000);
      if (action === "login") {
        setLoginRemaining(secondsLeft > 0 ? secondsLeft : 0);
      } else {
        setLogoutRemaining(secondsLeft > 0 ? secondsLeft : 0);
      }
      if (secondsLeft <= 0) {
        clearIntervalRef(action === "login" ? loginTimerRef : logoutTimerRef);
      }
    };

    update();
    const interval = setInterval(update, 1000);
    if (action === "login") {
      clearIntervalRef(loginTimerRef);
      loginTimerRef.current = interval;
    } else {
      clearIntervalRef(logoutTimerRef);
      logoutTimerRef.current = interval;
    }
  }, []);

  const startStatusPolling = useCallback((token, action) => {
    if (!token) return;
    const poll = async () => {
      try {
        const response = await axios.get(`${domainpath}/qr/status`, {
          params: { token },
        });
        const status = response?.data?.data;
        if (status?.expired) {
          if (action === "login") {
            fetchQrPng("login", setLoginState);
          } else {
            fetchQrPng("logout", setLogoutState);
          }
        }
      } catch (_err) {
        // ignore polling errors
      }
    };

    const interval = setInterval(poll, 10000);
    if (action === "login") {
      clearIntervalRef(loginStatusRef);
      loginStatusRef.current = interval;
    } else {
      clearIntervalRef(logoutStatusRef);
      logoutStatusRef.current = interval;
    }
  }, [fetchQrPng]);

  useEffect(() => {
    fetchQrPng("login", setLoginState);
    fetchQrPng("logout", setLogoutState);
    return () => {
      clearTimer(loginRefreshRef);
      clearTimer(logoutRefreshRef);
      clearIntervalRef(loginStatusRef);
      clearIntervalRef(logoutStatusRef);
      clearIntervalRef(loginTimerRef);
      clearIntervalRef(logoutTimerRef);
    };
  }, [fetchQrPng]);

  useEffect(() => {
    if (loginState.expiresAt) {
      scheduleRefresh(loginState.expiresAt, "login");
      startCountdown(loginState.expiresAt, "login");
    }
    if (loginState.token) {
      startStatusPolling(loginState.token, "login");
    }
  }, [loginState.expiresAt, loginState.token, scheduleRefresh, startStatusPolling, startCountdown]);

  useEffect(() => {
    if (logoutState.expiresAt) {
      scheduleRefresh(logoutState.expiresAt, "logout");
      startCountdown(logoutState.expiresAt, "logout");
    }
    if (logoutState.token) {
      startStatusPolling(logoutState.token, "logout");
    }
  }, [logoutState.expiresAt, logoutState.token, scheduleRefresh, startStatusPolling, startCountdown]);

  const handleLocationSubmit = (event) => {
    event.preventDefault();
    fetchQrPng("login", setLoginState);
    fetchQrPng("logout", setLogoutState);
  };

  return (
    <div className="qr-page">
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap");
        :root {
          --qr-ink: #0d1b2a;
          --qr-ink-soft: #2d3b4f;
          --qr-mist: #eef1f6;
          --qr-sky: #e8f0ff;
          --qr-accent: #f27a2c;
          --qr-accent-soft: #ffd1b2;
          --qr-card: #ffffff;
          --qr-border: rgba(13, 27, 42, 0.12);
        }
        .qr-page {
          min-height: 100vh;
          width: 100%;
          padding: 32px 20px 64px;
          font-family: "Space Grotesk", sans-serif;
          color: var(--qr-ink);
          background:
            radial-gradient(circle at 12% 18%, rgba(34, 139, 230, 0.18), transparent 45%),
            radial-gradient(circle at 88% 16%, rgba(255, 175, 90, 0.22), transparent 42%),
            linear-gradient(135deg, #f3f7ff 0%, #eaf1ff 55%, #f8fafc 100%);
          position: relative;
          overflow: hidden;
        }
        .qr-page::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: linear-gradient(
              0deg,
              rgba(13, 27, 42, 0.03) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(13, 27, 42, 0.03) 1px,
              transparent 1px
            );
          background-size: 28px 28px;
          pointer-events: none;
        }
        .qr-shell {
          width: min(1320px, 100%);
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
          position: relative;
          z-index: 1;
        }
        .qr-header {
          background: var(--qr-card);
          border-radius: 24px;
          padding: 24px 28px;
          border: 1px solid var(--qr-border);
          box-shadow: 0 24px 60px rgba(13, 27, 42, 0.1);
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 18px;
          animation: qr-fade 0.6s ease-out;
        }
        .qr-header-left {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .qr-back {
          align-self: flex-start;
          border: 1px solid rgba(13, 27, 42, 0.12);
          background: #ffffff;
          color: var(--qr-ink);
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .qr-back:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 18px rgba(13, 27, 42, 0.15);
        }
        .qr-title {
          font-size: 26px;
          margin: 0;
          font-weight: 700;
        }
        .qr-subtitle {
          margin: 4px 0 0;
          color: var(--qr-ink-soft);
          font-size: 14px;
        }
        .qr-location {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
        }
        .qr-location label {
          font-size: 12px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--qr-ink-soft);
        }
        .qr-location input {
          border: 1px solid var(--qr-border);
          border-radius: 12px;
          padding: 8px 12px;
          min-width: 180px;
          font-size: 14px;
          background: var(--qr-mist);
          color: var(--qr-ink);
        }
        .qr-location button {
          background: var(--qr-ink);
          color: #fff;
          border: none;
          padding: 10px 16px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .qr-location button:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 20px rgba(13, 27, 42, 0.2);
        }
        .qr-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
        }
        .qr-card {
          background: var(--qr-card);
          border-radius: 26px;
          padding: 26px;
          border: 1px solid var(--qr-border);
          box-shadow: 0 26px 70px rgba(13, 27, 42, 0.12);
          display: flex;
          flex-direction: column;
          gap: 20px;
          animation: qr-fade 0.7s ease-out;
          min-height: 420px;
        }
        .qr-card-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }
        .qr-eyebrow {
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--qr-ink-soft);
          margin: 0 0 6px;
        }
        .qr-card .qr-title {
          font-size: 22px;
        }
        .qr-pill {
          font-size: 11px;
          font-family: "IBM Plex Mono", monospace;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 6px 10px;
          border-radius: 999px;
          background: var(--qr-sky);
          color: #2f4b7a;
          white-space: nowrap;
        }
        .qr-pill.is-loading {
          background: var(--qr-accent-soft);
          color: #8a3b07;
        }
        .qr-frame {
          position: relative;
        }
        .qr-frame-inner {
          border-radius: 22px;
          border: 1px dashed rgba(13, 27, 42, 0.2);
          min-height: 280px;
          display: grid;
          place-items: center;
          background: #f9fbff;
        }
        .qr-image {
          max-width: 260px;
          width: 80%;
          animation: qr-pop 0.4s ease-out;
        }
        .qr-empty {
          color: #98a2b3;
          font-size: 14px;
        }
        .qr-glow {
          position: absolute;
          inset: 10px;
          border-radius: 20px;
          background: radial-gradient(circle, rgba(242, 122, 44, 0.12), transparent 70%);
          filter: blur(12px);
          opacity: 0.6;
          pointer-events: none;
        }
        .qr-meta {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
          background: var(--qr-mist);
          border-radius: 14px;
          padding: 12px 14px;
        }
        .qr-meta-label {
          display: block;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: var(--qr-ink-soft);
        }
        .qr-meta-value {
          font-size: 13px;
          font-family: "IBM Plex Mono", monospace;
        }
        @keyframes qr-fade {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes qr-pop {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @media (max-width: 960px) {
          .qr-header {
            padding: 20px;
          }
          .qr-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 520px) {
          .qr-page {
            padding: 20px 14px 48px;
          }
          .qr-card {
            padding: 16px;
            min-height: 0;
          }
          .qr-card-head {
            flex-direction: column;
            align-items: flex-start;
          }
          .qr-pill {
            width: 100%;
            text-align: center;
            white-space: normal;
          }
          .qr-frame-inner {
            min-height: 220px;
            padding: 12px;
          }
          .qr-image {
            width: 100%;
            max-width: 220px;
          }
          .qr-location input {
            width: 100%;
          }
          .qr-location button {
            width: 100%;
          }
        }
        @media (max-width: 640px) {
          .qr-header {
            padding: 18px;
          }
          .qr-title {
            font-size: 22px;
          }
          .qr-card {
            padding: 18px;
            min-height: 360px;
          }
        }
      `}</style>
      <div className="qr-shell">
        <div className="qr-header">
          <div className="qr-header-left">
            <button className="qr-back" type="button" onClick={() => navigate("/")}>
              ← Back to Home
            </button>
            <div>
              <h2 className="qr-title">QR Login / Logout</h2>
              <p className="qr-subtitle">
                One QR per action, reusable until expiry. Auto-refresh on expiry only.
              </p>
            </div>
          </div>
          <form className="qr-location" onSubmit={handleLocationSubmit}>
            <label htmlFor="qr-location-input">Location</label>
            <input
              id="qr-location-input"
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Gate-1"
            />
            <button type="submit">Update</button>
          </form>
        </div>

        <div className="qr-grid">
          <QrCard
            title="Login QR"
            imageSrc={loginState.imageSrc}
            expiresAt={loginState.expiresAt}
            loading={loginState.loading}
            remainingSeconds={loginRemaining}
          />
          <QrCard
            title="Logout QR"
            imageSrc={logoutState.imageSrc}
            expiresAt={logoutState.expiresAt}
            loading={logoutState.loading}
            remainingSeconds={logoutRemaining}
          />
        </div>
      </div>
    </div>
  );
};

export default QrPage;

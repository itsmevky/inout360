import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import QRCode from "qrcode";
import { domainpath } from "../../Helpers/api.js";
import "../../Styles/qrpage.css";

const DEFAULT_LOCATION = "Gate-1";

const QrCard = ({
  title,
  imageSrc,
  expiresAt,
  remainingSeconds,
  loading,
  onTitleClick,
}) => (
  <div className="qr-card">
    <div className="qr-card-head">
      <div>
        <p className="qr-eyebrow">Secure Access</p>
        {onTitleClick ? (
          <button
            type="button"
            className="qr-title-button"
            onClick={onTitleClick}
          >
            {title}
          </button>
        ) : (
          <h3 className="qr-title">{title}</h3>
        )}
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

const QrPage = ({ singleAction = null }) => {
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

  const isLoginOnly = singleAction === "login";
  const isLogoutOnly = singleAction === "logout";

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

  useEffect(() => {
    const token = localStorage.getItem("qr_access_token");
    if (!token) {
      navigate("/qr-login");
    }
  }, [navigate]);

  const handleQrLogout = () => {
    localStorage.removeItem("qr_access_token");
    navigate("/qr-login");
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
    if (!isLogoutOnly) {
      fetchQrPng("login", setLoginState);
    }
    if (!isLoginOnly) {
      fetchQrPng("logout", setLogoutState);
    }
    return () => {
      clearTimer(loginRefreshRef);
      clearTimer(logoutRefreshRef);
      clearIntervalRef(loginStatusRef);
      clearIntervalRef(logoutStatusRef);
      clearIntervalRef(loginTimerRef);
      clearIntervalRef(logoutTimerRef);
    };
  }, [fetchQrPng, isLoginOnly, isLogoutOnly]);

  useEffect(() => {
    if (isLogoutOnly) return;
    if (loginState.expiresAt) {
      scheduleRefresh(loginState.expiresAt, "login");
      startCountdown(loginState.expiresAt, "login");
    }
    if (loginState.token) {
      startStatusPolling(loginState.token, "login");
    }
  }, [
    loginState.expiresAt,
    loginState.token,
    scheduleRefresh,
    startStatusPolling,
    startCountdown,
    isLogoutOnly,
  ]);

  useEffect(() => {
    if (isLoginOnly) return;
    if (logoutState.expiresAt) {
      scheduleRefresh(logoutState.expiresAt, "logout");
      startCountdown(logoutState.expiresAt, "logout");
    }
    if (logoutState.token) {
      startStatusPolling(logoutState.token, "logout");
    }
  }, [
    logoutState.expiresAt,
    logoutState.token,
    scheduleRefresh,
    startStatusPolling,
    startCountdown,
    isLoginOnly,
  ]);

  const handleLocationSubmit = (event) => {
    event.preventDefault();
    if (!isLogoutOnly) {
      fetchQrPng("login", setLoginState);
    }
    if (!isLoginOnly) {
      fetchQrPng("logout", setLogoutState);
    }
  };

  const headerTitle = isLoginOnly
    ? "Login QR"
    : isLogoutOnly
      ? "Logout QR"
      : "QR Login / Logout";
  const headerSubtitle = isLoginOnly || isLogoutOnly
    ? "One QR per action, reusable until expiry. Auto-refresh on expiry only."
    : "One QR per action, reusable until expiry. Auto-refresh on expiry only.";

  return (
    <div className="qr-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0px', background: 'linear-gradient(#f1f3ff, #cbd4ff);' }}>
      <div className="qr-shell">
        {!singleAction && (
          <div className="qr-header">
            <div className="qr-header-left">
              <button className="qr-back" type="button" onClick={() => navigate("/")}>
                ← Back to Home
              </button>
              <div>
                <h2 className="qr-title">{headerTitle}</h2>
                <p className="qr-subtitle">{headerSubtitle}</p>
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
              {/* <button className="qr-logout" type="button" onClick={handleQrLogout}>
                Logout
              </button> */}
            </form>
          </div>
        )}

        <div className="qr-grid">
          {!isLogoutOnly && (
            <QrCard
              title="Login QR"
              imageSrc={loginState.imageSrc}
              expiresAt={loginState.expiresAt}
              loading={loginState.loading}
              remainingSeconds={loginRemaining}
              onTitleClick={
                isLoginOnly ? undefined : () => navigate("/LoginQr")
              }
            />
          )}
          {!isLoginOnly && (
            <QrCard
              title="Logout QR"
              imageSrc={logoutState.imageSrc}
              expiresAt={logoutState.expiresAt}
              loading={logoutState.loading}
              remainingSeconds={logoutRemaining}
              onTitleClick={
                isLogoutOnly ? undefined : () => navigate("/LogoutQr")
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default QrPage;

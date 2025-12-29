import React, { useEffect, useState } from "react";
import QRCode from "qrcode";

const TARGET_URL = "https://pidiliteapp.ajivainfotech.com/";

const AppQrPage = () => {
  const [qrSrc, setQrSrc] = useState("");
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const generateQr = async () => {
      setError("");
      setQrSrc("");
      setIsGenerating(true);
      try {
        const dataUrl = await QRCode.toDataURL(TARGET_URL, {
          width: 280,
          margin: 2,
          color: {
            dark: "#0f172a",
            light: "#ffffff",
          },
        });
        setQrSrc(dataUrl);
      } catch (_err) {
        setError("Failed to generate QR. Try again.");
      } finally {
        setIsGenerating(false);
      }
    };

    generateQr();
  }, []);

  return (
    <div className="layout-section-dashboard p-4">
      <div className="bg-white p-4 rounded-lg font-semibold text-xl flex items-center gap-2 app-qr-title">
        📲 App QR
        <span className="text-gray-500 text-base">Scan to open the app</span>
      </div>

      <div className="mt-5">
        <div className="bg-white rounded-xl p-5 shadow-sm app-qr-preview">
          <h3 className="text-lg font-semibold mb-4">Preview</h3>
          <div className="app-qr-frame">
            {qrSrc ? (
              <img src={qrSrc} alt="QR code" className="app-qr-image" />
            ) : (
              <div className="app-qr-empty">Generate QR to preview</div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-3">
            {isGenerating ? "Generating QR..." : `Scan this QR to open: ${TARGET_URL}`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AppQrPage;

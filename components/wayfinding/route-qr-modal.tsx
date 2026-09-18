"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Check, Copy, QrCode, Smartphone, X } from "lucide-react";
import type { Route } from "../../packages/domain";
import type { MapPlace } from "./explorer-model";

export function RouteQRModal({
  route,
  destination,
  originNodeId,
  accessible,
  onClose,
}: {
  route: Route;
  destination: MapPlace;
  originNodeId: string;
  accessible: boolean;
  onClose: () => void;
}) {
  const [link, setLink] = useState("");
  const [qr, setQr] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    let active = true;
    async function createCode() {
      let baseUrl = location.origin;
      try {
        const response = await fetch("/api/device-link", { cache: "no-store" });
        if (response.ok) baseUrl = (await response.json()).baseUrl || baseUrl;
      } catch {}
      const params = new URLSearchParams({
        destination: destination.id,
        origin: originNodeId,
      });
      if (accessible) params.set("accessible", "1");
      const mobileLink = `${baseUrl}/go?${params}`;
      const image = await QRCode.toDataURL(mobileLink, {
        width: 300,
        margin: 1,
        errorCorrectionLevel: "M",
        color: { dark: "#102447", light: "#ffffff" },
      });
      if (active) {
        setLink(mobileLink);
        setQr(image);
      }
    }
    createCode();
    return () => {
      active = false;
    };
  }, [accessible, destination.id, originNodeId]);
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }
  return (
    <div
      className="modal explorer-qr-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Scan directions QR code"
    >
      <div className="qr-card">
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close QR code"
        >
          <X />
        </button>
        <div className="qr-icon">
          <QrCode />
        </div>
        <p className="eyebrow">Continue on your phone</p>
        <h2>Scan to take directions with you</h2>
        <p className="explorer-qr-help">
          <Smartphone size={17} /> Open your phone camera and point it at this
          QR code.
        </p>
        {qr ? (
          <img
            src={qr}
            alt={`QR code for directions to ${destination.name}`}
            className="qr-image"
          />
        ) : (
          <div className="qr-loading">Generating route QR…</div>
        )}
        <strong>{destination.name}</strong>
        <span>
          {route.minutes} min · {route.distance} m ·{" "}
          {accessible ? "Step-free route" : "Fastest route"}
        </span>
        <small>
          The route opens in the phone browser. No app or sign-in required.
        </small>
        <button
          type="button"
          className="explorer-copy-link"
          onClick={copyLink}
          disabled={!link}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? "Link copied" : "Copy phone link"}
        </button>
        {link.includes("localhost") && (
          <p className="explorer-qr-warning">
            Connect the kiosk and phone to the same Wi-Fi, then restart the dev
            server with network access.
          </p>
        )}
        <code title={link}>{link || "Preparing phone link…"}</code>
        <button
          type="button"
          className="explorer-primary explorer-qr-continue"
          onClick={onClose}
        >
          Continue on kiosk
        </button>
      </div>
    </div>
  );
}

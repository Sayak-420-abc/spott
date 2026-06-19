"use client";

import { useState, useEffect, useRef } from "react";
import { QrCode, Loader2, KeyboardIcon, Camera, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function QRScannerModal({ isOpen, onClose }) {
  const [mode, setMode] = useState("camera"); // "camera" | "manual"
  const [scannerReady, setScannerReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [manualCode, setManualCode] = useState("");
  const [lastResult, setLastResult] = useState(null); // { success, name, message }
  const [isChecking, setIsChecking] = useState(false);
  const scannerRef = useRef(null);
  const inputRef = useRef(null);

  const { mutate: checkInAttendee } = useConvexMutation(api.registrations.checkInAttendee);

  const handleCheckIn = async (qrCode) => {
    if (!qrCode?.trim()) return;
    setIsChecking(true);
    try {
      const result = await checkInAttendee({ qrCode: qrCode.trim() });
      if (result.success) {
        setLastResult({
          success: true,
          name: result.registration?.attendeeName ?? "Attendee",
          message: "Check-in successful!",
        });
        toast.success(`✅ ${result.registration?.attendeeName ?? "Attendee"} checked in!`);
        setManualCode("");
      } else {
        setLastResult({ success: false, message: result.message ?? "Already checked in" });
        toast.warning(result.message ?? "Already checked in");
      }
    } catch (error) {
      setLastResult({ success: false, message: error.message ?? "Invalid QR code" });
      toast.error(error.message ?? "Invalid QR code");
    } finally {
      setIsChecking(false);
    }
  };

  // ── Camera mode ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || mode !== "camera") return;

    let scanner = null;
    let mounted = true;

    const initScanner = async () => {
      setScannerReady(false);
      setCameraError(null);

      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
      } catch {
        setCameraError("Camera access denied. Use manual entry below.");
        setMode("manual");
        return;
      }

      try {
        const { Html5QrcodeScanner } = await import("html5-qrcode");
        if (!mounted) return;

        scanner = new Html5QrcodeScanner(
          "qr-reader",
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true,
            videoConstraints: { facingMode: "environment" },
          },
          false
        );

        scanner.render(
          (decodedText) => {
            if (scanner) scanner.clear().catch(() => {});
            handleCheckIn(decodedText);
          },
          (err) => {
            if (err && !err.includes("NotFoundException")) console.debug("Scan:", err);
          }
        );

        scannerRef.current = scanner;
        setScannerReady(true);
        setCameraError(null);
      } catch (err) {
        setCameraError(`Camera failed: ${err.message}. Switch to manual entry.`);
      }
    };

    initScanner();

    return () => {
      mounted = false;
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
      setScannerReady(false);
    };
  }, [isOpen, mode]);

  // Focus manual input when switching to manual mode
  useEffect(() => {
    if (mode === "manual" && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [mode]);

  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
      scannerRef.current = null;
    }
    setLastResult(null);
    setManualCode("");
    setCameraError(null);
    setScannerReady(false);
    onClose();
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) handleCheckIn(manualCode);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-zinc-950 border border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <QrCode className="w-5 h-5 text-purple-400" />
            Check-In Attendee
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Scan a QR code with your camera or enter the ticket code manually.
          </DialogDescription>
        </DialogHeader>

        {/* Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => { setMode("camera"); setLastResult(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              mode === "camera"
                ? "bg-purple-600 text-white"
                : "bg-zinc-900 text-gray-400 hover:text-white border border-gray-800"
            }`}
          >
            <Camera className="w-4 h-4" />
            Camera Scan
          </button>
          <button
            onClick={() => { setMode("manual"); setLastResult(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              mode === "manual"
                ? "bg-purple-600 text-white"
                : "bg-zinc-900 text-gray-400 hover:text-white border border-gray-800"
            }`}
          >
            <KeyboardIcon className="w-4 h-4" />
            Manual Entry
          </button>
        </div>

        {/* Last result banner */}
        {lastResult && (
          <div
            className={`flex items-center gap-3 p-3 rounded-xl border text-sm ${
              lastResult.success
                ? "bg-emerald-950/40 border-emerald-700/50 text-emerald-300"
                : "bg-red-950/40 border-red-700/50 text-red-300"
            }`}
          >
            {lastResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            )}
            <div>
              {lastResult.success && (
                <p className="font-bold">{lastResult.name}</p>
              )}
              <p>{lastResult.message}</p>
            </div>
            <button
              onClick={() => setLastResult(null)}
              className="ml-auto text-gray-500 hover:text-white"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Camera Mode ── */}
        {mode === "camera" && (
          <div className="space-y-3">
            {cameraError ? (
              <div className="text-sm text-red-400 bg-red-950/30 border border-red-800/40 rounded-xl p-4 text-center">
                {cameraError}
              </div>
            ) : (
              <>
                <div
                  id="qr-reader"
                  className="w-full rounded-xl overflow-hidden"
                  style={{ minHeight: "300px" }}
                />
                {!scannerReady && (
                  <div className="flex items-center justify-center py-4 gap-2 text-gray-400 text-sm">
                    <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                    Starting camera…
                  </div>
                )}
                {scannerReady && (
                  <p className="text-xs text-gray-500 text-center">
                    Position the attendee&apos;s QR code within the frame
                  </p>
                )}
              </>
            )}
          </div>
        )}
 
        {/* ── Manual Entry Mode ── */}
        {mode === "manual" && (
          <form onSubmit={handleManualSubmit} className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-1.5 block">
                Ticket / QR Code
              </label>
              <input
                ref={inputRef}
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="e.g. EVT-1234567890-ABC123"
                className="w-full bg-zinc-900 border border-gray-700 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-colors placeholder:text-gray-600 font-mono"
                autoComplete="off"
              />
              <p className="text-[11px] text-gray-600 mt-1.5">
                The QR code value is printed on the attendee&apos;s ticket email.
              </p>
            </div>
            <button
              type="submit"
              disabled={!manualCode.trim() || isChecking}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isChecking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Checking in…
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Check In
                </>
              )}
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

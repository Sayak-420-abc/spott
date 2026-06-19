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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <DialogContent className="bg-[var(--bg-card)] border-2 border-[var(--border)] text-[var(--text-primary)] rounded-none shadow-[6px_6px_0px_0px_var(--shadow-color)] max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-black uppercase text-lg text-[var(--text-primary)]">
            <QrCode className="w-5 h-5 text-[var(--color-primary)]" />
            Check-In Attendee
          </DialogTitle>
          <DialogDescription className="text-xs font-bold text-[var(--text-secondary)] mt-1 uppercase">
            Scan a QR code with your camera or enter the ticket code manually.
          </DialogDescription>
        </DialogHeader>

        {/* Mode Toggle */}
        <div className="flex gap-2.5 mt-3">
          <button
            onClick={() => { setMode("camera"); setLastResult(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 border-2 border-[var(--border)] text-xs font-black uppercase transition-all shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer ${
              mode === "camera"
                ? "bg-[var(--color-primary)] text-white"
                : "bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
            }`}
          >
            <Camera className="w-4 h-4" />
            Camera Scan
          </button>
          <button
            onClick={() => { setMode("manual"); setLastResult(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 border-2 border-[var(--border)] text-xs font-black uppercase transition-all shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer ${
              mode === "manual"
                ? "bg-[var(--color-primary)] text-white"
                : "bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
            }`}
          >
            <KeyboardIcon className="w-4 h-4" />
            Manual Entry
          </button>
        </div>

        {/* Last result banner */}
        {lastResult && (
          <div
            className={`flex items-center gap-3 p-3 border-2 border-[var(--border)] shadow-[3px_3px_0px_0px_var(--shadow-color)] text-xs font-bold uppercase mt-2 ${
              lastResult.success
                ? "bg-[var(--color-success)] text-[var(--text-primary)]"
                : "bg-[var(--color-danger)] text-white"
            }`}
          >
            {lastResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-[var(--text-primary)] flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-white flex-shrink-0" />
            )}
            <div className="flex-1">
              {lastResult.success && (
                <p className="font-black text-sm">{lastResult.name}</p>
              )}
              <p className="mt-0.5">{lastResult.message}</p>
            </div>
            <button
              onClick={() => setLastResult(null)}
              className="text-current hover:opacity-80 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Camera Mode ── */}
        {mode === "camera" && (
          <div className="space-y-3 mt-4">
            {cameraError ? (
              <div className="text-xs font-bold uppercase text-[var(--color-danger)] bg-[var(--bg-elevated)] border-2 border-[var(--color-danger)] shadow-[2px_2px_0px_0px_var(--shadow-color)] p-4 text-center">
                {cameraError}
              </div>
            ) : (
              <>
                <div
                  id="qr-reader"
                  className="w-full border-2 border-[var(--border)] shadow-[3px_3px_0px_0px_var(--shadow-color)] bg-black overflow-hidden"
                  style={{ minHeight: "260px" }}
                />
                {!scannerReady && (
                  <div className="flex items-center justify-center py-4 gap-2 text-[var(--text-secondary)] text-xs font-bold uppercase">
                    <Loader2 className="w-5 h-5 animate-spin text-[var(--color-primary)]" />
                    Starting camera…
                  </div>
                )}
                {scannerReady && (
                  <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase text-center mt-2">
                    Position the attendee&apos;s QR code within the frame
                  </p>
                )}
              </>
            )}
          </div>
        )}
 
        {/* ── Manual Entry Mode ── */}
        {mode === "manual" && (
          <form onSubmit={handleManualSubmit} className="space-y-3 mt-4">
            <div>
              <label className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-wider mb-1 block">
                Ticket / QR Code
              </label>
              <input
                ref={inputRef}
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="e.g. EVT-1234567890-ABC123"
                className="w-full bg-[var(--bg-card)] border-2 border-[var(--border)] text-[var(--text-primary)] text-xs font-bold px-4 py-3 outline-none focus:border-[var(--color-primary)] focus:shadow-[2px_2px_0px_0px_var(--shadow-color)] transition-all placeholder:text-[var(--text-muted)] font-mono"
                autoComplete="off"
              />
              <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase mt-2">
                The QR code value is printed on the attendee&apos;s ticket email.
              </p>
            </div>
            <button
              type="submit"
              disabled={!manualCode.trim() || isChecking}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-[var(--border)] bg-[var(--color-primary)] text-white font-black text-xs uppercase hover:bg-[var(--color-primary-hover)] transition-all shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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

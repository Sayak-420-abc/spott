"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import Link from "next/link";

export default function TestNotificationsPage() {
  const testNotification = useMutation(api.notifications.testNotificationAndEmail);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await testNotification();
      setResult(res);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "60px auto",
        padding: "32px",
        background: "var(--bg-card)",
        border: "3px solid var(--border)",
        boxShadow: "6px 6px 0px 0px var(--shadow-color)",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 900,
          fontSize: "24px",
          color: "var(--text-primary)",
          marginBottom: "8px",
        }}
      >
        🧪 Notification & Email Test
      </h1>
      <p
        style={{
          fontSize: "14px",
          color: "var(--text-secondary)",
          marginBottom: "24px",
          lineHeight: 1.6,
        }}
      >
        Click the button below to create a test notification and send a test email
        to your registered email. Make sure{" "}
        <code
          style={{
            background: "var(--bg-elevated)",
            padding: "2px 6px",
            border: "1px solid var(--border)",
            fontSize: "12px",
          }}
        >
          GMAIL_USER
        </code>{" "}
        and{" "}
        <code
          style={{
            background: "var(--bg-elevated)",
            padding: "2px 6px",
            border: "1px solid var(--border)",
            fontSize: "12px",
          }}
        >
          GMAIL_APP_PASSWORD
        </code>{" "}
        are set in your Convex dashboard environment variables.
      </p>

      <button
        onClick={handleTest}
        disabled={loading}
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 900,
          fontSize: "14px",
          textTransform: "uppercase",
          letterSpacing: "1px",
          padding: "14px 28px",
          background: loading ? "var(--text-muted)" : "var(--color-primary)",
          color: "#FFFFFF",
          border: "3px solid var(--border)",
          boxShadow: loading ? "none" : "4px 4px 0px 0px var(--shadow-color)",
          cursor: loading ? "wait" : "pointer",
          transition: "all 0.15s ease",
          transform: loading ? "translate(2px, 2px)" : "none",
          width: "100%",
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.currentTarget.style.transform = "translate(-2px, -2px)";
            e.currentTarget.style.boxShadow =
              "6px 6px 0px 0px var(--shadow-color)";
          }
        }}
        onMouseLeave={(e) => {
          if (!loading) {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow =
              "4px 4px 0px 0px var(--shadow-color)";
          }
        }}
      >
        {loading ? "⏳ Sending..." : "🚀 Send Test Notification + Email"}
      </button>

      {/* Success result */}
      {result && (
        <div
          style={{
            marginTop: "20px",
            padding: "16px",
            background: "#ECFDF5",
            border: "2px solid var(--border)",
            boxShadow: "3px 3px 0px 0px var(--shadow-color)",
          }}
        >
          <p
            style={{
              fontWeight: 800,
              fontSize: "14px",
              color: "#065F46",
              margin: "0 0 8px",
            }}
          >
            ✅ Success!
          </p>
          <p style={{ fontSize: "13px", color: "#047857", margin: "0 0 4px" }}>
            <strong>Email sent to:</strong> {result.emailScheduledTo}
          </p>
          <p style={{ fontSize: "13px", color: "#047857", margin: "0 0 4px" }}>
            <strong>Event used:</strong> {result.eventUsed}
          </p>
          <p style={{ fontSize: "13px", color: "#047857", margin: "0 0 12px" }}>
            <strong>Notification ID:</strong>{" "}
            {result.notificationId ?? "N/A (no events in DB)"}
          </p>
          <p style={{ fontSize: "12px", color: "#047857", margin: 0 }}>
            Check the 🔔 bell icon in the header for the in-app notification,
            and check your inbox for the email.
          </p>
        </div>
      )}

      {/* Error result */}
      {error && (
        <div
          style={{
            marginTop: "20px",
            padding: "16px",
            background: "#FEF2F2",
            border: "2px solid var(--border)",
            boxShadow: "3px 3px 0px 0px var(--shadow-color)",
          }}
        >
          <p
            style={{
              fontWeight: 800,
              fontSize: "14px",
              color: "#991B1B",
              margin: "0 0 8px",
            }}
          >
            ❌ Error
          </p>
          <p style={{ fontSize: "13px", color: "#B91C1C", margin: 0 }}>
            {error}
          </p>
        </div>
      )}

      <Link
        href="/"
        style={{
          display: "inline-block",
          marginTop: "20px",
          fontSize: "13px",
          fontWeight: 700,
          color: "var(--color-primary)",
          textDecoration: "underline",
        }}
      >
        ← Back to Home
      </Link>
    </div>
  );
}

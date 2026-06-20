"use client";

import { X, Sparkles, Crown } from "lucide-react";
import { PricingTable } from "@clerk/nextjs";

export default function UpgradeModal({ isOpen, onClose, trigger = "limit" }) {
  if (!isOpen) return null;

  const triggerMessage = {
    header: "Create Unlimited Events with Pro!",
    limit: "You've reached your free event limit.",
    color: "Custom theme colors are a Pro feature.",
  }[trigger] ?? "";

  return (
    /* Overlay */
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(30, 41, 59, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        overflowY: "auto",
      }}
    >
      {/* Modal box */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg-card)",
          border: "3px solid var(--border)",
          boxShadow: "8px 8px 0px 0px var(--shadow-color)",
          borderRadius: "0px",
          width: "100%",
          maxWidth: "660px",
          position: "relative",
          animation: "fadeIn 0.2s cubic-bezier(0.34,1.56,0.64,1) forwards",
          margin: "auto",
        }}
      >
        {/* ── Header stripe ── */}
        <div
          style={{
            background: "var(--color-primary)",
            borderBottom: "3px solid var(--border)",
            padding: "1.25rem 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
            <div
              style={{
                width: 34,
                height: 34,
                background: "var(--color-accent)",
                border: "2px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "2px 2px 0px 0px var(--shadow-color)",
                flexShrink: 0,
              }}
            >
              <Crown size={16} color="var(--border)" strokeWidth={2.5} />
            </div>
            <div>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  fontSize: "1.2rem",
                  color: "#FFFFFF",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  margin: 0,
                  lineHeight: 1.1,
                }}
              >
                Upgrade to Pro
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.78rem",
                  color: "rgba(255,255,255,0.8)",
                  fontWeight: 500,
                  marginTop: "0.2rem",
                }}
              >
                {triggerMessage} Unlock unlimited events and premium features!
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              background: "var(--color-accent)",
              border: "2px solid var(--border)",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "2px 2px 0px 0px var(--shadow-color)",
              transition: "all 0.2s ease",
              borderRadius: "0px",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translate(-1px,-1px)";
              e.currentTarget.style.boxShadow = "3px 3px 0px 0px var(--shadow-color)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translate(0,0)";
              e.currentTarget.style.boxShadow = "2px 2px 0px 0px var(--shadow-color)";
            }}
          >
            <X size={14} color="var(--border)" strokeWidth={2.5} />
          </button>
        </div>

        {/* ── Pricing Table ── */}
        <div
          style={{
            padding: "1.5rem",
            background: "var(--bg-card)",
          }}
        >
          {/* Sparkles label */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              marginBottom: "1rem",
              padding: "0.3rem 0.85rem",
              background: "var(--bg-elevated)",
              border: "2px solid var(--border)",
              boxShadow: "2px 2px 0px 0px var(--shadow-color)",
              fontFamily: "var(--font-display)",
              fontSize: "0.65rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--color-primary)",
            }}
          >
            <Sparkles size={11} strokeWidth={2.5} />
            Choose Your Plan
          </div>

          <PricingTable
            checkoutProps={{
              appearance: {
                elements: {
                  drawerRoot: { zIndex: 2000 },
                },
              },
            }}
          />
        </div>

        {/* ── Footer ── */}
        <div
          style={{
            borderTop: "2px dashed var(--border)",
            padding: "1rem 1.5rem",
            background: "var(--bg-elevated)",
          }}
        >
          <button
            onClick={onClose}
            className="btn-ghost"
            style={{ width: "100%", justifyContent: "center" }}
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Ticket, CheckCircle, X, User, Mail, Zap } from "lucide-react";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

export default function RegisterModal({ event, isOpen, onClose }) {
  const router = useRouter();
  const { user } = useUser();
  const [name, setName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(
    user?.primaryEmailAddress?.emailAddress || "",
  );
  const [isSuccess, setIsSuccess] = useState(false);

  const { mutate: registerForEvent, isLoading } = useConvexMutation(
    api.registrations.registerForEvent,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      await registerForEvent({
        eventId: event._id,
        attendeeName: name,
        attendeeEmail: email,
      });
      setIsSuccess(true);
      toast.success("Registration successful! 🎉");
    } catch (error) {
      toast.error(error.message || "Registration failed");
    }
  };

  const handleViewTicket = () => {
    router.push("/my-tickets");
    onClose();
  };

  if (!isOpen) return null;

  return (
    /* Overlay */
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(30, 41, 59, 0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      {/* Modal box — stop propagation so clicking inside doesn't close */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg-card)",
          border: "3px solid var(--border)",
          boxShadow: "8px 8px 0px 0px var(--shadow-color)",
          borderRadius: "0px",
          width: "100%",
          maxWidth: "480px",
          position: "relative",
          animation: "fadeIn 0.2s cubic-bezier(0.34,1.56,0.64,1) forwards",
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
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div
              style={{
                width: 32,
                height: 32,
                background: "var(--color-accent)",
                border: "2px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "2px 2px 0px 0px var(--shadow-color)",
              }}
            >
              <Ticket size={14} color="var(--border)" strokeWidth={2.5} />
            </div>
            <div>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  color: "#FFFFFF",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  margin: 0,
                }}
              >
                Register for Event
              </h2>
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

        {/* ── Body ── */}
        <div style={{ padding: "1.5rem" }}>

          {isSuccess ? (
            /* ── Success state ── */
            <div style={{ textAlign: "center", padding: "1rem 0" }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  background: "var(--color-success)",
                  border: "3px solid var(--border)",
                  boxShadow: "4px 4px 0px 0px var(--shadow-color)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.25rem",
                }}
              >
                <CheckCircle size={28} color="var(--border)" strokeWidth={2.5} />
              </div>

              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  fontSize: "1.4rem",
                  color: "var(--text-primary)",
                  textTransform: "uppercase",
                  marginBottom: "0.5rem",
                }}
              >
                You&apos;re All Set!
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  color: "var(--text-secondary)",
                  fontSize: "0.88rem",
                  lineHeight: 1.6,
                  marginBottom: "1.5rem",
                }}
              >
                Your registration is confirmed. Check your Tickets for event
                details and your QR code ticket.
              </p>

              <div
                style={{
                  borderTop: "2px dashed var(--border)",
                  paddingTop: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <button
                  onClick={handleViewTicket}
                  className="btn-primary"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  <Ticket size={15} strokeWidth={2.5} />
                  View My Ticket
                </button>
                <button
                  onClick={onClose}
                  className="btn-ghost"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            /* ── Registration form ── */
            <form onSubmit={handleSubmit}>
              {/* Event summary card */}
              <div
                style={{
                  background: "var(--bg-elevated)",
                  border: "2px solid var(--border)",
                  boxShadow: "3px 3px 0px 0px var(--shadow-color)",
                  padding: "1rem",
                  marginBottom: "1.25rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    marginBottom: "0.4rem",
                  }}
                >
                  <Zap size={12} color="var(--color-primary)" strokeWidth={2.5} />
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "0.62rem",
                      fontWeight: 800,
                      color: "var(--color-primary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Event
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    color: "var(--text-primary)",
                    marginBottom: "0.3rem",
                    lineHeight: 1.3,
                  }}
                >
                  {event.title}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                    fontWeight: 600,
                  }}
                >
                  {event.ticketType === "free" ? (
                    <span style={{ color: "var(--color-success)", fontWeight: 700 }}>
                      ✓ Free Event
                    </span>
                  ) : (
                    <>
                      Price: <strong style={{ color: "var(--color-primary)" }}>₹{event.ticketPrice}</strong>{" "}
                      <span style={{ fontSize: "0.72rem", fontWeight: 500 }}>(Pay at venue)</span>
                    </>
                  )}
                </p>
              </div>

              {/* Full Name */}
              <div style={{ marginBottom: "1rem" }}>
                <label
                  htmlFor="name"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "var(--text-primary)",
                    marginBottom: "0.5rem",
                  }}
                >
                  <User size={12} strokeWidth={2.5} />
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="input-field"
                />
              </div>

              {/* Email */}
              <div style={{ marginBottom: "1rem" }}>
                <label
                  htmlFor="email"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "var(--text-primary)",
                    marginBottom: "0.5rem",
                  }}
                >
                  <Mail size={12} strokeWidth={2.5} />
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  required
                  className="input-field"
                />
              </div>

              {/* Terms */}
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.72rem",
                  color: "var(--text-muted)",
                  fontWeight: 500,
                  lineHeight: 1.5,
                  marginBottom: "1.25rem",
                  borderLeft: "3px solid var(--color-accent)",
                  paddingLeft: "0.75rem",
                }}
              >
                By registering, you agree to receive event updates and reminders via email.
              </p>

              {/* Divider */}
              <div
                style={{
                  borderTop: "2px dashed var(--border)",
                  marginBottom: "1.25rem",
                }}
              />

              {/* Action buttons */}
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="btn-ghost"
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary"
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    opacity: isLoading ? 0.7 : 1,
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" strokeWidth={2.5} />
                      Registering...
                    </>
                  ) : (
                    <>
                      <Ticket size={14} strokeWidth={2.5} />
                      Register
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

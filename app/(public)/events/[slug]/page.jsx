/* eslint-disable react-hooks/purity */
"use client";

import { useParams, useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Share2,
  Ticket,
  ExternalLink,
  Loader2,
  CheckCircle,
  Heart,
} from "lucide-react";
import { useConvexQuery, useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { getCategoryIcon, getCategoryLabel } from "@/lib/data";
import RegisterModal from "./_components/register-modal";

// Utility function to darken a color
function darkenColor(color, amount) {
  const colorWithoutHash = color.replace("#", "");
  const num = parseInt(colorWithoutHash, 16);
  const r = Math.max(0, (num >> 16) - amount * 255);
  const g = Math.max(0, ((num >> 8) & 0x00ff) - amount * 255);
  const b = Math.max(0, (num & 0x0000ff) - amount * 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

// Card with always-white text on event theme color
function ThemeCard({ themeColor, children, style = {} }) {
  return (
    <div
      style={{
        backgroundColor: themeColor ? darkenColor(themeColor, 0.06) : "#1e3a8a",
        border: "3px solid rgba(255,255,255,0.2)",
        boxShadow: "4px 4px 0px 0px rgba(0,0,0,0.3)",
        padding: "1.5rem",
        color: "#FFFFFF",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [togglingLike, setTogglingLike] = useState(false);

  const { data: event, isLoading } = useConvexQuery(api.events.getEventBySlug, {
    slug: params.slug,
  });

  const { data: dbUser } = useConvexQuery(api.users.getCurrentUser);

  const { data: isLikedEvent } = useConvexQuery(
    api.events.isLiked,
    event?._id && dbUser?._id ? { eventId: event._id, userId: dbUser._id } : "skip"
  );

  const { mutate: toggleLike } = useConvexMutation(api.events.toggleLikeEvent);
  const { mutate: recordInteraction } = useConvexMutation(api.analytics.recordInteraction);

  useEffect(() => {
    if (event?._id && dbUser?._id) {
      recordInteraction({
        eventId: event._id,
        userId: dbUser._id,
        interactionType: "viewed",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?._id, dbUser?._id]);

  const handleToggleLike = async () => {
    if (!event?._id) return;
    setTogglingLike(true);
    try {
      const res = await toggleLike({ eventId: event._id });
      if (res?.liked) {
        toast.success("Event liked!");
      } else {
        toast.info("Event unliked.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update like status");
    } finally {
      setTogglingLike(false);
    }
  };

  const { data: registration } = useConvexQuery(
    api.registrations.checkRegistration,
    event?._id ? { eventId: event._id } : "skip",
  );

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description.slice(0, 100) + "...",
          url: url,
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleRegister = () => {
    if (!user) {
      toast.error("Please sign in to register");
      return;
    }
    setShowRegisterModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--color-primary)" }} />
      </div>
    );
  }

  if (!event) {
    notFound();
  }

  const isEventFull = event.registrationCount >= event.capacity;
  const isEventPast = event.endDate < Date.now();
  const isOrganizer = user?.id === event.organizerId;
  const bg = event.themeColor || "#1e3a8a";

  return (
    <div
      style={{ backgroundColor: bg }}
      className="min-h-screen py-8 -mt-6 md:-mt-16 lg:-mx-5"
    >
      <div className="max-w-7xl mx-auto px-8">

        {/* ── Event Title & Info — always white text ── */}
        <div className="mb-8">
          {/* Category badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.3rem 0.85rem",
              background: "rgba(255,255,255,0.15)",
              border: "2px solid rgba(255,255,255,0.4)",
              boxShadow: "2px 2px 0px 0px rgba(0,0,0,0.25)",
              fontFamily: "var(--font-display)",
              fontSize: "0.72rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#FFFFFF",
              marginBottom: "1rem",
            }}
          >
            {getCategoryIcon(event.category)} {getCategoryLabel(event.category)}
          </div>

          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "clamp(1.8rem, 4vw, 3rem)",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              color: "#FFFFFF",
              marginBottom: "1rem",
              textShadow: "2px 2px 0px rgba(0,0,0,0.3)",
            }}
          >
            {event.title}
          </h1>

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "rgba(255,255,255,0.85)" }}>
              <Calendar size={16} strokeWidth={2} />
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", fontWeight: 600 }}>
                {format(event.startDate, "EEEE, MMMM dd, yyyy")}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "rgba(255,255,255,0.85)" }}>
              <Clock size={16} strokeWidth={2} />
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", fontWeight: 600 }}>
                {format(event.startDate, "h:mm a")} – {format(event.endDate, "h:mm a")}
              </span>
            </div>
          </div>
        </div>

        {/* ── Hero Image ── */}
        {event.coverImage && (
          <div
            style={{
              position: "relative",
              height: 400,
              border: "3px solid rgba(255,255,255,0.25)",
              boxShadow: "6px 6px 0px 0px rgba(0,0,0,0.3)",
              overflow: "hidden",
              marginBottom: "2rem",
            }}
          >
            <Image
              src={event.coverImage}
              alt={event.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          {/* ── Main Content ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* About */}
            <ThemeCard themeColor={bg}>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "1.25rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: "#FFFFFF",
                  marginBottom: "1rem",
                  borderBottom: "2px solid rgba(255,255,255,0.25)",
                  paddingBottom: "0.75rem",
                }}
              >
                About This Event
              </h2>
              <p
                style={{
                  color: "rgba(255,255,255,0.85)",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.92rem",
                  lineHeight: 1.75,
                  whiteSpace: "pre-wrap",
                }}
              >
                {event.description}
              </p>
            </ThemeCard>

            {/* Location */}
            <ThemeCard themeColor={bg}>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "1.25rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: "#FFFFFF",
                  marginBottom: "1rem",
                  borderBottom: "2px solid rgba(255,255,255,0.25)",
                  paddingBottom: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <MapPin size={18} strokeWidth={2.5} />
                Location
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <p style={{ color: "#FFFFFF", fontWeight: 700, fontFamily: "var(--font-sans)" }}>
                  {event.city}, {event.state || event.country}
                </p>
                {event.address && (
                  <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.88rem", fontFamily: "var(--font-sans)" }}>
                    {event.address}
                  </p>
                )}
                {event.venue && (
                  <a
                    href={event.venue}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      marginTop: "0.5rem",
                      padding: "0.5rem 1rem",
                      background: "rgba(255,255,255,0.15)",
                      border: "2px solid rgba(255,255,255,0.4)",
                      color: "#FFFFFF",
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      textDecoration: "none",
                      boxShadow: "2px 2px 0px 0px rgba(0,0,0,0.25)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    View on Map
                    <ExternalLink size={13} strokeWidth={2.5} />
                  </a>
                )}
              </div>
            </ThemeCard>

            {/* Organizer */}
            <ThemeCard themeColor={bg}>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "1.25rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: "#FFFFFF",
                  marginBottom: "1rem",
                  borderBottom: "2px solid rgba(255,255,255,0.25)",
                  paddingBottom: "0.75rem",
                }}
              >
                Organizer
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    background: "rgba(255,255,255,0.2)",
                    border: "2px solid rgba(255,255,255,0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-display)",
                    fontWeight: 900,
                    fontSize: "1.25rem",
                    color: "#FFFFFF",
                    flexShrink: 0,
                  }}
                >
                  {event.organizerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontWeight: 700, color: "#FFFFFF", fontFamily: "var(--font-sans)" }}>
                    {event.organizerName}
                  </p>
                  <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-sans)" }}>
                    Event Organizer
                  </p>
                </div>
              </div>
            </ThemeCard>
          </div>

          {/* ── Sidebar Registration Card ── */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div
              style={{
                backgroundColor: darkenColor(bg, 0.08),
                border: "3px solid rgba(255,255,255,0.25)",
                boxShadow: "6px 6px 0px 0px rgba(0,0,0,0.35)",
                overflow: "hidden",
              }}
            >
              {/* Card header stripe */}
              <div
                style={{
                  background: "rgba(255,255,255,0.1)",
                  borderBottom: "2px solid rgba(255,255,255,0.2)",
                  padding: "0.75rem 1.5rem",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  // Registration
                </span>
              </div>

              <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

                {/* Price */}
                <div>
                  <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-sans)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.35rem" }}>
                    Price
                  </p>
                  <p style={{ fontSize: "2rem", fontWeight: 900, color: "#FFFFFF", fontFamily: "var(--font-display)", lineHeight: 1 }}>
                    {event.ticketType === "free" ? "Free" : `₹${event.ticketPrice}`}
                  </p>
                  {event.ticketType === "paid" && (
                    <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-sans)", marginTop: "0.25rem" }}>
                      Pay at event offline
                    </p>
                  )}
                </div>

                {/* Divider */}
                <div style={{ borderTop: "2px dashed rgba(255,255,255,0.2)" }} />

                {/* Stats */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {[
                    { icon: <Users size={14} strokeWidth={2} />, label: "Attendees", value: `${event.registrationCount} / ${event.capacity}` },
                    { icon: <Calendar size={14} strokeWidth={2} />, label: "Date", value: format(event.startDate, "MMM dd") },
                    { icon: <Clock size={14} strokeWidth={2} />, label: "Time", value: format(event.startDate, "h:mm a") },
                  ].map(({ icon, label, value }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "rgba(255,255,255,0.65)", fontFamily: "var(--font-sans)", fontSize: "0.85rem" }}>
                        {icon}
                        <span>{label}</span>
                      </div>
                      <span style={{ fontWeight: 700, color: "#FFFFFF", fontFamily: "var(--font-sans)", fontSize: "0.85rem" }}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div style={{ borderTop: "2px dashed rgba(255,255,255,0.2)" }} />

                {/* Registration CTA */}
                {registration ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                        background: "rgba(52,211,153,0.2)",
                        border: "2px solid rgba(52,211,153,0.5)",
                        padding: "0.75rem 1rem",
                        color: "#6EF7CE",
                      }}
                    >
                      <CheckCircle size={16} strokeWidth={2.5} />
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.85rem" }}>
                        You&apos;re registered!
                      </span>
                    </div>
                    <button
                      onClick={() => router.push("/my-tickets")}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                        padding: "0.75rem 1.5rem",
                        background: "#FFFFFF",
                        border: "2px solid rgba(0,0,0,0.5)",
                        boxShadow: "3px 3px 0px 0px rgba(0,0,0,0.4)",
                        fontFamily: "var(--font-display)",
                        fontWeight: 800,
                        fontSize: "0.85rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        color: "#1E293B",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = "translate(-1px,-1px)"; e.currentTarget.style.boxShadow = "4px 4px 0px 0px rgba(0,0,0,0.4)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = "translate(0,0)"; e.currentTarget.style.boxShadow = "3px 3px 0px 0px rgba(0,0,0,0.4)"; }}
                    >
                      <Ticket size={15} strokeWidth={2.5} />
                      View Ticket
                    </button>
                  </div>
                ) : isEventPast ? (
                  <button
                    disabled
                    style={{
                      width: "100%",
                      padding: "0.75rem 1.5rem",
                      background: "rgba(255,255,255,0.1)",
                      border: "2px solid rgba(255,255,255,0.2)",
                      fontFamily: "var(--font-display)",
                      fontWeight: 800,
                      fontSize: "0.85rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      color: "rgba(255,255,255,0.4)",
                      cursor: "not-allowed",
                    }}
                  >
                    Event Ended
                  </button>
                ) : isEventFull ? (
                  <button
                    disabled
                    style={{
                      width: "100%",
                      padding: "0.75rem 1.5rem",
                      background: "rgba(255,255,255,0.1)",
                      border: "2px solid rgba(255,255,255,0.2)",
                      fontFamily: "var(--font-display)",
                      fontWeight: 800,
                      fontSize: "0.85rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      color: "rgba(255,255,255,0.4)",
                      cursor: "not-allowed",
                    }}
                  >
                    Event Full
                  </button>
                ) : isOrganizer ? (
                  <button
                    onClick={() => router.push(`/events/${event.slug}/manage`)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      padding: "0.75rem 1.5rem",
                      background: "rgba(255,255,255,0.15)",
                      border: "2px solid rgba(255,255,255,0.5)",
                      boxShadow: "3px 3px 0px 0px rgba(0,0,0,0.3)",
                      fontFamily: "var(--font-display)",
                      fontWeight: 800,
                      fontSize: "0.85rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      color: "#FFFFFF",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    Manage Event
                  </button>
                ) : (
                  <button
                    onClick={handleRegister}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.6rem",
                      padding: "0.9rem 1.5rem",
                      background: "#FFFFFF",
                      border: "3px solid rgba(0,0,0,0.6)",
                      boxShadow: "4px 4px 0px 0px rgba(0,0,0,0.45)",
                      fontFamily: "var(--font-display)",
                      fontWeight: 900,
                      fontSize: "0.92rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "#1E293B",
                      cursor: "pointer",
                      transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translate(-2px,-2px)"; e.currentTarget.style.boxShadow = "6px 6px 0px 0px rgba(0,0,0,0.45)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "translate(0,0)"; e.currentTarget.style.boxShadow = "4px 4px 0px 0px rgba(0,0,0,0.45)"; }}
                  >
                    <Ticket size={16} strokeWidth={2.5} />
                    Register for Event
                  </button>
                )}

                {/* Like Button */}
                {user && (
                  <button
                    onClick={handleToggleLike}
                    disabled={togglingLike}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      padding: "0.7rem 1.5rem",
                      background: isLikedEvent ? "rgba(225,29,72,0.3)" : "rgba(255,255,255,0.1)",
                      border: isLikedEvent ? "2px solid rgba(244,63,94,0.7)" : "2px solid rgba(255,255,255,0.3)",
                      boxShadow: "2px 2px 0px 0px rgba(0,0,0,0.25)",
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      color: isLikedEvent ? "#FDA4AF" : "rgba(255,255,255,0.85)",
                      cursor: togglingLike ? "not-allowed" : "pointer",
                      transition: "all 0.2s ease",
                      opacity: togglingLike ? 0.6 : 1,
                    }}
                  >
                    <Heart
                      size={14}
                      strokeWidth={2.5}
                      style={{ fill: isLikedEvent ? "#FDA4AF" : "transparent" }}
                    />
                    {isLikedEvent ? "Liked" : "Like Event"}
                    {(event.likeCount ?? 0) > 0 && ` (${event.likeCount})`}
                  </button>
                )}

                {/* Share Button */}
                <button
                  onClick={handleShare}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    padding: "0.7rem 1.5rem",
                    background: "rgba(255,255,255,0.08)",
                    border: "2px solid rgba(255,255,255,0.25)",
                    boxShadow: "2px 2px 0px 0px rgba(0,0,0,0.2)",
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    color: "rgba(255,255,255,0.8)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                >
                  <Share2 size={14} strokeWidth={2.5} />
                  Share Event
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Register Modal */}
      {showRegisterModal && (
        <RegisterModal
          event={event}
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
        />
      )}
    </div>
  );
}

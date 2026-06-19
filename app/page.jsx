"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import {
  Zap,
  Users,
  Star,
  BarChart2,
  QrCode,
  ArrowRight,
  Shield,
  Brain,
  Sparkles,
  Calendar,
  Trophy,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Recommendations",
    description:
      "Our AI matches you with events based on your past registrations, profile matching, and interest alignment.",
    color: "var(--color-primary)",
    bg: "rgba(139,92,246,0.08)",
    tag: "AI MATCHING",
  },
  {
    icon: QrCode,
    title: "Easy QR Check-In",
    description:
      "Scan dynamic QR tickets to instantly verify and record attendance at the door.",
    color: "var(--color-secondary)",
    bg: "rgba(244,114,182,0.08)",
    tag: "QUICK CHECK-IN",
  },
  {
    icon: BarChart2,
    title: "Organizer Analytics",
    description:
      "Monitor event registrations, visitor timeline velocity, and registration conversion funnels in real-time.",
    color: "var(--color-success)",
    bg: "rgba(52,211,153,0.08)",
    tag: "INSIGHTS",
  },
  {
    icon: Sparkles,
    title: "Personalized Matches",
    description:
      "See match percentage indicators directly on the Explore dashboard matching your onboarding categories.",
    color: "var(--color-accent)",
    bg: "rgba(251,191,36,0.10)",
    tag: "MATCH PERCENTAGES",
  },
];

const stats = [
  { value: "10K+", label: "Attendees Connected", color: "var(--color-primary)" },
  { value: "500+", label: "Events Hosted", color: "var(--color-secondary)" },
  { value: "95%", label: "Fill-up Rate", color: "var(--color-accent)" },
  { value: "99%", label: "Match Accuracy", color: "var(--color-success)" },
];

const benefits = [
  "Discover events matched to your interests",
  "Check in instantly with your personal QR code",
  "Track ticket registration details in real time",
  "Host events and track comprehensive visitor metrics",
];

const marqueeText =
  "HACKATHONS // MEETUPS // TECH TALKS // WORKSHOPS // CONCERTS // DESIGN SHOWS // MATCH MAKER // QR TICKETS // ANALYTICS DASHBOARD // HACKATHONS // MEETUPS // TECH TALKS // WORKSHOPS // CONCERTS // DESIGN SHOWS // MATCH MAKER // QR TICKETS // ANALYTICS DASHBOARD //";

export default function LandingPage() {
  const { isSignedIn } = useAuth();

  return (
    <div style={{ background: "var(--bg-primary)" }} className="min-h-screen dot-grid overflow-hidden">
      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <section
        style={{
          padding: "3rem 1.5rem 4rem",
          textAlign: "center",
          maxWidth: 860,
          margin: "0 auto",
          position: "relative",
        }}
        className="animate-fade-in"
      >
        {/* Decorative background blobs */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: "var(--color-accent)",
            opacity: 0.15,
            top: "0%",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "var(--color-primary)",
            opacity: 0.08,
            top: "30%",
            left: "5%",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        {/* Badge pill */}
        <div className="relative z-10 inline-flex justify-center mb-6">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.35rem 1rem",
              background: "var(--bg-card)",
              border: "2px solid var(--border)",
              borderRadius: "0px",
              boxShadow: "3px 3px 0px 0px var(--shadow-color)",
              fontFamily: "var(--font-display)",
              fontSize: "0.72rem",
              fontWeight: 800,
              color: "var(--color-primary)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            <Sparkles size={12} strokeWidth={2.5} />
            Intelligent Event Discovery Platform
          </div>
        </div>

        {/* Main heading */}
        <h1
          style={{
            position: "relative",
            zIndex: 1,
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.4rem, 6.5vw, 4.5rem)",
            fontWeight: 900,
            letterSpacing: "-0.03em",
            lineHeight: 1.08,
            marginBottom: "1.5rem",
            color: "var(--text-primary)",
          }}
        >
          Discover & Create{" "}
          <span
            style={{
              display: "inline-block",
              background: "var(--color-accent)",
              padding: "0.08em 0.45em",
              border: "3px solid var(--border)",
              transform: "rotate(-1.5deg)",
              boxShadow: "4px 4px 0px 0px var(--shadow-color)",
              borderRadius: "0px",
            }}
          >
            Amazing
          </span>{" "}
          <br />
          Events.
        </h1>

        {/* Subtitle */}
        <p
          style={{
            position: "relative",
            zIndex: 1,
            fontSize: "1rem",
            color: "var(--text-secondary)",
            fontWeight: 500,
            maxWidth: 540,
            margin: "0 auto 2.5rem",
            lineHeight: 1.75,
            fontFamily: "var(--font-sans)",
          }}
        >
          Discover tech meetups, workshops, and social gatherings. Check in instantly using dynamic QR codes and track conversion metrics — rebranded neobrutalism UI style.
        </p>

        {/* Hero CTA buttons */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/explore"
            className="btn-primary animate-wiggle"
            style={{
              textDecoration: "none",
              fontSize: "0.88rem",
              padding: "0.9rem 2.25rem",
              boxShadow: "5px 5px 0px 0px var(--shadow-color)",
              borderRadius: "0px",
            }}
          >
            Start Exploring
            <ArrowRight size={15} strokeWidth={2.5} />
          </Link>
          <Link
            href="/explore"
            style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.88rem",
              padding: "0.9rem 2.25rem",
              background: "var(--color-secondary)",
              color: "#FFFFFF",
              border: "2px solid var(--border)",
              borderRadius: "0px",
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              boxShadow: "4px 4px 0px 0px var(--shadow-color)",
              transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#ec4899";
              e.currentTarget.style.transform = "translate(-2px, -2px)";
              e.currentTarget.style.boxShadow = "6px 6px 0px 0px var(--shadow-color)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--color-secondary)";
              e.currentTarget.style.transform = "translate(0, 0)";
              e.currentTarget.style.boxShadow = "4px 4px 0px 0px var(--shadow-color)";
            }}
          >
            <Calendar size={14} strokeWidth={2.5} />
            Browse Events
          </Link>
        </div>

        {/* Benefits checklist */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexWrap: "wrap",
            gap: "0.65rem 1.5rem",
            justifyContent: "center",
            marginTop: "2.5rem",
          }}
        >
          {benefits.map((b, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "var(--text-secondary)",
                fontFamily: "var(--font-sans)",
              }}
            >
              <CheckCircle2 size={14} color="var(--color-success)" strokeWidth={2.5} />
              {b}
            </div>
          ))}
        </div>
      </section>

      {/* ── Scrolling Marquee ─────────────────────────────────────────── */}
      <div
        style={{
          background: "var(--color-primary)",
          borderTop: "3px solid var(--border)",
          borderBottom: "3px solid var(--border)",
          padding: "0.8rem 0",
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        <div
          className="animate-marquee"
          style={{
            display: "inline-block",
            fontSize: "0.9rem",
            fontWeight: 900,
            fontFamily: "var(--font-display)",
            color: "#FFFFFF",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          {marqueeText}&nbsp;&nbsp;&nbsp;{marqueeText}
        </div>
      </div>

      {/* ── Stats Section ─────────────────────────────────────────────── */}
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-[var(--bg-card)] border-2 border-[var(--border)] p-8 text-center shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] transition-all hover:translate-y-[-2px]"
            >
              <div
                style={{
                  fontSize: "2.5rem",
                  fontWeight: 900,
                  fontFamily: "var(--font-display)",
                  color: stat.color,
                  lineHeight: 1,
                  marginBottom: "0.5rem",
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  fontFamily: "var(--font-display)",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features Grid ────────────────────────────────────────────── */}
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              marginBottom: "1rem",
              background: "var(--bg-card)",
              border: "2px solid var(--border)",
              padding: "0.3rem 1rem",
              borderRadius: "0px",
              boxShadow: "2px 2px 0px 0px var(--shadow-color)",
              fontFamily: "var(--font-display)",
              fontSize: "0.7rem",
              fontWeight: 800,
              color: "var(--color-secondary)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            <Star size={11} strokeWidth={2.5} />
            Platform Features
          </div>
          <h2
            className="section-header"
            style={{ color: "var(--text-primary)", marginBottom: "0.75rem", fontSize: "clamp(1.5rem, 4vw, 2rem)" }}
          >
            Everything you need, <span style={{ color: "var(--color-primary)" }}>all in one place</span>
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.88rem",
              fontWeight: 500,
              fontFamily: "var(--font-sans)",
              maxWidth: 480,
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            Tactile layout tools, smart discovery dashboard, and neobrutalism styled elements built for modern events.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="bg-[var(--bg-card)] border-2 border-[var(--border)] p-6 shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] transition-all hover:translate-y-[-2px] hover:rotate-[-0.5deg]"
              >
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.62rem",
                    fontWeight: 800,
                    color: feature.color,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: "1rem",
                  }}
                >
                  {"// " + feature.tag}
                </div>

                <div
                  style={{
                    width: 44,
                    height: 44,
                    background: feature.color,
                    border: "2px solid var(--border)",
                    borderRadius: "0px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1.25rem",
                    boxShadow: "2px 2px 0px 0px var(--shadow-color)",
                  }}
                >
                  <Icon size={18} color="#FFFFFF" strokeWidth={2.5} />
                </div>

                <h3
                  style={{
                    fontWeight: 800,
                    fontSize: "1rem",
                    marginBottom: "0.5rem",
                    fontFamily: "var(--font-display)",
                    color: "var(--text-primary)",
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.82rem",
                    lineHeight: 1.65,
                    fontFamily: "var(--font-sans)",
                    fontWeight: 500,
                  }}
                >
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────── */}
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <div
          className="bg-[var(--color-primary)] border-3 border-[var(--border)] shadow-[6px_6px_0px_0px_var(--shadow-color)] py-16 px-8 text-center relative overflow-hidden"
        >
          <div style={{ position: "relative", zIndex: 1 }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                fontSize: "clamp(1.6rem, 4vw, 2.25rem)",
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
                color: "#FFFFFF",
                marginBottom: "1.5rem",
                textTransform: "uppercase",
              }}
            >
              Ready to explore your community?
            </h2>
            <Link
              href="/explore"
              className="btn-secondary text-sm px-8 py-3.5 shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] transition-all inline-flex items-center gap-2"
              style={{ textDecoration: "none" }}
            >
              Get Started Now
              <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Heart, MapPin, CheckCircle, X } from "lucide-react";
import { CATEGORIES } from "@/lib/data";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { City, State } from "country-state-city";

export function OnboardingModal({ isOpen, onClose, onComplete }) {
  const [step, setStep] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [location, setLocation] = useState({
    state: "",
    city: "",
    country: "India",
  });

  const { mutate: completeOnboarding, isLoading } = useConvexMutation(
    api.users.completeOnboarding,
  );

  const indianStates = State.getStatesOfCountry("IN");

  const cities = useMemo(() => {
    if (!location.state) return [];
    const selectedState = indianStates.find((s) => s.name === location.state);
    if (!selectedState) return [];
    return City.getCitiesOfState("IN", selectedState.isoCode);
  }, [location.state, indianStates]);

  const progress = (step / 2) * 100;

  const toggleInterest = (categoryId) => {
    setSelectedInterests((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const handleComplete = async () => {
    try {
      await completeOnboarding({ interests: selectedInterests, location });
      toast.success("Onboarding completed 🎉");
      onComplete?.();
      onClose?.();
    } catch (error) {
      console.error(error);
      toast.error("Failed to complete onboarding");
    }
  };

  const handleNext = () => {
    if (step === 1 && selectedInterests.length < 3) {
      toast.error("Please select at least 3 interests");
      return;
    }
    if (step === 2 && (!location.city || !location.state)) {
      toast.error("Please select both state and city");
      return;
    }
    if (step < 2) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  if (!isOpen) return null;

  return (
    /* Overlay */
    <div
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
        style={{
          background: "var(--bg-card)",
          border: "3px solid var(--border)",
          boxShadow: "8px 8px 0px 0px var(--shadow-color)",
          borderRadius: "0px",
          width: "100%",
          maxWidth: "640px",
          position: "relative",
          animation: "fadeIn 0.2s cubic-bezier(0.34,1.56,0.64,1) forwards",
          margin: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Progress bar ── */}
        <div
          style={{
            height: "4px",
            background: "var(--bg-elevated)",
            borderBottom: "2px solid var(--border)",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "var(--color-primary)",
              transition: "width 0.4s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          />
        </div>

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
              {step === 1
                ? <Heart size={16} color="var(--border)" strokeWidth={2.5} />
                : <MapPin size={16} color="var(--border)" strokeWidth={2.5} />
              }
            </div>
            <div>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  fontSize: "1.1rem",
                  color: "#FFFFFF",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  margin: 0,
                  lineHeight: 1.1,
                }}
              >
                {step === 1 ? "What interests you?" : "Where are you located?"}
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.75rem",
                  color: "rgba(255,255,255,0.8)",
                  fontWeight: 500,
                  marginTop: "0.2rem",
                }}
              >
                {step === 1
                  ? "Select at least 3 categories to personalize your experience"
                  : "We'll show you events happening near you"}
              </p>
            </div>
          </div>

          {/* Step indicator */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              flexShrink: 0,
            }}
          >
            {[1, 2].map((s) => (
              <div
                key={s}
                style={{
                  width: s === step ? 24 : 8,
                  height: 8,
                  background: s === step ? "var(--color-accent)" : "rgba(255,255,255,0.4)",
                  border: "1px solid var(--border)",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: "1.5rem" }}>
          {step === 1 && (
            <div>
              {/* Category grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "0.75rem",
                  maxHeight: "380px",
                  overflowY: "auto",
                  paddingRight: "0.25rem",
                  marginBottom: "1rem",
                }}
              >
                {CATEGORIES.map((category) => {
                  const isSelected = selectedInterests.includes(category.id);
                  return (
                    <button
                      key={category.id}
                      onClick={() => toggleInterest(category.id)}
                      style={{
                        padding: "0.9rem 0.5rem",
                        background: isSelected ? "var(--color-primary)" : "var(--bg-card)",
                        border: isSelected
                          ? "3px solid var(--border)"
                          : "2px solid var(--border)",
                        boxShadow: isSelected
                          ? "3px 3px 0px 0px var(--shadow-color)"
                          : "2px 2px 0px 0px var(--shadow-color)",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        transform: isSelected ? "translate(-1px,-1px)" : "translate(0,0)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0.5rem",
                        textAlign: "center",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.transform = "translate(-1px,-1px)";
                          e.currentTarget.style.boxShadow = "3px 3px 0px 0px var(--shadow-color)";
                          e.currentTarget.style.background = "var(--bg-elevated)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.transform = "translate(0,0)";
                          e.currentTarget.style.boxShadow = "2px 2px 0px 0px var(--shadow-color)";
                          e.currentTarget.style.background = "var(--bg-card)";
                        }
                      }}
                    >
                      <div style={{ fontSize: "1.5rem", lineHeight: 1 }}>{category.icon}</div>
                      <div
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 700,
                          fontSize: "0.72rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          color: isSelected ? "#FFFFFF" : "var(--text-primary)",
                          lineHeight: 1.2,
                        }}
                      >
                        {category.label}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selection count */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem 1rem",
                  background: "var(--bg-elevated)",
                  border: "2px solid var(--border)",
                  boxShadow: "2px 2px 0px 0px var(--shadow-color)",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    background: selectedInterests.length >= 3 ? "var(--color-success)" : "var(--color-primary)",
                    border: "2px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-display)",
                    fontWeight: 900,
                    fontSize: "0.85rem",
                    color: "#FFFFFF",
                    flexShrink: 0,
                    transition: "background 0.2s ease",
                  }}
                >
                  {selectedInterests.length}
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: selectedInterests.length >= 3 ? "var(--color-success)" : "var(--text-secondary)",
                  }}
                >
                  {selectedInterests.length >= 3
                    ? "✓ Ready to continue!"
                    : `Select ${3 - selectedInterests.length} more to continue`}
                </span>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                {/* State — native select avoids Radix Portal z-index conflict */}
                <div>
                  <label
                    htmlFor="ob-state"
                    style={{
                      display: "block",
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: "0.72rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "var(--text-primary)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    State
                  </label>
                  <select
                    id="ob-state"
                    value={location.state}
                    onChange={(e) =>
                      setLocation({ ...location, state: e.target.value, city: "" })
                    }
                    style={{
                      width: "100%",
                      height: "44px",
                      padding: "0 0.75rem",
                      background: "var(--bg-card)",
                      border: "2px solid var(--border)",
                      borderRadius: "0px",
                      color: location.state ? "var(--text-primary)" : "var(--text-muted)",
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      boxShadow: "2px 2px 0px 0px var(--shadow-color)",
                      outline: "none",
                      cursor: "pointer",
                      appearance: "auto",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "var(--color-primary)";
                      e.currentTarget.style.boxShadow = "2px 2px 0px 0px var(--color-primary)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.boxShadow = "2px 2px 0px 0px var(--shadow-color)";
                    }}
                  >
                    <option value="" disabled>Select state</option>
                    {indianStates.map((state) => (
                      <option key={state.isoCode} value={state.name}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City — native select avoids Radix Portal z-index conflict */}
                <div>
                  <label
                    htmlFor="ob-city"
                    style={{
                      display: "block",
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: "0.72rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "var(--text-primary)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    City
                  </label>
                  <select
                    id="ob-city"
                    value={location.city}
                    onChange={(e) =>
                      setLocation({ ...location, city: e.target.value })
                    }
                    disabled={!location.state}
                    style={{
                      width: "100%",
                      height: "44px",
                      padding: "0 0.75rem",
                      background: "var(--bg-card)",
                      border: "2px solid var(--border)",
                      borderRadius: "0px",
                      color: location.city ? "var(--text-primary)" : "var(--text-muted)",
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      boxShadow: !location.state
                        ? "none"
                        : "2px 2px 0px 0px var(--shadow-color)",
                      outline: "none",
                      cursor: !location.state ? "not-allowed" : "pointer",
                      opacity: !location.state ? 0.5 : 1,
                      appearance: "auto",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "var(--color-primary)";
                      e.currentTarget.style.boxShadow = "2px 2px 0px 0px var(--color-primary)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.boxShadow = "2px 2px 0px 0px var(--shadow-color)";
                    }}
                  >
                    <option value="" disabled>
                      {location.state ? "Select city" : "Select state first"}
                    </option>
                    {cities.map((city) => (
                      <option key={city.name} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location preview */}
              {location.city && location.state && (
                <div
                  style={{
                    padding: "1rem",
                    background: "var(--bg-elevated)",
                    border: "2px solid var(--border)",
                    boxShadow: "3px 3px 0px 0px var(--color-primary)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      background: "var(--color-primary)",
                      border: "2px solid var(--border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <MapPin size={16} color="#FFFFFF" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 800,
                        fontSize: "0.8rem",
                        textTransform: "uppercase",
                        color: "var(--text-primary)",
                        letterSpacing: "0.04em",
                      }}
                    >
                      Your Location
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.82rem",
                        color: "var(--text-secondary)",
                        fontWeight: 600,
                      }}
                    >
                      {location.city}, {location.state}, {location.country}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div
          style={{
            borderTop: "2px dashed var(--border)",
            padding: "1rem 1.5rem",
            background: "var(--bg-elevated)",
            display: "flex",
            gap: "0.75rem",
          }}
        >
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="btn-ghost"
              style={{ gap: "0.4rem" }}
            >
              <ArrowLeft size={14} strokeWidth={2.5} />
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={isLoading}
            className="btn-primary"
            style={{
              flex: 1,
              justifyContent: "center",
              gap: "0.4rem",
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading
              ? "Completing..."
              : step === 2
                ? "Complete Setup"
                : "Continue"}
            {!isLoading && <ArrowRight size={14} strokeWidth={2.5} />}
          </button>
        </div>
      </div>
    </div>
  );
}

/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Calendar, Loader2, ChevronDown } from "lucide-react";
import { State, City } from "country-state-city";
import { format } from "date-fns";
import { useConvexQuery, useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { createLocationSlug } from "@/lib/location-utils";
import { getCategoryIcon } from "@/lib/data";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export default function SearchLocationBar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);

  const { data: currentUser, isLoading } = useConvexQuery(
    api.users.getCurrentUser,
  );
  const { mutate: updateLocation } = useConvexMutation(
    api.users.completeOnboarding,
  );

  const { data: searchResults, isLoading: searchLoading } = useConvexQuery(
    api.search.searchEvents,
    searchQuery.trim().length >= 2 ? { query: searchQuery, limit: 5 } : "skip",
  );

  const indianStates = useMemo(() => State.getStatesOfCountry("IN"), []);

  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  useEffect(() => {
    if (currentUser?.location) {
      setSelectedState(currentUser.location.state || "");
      setSelectedCity(currentUser.location.city || "");
    }
  }, [currentUser, isLoading]);

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  const cities = useMemo(() => {
    if (!selectedState) return [];
    const state = indianStates.find((s) => s.name === selectedState);
    if (!state) return [];
    return City.getCitiesOfState("IN", state.isoCode);
  }, [selectedState, indianStates]);

  const debouncedSetQuery = useRef(
    debounce((value) => setSearchQuery(value), 300),
  ).current;

  const handleSearchInput = (e) => {
    const value = e.target.value;
    debouncedSetQuery(value);
    setShowSearchResults(value.length >= 2);
  };

  const handleEventClick = (slug) => {
    setShowSearchResults(false);
    setSearchQuery("");
    router.push(`/events/${slug}`);
  };

  const handleLocationSelect = async (city, state) => {
    try {
      if (currentUser?.interests && currentUser?.location) {
        await updateLocation({
          location: { city, state, country: "India" },
          interests: currentUser.interests,
        });
      }
      const slug = createLocationSlug(city, state);
      router.push(`/explore/${slug}`);
    } catch (error) {
      console.error("Failed to update location:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
      {/* ── Search Bar ── */}
      <div style={{ position: "relative", flex: 1 }} ref={searchRef}>
        <Search
          size={15}
          strokeWidth={2}
          style={{
            position: "absolute",
            left: "0.75rem",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-muted)",
            pointerEvents: "none",
          }}
        />
        <input
          type="text"
          placeholder="Search events..."
          onChange={handleSearchInput}
          onFocus={() => {
            if (searchQuery.length >= 2) setShowSearchResults(true);
          }}
          style={{
            width: "100%",
            height: "36px",
            paddingLeft: "2.25rem",
            paddingRight: "0.75rem",
            background: "var(--bg-card)",
            border: "2px solid var(--border)",
            borderRight: "none",
            borderRadius: "0px",
            color: "var(--text-primary)",
            fontFamily: "var(--font-sans)",
            fontSize: "0.85rem",
            fontWeight: 500,
            boxShadow: "2px 2px 0px 0px var(--shadow-color)",
            outline: "none",
            transition: "border-color 0.2s ease",
          }}
          onFocusCapture={(e) => {
            e.currentTarget.style.borderColor = "var(--color-primary)";
          }}
          onBlurCapture={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
          }}
        />

        {/* ── Search Results Dropdown ── */}
        {showSearchResults && (
          <div
            className="search-results-dropdown"
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              width: "360px",
              maxHeight: "380px",
              overflowY: "auto",
              background: "var(--bg-card)",
              border: "2px solid var(--border)",
              boxShadow: "6px 6px 0px 0px var(--shadow-color)",
              zIndex: 9999,
            }}
          >
            {searchLoading ? (
              <div style={{ padding: "1rem", display: "flex", justifyContent: "center" }}>
                <Loader2
                  size={18}
                  className="animate-spin"
                  style={{ color: "var(--color-primary)" }}
                />
              </div>
            ) : searchResults && searchResults.length > 0 ? (
              <div>
                <p
                  style={{
                    padding: "0.5rem 1rem 0.25rem",
                    fontFamily: "var(--font-display)",
                    fontSize: "0.62rem",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--text-muted)",
                    borderBottom: "1px solid var(--border)",
                    marginBottom: "0.25rem",
                  }}
                >
                  Search Results
                </p>
                {searchResults.map((event) => (
                  <button
                    key={event._id}
                    onClick={() => handleEventClick(event.slug)}
                    className="search-result-item"
                    style={{
                      width: "100%",
                      padding: "0.6rem 1rem",
                      background: "transparent",
                      border: "none",
                      borderBottom: "1px solid var(--border)",
                      textAlign: "left",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.75rem",
                      transition: "background 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--bg-elevated)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <div style={{ fontSize: "1.25rem", lineHeight: 1, marginTop: "2px", flexShrink: 0 }}>
                      {getCategoryIcon(event.category)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontWeight: 600,
                          fontSize: "0.85rem",
                          color: "var(--text-primary)",
                          marginBottom: "0.25rem",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {event.title}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          fontSize: "0.72rem",
                          color: "var(--text-muted)",
                          fontFamily: "var(--font-sans)",
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          <Calendar size={10} strokeWidth={2} />
                          {format(event.startDate, "MMM dd")}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          <MapPin size={10} strokeWidth={2} />
                          {event.city}
                        </span>
                        {event.ticketType === "free" && (
                          <span
                            style={{
                              background: "var(--color-success)",
                              border: "1px solid var(--border)",
                              padding: "0.1rem 0.4rem",
                              fontFamily: "var(--font-display)",
                              fontWeight: 700,
                              fontSize: "0.6rem",
                              textTransform: "uppercase",
                              color: "var(--text-primary)",
                            }}
                          >
                            Free
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p
                style={{
                  padding: "1rem",
                  textAlign: "center",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.82rem",
                  color: "var(--text-muted)",
                }}
              >
                No results found
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── State Select ── */}
      <Select
        value={selectedState}
        onValueChange={(value) => {
          setSelectedState(value);
          setSelectedCity("");
        }}
      >
        <SelectTrigger className="w-32 h-9 border-l-0 rounded-none">
          <SelectValue placeholder="State" />
        </SelectTrigger>
        <SelectContent>
          {indianStates.map((state) => (
            <SelectItem key={state.isoCode} value={state.name}>
              {state.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* ── City Select ── */}
      <Select
        value={selectedCity}
        onValueChange={(value) => {
          setSelectedCity(value);
          if (value && selectedState) {
            handleLocationSelect(value, selectedState);
          }
        }}
        disabled={!selectedState}
      >
        <SelectTrigger className="w-32 h-9 rounded-none">
          <SelectValue placeholder="City" />
        </SelectTrigger>
        <SelectContent>
          {cities.map((city) => (
            <SelectItem key={city.name} value={city.name}>
              {city.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

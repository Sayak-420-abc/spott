"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, Loader2, X, Image as ImageIcon } from "lucide-react";

export default function UnsplashImagePicker({ isOpen, onClose, onSelect }) {
  const [query, setQuery] = useState("event");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);

  const searchImages = async (searchQuery) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${searchQuery}&per_page=12&client_id=${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}`,
      );
      const data = await response.json();
      setImages(data.results || []);
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchImages(query);
  };

  if (!isOpen) return null;

  return (
    /* Overlay */
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(30, 41, 59, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
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
          maxWidth: "860px",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          animation: "fadeIn 0.2s cubic-bezier(0.34,1.56,0.64,1) forwards",
        }}
      >
        {/* ── Header stripe ── */}
        <div
          style={{
            background: "var(--color-primary)",
            borderBottom: "3px solid var(--border)",
            padding: "1.1rem 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
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
                flexShrink: 0,
              }}
            >
              <ImageIcon size={14} color="var(--border)" strokeWidth={2.5} />
            </div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                fontSize: "1.1rem",
                color: "#FFFFFF",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                margin: 0,
              }}
            >
              Choose Cover Image
            </h2>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              background: "var(--color-accent)",
              border: "2px solid var(--border)",
              width: 30,
              height: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "2px 2px 0px 0px var(--shadow-color)",
              transition: "all 0.15s ease",
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
            <X size={13} color="var(--border)" strokeWidth={2.5} />
          </button>
        </div>

        {/* ── Search bar ── */}
        <div
          style={{
            padding: "1rem 1.5rem",
            borderBottom: "2px solid var(--border)",
            background: "var(--bg-elevated)",
            flexShrink: 0,
          }}
        >
          <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.5rem" }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for images..."
              style={{
                flex: 1,
                height: "40px",
                padding: "0 0.75rem",
                background: "var(--bg-card)",
                border: "2px solid var(--border)",
                borderRadius: "0px",
                color: "var(--text-primary)",
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                fontWeight: 500,
                outline: "none",
                boxShadow: "2px 2px 0px 0px var(--shadow-color)",
                transition: "border-color 0.2s ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--color-primary)";
                e.currentTarget.style.boxShadow = "2px 2px 0px 0px var(--color-primary)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.boxShadow = "2px 2px 0px 0px var(--shadow-color)";
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                height: "40px",
                padding: "0 1rem",
                background: "var(--color-primary)",
                border: "2px solid var(--border)",
                borderRadius: "0px",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "2px 2px 0px 0px var(--shadow-color)",
                transition: "all 0.15s ease",
                opacity: loading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translate(-1px,-1px)";
                  e.currentTarget.style.boxShadow = "3px 3px 0px 0px var(--shadow-color)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translate(0,0)";
                e.currentTarget.style.boxShadow = "2px 2px 0px 0px var(--shadow-color)";
              }}
            >
              {loading
                ? <Loader2 size={16} color="#FFFFFF" className="animate-spin" />
                : <Search size={16} color="#FFFFFF" strokeWidth={2.5} />
              }
            </button>
          </form>
        </div>

        {/* ── Image grid ── */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1.25rem 1.5rem",
          }}
        >
          {loading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "240px",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <Loader2
                size={32}
                className="animate-spin"
                style={{ color: "var(--color-primary)" }}
              />
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--text-muted)",
                }}
              >
                Searching Unsplash...
              </p>
            </div>
          ) : images.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "0.75rem",
              }}
            >
              {images.map((image) => (
                <button
                  key={image.id}
                  onClick={() => onSelect(image.urls.regular)}
                  onMouseEnter={() => setHoveredId(image.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    position: "relative",
                    aspectRatio: "16/9",
                    overflow: "hidden",
                    border: hoveredId === image.id
                      ? "3px solid var(--color-primary)"
                      : "2px solid var(--border)",
                    boxShadow: hoveredId === image.id
                      ? "4px 4px 0px 0px var(--color-primary)"
                      : "2px 2px 0px 0px var(--shadow-color)",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    transform: hoveredId === image.id ? "translate(-1px,-1px)" : "translate(0,0)",
                    background: "var(--bg-elevated)",
                    borderRadius: "0px",
                    padding: 0,
                  }}
                >
                  <Image
                    src={image.urls.small}
                    alt={image.alt_description || image.description || "Unsplash image"}
                    className="w-full h-full object-cover"
                    width={400}
                    height={225}
                    style={{ display: "block" }}
                  />
                  {/* Photographer credit on hover */}
                  {hoveredId === image.id && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: "rgba(30,41,59,0.85)",
                        padding: "0.3rem 0.5rem",
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.65rem",
                        fontWeight: 600,
                        color: "#FFFFFF",
                        textAlign: "left",
                        letterSpacing: "0.02em",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      📷 {image.user?.name}
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "3rem 1rem",
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  background: "var(--bg-elevated)",
                  border: "2px solid var(--border)",
                  boxShadow: "3px 3px 0px 0px var(--shadow-color)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem",
                }}
              >
                <Search size={22} style={{ color: "var(--text-muted)" }} strokeWidth={2} />
              </div>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--text-secondary)",
                  marginBottom: "0.3rem",
                }}
              >
                Search for images to get started
              </p>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                }}
              >
                Millions of free photos from Unsplash
              </p>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div
          style={{
            borderTop: "2px dashed var(--border)",
            padding: "0.65rem 1.5rem",
            background: "var(--bg-elevated)",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.72rem",
              fontWeight: 600,
              color: "var(--text-muted)",
            }}
          >
            Photos from{" "}
            <a
              href="https://unsplash.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "var(--color-primary)",
                fontWeight: 700,
                textDecoration: "underline",
              }}
            >
              Unsplash
            </a>
          </p>
          <button
            onClick={onClose}
            className="btn-ghost"
            style={{ fontSize: "0.72rem" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

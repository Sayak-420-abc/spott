"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Bell, Check, CheckCheck, Clock, Sparkles, X } from "lucide-react";
import Link from "next/link";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifications = useQuery(api.notifications.getNotifications) ?? [];
  const unreadCount = useQuery(api.notifications.getUnreadCount) ?? 0;
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notificationId) => {
    await markAsRead({ notificationId });
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const formatTimeAgo = (timestamp) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const formatEventDate = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const hasUnread = unreadCount > 0;

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      {/* ── Bell Button ── */}
      <button
        id="notification-bell"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={`Notifications${hasUnread ? ` (${unreadCount} unread)` : ""}`}
        style={{
          position: "relative",
          width: "36px",
          height: "36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          border: "2px solid var(--border)",
          background: hasUnread ? "#EF4444" : "var(--bg-card)",
          boxShadow: "2px 2px 0px 0px var(--shadow-color)",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translate(-1px, -1px)";
          e.currentTarget.style.boxShadow = "3px 3px 0px 0px var(--shadow-color)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translate(0, 0)";
          e.currentTarget.style.boxShadow = "2px 2px 0px 0px var(--shadow-color)";
        }}
      >
        <Bell
          size={16}
          strokeWidth={2.5}
          style={{
            color: hasUnread ? "#FFFFFF" : "var(--text-primary)",
            fill: hasUnread ? "#FFFFFF" : "none",
          }}
        />

        {/* Unread badge */}
        {hasUnread && (
          <span
            style={{
              position: "absolute",
              top: "-5px",
              right: "-5px",
              width: "18px",
              height: "18px",
              background: "var(--color-accent)",
              border: "2px solid var(--border)",
              fontSize: "10px",
              fontWeight: 900,
              color: "var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown Panel ── */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: "380px",
            maxHeight: "480px",
            background: "var(--bg-card)",
            border: "3px solid var(--border)",
            boxShadow: "6px 6px 0px 0px var(--shadow-color)",
            zIndex: 999,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* ── Header ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              borderBottom: "3px solid var(--border)",
              background: "var(--color-primary)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  background: "var(--color-accent)",
                  border: "2px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Bell size={14} strokeWidth={2.5} color="var(--border)" />
              </div>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  fontSize: "14px",
                  color: "#FFFFFF",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                Notifications
              </span>
              {hasUnread && (
                <span
                  style={{
                    background: "var(--color-accent)",
                    border: "1px solid var(--border)",
                    fontSize: "10px",
                    fontWeight: 900,
                    padding: "1px 6px",
                    color: "var(--border)",
                  }}
                >
                  {unreadCount} NEW
                </span>
              )}
            </div>

            <div style={{ display: "flex", gap: "6px" }}>
              {hasUnread && (
                <button
                  onClick={handleMarkAllRead}
                  title="Mark all as read"
                  style={{
                    width: "28px",
                    height: "28px",
                    background: "var(--color-accent)",
                    border: "2px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "2px 2px 0px 0px var(--shadow-color)",
                    transition: "all 0.15s ease",
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
                  <CheckCheck size={14} strokeWidth={2.5} color="var(--border)" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  width: "28px",
                  height: "28px",
                  background: "rgba(255,255,255,0.2)",
                  border: "2px solid rgba(255,255,255,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.2)";
                }}
              >
                <X size={14} strokeWidth={2.5} color="#FFFFFF" />
              </button>
            </div>
          </div>

          {/* ── Notification List ── */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              maxHeight: "380px",
            }}
          >
            {notifications.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "48px 24px",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    background: "var(--bg-elevated)",
                    border: "2px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "3px 3px 0px 0px var(--shadow-color)",
                  }}
                >
                  <Bell size={22} color="var(--text-muted)" />
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: "14px",
                    color: "var(--text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    margin: 0,
                  }}
                >
                  All Caught Up
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    margin: 0,
                    textAlign: "center",
                  }}
                >
                  No notifications yet. We&apos;ll alert you when events you&apos;re
                  registered for or interested in are approaching!
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const isRegistered = n.type === "registered_approaching";
                const accentColor = isRegistered
                  ? "var(--color-primary)"
                  : "var(--color-accent)";
                const IconComponent = isRegistered ? Clock : Sparkles;

                return (
                  <Link
                    key={n._id}
                    href={`/events/${n.eventSlug}`}
                    onClick={() => handleNotificationClick(n._id)}
                    style={{
                      display: "flex",
                      gap: "12px",
                      padding: "14px 16px",
                      borderBottom: "1px solid var(--border)",
                      textDecoration: "none",
                      cursor: "pointer",
                      background: n.read
                        ? "transparent"
                        : "var(--bg-elevated)",
                      transition: "background 0.15s ease",
                      position: "relative",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--bg-elevated)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = n.read
                        ? "transparent"
                        : "var(--bg-elevated)";
                    }}
                  >
                    {/* Unread indicator strip */}
                    {!n.read && (
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: "4px",
                          background: accentColor,
                        }}
                      />
                    )}

                    {/* Type icon */}
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        flexShrink: 0,
                        background: accentColor,
                        border: "2px solid var(--border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "2px 2px 0px 0px var(--shadow-color)",
                      }}
                    >
                      <IconComponent
                        size={16}
                        strokeWidth={2.5}
                        color={isRegistered ? "#FFFFFF" : "var(--border)"}
                      />
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          margin: "0 0 2px",
                          fontSize: "13px",
                          fontWeight: n.read ? 600 : 800,
                          color: "var(--text-primary)",
                          lineHeight: 1.3,
                        }}
                      >
                        {n.title}
                      </p>
                      <p
                        style={{
                          margin: "0 0 4px",
                          fontSize: "12px",
                          color: "var(--text-secondary)",
                          lineHeight: 1.4,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {n.message}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            color: "var(--text-muted)",
                          }}
                        >
                          {formatTimeAgo(n.createdAt)}
                        </span>
                        {n.eventStartDate > 0 && (
                          <>
                            <span
                              style={{
                                fontSize: "10px",
                                color: "var(--text-muted)",
                              }}
                            >
                              •
                            </span>
                            <span
                              style={{
                                fontSize: "10px",
                                fontWeight: 700,
                                color: accentColor,
                              }}
                            >
                              📅 {formatEventDate(n.eventStartDate)}
                            </span>
                          </>
                        )}
                        {n.read && (
                          <Check
                            size={12}
                            color="var(--color-success)"
                            style={{ marginLeft: "auto" }}
                          />
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

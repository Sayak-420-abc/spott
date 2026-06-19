"use client"

import React from 'react'
import Image from 'next/image';
import { Calendar, Eye, MapPin, QrCode, Trash2, Users, X } from 'lucide-react';
import { getCategoryIcon, getCategoryLabel } from '@/lib/data';
import { format } from 'date-fns';

const EventCard = ({
  event,
  onClick,
  onDelete,
  action = null,
  variant = "grid",
  className = "",
}) => {
  if (variant === "list") {
    return (
      <div
        className={`bg-[var(--bg-card)] border-2 border-[var(--border)] p-3 flex gap-3 shadow-[3px_3px_0px_0px_var(--shadow-color)] hover:shadow-[5px_5px_0px_0px_var(--shadow-color)] transition-all cursor-pointer group hover:translate-y-[-1px] ${className}`}
        onClick={onClick}
      >
        {/* Event Image */}
        <div className="w-20 h-20 border-2 border-[var(--border)] shrink-0 overflow-hidden relative shadow-[1.5px_1.5px_0px_0px_var(--shadow-color)]">
          {event.coverImage ? (
            <Image
              src={event.coverImage}
              alt={event.title}
              fill
              className="object-cover"
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center text-3xl"
              style={{ backgroundColor: event.themeColor }}
            >
              {getCategoryIcon(event.category)}
            </div>
          )}
        </div>

        {/* Event Details */}
        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-sm mb-1 group-hover:text-[var(--color-primary)] transition-colors line-clamp-2 font-[var(--font-display)] text-[var(--text-primary)]">
            {event.title}
          </h3>
          <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)] mb-1">
            <MapPin className="w-3.5 h-3.5" />
            <span className="line-clamp-1 font-semibold">
              {event.locationType === "online" ? "Online Event" : event.city}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)] font-semibold">
            <Users className="w-3.5 h-3.5" />
            <span>{event.registrationCount} attending</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`pop-shadow-card overflow-hidden bg-[var(--bg-card)] flex flex-col justify-between h-full ${onClick ? "cursor-pointer" : ""} ${className}`}
      onClick={onClick}
    >
      <div>
        <div className="relative h-48 overflow-hidden border-b-2 border-[var(--border)]">
          {event.coverImage ? (
            <Image
              src={event.coverImage}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              width={500}
              height={192}
              priority
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-4xl"
              style={{ backgroundColor: event.themeColor }}
            >
              {getCategoryIcon(event.category)}
            </div>
          )}
          <div className="absolute top-3 right-3">
            <span className="badge badge-primary bg-[var(--color-primary)] text-white shadow-[1.5px_1.5px_0px_0px_var(--shadow-color)] border-2 border-[var(--border)] text-[10px] font-black tracking-widest px-2 py-0.5 uppercase">
              {event.ticketType === "free" ? "Free" : "Paid"}
            </span>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <span className="badge bg-[var(--color-accent)] text-[var(--text-primary)] border-2 border-[var(--border)] shadow-[1px_1px_0px_0px_var(--shadow-color)] text-[10px] font-black tracking-wider px-2.5 py-0.5 uppercase mb-2">
              {getCategoryIcon(event.category)} {getCategoryLabel(event.category)}
            </span>
            <h3 className="font-extrabold text-lg line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors font-[var(--font-display)] text-[var(--text-primary)] mt-1.5 leading-snug">
              {event.title}
            </h3>
          </div>

          <div className="space-y-2 text-sm text-[var(--text-secondary)] font-semibold">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--color-primary)]" />
              <span>{format(event.startDate, "PPP")}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[var(--color-secondary)]" />
              <span className="line-clamp-1">
                {event.locationType === "online"
                  ? "Online Event"
                  : `${event.city}, ${event.state || event.country}`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[var(--color-success)]" />
              <span>
                {event.registrationCount} / {event.capacity} registered
              </span>
            </div>
          </div>
        </div>
      </div>

      {action && (
        <div className="p-4 pt-0 flex gap-2">
          <button
            className="flex-grow flex items-center justify-center gap-1.5 text-xs font-bold uppercase py-2 px-3 border-2 border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--color-accent)] shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer transition-all text-[var(--text-primary)]"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.(e);
            }}
          >
            {action === "event" ? (
              <>
                <Eye className="w-3.5 h-3.5" />
                View
              </>
            ) : (
              <>
                <QrCode className="w-3.5 h-3.5" />
                Show Ticket
              </>
            )}
          </button>

          {onDelete && (
            <button
              className="flex-shrink-0 flex items-center justify-center p-2 border-2 border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--color-danger)] hover:text-white shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer transition-all text-[var(--color-danger)]"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(event._id);
              }}
            >
              {action === "event" ? (
                <Trash2 className="w-3.5 h-3.5" />
              ) : (
                <X className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EventCard;

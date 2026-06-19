/* eslint-disable react-hooks/purity */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Calendar, MapPin, Loader2, Ticket } from "lucide-react";
import { useConvexQuery, useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import QRCode from "react-qr-code";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import EventCard from "@/components/event-card";

export default function MyTicketsPage() {
  const router = useRouter();
  const [selectedTicket, setSelectedTicket] = useState(null);

  const { data: registrations, isLoading } = useConvexQuery(
    api.registrations.getMyRegistrations,
  );

  const { mutate: cancelRegistration } =
    useConvexMutation(api.registrations.cancelRegistration);

  const handleCancelRegistration = async (registrationId) => {
    if (!window.confirm("Are you sure you want to cancel this registration?"))
      return;

    try {
      await cancelRegistration({ registrationId });
      toast.success("Registration cancelled successfully.");
    } catch (error) {
      toast.error(error.message || "Failed to cancel registration");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  const now = Date.now();

  const upcomingTickets = registrations?.filter(
    (reg) =>
      reg.event && reg.event.startDate >= now && reg.status === "confirmed",
  );
  const pastTickets = registrations?.filter(
    (reg) =>
      reg.event && (reg.event.startDate < now || reg.status === "cancelled"),
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b-2 border-[var(--border)]">
        <h1 className="text-4xl font-black font-[var(--font-display)] uppercase text-[var(--text-primary)]">My Tickets</h1>
        <p className="text-[var(--text-secondary)] mt-2 text-sm font-semibold uppercase">
          View and manage your event registrations
        </p>
      </div>

      {/* Upcoming Tickets */}
      {upcomingTickets?.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-black font-[var(--font-display)] uppercase text-[var(--text-primary)]">Upcoming Events</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingTickets.map((registration) => (
              <EventCard
                key={registration._id}
                event={registration.event}
                action="ticket"
                onClick={() => setSelectedTicket(registration)}
                onDelete={() => handleCancelRegistration(registration._id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Past Tickets */}
      {pastTickets?.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-black font-[var(--font-display)] uppercase text-[var(--text-primary)]">Past Events</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastTickets.map((registration) => (
              <EventCard
                key={registration._id}
                event={registration.event}
                action={null}
                className="opacity-60"
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!upcomingTickets?.length && !pastTickets?.length && (
        <div className="border-2 border-dashed border-[var(--border)] bg-[var(--bg-card)] p-12 text-center shadow-[4px_4px_0px_0px_var(--shadow-color)] max-w-xl mx-auto">
          <div className="space-y-4">
            <div className="text-6xl mb-4">🎟️</div>
            <h2 className="text-2xl font-black font-[var(--font-display)] uppercase text-[var(--text-primary)]">No tickets yet</h2>
            <p className="text-sm font-semibold text-[var(--text-secondary)] uppercase">
              Register for events to see your tickets here
            </p>
            <Link
              href="/explore"
              className="btn-primary text-xs shadow-[2px_2px_0px_0px_var(--shadow-color)] inline-flex items-center gap-1.5"
              style={{ textDecoration: "none" }}
            >
              <Ticket className="w-4 h-4" /> Browse Events
            </Link>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {selectedTicket && (
        <Dialog
          open={!!selectedTicket}
          onOpenChange={() => setSelectedTicket(null)}
        >
          <DialogContent className="bg-[var(--bg-card)] border-2 border-[var(--border)] text-[var(--text-primary)] rounded-none shadow-[6px_6px_0px_0px_var(--shadow-color)] max-w-md p-6">
            <DialogHeader>
              <DialogTitle className="font-black uppercase text-lg text-[var(--text-primary)]">Your Ticket</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="text-center p-3 border-2 border-[var(--border)] bg-[var(--bg-elevated)] shadow-[2px_2px_0px_0px_var(--shadow-color)]">
                <p className="font-black text-sm uppercase text-[var(--text-primary)]">
                  {selectedTicket.attendeeName}
                </p>
                <p className="text-xs font-bold text-[var(--text-secondary)] mt-1 uppercase line-clamp-1">
                  {selectedTicket.event.title}
                </p>
              </div>

              <div className="flex justify-center p-6 bg-white border-2 border-[var(--border)] shadow-[3px_3px_0px_0px_var(--shadow-color)]">
                <QRCode value={selectedTicket.qrCode} size={200} level="H" />
              </div>

              <div className="text-center">
                <p className="text-[10px] font-black uppercase text-[var(--text-secondary)]">Ticket ID</p>
                <p className="font-mono text-xs font-bold bg-[var(--bg-elevated)] border border-[var(--border)] py-1 mt-1">{selectedTicket.qrCode}</p>
              </div>

              <div className="border-2 border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-[2px_2px_0px_0px_var(--shadow-color)] space-y-2 text-xs font-bold uppercase text-[var(--text-secondary)]">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[var(--color-primary)]" />
                  <span>
                    {format(selectedTicket.event.startDate, "PPP, h:mm a")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[var(--color-secondary)]" />
                  <span>
                    {selectedTicket.event.locationType === "online"
                      ? "Online Event"
                      : `${selectedTicket.event.city}, ${
                          selectedTicket.event.state ||
                          selectedTicket.event.country
                        }`}
                  </span>
                </div>
              </div>

              <p className="text-[10px] font-bold text-[var(--text-secondary)] text-center uppercase">
                Show this QR code at the event entrance for check-in
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

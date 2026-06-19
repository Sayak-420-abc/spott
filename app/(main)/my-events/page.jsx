"use client";

import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useConvexQuery, useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import EventCard from "@/components/event-card";

export default function MyEventsPage() {
  const router = useRouter();

  const { data: events, isLoading } = useConvexQuery(api.events.getMyEvents);
  const { mutate: deleteEvent } = useConvexMutation(api.events.deleteEvent);

  const handleDelete = async (eventId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event? This action cannot be undone and will permanently delete the event and all associated registrations.",
    );

    if (!confirmed) return;

    try {
      await deleteEvent({ eventId });
      toast.success("Event deleted successfully");
    } catch (error) {
      toast.error(error.message || "Failed to delete event");
    }
  };

  const handleEventClick = (eventId) => {
    router.push(`/my-events/${eventId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b-2 border-[var(--border)]">
        <h1 className="text-4xl font-black font-[var(--font-display)] uppercase text-[var(--text-primary)]">My Events</h1>
        <p className="text-[var(--text-secondary)] mt-2 text-sm font-semibold uppercase">Manage your created events</p>
      </div>

      {events?.length === 0 ? (
        <div className="border-2 border-dashed border-[var(--border)] bg-[var(--bg-card)] p-12 text-center shadow-[4px_4px_0px_0px_var(--shadow-color)] max-w-xl mx-auto">
          <div className="space-y-4">
            <div className="text-6xl mb-4">📅</div>
            <h2 className="text-2xl font-black font-[var(--font-display)] uppercase text-[var(--text-primary)]">No events yet</h2>
            <p className="text-sm font-semibold text-[var(--text-secondary)] uppercase">
              Create your first event and start managing attendees
            </p>
            <Link
              href="/create-event"
              className="btn-primary text-xs shadow-[2px_2px_0px_0px_var(--shadow-color)] inline-flex items-center gap-1.5"
              style={{ textDecoration: "none" }}
            >
              <Plus className="w-4 h-4" /> Create Your First Event
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events?.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              action="event"
              onClick={() => handleEventClick(event._id)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  TrendingUp,
  Clock,
  Trash2,
  QrCode,
  Loader2,
  CheckCircle,
  Download,
  Search,
  Eye,
} from "lucide-react";
import { useConvexQuery, useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

import { getCategoryIcon, getCategoryLabel } from "@/lib/data";
import QRScannerModal from "../_components/qr-scanner-modal";
import { AttendeeCard } from "../_components/attendee-card";

export default function EventDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId;

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showQRScanner, setShowQRScanner] = useState(false);

  // Fetch event dashboard data
  const { data: dashboardData, isLoading } = useConvexQuery(
    api.dashboard.getEventDashboard,
    { eventId },
  );

  // Fetch registrations
  const { data: registrations, isLoading: loadingRegistrations } =
    useConvexQuery(api.registrations.getEventRegistrations, { eventId });

  // Delete event mutation
  const { mutate: deleteEvent, isLoading: isDeleting } = useConvexMutation(
    api.dashboard.deleteEvent,
  );

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event? This action cannot be undone and will permanently delete the event and all associated registrations.",
    );

    if (!confirmed) return;

    try {
      await deleteEvent({ eventId });
      toast.success("Event deleted successfully");
      router.push("/my-events");
    } catch (error) {
      toast.error(error.message || "Failed to delete event");
    }
  };

  const handleExportCSV = () => {
    if (!registrations || registrations.length === 0) {
      toast.error("No registrations to export");
      return;
    }

    const csvContent = [
      [
        "Name",
        "Email",
        "Registered At",
        "Checked In",
        "Checked In At",
        "QR Code",
      ],
      ...registrations.map((reg) => [
        reg.attendeeName,
        reg.attendeeEmail,
        new Date(reg.registeredAt).toLocaleString(),
        reg.checkedIn ? "Yes" : "No",
        reg.checkedInAt ? new Date(reg.checkedInAt).toLocaleString() : "-",
        reg.qrCode,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${dashboardData?.event.title || "event"}_registrations.csv`;
    a.click();
    toast.success("CSV exported successfully");
  };

  if (isLoading || loadingRegistrations) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  if (!dashboardData) {
    notFound();
  }

  const { event, stats } = dashboardData;

  // Filter registrations based on active tab and search
  const filteredRegistrations = registrations?.filter((reg) => {
    const matchesSearch =
      reg.attendeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.attendeeEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.qrCode.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "all") return matchesSearch && reg.status === "confirmed";
    if (activeTab === "checked-in")
      return matchesSearch && reg.checkedIn && reg.status === "confirmed";
    if (activeTab === "pending")
      return matchesSearch && !reg.checkedIn && reg.status === "confirmed";

    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      {/* Navigation */}
      <div>
        <button
          onClick={() => router.push("/my-events")}
          className="font-bold text-xs uppercase px-4 py-2 border-2 border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--color-accent)] hover:text-[var(--text-primary)] transition-all shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer inline-flex items-center gap-1.5 self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Events
        </button>
      </div>

      {event.coverImage && (
        <div className="relative h-[250px] md:h-[350px] border-2 border-[var(--border)] shadow-[4px_4px_0px_0px_var(--shadow-color)] overflow-hidden mb-6">
          <Image
            src={event.coverImage}
            alt={event.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Event Header */}
      <div className="flex flex-col gap-5 md:flex-row items-start justify-between pb-6 border-b-2 border-[var(--border)]">
        <div className="flex-1">
          <h1 className="text-3xl font-black font-[var(--font-display)] uppercase text-[var(--text-primary)] mb-3">{event.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-[var(--text-secondary)] uppercase">
            <span className="bg-[var(--bg-elevated)] border border-[var(--border)] px-2 py-0.5 shadow-[1px_1px_0px_0px_var(--shadow-color)] font-black">
              {getCategoryIcon(event.category)}{" "}
              {getCategoryLabel(event.category)}
            </span>
            <div className="flex items-center gap-1 bg-[var(--bg-card)] border border-[var(--border)] px-2 py-0.5 shadow-[1px_1px_0px_0px_var(--shadow-color)]">
              <Calendar className="w-3.5 h-3.5 text-[var(--color-primary)]" />
              <span>{format(event.startDate, "PPP")}</span>
            </div>
            <div className="flex items-center gap-1 bg-[var(--bg-card)] border border-[var(--border)] px-2 py-0.5 shadow-[1px_1px_0px_0px_var(--shadow-color)]">
              <MapPin className="w-3.5 h-3.5 text-[var(--color-secondary)]" />
              <span>
                {event.locationType === "online"
                  ? "Online"
                  : `${event.city}, ${event.state || event.country}`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={() => router.push(`/events/${event.slug}`)}
            className="font-bold text-xs uppercase px-4 py-2 border-2 border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--color-accent)] hover:text-[var(--text-primary)] transition-all shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer inline-flex items-center justify-center gap-1.5 flex-1 md:flex-none"
          >
            <Eye className="w-4 h-4 text-[var(--color-primary)]" />
            View Detail
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="font-bold text-xs uppercase px-4 py-2 border-2 border-[var(--border)] bg-[var(--color-danger)] hover:bg-[var(--color-danger)] text-white transition-all shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer inline-flex items-center justify-center gap-1.5 flex-1 md:flex-none disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? "Deleting..." : "Delete Event"}
          </button>
        </div>
      </div>

      {/* QR Check-In Button */}
      <button
        onClick={() => setShowQRScanner(true)}
        className="btn-primary w-full py-4 text-xs font-black uppercase border-2 border-[var(--border)] shadow-[3px_3px_0px_0px_var(--shadow-color)] hover:translate-y-[-1px] active:translate-y-[1px] hover:shadow-[5px_5px_0px_0px_var(--shadow-color)] transition-all flex items-center justify-center gap-2 cursor-pointer mb-6"
      >
        <QrCode className="w-5 h-5 text-white fill-none" />
        Scan QR Code to Check-In Attendees
      </button>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Capacity */}
        <div className="border-2 border-[var(--border)] bg-[var(--bg-card)] shadow-[3px_3px_0px_0px_var(--shadow-color)] p-5 flex items-center gap-3">
          <div className="p-3 border-2 border-[var(--border)] bg-[var(--bg-elevated)] shadow-[1px_1px_0px_0px_var(--shadow-color)]">
            <Users className="w-6 h-6 text-[var(--color-primary)]" />
          </div>
          <div>
            <p className="text-2xl font-black uppercase text-[var(--text-primary)] font-[var(--font-display)]">
              {stats.totalRegistrations}/{stats.capacity}
            </p>
            <p className="text-[10px] font-black uppercase text-[var(--text-secondary)] mt-0.5">Capacity</p>
          </div>
        </div>

        {/* Checked In */}
        <div className="border-2 border-[var(--border)] bg-[var(--bg-card)] shadow-[3px_3px_0px_0px_var(--shadow-color)] p-5 flex items-center gap-3">
          <div className="p-3 border-2 border-[var(--border)] bg-[var(--bg-elevated)] shadow-[1px_1px_0px_0px_var(--shadow-color)]">
            <CheckCircle className="w-6 h-6 text-[var(--color-success)]" />
          </div>
          <div>
            <p className="text-2xl font-black uppercase text-[var(--text-primary)] font-[var(--font-display)]">{stats.checkedInCount}</p>
            <p className="text-[10px] font-black uppercase text-[var(--text-secondary)] mt-0.5">Checked In</p>
          </div>
        </div>

        {/* Revenue or Check-In Rate */}
        {event.ticketType === "paid" ? (
          <div className="border-2 border-[var(--border)] bg-[var(--bg-card)] shadow-[3px_3px_0px_0px_var(--shadow-color)] p-5 flex items-center gap-3">
            <div className="p-3 border-2 border-[var(--border)] bg-[var(--bg-elevated)] shadow-[1px_1px_0px_0px_var(--shadow-color)]">
              <TrendingUp className="w-6 h-6 text-[var(--color-secondary)]" />
            </div>
            <div>
              <p className="text-2xl font-black uppercase text-[var(--text-primary)] font-[var(--font-display)]">₹{stats.totalRevenue}</p>
              <p className="text-[10px] font-black uppercase text-[var(--text-secondary)] mt-0.5">Revenue</p>
            </div>
          </div>
        ) : (
          <div className="border-2 border-[var(--border)] bg-[var(--bg-card)] shadow-[3px_3px_0px_0px_var(--shadow-color)] p-5 flex items-center gap-3">
            <div className="p-3 border-2 border-[var(--border)] bg-[var(--bg-elevated)] shadow-[1px_1px_0px_0px_var(--shadow-color)]">
              <TrendingUp className="w-6 h-6 text-[var(--color-secondary)]" />
            </div>
            <div>
              <p className="text-2xl font-black uppercase text-[var(--text-primary)] font-[var(--font-display)]">{stats.checkInRate}%</p>
              <p className="text-[10px] font-black uppercase text-[var(--text-secondary)] mt-0.5">Check-in Rate</p>
            </div>
          </div>
        )}

        {/* Time Left */}
        <div className="border-2 border-[var(--border)] bg-[var(--bg-card)] shadow-[3px_3px_0px_0px_var(--shadow-color)] p-5 flex items-center gap-3">
          <div className="p-3 border-2 border-[var(--border)] bg-[var(--bg-elevated)] shadow-[1px_1px_0px_0px_var(--shadow-color)]">
            <Clock className="w-6 h-6 text-[var(--color-accent)]" />
          </div>
          <div>
            <p className="text-2xl font-black uppercase text-[var(--text-primary)] font-[var(--font-display)]">
              {stats.isEventPast
                ? "Ended"
                : stats.hoursUntilEvent > 24
                  ? `${Math.floor(stats.hoursUntilEvent / 24)}d`
                  : `${stats.hoursUntilEvent}h`}
            </p>
            <p className="text-[10px] font-black uppercase text-[var(--text-secondary)] mt-0.5">
              {stats.isEventPast ? "Event Over" : "Time Left"}
            </p>
          </div>
        </div>
      </div>

      {/* Attendee Management Section */}
      <div className="space-y-6 pt-6">
        <h2 className="text-2xl font-black font-[var(--font-display)] uppercase text-[var(--text-primary)]">Attendee Management</h2>

        {/* Tabs Bar */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 border-2 border-[var(--border)] text-xs font-black uppercase transition-all shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer ${
              activeTab === "all"
                ? "bg-[var(--color-primary)] text-white shadow-[2px_2px_0px_0px_var(--shadow-color)] translate-y-[-1px]"
                : "bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            All ({stats.totalRegistrations})
          </button>
          <button
            onClick={() => setActiveTab("checked-in")}
            className={`px-4 py-2 border-2 border-[var(--border)] text-xs font-black uppercase transition-all shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer ${
              activeTab === "checked-in"
                ? "bg-[var(--color-primary)] text-white shadow-[2px_2px_0px_0px_var(--shadow-color)] translate-y-[-1px]"
                : "bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Checked In ({stats.checkedInCount})
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 border-2 border-[var(--border)] text-xs font-black uppercase transition-all shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer ${
              activeTab === "pending"
                ? "bg-[var(--color-primary)] text-white shadow-[2px_2px_0px_0px_var(--shadow-color)] translate-y-[-1px]"
                : "bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Pending ({stats.pendingCount})
          </button>
        </div>

        {/* Search and Actions */}
        <div className="flex gap-3 flex-col sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
            <input
              placeholder="Search by name, email, or QR code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--bg-card)] border-2 border-[var(--border)] text-[var(--text-primary)] text-xs font-bold pl-10 pr-4 py-3 outline-none focus:border-[var(--color-primary)] focus:shadow-[2px_2px_0px_0px_var(--shadow-color)] transition-all placeholder:text-[var(--text-muted)]"
            />
          </div>
          <button
            onClick={handleExportCSV}
            className="font-bold text-xs uppercase px-4 py-3 border-2 border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--color-accent)] text-[var(--text-primary)] transition-all shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer inline-flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Attendee List */}
        <div className="space-y-3">
          {filteredRegistrations && filteredRegistrations.length > 0 ? (
            filteredRegistrations.map((registration) => (
              <AttendeeCard
                key={registration._id}
                registration={registration}
              />
            ))
          ) : (
            <div className="border-2 border-dashed border-[var(--border)] bg-[var(--bg-card)] p-12 text-center shadow-[3px_3px_0px_0px_var(--shadow-color)] text-xs font-bold uppercase text-[var(--text-secondary)]">
              No attendees found
            </div>
          )}
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScannerModal
          isOpen={showQRScanner}
          onClose={() => setShowQRScanner(false)}
        />
      )}
    </div>
  );
}

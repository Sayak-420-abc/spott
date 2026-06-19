"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  Calendar,
  Users,
  Eye,
  Percent,
  TrendingUp,
  MapPin,
  Clock,
  Loader2,
  BarChart3,
  Award,
  Heart,
  Bookmark,
  Share2,
  Zap,
  Activity,
  Star,
  TableProperties,
  LayoutDashboard,
  CheckCircle2,
  XCircle,
  ChevronUp,
  ChevronDown,
  Search,
  Download,
  MousePointerClick,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// ─── helpers ─────────────────────────────────────────────────────────────────
function fmtDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtShortDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, iconColor, barColor, barPercent, sub }) {
  return (
    <div className="border border-gray-800 bg-zinc-950/60 backdrop-blur-xl p-5 rounded-2xl flex flex-col gap-2 hover:border-gray-700 transition-colors">
      <div className="flex items-center justify-between text-xs text-gray-500 font-semibold uppercase tracking-widest">
        <span>{label}</span>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <p className="text-3xl font-extrabold text-white mt-1 tabular-nums">{value}</p>
      {barColor !== undefined && (
        <div className="h-1.5 bg-white/5 rounded-full mt-1 overflow-hidden">
          <div
            className={`h-full ${barColor} rounded-full transition-all duration-700`}
            style={{ width: `${Math.min(100, barPercent ?? 0)}%` }}
          />
        </div>
      )}
      {sub && <span className="text-[10px] text-gray-500 mt-1">{sub}</span>}
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900 border border-gray-700 rounded-xl px-4 py-3 text-xs text-white shadow-xl">
      <p className="font-bold mb-1 text-gray-400">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="capitalize">{p.dataKey}:</span>
          <span className="font-bold">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Tab Button ───────────────────────────────────────────────────────────────
function TabBtn({ active, onClick, icon: Icon, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
        active
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40"
          : "bg-zinc-900 text-gray-400 hover:text-white hover:bg-zinc-800 border border-gray-800"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
      {count !== undefined && (
        <span
          className={`text-xs px-1.5 py-0.5 rounded-full font-bold tabular-nums ${
            active ? "bg-white/20 text-white" : "bg-white/5 text-gray-500"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// ─── Sortable Table Header ────────────────────────────────────────────────────
function SortTh({ label, field, sort, onSort }) {
  const active = sort.field === field;
  return (
    <th
      onClick={() => onSort(field)}
      className="text-left text-xs font-semibold text-gray-500 uppercase tracking-widest py-3 px-4 cursor-pointer select-none hover:text-gray-300 transition-colors whitespace-nowrap"
    >
      <span className="flex items-center gap-1">
        {label}
        <span className="flex flex-col -space-y-1 ml-1">
          <ChevronUp className={`w-2.5 h-2.5 ${active && sort.dir === "asc" ? "text-indigo-400" : "text-gray-700"}`} />
          <ChevronDown className={`w-2.5 h-2.5 ${active && sort.dir === "desc" ? "text-indigo-400" : "text-gray-700"}`} />
        </span>
      </span>
    </th>
  );
}

// ─── Interaction type badge ───────────────────────────────────────────────────
const INTERACTION_STYLES = {
  viewed: { label: "View", cls: "bg-sky-500/10 text-sky-400 border-sky-500/20", icon: Eye },
  clicked: { label: "Click", cls: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20", icon: MousePointerClick },
  bookmarked: { label: "Bookmark", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: Bookmark },
  shared: { label: "Share", cls: "bg-teal-500/10 text-teal-400 border-teal-500/20", icon: Share2 },
};

function InteractionBadge({ type }) {
  const style = INTERACTION_STYLES[type] ?? { label: type, cls: "bg-gray-800 text-gray-400 border-gray-700", icon: Activity };
  const BadgeIcon = style.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${style.cls}`}>
      <BadgeIcon className="w-3 h-3" />
      {style.label}
    </span>
  );
}

// ─── CSV Export helper ────────────────────────────────────────────────────────
function exportCSV(rows, headers, filename) {
  const lines = [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Empty table ─────────────────────────────────────────────────────────────
function EmptyTable({ message }) {
  return (
    <tr>
      <td colSpan={99} className="py-12 text-center text-sm text-gray-600">
        {message}
      </td>
    </tr>
  );
}

// ─── Registrations Table ─────────────────────────────────────────────────────
function RegistrationsTable({ rows }) {
  const [sort, setSort] = useState({ field: "registeredAt", dir: "desc" });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("confirmed"); // "all" | "confirmed" | "cancelled"

  function onSort(field) {
    setSort((s) => ({ field, dir: s.field === field && s.dir === "desc" ? "asc" : "desc" }));
  }

  const confirmed = rows.filter((r) => r.status === "confirmed");
  const cancelled = rows.filter((r) => r.status === "cancelled");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const byStatus = statusFilter === "all" ? rows : rows.filter((r) => r.status === statusFilter);
    return byStatus
      .filter((r) =>
        !q ||
        r.attendeeName?.toLowerCase().includes(q) ||
        r.attendeeEmail?.toLowerCase().includes(q) ||
        r.qrCode?.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        const va = a[sort.field] ?? "";
        const vb = b[sort.field] ?? "";
        return sort.dir === "asc" ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
      });
  }, [rows, sort, search, statusFilter]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Status filter pills */}
        <div className="flex items-center gap-2">
          {[
            { key: "confirmed", label: `Confirmed (${confirmed.length})` },
            { key: "all",       label: `All (${rows.length})` },
            ...(cancelled.length > 0 ? [{ key: "cancelled", label: `Cancelled (${cancelled.length})` }] : []),
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === key
                  ? key === "cancelled"
                    ? "bg-red-700 text-white"
                    : "bg-indigo-600 text-white"
                  : "bg-zinc-900 text-gray-500 hover:text-white border border-gray-800"
              }`}
              title={key === "all" ? "Matches the total document count in your Convex dashboard" : undefined}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search attendees…"
              className="bg-zinc-900 border border-gray-800 text-white text-sm rounded-xl pl-8 pr-3 py-2 outline-none focus:border-indigo-600 transition-colors placeholder:text-gray-600 w-52"
            />
          </div>
          <button
            onClick={() =>
              exportCSV(
                filtered.map((r) => [r.attendeeName, r.attendeeEmail, r.status, r.checkedIn ? "Yes" : "No", fmtDate(r.registeredAt), fmtDate(r.checkedInAt), r.qrCode]),
                ["Name", "Email", "Status", "Checked In", "Registered At", "Checked In At", "QR Code"],
                "registrations.csv"
              )
            }
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 transition-all whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900/80">
            <tr>
              <SortTh label="Attendee" field="attendeeName" sort={sort} onSort={onSort} />
              <SortTh label="Email" field="attendeeEmail" sort={sort} onSort={onSort} />
              <SortTh label="Status" field="status" sort={sort} onSort={onSort} />
              <SortTh label="Check-In" field="checkedIn" sort={sort} onSort={onSort} />
              <SortTh label="Registered" field="registeredAt" sort={sort} onSort={onSort} />
              <SortTh label="Checked In At" field="checkedInAt" sort={sort} onSort={onSort} />
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-widest py-3 px-4">QR Code</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-900">
            {filtered.length === 0 ? (
              <EmptyTable message="No registrations found." />
            ) : (
              filtered.map((r) => (
                <tr key={r._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-medium text-white">{r.attendeeName}</td>
                  <td className="py-3 px-4 text-gray-400">{r.attendeeEmail}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold border ${
                        r.status === "confirmed"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {r.checkedIn ? (
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4.5 h-4.5 text-gray-700" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs whitespace-nowrap">{fmtDate(r.registeredAt)}</td>
                  <td className="py-3 px-4 text-gray-500 text-xs whitespace-nowrap">{r.checkedInAt ? fmtDate(r.checkedInAt) : <span className="text-gray-700">—</span>}</td>
                  <td className="py-3 px-4">
                    <code className="text-[10px] bg-gray-900 border border-gray-800 text-gray-400 px-2 py-0.5 rounded-md font-mono">
                      {r.qrCode}
                    </code>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-600 text-right">{filtered.length} of {rows.length} records</p>
    </div>
  );
}

// ─── Interactions Table ───────────────────────────────────────────────────────
function InteractionsTable({ rows }) {
  const [sort, setSort] = useState({ field: "createdAt", dir: "desc" });
  const [filter, setFilter] = useState("all");

  function onSort(field) {
    setSort((s) => ({ field, dir: s.field === field && s.dir === "desc" ? "asc" : "desc" }));
  }

  const filtered = useMemo(() => {
    return rows
      .filter((r) => filter === "all" || r.interactionType === filter)
      .sort((a, b) => {
        const va = a[sort.field] ?? 0;
        const vb = b[sort.field] ?? 0;
        return sort.dir === "asc" ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
      });
  }, [rows, sort, filter]);

  const types = ["all", "viewed", "clicked", "bookmarked", "shared"];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                filter === t
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-900 text-gray-500 hover:text-white border border-gray-800"
              }`}
            >
              {t === "all" ? `All (${rows.length})` : `${t} (${rows.filter((r) => r.interactionType === t).length})`}
            </button>
          ))}
        </div>
        <button
          onClick={() =>
            exportCSV(
              filtered.map((r) => [r.interactionType, fmtDate(r.createdAt), r.userId]),
              ["Type", "Date", "User ID"],
              "interactions.csv"
            )
          }
          className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900/80">
            <tr>
              <SortTh label="Type" field="interactionType" sort={sort} onSort={onSort} />
              <SortTh label="Date" field="createdAt" sort={sort} onSort={onSort} />
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-widest py-3 px-4">User ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-900">
            {filtered.length === 0 ? (
              <EmptyTable message="No interactions yet." />
            ) : (
              filtered.map((r) => (
                <tr key={r._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4">
                    <InteractionBadge type={r.interactionType} />
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs whitespace-nowrap">{fmtDate(r.createdAt)}</td>
                  <td className="py-3 px-4">
                    <code className="text-[10px] bg-gray-900 border border-gray-800 text-gray-500 px-2 py-0.5 rounded-md font-mono">
                      {r.userId}
                    </code>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-600 text-right">{filtered.length} of {rows.length} records shown (max 200)</p>
    </div>
  );
}

// ─── Likes Table ──────────────────────────────────────────────────────────────
function LikesTable({ rows }) {
  const [sort, setSort] = useState({ field: "likedAt", dir: "desc" });

  function onSort(field) {
    setSort((s) => ({ field, dir: s.field === field && s.dir === "desc" ? "asc" : "desc" }));
  }

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      const va = a[sort.field] ?? 0;
      const vb = b[sort.field] ?? 0;
      return sort.dir === "asc" ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
  }, [rows, sort]);

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          onClick={() =>
            exportCSV(
              sorted.map((r) => [r.userId, fmtDate(r.likedAt)]),
              ["User ID", "Liked At"],
              "likes.csv"
            )
          }
          className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900/80">
            <tr>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-widest py-3 px-4">#</th>
              <SortTh label="User ID" field="userId" sort={sort} onSort={onSort} />
              <SortTh label="Liked At" field="likedAt" sort={sort} onSort={onSort} />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-900">
            {sorted.length === 0 ? (
              <EmptyTable message="No likes yet." />
            ) : (
              sorted.map((r, i) => (
                <tr key={r._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 text-gray-700 text-xs">{i + 1}</td>
                  <td className="py-3 px-4">
                    <code className="text-[10px] bg-gray-900 border border-gray-800 text-gray-400 px-2 py-0.5 rounded-md font-mono">
                      {r.userId}
                    </code>
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs whitespace-nowrap">{fmtDate(r.likedAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-600 text-right">{sorted.length} records</p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [selectedEventId, setSelectedEventId] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [mainTab, setMainTab] = useState("dashboard"); // "dashboard" | "data"
  const [dataTab, setDataTab] = useState("registrations"); // "registrations" | "interactions" | "likes"
  const [showRawRegs, setShowRawRegs] = useState(false); // toggle: confirmed vs all records

  const myEvents = useQuery(api.events.getMyEvents);
  const overallStats = useQuery(api.analytics.getOrganizerOverallStats);
  const analytics = useQuery(
    api.analytics.getEventAnalytics,
    selectedEventId ? { eventId: selectedEventId } : "skip"
  );
  const ctr = useQuery(
    api.analytics.getRecommendationCTR,
    selectedEventId ? { eventId: selectedEventId } : "skip"
  );
  const rawData = useQuery(
    api.analytics.getRawEventData,
    selectedEventId && mainTab === "data" ? { eventId: selectedEventId } : "skip"
  );
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (myEvents && myEvents.length > 0 && !selectedEventId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedEventId(myEvents[0]._id);
    }
  }, [myEvents, selectedEventId]);

  if (!isMounted) return null;

  const hasData =
    analytics &&
    (analytics.registrationCount > 0 || analytics.viewCount > 0 || analytics.likeCount > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-7">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-3">
            <BarChart3 className="w-9 h-9 text-indigo-400" />
            Organizer Analytics
          </h1>
          <p className="text-muted-foreground mt-2 text-sm max-w-lg">
            Track registrations, engagement funnels, recommendation CTR, and inspect raw event data.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
          {myEvents && myEvents.length > 0 ? (
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
              <SelectTrigger className="w-full sm:w-72 bg-zinc-950 border-gray-800 text-white rounded-xl h-11">
                <SelectValue placeholder="Select an event" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-gray-800 text-white">
                {myEvents.map((evt) => (
                  <SelectItem key={evt._id} value={evt._id} className="hover:bg-indigo-950/30 cursor-pointer">
                    {evt.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : myEvents === undefined ? (
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
          ) : (
            <span className="text-muted-foreground text-sm">No events created yet</span>
          )}


        </div>
      </div>

      {/* ── Portfolio Overview ── */}
      {overallStats && overallStats.totalEvents > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="My Events" value={overallStats.totalEvents} icon={Calendar} iconColor="text-blue-400" sub="Total events created" />
          <StatCard label="Total Signups" value={overallStats.totalRegistrations} icon={Users} iconColor="text-indigo-400" barColor="bg-indigo-500" barPercent={overallStats.avgFillRate} sub={`${overallStats.avgFillRate}% avg fill rate`} />
          <StatCard label="Total Views" value={overallStats.totalViews} icon={Eye} iconColor="text-sky-400" sub="Across all events" />
          <StatCard label="Total Likes" value={overallStats.totalLikes} icon={Heart} iconColor="text-pink-400" sub="Event saves & likes" />
        </div>
      )}

      {/* ── No Events ── */}
      {myEvents && myEvents.length === 0 && (
        <div className="border border-dashed border-gray-800 bg-gray-950/20 rounded-2xl p-14 text-center">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto text-blue-400 mb-4">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No events found</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Create an event first to start tracking metrics and attendee behaviour.
          </p>
        </div>
      )}

      {/* ── Loading ── */}
      {selectedEventId && !analytics && myEvents && myEvents.length > 0 && (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
          <p className="text-muted-foreground text-sm">Loading analytics…</p>
        </div>
      )}

      {/* ── Main Content ── */}
      {analytics && (
        <div className="space-y-6 animate-in fade-in duration-300">

          {/* Event Banner */}
          <div className="p-5 rounded-2xl border border-gray-800/80 bg-gradient-to-r from-zinc-950/80 via-indigo-950/10 to-zinc-950/80 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-indigo-400 font-bold uppercase tracking-widest">Currently Analyzing</span>
              <h2 className="text-2xl font-bold text-white mt-0.5">{analytics.event?.title}</h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-1.5">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{analytics.event?.city}{analytics.event?.country ? `, ${analytics.event.country}` : ""}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>
                    {analytics.event?.startDate
                      ? new Date(analytics.event.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">{analytics.capacityFill}% filled</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 border border-gray-800 bg-black/30 px-4 py-2 rounded-xl">
              <Star className="w-3.5 h-3.5 text-yellow-500" />
              Capacity:
              <strong className="text-gray-300 ml-1">
                {showRawRegs ? analytics.totalRegistrationCount : analytics.registrationCount} / {analytics.event?.capacity}
              </strong>
              {showRawRegs && analytics.cancelledCount > 0 && (
                <span className="text-red-400/60">(incl. {analytics.cancelledCount} cancelled)</span>
              )}
            </div>
          </div>

          {/* ── Main Tab Bar ── */}
          <div className="flex items-center gap-3">
            <TabBtn
              active={mainTab === "dashboard"}
              onClick={() => setMainTab("dashboard")}
              icon={LayoutDashboard}
              label="Dashboard"
            />
            <TabBtn
              active={mainTab === "data"}
              onClick={() => setMainTab("data")}
              icon={TableProperties}
              label="Data"
              count={analytics.totalRegistrationCount + analytics.viewCount + analytics.likeCount}
            />
          </div>

          {/* ═══════════════ DASHBOARD TAB ═══════════════ */}
          {mainTab === "dashboard" && (
            <div className="space-y-6">
              {!hasData && (
                <div className="border border-dashed border-zinc-800 bg-zinc-950/40 rounded-2xl p-6 flex items-start gap-4">
                  <BarChart3 className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-zinc-300 mb-1">No analytics data yet</p>
                    <p className="text-xs text-zinc-500">
                      There are no registrations, page views, or likes recorded for this event yet.
                    </p>
                  </div>
                </div>
              )}

              {/* KPI Row 1 */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Registrations card with confirmed / raw toggle */}
                <div className="border border-gray-800 bg-zinc-950/60 backdrop-blur-xl p-5 rounded-2xl flex flex-col gap-2 hover:border-gray-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-semibold uppercase tracking-widest">Registrations</span>
                    <Users className="w-4 h-4 text-indigo-400" />
                  </div>
                  <p className="text-3xl font-extrabold text-white tabular-nums">
                    {showRawRegs ? analytics.totalRegistrationCount : analytics.registrationCount}
                  </p>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, showRawRegs ? Math.round((analytics.totalRegistrationCount / (analytics.event?.capacity || 1)) * 100) : analytics.capacityFill)}%` }}
                    />
                  </div>
                  {/* Toggle row */}
                  <div className="flex items-center gap-1.5 mt-1">
                    <button
                      onClick={() => setShowRawRegs(false)}
                      className={`flex-1 text-[10px] font-bold px-2 py-1 rounded-md transition-all ${
                        !showRawRegs ? "bg-indigo-600 text-white" : "bg-white/5 text-gray-500 hover:text-white"
                      }`}
                    >
                      Confirmed
                    </button>
                    <button
                      onClick={() => setShowRawRegs(true)}
                      className={`flex-1 text-[10px] font-bold px-2 py-1 rounded-md transition-all ${
                        showRawRegs ? "bg-indigo-600 text-white" : "bg-white/5 text-gray-500 hover:text-white"
                      }`}
                      title="Total documents in the registrations table — matches the Convex dashboard count"
                    >
                      All ({analytics.totalRegistrationCount})
                    </button>
                  </div>
                  {showRawRegs && analytics.cancelledCount > 0 && (
                    <span className="text-[10px] text-red-400/70">{analytics.cancelledCount} cancelled included</span>
                  )}
                </div>
                <StatCard label="Check-Ins" value={analytics.attendanceCount} icon={Award} iconColor="text-emerald-400" barColor="bg-emerald-500" barPercent={analytics.attendanceRate} sub={`${analytics.attendanceRate}% attendance rate`} />
                <StatCard label="Page Views" value={analytics.viewCount} icon={Eye} iconColor="text-sky-400" sub="Total event detail views" />
                <StatCard label="Rec. CTR" value={ctr ? `${ctr.ctr.toFixed(1)}%` : "0%"} icon={Percent} iconColor="text-pink-400" sub={`${ctr?.views ?? 0} impressions · ${ctr?.clicks ?? 0} clicks`} />
              </div>

              {/* KPI Row 2 */}
              <div className="grid grid-cols-3 gap-4">
                <StatCard label="Likes" value={analytics.likeCount} icon={Heart} iconColor="text-rose-400" sub="Total hearts" />
                <StatCard label="Bookmarks" value={analytics.bookmarkCount} icon={Bookmark} iconColor="text-amber-400" sub="Saved for later" />
                <StatCard label="Shares" value={analytics.shareCount} icon={Share2} iconColor="text-teal-400" sub="Social shares" />
              </div>

              {/* Charts */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Registration Velocity */}
                <div className="border border-gray-800/80 bg-zinc-950/50 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-sm font-bold text-white">7-Day Registration Velocity</h3>
                  </div>
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.registrationTimeline} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRegs" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                        <XAxis dataKey="day" stroke="#444" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#444" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="registrations" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRegs)" dot={{ fill: "#6366f1", r: 3 }} activeDot={{ r: 5, fill: "#818cf8" }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Interaction Breakdown */}
                <div className="border border-gray-800/80 bg-zinc-950/50 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-white">7-Day Interaction Breakdown</h3>
                  </div>
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.interactionTimeline} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                        <XAxis dataKey="day" stroke="#444" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#444" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" iconSize={8} />
                        <Bar dataKey="views" name="Views" fill="#38bdf8" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="clicks" name="Clicks" fill="#818cf8" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="bookmarks" name="Bookmarks" fill="#fbbf24" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Funnel */}
              <div className="border border-gray-800/80 bg-zinc-950/50 p-6 rounded-2xl space-y-5">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Attendance Conversion Funnel</h3>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-indigo-950/20 border border-indigo-800/30 rounded-xl p-4 text-center">
                    <p className="text-xs text-indigo-400 uppercase tracking-widest font-semibold mb-2">1. Page Views</p>
                    <p className="text-3xl font-extrabold text-white">{analytics.viewCount}</p>
                    <p className="text-xs text-gray-600 mt-1">Top of funnel</p>
                    <div className="h-1.5 bg-white/5 rounded-full mt-3"><div className="h-full bg-indigo-500 rounded-full w-full" /></div>
                  </div>
                  <div className="bg-purple-950/20 border border-purple-800/30 rounded-xl p-4 text-center">
                    <p className="text-xs text-purple-400 uppercase tracking-widest font-semibold mb-2">2. Registered</p>
                    <p className="text-3xl font-extrabold text-white">{analytics.registrationCount}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {analytics.viewCount > 0
                        ? `${Math.round((analytics.registrationCount / analytics.viewCount) * 100)}% conversion`
                        : "—"}
                    </p>
                    <div className="h-1.5 bg-white/5 rounded-full mt-3 overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: analytics.viewCount > 0 ? `${Math.min(100, (analytics.registrationCount / analytics.viewCount) * 100)}%` : "0%" }} />
                    </div>
                  </div>
                  <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-xl p-4 text-center">
                    <p className="text-xs text-emerald-400 uppercase tracking-widest font-semibold mb-2">3. Checked In</p>
                    <p className="text-3xl font-extrabold text-white">{analytics.attendanceCount}</p>
                    <p className="text-xs text-gray-600 mt-1">{analytics.attendanceRate}% of registrants</p>
                    <div className="h-1.5 bg-white/5 rounded-full mt-3 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${analytics.attendanceRate}%` }} />
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-gray-600 text-center">Check-ins are recorded in real time when QR codes are scanned at the venue entrance.</p>
              </div>
            </div>
          )}

          {/* ═══════════════ DATA TAB ═══════════════ */}
          {mainTab === "data" && (
            <div className="space-y-5">
              {/* Data sub-tabs */}
              <div className="flex items-center gap-2 flex-wrap">
                <TabBtn
                  active={dataTab === "registrations"}
                  onClick={() => setDataTab("registrations")}
                  icon={Users}
                  label="Registrations"
                  count={rawData?.registrations?.length}
                />
                <TabBtn
                  active={dataTab === "interactions"}
                  onClick={() => setDataTab("interactions")}
                  icon={Zap}
                  label="Interactions"
                  count={rawData?.interactions?.length}
                />
                <TabBtn
                  active={dataTab === "likes"}
                  onClick={() => setDataTab("likes")}
                  icon={Heart}
                  label="Likes"
                  count={rawData?.likes?.length}
                />
              </div>

              {!rawData ? (
                <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground text-sm">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading data…
                </div>
              ) : (
                <div className="animate-in fade-in duration-200">
                  {dataTab === "registrations" && (
                    <RegistrationsTable rows={rawData.registrations} />
                  )}
                  {dataTab === "interactions" && (
                    <InteractionsTable rows={rawData.interactions} />
                  )}
                  {dataTab === "likes" && (
                    <LikesTable rows={rawData.likes} />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

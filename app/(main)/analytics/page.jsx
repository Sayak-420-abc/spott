"use client";

import { useQuery } from "convex/react";
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

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, iconColor, barColor, barPercent, sub }) {
  return (
    <div className="cyber-card p-5 bg-[var(--bg-card)] border-2 border-[var(--border)] shadow-[4px_4px_0px_0px_var(--shadow-color)] flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wider">
        <span>{label}</span>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <p className="text-3xl font-black text-[var(--text-primary)] mt-1 tabular-nums font-[var(--font-display)] uppercase">{value}</p>
      {barColor !== undefined && (
        <div className="h-2 bg-[var(--bg-elevated)] border-2 border-[var(--border)] mt-1 overflow-hidden">
          <div
            className="h-full bg-[var(--color-primary)] transition-all duration-700"
            style={{ width: `${Math.min(100, barPercent ?? 0)}%` }}
          />
        </div>
      )}
      {sub && <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase mt-1">{sub}</span>}
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--bg-card)] border-2 border-[var(--border)] shadow-[3px_3px_0px_0px_var(--shadow-color)] px-4 py-3 text-xs text-[var(--text-primary)]">
      <p className="font-black mb-1 text-[var(--text-secondary)] uppercase">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 mt-1">
          <div className="w-2.5 h-2.5 border border-[var(--border)]" style={{ backgroundColor: p.color }} />
          <span className="capitalize font-bold text-[var(--text-secondary)]">{p.name || p.dataKey}:</span>
          <span className="font-black text-[var(--text-primary)]">{p.value}</span>
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
      className={`flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase border-2 border-[var(--border)] transition-all cursor-pointer ${
        active
          ? "bg-[var(--color-primary)] text-white shadow-[2px_2px_0px_0px_var(--shadow-color)] translate-y-[-1px]"
          : "bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] shadow-[1px_1px_0px_0px_var(--shadow-color)]"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
      {count !== undefined && (
        <span
          className={`text-[9px] px-1.5 py-0.5 border border-[var(--border)] font-black tabular-nums transition-colors ${
            active ? "bg-white text-[var(--text-primary)]" : "bg-[var(--bg-elevated)] text-[var(--text-secondary)]"
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
      className="text-left text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider py-3 px-4 cursor-pointer select-none hover:text-[var(--text-primary)] transition-colors whitespace-nowrap"
    >
      <span className="flex items-center gap-1">
        {label}
        <span className="flex flex-col -space-y-0.5 ml-1">
          <ChevronUp className={`w-2.5 h-2.5 ${active && sort.dir === "asc" ? "text-[var(--color-primary)]" : "text-[var(--text-muted)]"}`} />
          <ChevronDown className={`w-2.5 h-2.5 ${active && sort.dir === "desc" ? "text-[var(--color-primary)]" : "text-[var(--text-muted)]"}`} />
        </span>
      </span>
    </th>
  );
}

// ─── Interaction type badge ───────────────────────────────────────────────────
const INTERACTION_STYLES = {
  viewed: { label: "View", cls: "bg-[var(--bg-card)] text-sky-500", icon: Eye },
  clicked: { label: "Click", cls: "bg-[var(--bg-card)] text-[var(--color-primary)]", icon: MousePointerClick },
  bookmarked: { label: "Bookmark", cls: "bg-[var(--bg-card)] text-[var(--color-accent)]", icon: Bookmark },
  shared: { label: "Share", cls: "bg-[var(--bg-card)] text-[var(--color-secondary)]", icon: Share2 },
};

function InteractionBadge({ type }) {
  const style = INTERACTION_STYLES[type] ?? { label: type, cls: "bg-[var(--bg-card)] text-[var(--text-secondary)]", icon: Activity };
  const BadgeIcon = style.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black uppercase border-2 border-[var(--border)] shadow-[1px_1px_0px_0px_var(--shadow-color)] ${style.cls}`}>
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
      <td colSpan={99} className="py-12 text-center text-sm font-semibold text-[var(--text-secondary)]">
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
    <div className="space-y-4">
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
              className={`px-3 py-1.5 border-2 border-[var(--border)] text-xs font-black uppercase transition-all cursor-pointer shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:translate-y-[-1px] active:translate-y-[1px] ${
                statusFilter === key
                  ? key === "cancelled"
                    ? "bg-[var(--color-danger)] text-white"
                    : "bg-[var(--color-primary)] text-white"
                  : "bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
              }`}
              title={key === "all" ? "Matches the total document count in your Convex dashboard" : undefined}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search attendees…"
              className="bg-[var(--bg-card)] border-2 border-[var(--border)] text-[var(--text-primary)] text-xs font-semibold px-8 py-2 outline-none focus:border-[var(--color-primary)] focus:shadow-[2px_2px_0px_0px_var(--shadow-color)] transition-all placeholder:text-[var(--text-muted)] w-52"
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
            className="flex items-center gap-1.5 text-xs font-black uppercase px-3.5 py-2 border-2 border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--color-accent)] hover:translate-y-[-1px] active:translate-y-[1px] transition-all cursor-pointer shadow-[2px_2px_0px_0px_var(--shadow-color)] whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border-2 border-[var(--border)] shadow-[3px_3px_0px_0px_var(--shadow-color)] bg-[var(--bg-card)]">
        <table className="w-full text-xs">
          <thead className="bg-[var(--bg-elevated)] border-b-2 border-[var(--border)]">
            <tr>
              <SortTh label="Attendee" field="attendeeName" sort={sort} onSort={onSort} />
              <SortTh label="Email" field="attendeeEmail" sort={sort} onSort={onSort} />
              <SortTh label="Status" field="status" sort={sort} onSort={onSort} />
              <SortTh label="Check-In" field="checkedIn" sort={sort} onSort={onSort} />
              <SortTh label="Registered" field="registeredAt" sort={sort} onSort={onSort} />
              <SortTh label="Checked In At" field="checkedInAt" sort={sort} onSort={onSort} />
              <th className="text-left text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider py-3 px-4">QR Code</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {filtered.length === 0 ? (
              <EmptyTable message="No registrations found." />
            ) : (
              filtered.map((r) => (
                <tr key={r._id} className="hover:bg-[var(--bg-elevated)]/30 transition-colors">
                  <td className="py-3 px-4 font-extrabold text-[var(--text-primary)]">{r.attendeeName}</td>
                  <td className="py-3 px-4 font-semibold text-[var(--text-secondary)]">{r.attendeeEmail}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-[10px] font-black uppercase border border-[var(--border)] shadow-[1px_1px_0px_0px_var(--shadow-color)] ${
                        r.status === "confirmed"
                          ? "bg-[var(--color-success)] text-[var(--text-primary)]"
                          : "bg-[var(--color-danger)] text-white"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {r.checkedIn ? (
                      <CheckCircle2 className="w-5 h-5 text-[var(--color-success)]" />
                    ) : (
                      <XCircle className="w-5 h-5 text-[var(--text-muted)]" />
                    )}
                  </td>
                  <td className="py-3 px-4 font-bold text-[var(--text-secondary)] whitespace-nowrap">{fmtDate(r.registeredAt)}</td>
                  <td className="py-3 px-4 font-bold text-[var(--text-secondary)] whitespace-nowrap">{r.checkedInAt ? fmtDate(r.checkedInAt) : <span className="text-[var(--text-muted)]">—</span>}</td>
                  <td className="py-3 px-4">
                    <code className="text-[10px] bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] px-2 py-0.5 font-mono font-bold">
                      {r.qrCode}
                    </code>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs font-bold text-[var(--text-secondary)] text-right">{filtered.length} of {rows.length} records</p>
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
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 border-2 border-[var(--border)] text-xs font-black uppercase transition-all cursor-pointer shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:translate-y-[-1px] active:translate-y-[1px] ${
                filter === t
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
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
          className="flex items-center gap-1.5 text-xs font-black uppercase px-3.5 py-2 border-2 border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--color-accent)] hover:translate-y-[-1px] active:translate-y-[1px] transition-all cursor-pointer shadow-[2px_2px_0px_0px_var(--shadow-color)] whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto border-2 border-[var(--border)] shadow-[3px_3px_0px_0px_var(--shadow-color)] bg-[var(--bg-card)]">
        <table className="w-full text-xs">
          <thead className="bg-[var(--bg-elevated)] border-b-2 border-[var(--border)]">
            <tr>
              <SortTh label="Type" field="interactionType" sort={sort} onSort={onSort} />
              <SortTh label="Date" field="createdAt" sort={sort} onSort={onSort} />
              <th className="text-left text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider py-3 px-4">User ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {filtered.length === 0 ? (
              <EmptyTable message="No interactions yet." />
            ) : (
              filtered.map((r) => (
                <tr key={r._id} className="hover:bg-[var(--bg-elevated)]/30 transition-colors">
                  <td className="py-3 px-4">
                    <InteractionBadge type={r.interactionType} />
                  </td>
                  <td className="py-3 px-4 font-bold text-[var(--text-secondary)] whitespace-nowrap">{fmtDate(r.createdAt)}</td>
                  <td className="py-3 px-4">
                    <code className="text-[10px] bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] px-2 py-0.5 font-mono font-bold">
                      {r.userId}
                    </code>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs font-bold text-[var(--text-secondary)] text-right">{filtered.length} of {rows.length} records shown (max 200)</p>
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
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() =>
            exportCSV(
              sorted.map((r) => [r.userId, fmtDate(r.likedAt)]),
              ["User ID", "Liked At"],
              "likes.csv"
            )
          }
          className="flex items-center gap-1.5 text-xs font-black uppercase px-3.5 py-2 border-2 border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--color-accent)] hover:translate-y-[-1px] active:translate-y-[1px] transition-all cursor-pointer shadow-[2px_2px_0px_0px_var(--shadow-color)]"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto border-2 border-[var(--border)] shadow-[3px_3px_0px_0px_var(--shadow-color)] bg-[var(--bg-card)]">
        <table className="w-full text-xs">
          <thead className="bg-[var(--bg-elevated)] border-b-2 border-[var(--border)]">
            <tr>
              <th className="text-left text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider py-3 px-4">#</th>
              <SortTh label="User ID" field="userId" sort={sort} onSort={onSort} />
              <SortTh label="Liked At" field="likedAt" sort={sort} onSort={onSort} />
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {sorted.length === 0 ? (
              <EmptyTable message="No likes yet." />
            ) : (
              sorted.map((r, i) => (
                <tr key={r._id} className="hover:bg-[var(--bg-elevated)]/30 transition-colors">
                  <td className="py-3 px-4 font-bold text-[var(--text-muted)] text-xs">{i + 1}</td>
                  <td className="py-3 px-4">
                    <code className="text-[10px] bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] px-2 py-0.5 font-mono font-bold">
                      {r.userId}
                    </code>
                  </td>
                  <td className="py-3 px-4 font-bold text-[var(--text-secondary)] whitespace-nowrap">{fmtDate(r.likedAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs font-bold text-[var(--text-secondary)] text-right">{sorted.length} records</p>
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
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b-2 border-[var(--border)]">
        <div>
          <h1 className="text-4xl font-black font-[var(--font-display)] uppercase text-[var(--text-primary)] flex items-center gap-3">
            <BarChart3 className="w-9 h-9 text-[var(--color-primary)]" />
            Organizer Analytics
          </h1>
          <p className="text-[var(--text-secondary)] mt-2 text-sm font-semibold max-w-lg">
            Track registrations, engagement funnels, recommendation CTR, and inspect raw event data.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
          {myEvents && myEvents.length > 0 ? (
            <div className="w-full sm:w-72">
              <label className="block text-[10px] font-black uppercase text-[var(--text-secondary)] mb-1">Select Active Event</label>
              <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                <SelectTrigger className="w-full bg-[var(--bg-card)] border-2 border-[var(--border)] text-[var(--text-primary)] rounded-none h-11 shadow-[2px_2px_0px_0px_var(--shadow-color)] focus:shadow-[3px_3px_0px_0px_var(--shadow-color)] focus:ring-0 focus:ring-offset-0 font-bold uppercase text-xs">
                  <SelectValue placeholder="Select an event" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--bg-card)] border-2 border-[var(--border)] text-[var(--text-primary)] rounded-none shadow-[4px_4px_0px_0px_var(--shadow-color)] z-50">
                  {myEvents.map((evt) => (
                    <SelectItem key={evt._id} value={evt._id} className="hover:bg-[var(--bg-elevated)] cursor-pointer focus:bg-[var(--bg-elevated)] focus:text-[var(--text-primary)] font-bold text-xs uppercase rounded-none">
                      {evt.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : myEvents === undefined ? (
            <Loader2 className="w-6 h-6 animate-spin text-[var(--color-primary)]" />
          ) : (
            <span className="text-[var(--text-secondary)] font-bold uppercase text-sm">No events created yet</span>
          )}
        </div>
      </div>

      {/* ── Portfolio Overview ── */}
      {overallStats && overallStats.totalEvents > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="My Events" value={overallStats.totalEvents} icon={Calendar} iconColor="text-[var(--color-primary)]" sub="Total events created" />
          <StatCard label="Total Signups" value={overallStats.totalRegistrations} icon={Users} iconColor="text-[var(--color-secondary)]" barColor="bg-[var(--color-secondary)]" barPercent={overallStats.avgFillRate} sub={`${overallStats.avgFillRate}% avg fill rate`} />
          <StatCard label="Total Views" value={overallStats.totalViews} icon={Eye} iconColor="text-[var(--color-accent)]" sub="Across all events" />
          <StatCard label="Total Likes" value={overallStats.totalLikes} icon={Heart} iconColor="text-[var(--color-danger)]" sub="Event saves & likes" />
        </div>
      )}

      {/* ── No Events ── */}
      {myEvents && myEvents.length === 0 && (
        <div className="border-2 border-dashed border-[var(--border)] bg-[var(--bg-card)] rounded-none p-14 text-center shadow-[4px_4px_0px_0px_var(--shadow-color)]">
          <div className="w-16 h-16 bg-[var(--bg-elevated)] border-2 border-[var(--border)] shadow-[2px_2px_0px_0px_var(--shadow-color)] flex items-center justify-center mx-auto text-[var(--color-primary)] mb-4">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black uppercase text-[var(--text-primary)] mb-2">No events found</h3>
          <p className="text-sm font-semibold text-[var(--text-secondary)] max-w-md mx-auto">
            Create an event first to start tracking metrics and attendee behavior.
          </p>
        </div>
      )}

      {/* ── Loading ── */}
      {selectedEventId && !analytics && myEvents && myEvents.length > 0 && (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)]" />
          <p className="text-[var(--text-secondary)] font-bold uppercase text-xs">Loading analytics…</p>
        </div>
      )}

      {/* ── Main Content ── */}
      {analytics && (
        <div className="space-y-6 animate-fade-in">

          {/* Event Banner */}
          <div className="p-5 border-2 border-[var(--border)] bg-[var(--bg-card)] shadow-[4px_4px_0px_0px_var(--shadow-color)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-[var(--color-primary)] font-black uppercase tracking-widest bg-[var(--bg-elevated)] border border-[var(--border)] px-2 py-0.5 shadow-[1px_1px_0px_0px_var(--shadow-color)]">Currently Analyzing</span>
              <h2 className="text-2xl font-black text-[var(--text-primary)] font-[var(--font-display)] uppercase mt-2">{analytics.event?.title}</h2>
              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-[var(--text-secondary)] mt-2">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{analytics.event?.city}{analytics.event?.country ? `, ${analytics.event.country}` : ""}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {analytics.event?.startDate
                      ? new Date(analytics.event.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-[var(--color-success)]" />
                  <span className="text-[var(--color-success)]">{analytics.capacityFill}% filled</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-black uppercase text-[var(--text-secondary)] border-2 border-[var(--border)] bg-[var(--bg-card)] px-4 py-2 shadow-[2px_2px_0px_0px_var(--shadow-color)]">
              <Star className="w-3.5 h-3.5 text-[var(--color-accent)] fill-[var(--color-accent)]" />
              Capacity:
              <strong className="text-[var(--text-primary)] ml-1">
                {showRawRegs ? analytics.totalRegistrationCount : analytics.registrationCount} / {analytics.event?.capacity}
              </strong>
              {showRawRegs && analytics.cancelledCount > 0 && (
                <span className="text-[var(--color-danger)] font-black italic ml-1">(incl. {analytics.cancelledCount} cancelled)</span>
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
                <div className="border-2 border-dashed border-[var(--border)] bg-[var(--bg-card)] p-6 flex items-start gap-4 shadow-[3px_3px_0px_0px_var(--shadow-color)]">
                  <BarChart3 className="w-5 h-5 text-[var(--color-primary)] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-black uppercase text-[var(--text-primary)] mb-1">No analytics data yet</p>
                    <p className="text-xs font-semibold text-[var(--text-secondary)]">
                      There are no registrations, page views, or likes recorded for this event yet.
                    </p>
                  </div>
                </div>
              )}

              {/* KPI Row 1 */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Registrations card with confirmed / raw toggle */}
                <div className="cyber-card p-5 flex flex-col gap-2 bg-[var(--bg-card)] border-2 border-[var(--border)] shadow-[4px_4px_0px_0px_var(--shadow-color)]">
                  <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wider">
                    <span>Registrations</span>
                    <Users className="w-4 h-4 text-[var(--color-primary)]" />
                  </div>
                  <p className="text-3xl font-black text-[var(--text-primary)] tabular-nums font-[var(--font-display)]">
                    {showRawRegs ? analytics.totalRegistrationCount : analytics.registrationCount}
                  </p>
                  <div className="h-2 bg-[var(--bg-elevated)] border-2 border-[var(--border)] overflow-hidden">
                    <div
                      className="h-full bg-[var(--color-primary)] transition-all duration-700"
                      style={{ width: `${Math.min(100, showRawRegs ? Math.round((analytics.totalRegistrationCount / (analytics.event?.capacity || 1)) * 100) : analytics.capacityFill)}%` }}
                    />
                  </div>
                  {/* Toggle row */}
                  <div className="flex items-center gap-1.5 mt-1">
                    <button
                      onClick={() => setShowRawRegs(false)}
                      className={`flex-1 text-[9px] font-black uppercase py-1 border border-[var(--border)] transition-all cursor-pointer ${
                        !showRawRegs ? "bg-[var(--color-primary)] text-white shadow-[1px_1px_0px_0px_var(--shadow-color)]" : "bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      Confirmed
                    </button>
                    <button
                      onClick={() => setShowRawRegs(true)}
                      className={`flex-1 text-[9px] font-black uppercase py-1 border border-[var(--border)] transition-all cursor-pointer ${
                        showRawRegs ? "bg-[var(--color-primary)] text-white shadow-[1px_1px_0px_0px_var(--shadow-color)]" : "bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                      title="Total documents in the registrations table — matches the Convex dashboard count"
                    >
                      All ({analytics.totalRegistrationCount})
                    </button>
                  </div>
                  {showRawRegs && analytics.cancelledCount > 0 && (
                    <span className="text-[10px] font-black text-[var(--color-danger)] uppercase mt-1">{analytics.cancelledCount} cancelled included</span>
                  )}
                </div>
                <StatCard label="Check-Ins" value={analytics.attendanceCount} icon={Award} iconColor="text-[var(--color-success)]" barColor="bg-[var(--color-success)]" barPercent={analytics.attendanceRate} sub={`${analytics.attendanceRate}% attendance rate`} />
                <StatCard label="Page Views" value={analytics.viewCount} icon={Eye} iconColor="text-[var(--color-secondary)]" sub="Total event detail views" />
                <StatCard label="Rec. CTR" value={ctr ? `${ctr.ctr.toFixed(1)}%` : "0%"} icon={Percent} iconColor="text-[var(--color-accent)]" sub={`${ctr?.views ?? 0} impressions · ${ctr?.clicks ?? 0} clicks`} />
              </div>

              {/* KPI Row 2 */}
              <div className="grid grid-cols-3 gap-4">
                <StatCard label="Likes" value={analytics.likeCount} icon={Heart} iconColor="text-[var(--color-danger)]" sub="Total hearts" />
                <StatCard label="Bookmarks" value={analytics.bookmarkCount} icon={Bookmark} iconColor="text-[var(--color-accent)]" sub="Saved for later" />
                <StatCard label="Shares" value={analytics.shareCount} icon={Share2} iconColor="text-[var(--color-primary)]" sub="Social shares" />
              </div>

              {/* Charts */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Registration Velocity */}
                <div className="border-2 border-[var(--border)] bg-[var(--bg-card)] shadow-[4px_4px_0px_0px_var(--shadow-color)] p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[var(--color-primary)]" />
                    <h3 className="text-sm font-black uppercase text-[var(--text-primary)]">7-Day Registration Velocity</h3>
                  </div>
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.registrationTimeline} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRegs" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--dot-color)" vertical={false} />
                        <XAxis dataKey="day" stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="registrations" stroke="var(--color-primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRegs)" dot={{ fill: "var(--color-primary)", r: 3 }} activeDot={{ r: 5, fill: "var(--color-primary)" }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Interaction Breakdown */}
                <div className="border-2 border-[var(--border)] bg-[var(--bg-card)] shadow-[4px_4px_0px_0px_var(--shadow-color)] p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[var(--color-accent)]" />
                    <h3 className="text-sm font-black uppercase text-[var(--text-primary)]">7-Day Interaction Breakdown</h3>
                  </div>
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.interactionTimeline} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--dot-color)" vertical={false} />
                        <XAxis dataKey="day" stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" iconSize={8} />
                        <Bar dataKey="views" name="Views" fill="#06b6d4" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="clicks" name="Clicks" fill="var(--color-primary)" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="bookmarks" name="Bookmarks" fill="var(--color-accent)" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Funnel */}
              <div className="border-2 border-[var(--border)] bg-[var(--bg-card)] shadow-[4px_4px_0px_0px_var(--shadow-color)] p-6 space-y-5">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[var(--color-success)]" />
                  <h3 className="text-sm font-black uppercase text-[var(--text-primary)]">Attendance Conversion Funnel</h3>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-[var(--bg-elevated)] border-2 border-[var(--border)] p-4 text-center shadow-[2px_2px_0px_0px_var(--shadow-color)]">
                    <p className="text-xs text-[var(--color-primary)] uppercase tracking-wider font-black mb-2">1. Page Views</p>
                    <p className="text-3xl font-black text-[var(--text-primary)] font-[var(--font-display)]">{analytics.viewCount}</p>
                    <p className="text-xs text-[var(--text-secondary)] font-bold mt-1">TOP OF FUNNEL</p>
                    <div className="h-2 bg-[var(--bg-card)] border border-[var(--border)] mt-3">
                      <div className="h-full bg-[var(--color-primary)] w-full" />
                    </div>
                  </div>
                  <div className="bg-[var(--bg-elevated)] border-2 border-[var(--border)] p-4 text-center shadow-[2px_2px_0px_0px_var(--shadow-color)]">
                    <p className="text-xs text-[var(--color-secondary)] uppercase tracking-wider font-black mb-2">2. Registered</p>
                    <p className="text-3xl font-black text-[var(--text-primary)] font-[var(--font-display)]">{analytics.registrationCount}</p>
                    <p className="text-xs text-[var(--text-secondary)] font-bold mt-1">
                      {analytics.viewCount > 0
                        ? `${Math.round((analytics.registrationCount / analytics.viewCount) * 100)}% conversion`
                        : "—"}
                    </p>
                    <div className="h-2 bg-[var(--bg-card)] border border-[var(--border)] mt-3 overflow-hidden">
                      <div className="h-full bg-[var(--color-secondary)]" style={{ width: analytics.viewCount > 0 ? `${Math.min(100, (analytics.registrationCount / analytics.viewCount) * 100)}%` : "0%" }} />
                    </div>
                  </div>
                  <div className="bg-[var(--bg-elevated)] border-2 border-[var(--border)] p-4 text-center shadow-[2px_2px_0px_0px_var(--shadow-color)]">
                    <p className="text-xs text-[var(--color-success)] uppercase tracking-wider font-black mb-2">3. Checked In</p>
                    <p className="text-3xl font-black text-[var(--text-primary)] font-[var(--font-display)]">{analytics.attendanceCount}</p>
                    <p className="text-xs text-[var(--text-secondary)] font-bold mt-1">{analytics.attendanceRate}% OF REGISTRANTS</p>
                    <div className="h-2 bg-[var(--bg-card)] border border-[var(--border)] mt-3 overflow-hidden">
                      <div className="h-full bg-[var(--color-success)] transition-all duration-700" style={{ width: `${analytics.attendanceRate}%` }} />
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] font-bold text-center">Check-ins are recorded in real time when QR codes are scanned at the venue entrance.</p>
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
                <div className="flex items-center justify-center py-16 gap-3 text-[var(--text-secondary)] text-sm font-bold uppercase">
                  <Loader2 className="w-5 h-5 animate-spin text-[var(--color-primary)]" />
                  Loading data…
                </div>
              ) : (
                <div className="animate-fade-in">
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

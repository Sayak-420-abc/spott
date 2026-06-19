"use client";

import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import {
  Sparkles,
  Brain,
  Users,
  TrendingUp,
  Clock,
  Zap,
  MapPin,
  Calendar,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
  Info,
  Heart,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { CATEGORIES } from "@/lib/data";

export default function RecommendationsPage() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const getRecs = useAction(api.recommendations.getRecommendations);
  
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPreferences, setShowPreferences] = useState(true);

  // User input states for custom overrides
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [customSkills, setCustomSkills] = useState("");

  // Initialize inputs with user database preferences
  useEffect(() => {
    if (currentUser) {
      setSelectedInterests(currentUser.interests ?? []);
      setCustomSkills((currentUser.skills ?? []).join(", "));
    }
  }, [currentUser]);

  const loadRecommendations = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const skillsArray = customSkills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const res = await getRecs({
        userId: currentUser._id,
        limit: 10,
        overrideInterests: selectedInterests,
        overrideSkills: skillsArray,
      });
      setRecs(res);
      toast.success("AI Feed computed!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  };

  // Run on mount when user is ready
  useEffect(() => {
    if (currentUser) {
      loadRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const toggleInterest = (id) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  if (!currentUser) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center bg-[var(--bg-primary)]">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)]" />
        <p className="text-[var(--text-secondary)] font-bold uppercase text-xs">Loading user account details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b-2 border-[var(--border)]">
        <div>
          <h1 className="text-4xl font-black font-[var(--font-display)] uppercase text-[var(--text-primary)] flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-[var(--color-primary)] animate-pulse" />
            AI Recommendations
          </h1>
          <p className="text-[var(--text-secondary)] mt-2 text-sm font-semibold uppercase">
            Select your preferences and hobbies to discover matched campus activities.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setShowPreferences(!showPreferences)}
            className="font-bold text-xs uppercase px-4 py-2.5 border-2 border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--color-accent)] hover:text-[var(--text-primary)] transition-all shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer inline-flex items-center gap-1.5 self-start"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Preferences Panel
          </button>
          <button
            onClick={loadRecommendations}
            disabled={loading}
            className="font-bold text-xs uppercase px-4 py-2.5 border-2 border-[var(--border)] bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-all shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer inline-flex items-center gap-1.5 self-start disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Re-compute matches
          </button>
        </div>
      </div>

      {/* Preferences Selection Panel */}
      {showPreferences && (
        <div className="border-2 border-[var(--border)] bg-[var(--bg-card)] shadow-[4px_4px_0px_0px_var(--shadow-color)] p-6 space-y-6 animate-fade-in">
          <div className="space-y-2">
            <h3 className="text-sm font-black uppercase text-[var(--color-primary)] flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-[var(--color-primary)]" />
              Select Hobbies & Event Interests
            </h3>
            <p className="text-xs font-bold text-[var(--text-secondary)] uppercase">
              Toggle categories to adjust recommendations based on your current interests:
            </p>
          </div>

          {/* Grid of Interests */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedInterests.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleInterest(cat.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 border-2 border-[var(--border)] text-xs font-black uppercase text-left transition-all cursor-pointer shadow-[2px_2px_0px_0px_var(--shadow-color)] ${
                    isSelected
                      ? "bg-[var(--color-primary)] text-white translate-y-[1px] shadow-[1px_1px_0px_0px_var(--shadow-color)]"
                      : "bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--border)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span className="truncate">{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Custom Skills/Keywords Override */}
          <div className="space-y-2">
            <h3 className="text-sm font-black uppercase text-[var(--color-primary)] flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-[var(--color-primary)]" />
              Skills & Target Keywords
            </h3>
            <p className="text-xs font-bold text-[var(--text-secondary)] uppercase">
              Enter target keywords (e.g. React, public speaking, cooking) to find matching events:
            </p>
            <input
              type="text"
              placeholder="React, Frontend, Photography, Leadership..."
              value={customSkills}
              onChange={(e) => setCustomSkills(e.target.value)}
              className="w-full bg-[var(--bg-card)] border-2 border-[var(--border)] text-[var(--text-primary)] text-xs font-bold px-4 py-3 outline-none focus:border-[var(--color-primary)] focus:shadow-[2px_2px_0px_0px_var(--shadow-color)] transition-all placeholder:text-[var(--text-muted)]"
            />
          </div>

          {/* Compute Overrides Button */}
          <button
            onClick={loadRecommendations}
            disabled={loading}
            className="w-full py-4 text-xs font-black uppercase border-2 border-[var(--border)] bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-all cursor-pointer shadow-[3px_3px_0px_0px_var(--shadow-color)] hover:translate-y-[-1px] active:translate-y-[1px] flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            Update Recommendations Feed
          </button>
        </div>
      )}

      {/* Main Feed */}
      {loading && recs.length === 0 ? (
        <div className="min-h-[30vh] flex flex-col items-center justify-center gap-4 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)]" />
          <p className="text-[var(--text-secondary)] font-bold uppercase text-xs">Computing AI matches from custom preferences...</p>
        </div>
      ) : recs.length === 0 ? (
        <div className="border-2 border-dashed border-[var(--border)] bg-[var(--bg-card)] p-12 text-center shadow-[4px_4px_0px_0px_var(--shadow-color)] max-w-xl mx-auto">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-[var(--bg-elevated)] border-2 border-[var(--border)] shadow-[2px_2px_0px_0px_var(--shadow-color)] flex items-center justify-center mx-auto text-[var(--color-primary)] mb-4">
              <Brain className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black uppercase text-[var(--text-primary)]">No active matches found</h3>
            <p className="text-sm font-semibold text-[var(--text-secondary)] uppercase leading-relaxed">
              No active events match these custom preference configurations. Try selecting more categories or adjusting keywords.
            </p>
            <Link
              href="/explore"
              className="btn-primary text-xs shadow-[2px_2px_0px_0px_var(--shadow-color)] inline-flex items-center gap-1.5"
              style={{ textDecoration: "none" }}
            >
              Explore All Events
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {recs.map((rec, idx) => (
            <RecommendationCard key={rec.event._id} idx={idx} rec={rec} />
          ))}
        </div>
      )}
    </div>
  );
}

function RecommendationCard({ rec, idx }) {
  const [open, setOpen] = useState(false);
  const percent = Math.round(rec.finalScore * 100);

  const color =
    rec.finalScore >= 0.75
      ? "bg-[var(--color-success)] text-[var(--text-primary)]"
      : rec.finalScore >= 0.55
      ? "bg-[var(--color-primary)] text-white"
      : "bg-[var(--color-accent)] text-[var(--text-primary)]";

  const ringColor =
    rec.finalScore >= 0.75
      ? "stroke-[var(--color-success)]"
      : rec.finalScore >= 0.55
      ? "stroke-[var(--color-primary)]"
      : "stroke-[var(--color-accent)]";

  const showAIPitch = !!rec.aiMessage;

  return (
    <div className="group border-2 border-[var(--border)] bg-[var(--bg-card)] p-6 transition-all shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:shadow-[6px_6px_0px_0px_var(--color-secondary)]">
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 border-2 border-[var(--border)] shadow-[1px_1px_0px_0px_var(--shadow-color)] ${color}`}>
              #{idx + 1} Best Fit &middot; {percent}% Match
            </span>
            <span className="inline-flex items-center px-2 py-0.5 border border-[var(--border)] text-[9px] font-mono font-bold uppercase tracking-wider bg-[var(--bg-elevated)] text-[var(--text-secondary)] shadow-[1px_1px_0px_0px_var(--shadow-color)]">
              {rec.event.category}
            </span>
          </div>

          <Link href={`/events/${rec.event.slug}`}>
            <h3 className="text-xl font-black text-[var(--text-primary)] hover:text-[var(--color-primary)] transition-colors mt-2 uppercase font-[var(--font-display)]">
              {rec.event.title}
            </h3>
          </Link>

          {/* AI Advisor Engaging Message */}
          {showAIPitch && (
            <div className="relative border-2 border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 shadow-[2px_2px_0px_0px_var(--shadow-color)] mt-3 text-xs leading-relaxed">
              <span className="absolute -top-3.5 left-3 bg-[var(--color-primary)] border-2 border-[var(--border)] text-[9px] text-white px-2 py-0.5 font-black uppercase flex items-center gap-1 shadow-[1.5px_1.5px_0px_0px_var(--shadow-color)]">
                <Sparkles className="w-2.5 h-2.5" /> AI Advisor
              </span>
              <p className="text-[var(--text-primary)] italic font-semibold leading-relaxed mt-1">
                &quot;{rec.aiMessage}&quot;
              </p>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs text-[var(--color-primary)] font-black uppercase">
            <Info className="w-3.5 h-3.5" />
            <span>{rec.explanation[0]}</span>
          </div>

          {/* Meta Icons */}
          <div className="grid grid-cols-2 md:flex md:items-center gap-4 text-xs font-bold uppercase text-[var(--text-secondary)] pt-2">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[var(--color-primary)]" />
              <span>
                {new Date(rec.event.startDate).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[var(--color-secondary)]" />
              <span className="truncate max-w-[150px]">{rec.event.city}</span>
            </div>
            {rec.registeredFriends.length > 0 && (
              <div className="flex items-center gap-1.5 text-[var(--color-success)] bg-[var(--bg-elevated)] border border-[var(--border)] px-1.5 py-0.5 shadow-[1px_1px_0px_0px_var(--shadow-color)]">
                <Users className="w-4 h-4" />
                <span>
                  {rec.registeredFriends.length} friend
                  {rec.registeredFriends.length > 1 ? "s" : ""} registered
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Circular Progress Ring */}
        <div className="flex items-center justify-center self-center md:self-start">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="absolute w-full h-full transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="34"
                className="stroke-[var(--bg-elevated)]"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                className={ringColor}
                strokeWidth="6"
                fill="transparent"
                strokeDasharray="213.6"
                strokeDashoffset={213.6 - (213.6 * percent) / 100}
                strokeLinecap="round"
              />
            </svg>
            <span className="text-base font-black text-[var(--text-primary)] font-[var(--font-display)]">{percent}%</span>
          </div>
        </div>
      </div>

      <div className="h-[2px] bg-[var(--border)] my-4" />

      <div className="mt-4 flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <button
            onClick={() => setOpen(!open)}
            className="text-xs text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors flex items-center gap-1 font-black uppercase cursor-pointer"
          >
            {open ? "Hide Match Breakdown" : "Reveal Match Breakdown"}
            {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <Link
            href={`/events/${rec.event.slug}`}
            className="font-bold text-xs uppercase px-4 py-2 border-2 border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--color-accent)] text-[var(--text-primary)] transition-all shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer"
            style={{ textDecoration: "none" }}
          >
            View Event Details
          </Link>
        </div>

        {open && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-[var(--bg-elevated)] p-4 border-2 border-[var(--border)] shadow-[3px_3px_0px_0px_var(--shadow-color)] text-center mt-2 animate-fade-in">
            <div className="space-y-1">
              <p className="text-[10px] text-[var(--text-secondary)] uppercase font-black tracking-wider flex items-center justify-center gap-1">
                <Brain className="w-3 h-3 text-[var(--color-primary)]" /> Semantic
              </p>
              <p className="text-sm font-black text-[var(--text-primary)] font-[var(--font-display)]">{Math.round(rec.scores.semantic * 100)}%</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-[var(--text-secondary)] uppercase font-black tracking-wider flex items-center justify-center gap-1">
                <Users className="w-3 h-3 text-[var(--color-success)]" /> Social
              </p>
              <p className="text-sm font-black text-[var(--text-primary)] font-[var(--font-display)]">{Math.round(rec.scores.social * 100)}%</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-[var(--text-secondary)] uppercase font-black tracking-wider flex items-center justify-center gap-1">
                <TrendingUp className="w-3 h-3 text-[var(--color-secondary)]" /> Trend
              </p>
              <p className="text-sm font-black text-[var(--text-primary)] font-[var(--font-display)]">{Math.round(rec.scores.trend * 100)}%</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-[var(--text-secondary)] uppercase font-black tracking-wider flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-[var(--color-accent)]" /> Urgency
              </p>
              <p className="text-sm font-black text-[var(--text-primary)] font-[var(--font-display)]">{Math.round(rec.scores.deadline * 100)}%</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-[var(--text-secondary)] uppercase font-black tracking-wider flex items-center justify-center gap-1">
                <Zap className="w-3 h-3 text-sky-500" /> Freshness
              </p>
              <p className="text-sm font-black text-[var(--text-primary)] font-[var(--font-display)]">{Math.round(rec.scores.freshness * 100)}%</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

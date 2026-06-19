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
  Plus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  }, [currentUser]);

  const toggleInterest = (id) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  if (!currentUser) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
        <p className="text-muted-foreground text-sm">Loading user account details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-linear-to-r from-purple-400 via-pink-500 to-orange-400 bg-clip-text text-transparent flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
            AI Recommendations
          </h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            Select your preferences and hobbies to discover matched campus activities.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowPreferences(!showPreferences)}
            className="border-gray-800 text-gray-300 hover:text-white rounded-xl flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Preferences Panel
          </Button>
          <Button
            onClick={loadRecommendations}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-lg shadow-purple-900/30 flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Re-compute matches
          </Button>
        </div>
      </div>

      {/* Preferences Selection Panel */}
      {showPreferences && (
        <Card className="border border-gray-800 bg-zinc-950/40 backdrop-blur-xl rounded-2xl overflow-hidden p-6 animate-in fade-in duration-300">
          <CardContent className="p-0 space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-purple-400" />
                Select Hobbies & Event Interests
              </h3>
              <p className="text-xs text-muted-foreground">
                Toggle categories to adjust recommendations based on your current interests:
              </p>
            </div>

            {/* Grid of Interests */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedInterests.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleInterest(cat.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-purple-600/10 border-purple-500 text-purple-300 shadow-md shadow-purple-900/20"
                        : "bg-black/30 border-gray-900 text-gray-400 hover:border-gray-800 hover:text-gray-300"
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
              <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-purple-400" />
                Skills & Target Keywords
              </h3>
              <p className="text-xs text-muted-foreground">
                Enter target keywords (e.g. React, public speaking, cooking) to find matching events:
              </p>
              <Input
                type="text"
                placeholder="React, Frontend, Photography, Leadership..."
                value={customSkills}
                onChange={(e) => setCustomSkills(e.target.value)}
                className="bg-black/30 border-gray-900 text-white rounded-xl focus-visible:ring-purple-500"
              />
            </div>

            {/* Compute Overrides Button */}
            <Button
              onClick={loadRecommendations}
              disabled={loading}
              className="w-full bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-5 rounded-xl flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
              Update Recommendations Feed
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Main Feed */}
      {loading && recs.length === 0 ? (
        <div className="min-h-[30vh] flex flex-col items-center justify-center gap-4 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
          <p className="text-muted-foreground text-sm">Computing AI matches from custom preferences...</p>
        </div>
      ) : recs.length === 0 ? (
        <Card className="border border-dashed border-gray-800 bg-gray-950/20 backdrop-blur-md rounded-2xl p-10 text-center">
          <CardContent className="space-y-4 pt-6">
            <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto text-purple-400">
              <Brain className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-white">No active matches found</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              No active events match these custom preference configurations. Try selecting more categories or adjusting keywords.
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/explore">Explore All Events</Link>
            </Button>
          </CardContent>
        </Card>
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
      ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/5"
      : rec.finalScore >= 0.55
      ? "text-indigo-400 border-indigo-500/30 bg-indigo-500/5"
      : "text-amber-400 border-amber-500/30 bg-amber-500/5";

  const ringColor =
    rec.finalScore >= 0.75
      ? "stroke-emerald-400"
      : rec.finalScore >= 0.55
      ? "stroke-indigo-400"
      : "stroke-amber-400";

  const showAIPitch = !!rec.aiMessage;

  return (
    <div className="group border border-gray-800/60 hover:border-purple-500/40 bg-zinc-950/45 backdrop-blur-xl rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/10">
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border ${color}`}>
              #{idx + 1} Best Fit &middot; {percent}% Match
            </span>
            <Badge variant="outline" className="text-xs text-gray-400 border-gray-800 uppercase font-mono">
              {rec.event.category}
            </Badge>
          </div>

          <Link href={`/events/${rec.event.slug}`}>
            <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors mt-2 leading-snug">
              {rec.event.title}
            </h3>
          </Link>

          {/* AI Advisor Engaging One-Sentence Message */}
          {showAIPitch && (
            <div className="relative border-l-2 border-purple-500 bg-purple-950/20 px-4 py-3 rounded-r-xl my-3 text-sm">
              <span className="absolute -top-2.5 left-3 bg-purple-600 text-[10px] text-white px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> AI Advisor
              </span>
              <p className="text-purple-200 italic font-medium leading-relaxed mt-1">
                &quot;{rec.aiMessage}&quot;
              </p>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs text-purple-300 font-medium">
            <Info className="w-3.5 h-3.5" />
            <span>{rec.explanation[0]}</span>
          </div>

          {/* Meta Icons */}
          <div className="grid grid-cols-2 md:flex md:items-center gap-4 text-xs text-muted-foreground pt-2">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span>
                {new Date(rec.event.startDate).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="truncate max-w-[150px]">{rec.event.city}</span>
            </div>
            {rec.registeredFriends.length > 0 && (
              <div className="flex items-center gap-1.5 text-emerald-400">
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
                className="stroke-gray-800"
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
            <span className="text-lg font-extrabold text-white">{percent}%</span>
          </div>
        </div>
      </div>

      <div className="h-[1px] bg-gray-900/60 my-4" />

      <div className="mt-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setOpen(!open)}
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 font-semibold cursor-pointer"
          >
            {open ? "Hide Match Breakdown" : "Reveal Match Breakdown"}
            {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <Button asChild size="sm" className="bg-purple-700/80 hover:bg-purple-600 text-white rounded-lg px-4">
            <Link href={`/events/${rec.event.slug}`}>View Event Details</Link>
          </Button>
        </div>

        {open && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-gray-950/40 p-4 rounded-xl border border-gray-900 text-center mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center justify-center gap-1">
                <Brain className="w-3 h-3 text-purple-400" /> Semantic
              </p>
              <p className="text-sm font-extrabold text-white">{Math.round(rec.scores.semantic * 100)}%</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center justify-center gap-1">
                <Users className="w-3 h-3 text-emerald-400" /> Social
              </p>
              <p className="text-sm font-extrabold text-white">{Math.round(rec.scores.social * 100)}%</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center justify-center gap-1">
                <TrendingUp className="w-3 h-3 text-pink-400" /> Trend
              </p>
              <p className="text-sm font-extrabold text-white">{Math.round(rec.scores.trend * 100)}%</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" /> Urgency
              </p>
              <p className="text-sm font-extrabold text-white">{Math.round(rec.scores.deadline * 100)}%</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center justify-center gap-1">
                <Zap className="w-3 h-3 text-sky-400" /> Freshness
              </p>
              <p className="text-sm font-extrabold text-white">{Math.round(rec.scores.freshness * 100)}%</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

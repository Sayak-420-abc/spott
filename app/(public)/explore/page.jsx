"use client";

import { useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import React, { useRef, useState, useEffect } from "react";
import { useAction } from "convex/react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import Autoplay from "embla-carousel-autoplay";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, Loader2, MapPin, Users, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { createLocationSlug } from "@/lib/location-utils";
import EventCard from "@/components/event-card";
import { CATEGORIES } from "@/lib/data";

const ExplorePage = () => {
  //Fetch current user for location
  const { data: currentUser } = useConvexQuery(api.users.getCurrentUser);
  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));
  const router = useRouter();

  // Recommendations state & fetching
  const getRecs = useAction(api.recommendations.getRecommendations);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  useEffect(() => {
    const fetchRecs = async () => {
      if (!currentUser) return;
      setLoadingRecs(true);
      try {
        const res = await getRecs({ userId: currentUser._id, limit: 4 });
        setRecommendations(res || []);
      } catch (err) {
        console.error("Failed to fetch recommendations:", err);
      } finally {
        setLoadingRecs(false);
      }
    };
    fetchRecs();
  }, [currentUser, getRecs]);

  const { data: featuredEvents, isLoading: loadingFeatured } = useConvexQuery(
    api.explore.getFeaturedEvents,
    {
      limit: 3,
    },
  );

  const { data: localEvents, isLoading: loadingLocal } = useConvexQuery(
    api.explore.getEventsByLocation,
    {
      city: currentUser?.location?.city,
      state: currentUser?.location?.state,
      limit: 4,
    },
  );

  const { data: popularEvents, isLoading: loadingPopular } = useConvexQuery(
    api.explore.getPopularEvents,
    { limit: 6 },
  );

  const { data: categoryCounts } = useConvexQuery(
    api.explore.getCategoryCounts,
  );

  const handleEventClick = (slug) => {
    router.push(`/events/${slug}`);
  };

  const handleViewLocalEvents = () => {
    const city = currentUser?.location?.city || "Gurugram";
    const state = currentUser?.location?.state || "Haryana";
    const slug = createLocationSlug(city, state);
    router.push(`/explore/${slug}`);
  };

  // Format categories with counts
  const categoriesWithCounts = CATEGORIES.map((cat) => ({
    ...cat,
    count: categoryCounts?.[cat.id] || 0,
  }));

  const handleCategoryClick = (categoryId) => {
    router.push(`/explore/${categoryId}`);
  };

  // Loading state
  const isLoading = loadingFeatured || loadingLocal || loadingPopular;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <>
      <div className="pb-12 text-center relative z-10">
        <h1 className="font-[var(--font-display)] font-black text-4xl sm:text-6xl text-[var(--text-primary)] mb-4 tracking-tight uppercase">
          Discover <span className="bg-[var(--color-accent)] px-3 py-1 border-2 border-[var(--border)] inline-block transform rotate-[-1deg] shadow-[3px_3px_0px_0px_var(--shadow-color)]">Events</span>
        </h1>
        <p className="text-sm sm:text-base font-semibold text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
          Explore featured events, find what&apos;s happening locally, or browse popular national meetups — intelligently matched.
        </p>
      </div>

      {/* featured events carousel */}
      {featuredEvents && featuredEvents.length > 0 && (
        <div className="mb-16">
          <Carousel
            className="w-full"
            plugins={[plugin.current]}
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
          >
            <CarouselContent>
              {featuredEvents.map((event) => (
                <CarouselItem key={event._id}>
                  <div
                    onClick={() => handleEventClick(event.slug)}
                    className="relative h-96 border-2 border-[var(--border)] shadow-[6px_6px_0px_0px_var(--shadow-color)] overflow-hidden cursor-pointer"
                  >
                    {event.coverImage ? (
                      <Image
                        src={event.coverImage}
                        alt={event.title}
                        fill
                        className="object-cover"
                        priority
                      />
                    ) : (
                      <div
                        className="absolute inset-0"
                        style={{ backgroundColor: event.themeColor }}
                      ></div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

                    <div className="relative h-full flex flex-col justify-end p-6 md:p-10 z-10">
                      <span className="badge bg-[var(--color-primary)] text-white border-2 border-[var(--border)] shadow-[1.5px_1.5px_0px_0px_var(--shadow-color)] text-[10px] font-black tracking-widest px-2.5 py-0.5 uppercase w-fit mb-3">
                        {event.city}, {event.state || event.country}
                      </span>
                      <h2 className="text-2xl md:text-4xl font-black mb-3 text-white font-[var(--font-display)] tracking-tight leading-tight uppercase">
                        {event.title}
                      </h2>
                      <p className="text-sm md:text-base text-white/90 mb-4 max-w-2xl line-clamp-2 font-medium">
                        {event.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-white/80 font-bold text-xs">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                          <span>{format(event.startDate, "PPP")}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[var(--color-secondary)]" />
                          <span>{event.city}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-[var(--color-success)]" />
                          <span>{event.registrationCount} registered</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        </div>
      )}

      {/* Local Events */}
      {localEvents && localEvents.length > 0 && (
        <div className="mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-black font-[var(--font-display)] text-[var(--text-primary)] uppercase tracking-tight">Events Near You</h2>
              <p className="text-xs text-[var(--text-secondary)] font-semibold mt-0.5">
                Happening in {currentUser?.location?.city || "your area"}
              </p>
            </div>
            <button
              className="font-bold text-xs uppercase px-4 py-2 border-2 border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--color-accent)] transition-all shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer inline-flex items-center gap-1.5 self-start sm:self-auto"
              onClick={handleViewLocalEvents}
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {localEvents.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                variant="grid"
                onClick={() => handleEventClick(event.slug)}
              />
            ))}
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      {currentUser && (loadingRecs || (recommendations && recommendations.length > 0)) && (
        <div className="mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-black font-[var(--font-display)] text-[var(--text-primary)] uppercase tracking-tight flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-[var(--color-primary)] animate-pulse" />
                Recommended for You
              </h2>
              <p className="text-xs text-[var(--text-secondary)] font-semibold mt-0.5">
                AI-personalized matches based on your onboarding profile interests
              </p>
            </div>
            {!loadingRecs && recommendations.length > 0 && (
              <button
                className="font-bold text-xs uppercase px-4 py-2 border-2 border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--color-accent)] transition-all shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer inline-flex items-center gap-1.5 self-start sm:self-auto"
                onClick={() => router.push("/recommendations")}
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {loadingRecs ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--color-primary)]" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendations.map((rec) => (
                <div key={rec.event._id} className="relative group">
                  <EventCard
                    event={rec.event}
                    variant="grid"
                    onClick={() => handleEventClick(rec.event.slug)}
                  />
                  {/* Percentage matching badge overlay */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="badge bg-[var(--color-primary)] text-white font-extrabold gap-1 px-2.5 py-1 text-[10px] shadow-md border-2 border-[var(--border)]">
                      <Sparkles className="w-3 h-3 text-white fill-white" />
                      {Math.round(rec.finalScore * 100)}% Match
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Browse events by category */}
      <div className="mb-16">
        <h2 className="text-2xl font-black font-[var(--font-display)] text-[var(--text-primary)] uppercase tracking-tight mb-6">Browse by Category</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {categoriesWithCounts.map((category) => (
            <div
              key={category.id}
              className="bg-[var(--bg-card)] border-2 border-[var(--border)] p-4 flex items-center gap-3 shadow-[3px_3px_0px_0px_var(--shadow-color)] hover:shadow-[5px_5px_0px_0px_var(--shadow-color)] transition-all hover:translate-y-[-1px] cursor-pointer group"
              onClick={() => handleCategoryClick(category.id)}
            >
              <div className="text-3xl sm:text-4xl">{category.icon}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-extrabold mb-0.5 group-hover:text-[var(--color-primary)] transition-colors text-sm sm:text-base font-[var(--font-display)] text-[var(--text-primary)]">
                  {category.label}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] font-semibold">
                  {category.count} Event{category.count !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popular events across the country */}
      {popularEvents && popularEvents.length > 0 && (
        <div className="mb-16">
          <div className="mb-6">
            <h2 className="text-2xl font-black font-[var(--font-display)] text-[var(--text-primary)] uppercase tracking-tight">Popular Across India</h2>
            <p className="text-xs text-[var(--text-secondary)] font-semibold mt-0.5">Trending events nationwide</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularEvents.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                variant="list"
                onClick={() => handleEventClick(event.slug)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loadingFeatured &&
        !loadingLocal &&
        !loadingPopular &&
        (!featuredEvents || featuredEvents.length === 0) &&
        (!localEvents || localEvents.length === 0) &&
        (!popularEvents || popularEvents.length === 0) && (
          <div className="border-2 border-[var(--border)] bg-[var(--bg-card)] shadow-[6px_6px_0px_0px_var(--shadow-color)] p-12 text-center max-w-xl mx-auto">
            <div className="space-y-4">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-black font-[var(--font-display)] text-[var(--text-primary)] uppercase">No events yet</h2>
              <p className="text-sm font-semibold text-[var(--text-secondary)]">
                Be the first to create an event in your area!
              </p>
              <Link
                href="/create-event"
                className="btn-primary text-xs shadow-[2px_2px_0px_0px_var(--shadow-color)] inline-flex items-center gap-1.5"
                style={{ textDecoration: "none" }}
              >
                Create Event
              </Link>
            </div>
          </div>
        )}
    </>
  );
};

export default ExplorePage;


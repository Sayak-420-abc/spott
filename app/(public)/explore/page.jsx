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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <>
      <div className="pb-12 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">Discover Events</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Explore featured events, find what&apos;s happening locally, or browse
          events across India
        </p>
      </div>

      {/* featured events carousel */}

      {featuredEvents && featuredEvents.length > 0 && (
        <div className="mb-16">
          <Carousel
            className="w-full "
            plugins={[plugin.current]}
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
          >
            <CarouselContent>
              {featuredEvents.map((event) => (
                <CarouselItem key={event._id}>
                  <div
                    onClick={() => handleEventClick(event.slug)}
                    className="relative h-100 rounded-xl overflow-hidden cursor-pointer"
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

                    <div className="absolute inset-0 bg-linear-to-r from-black/60 to-black/30" />

                    <div className="relative h-full flex flex-col justify-end p-8 md:p-12">
                      <Badge className="w-fit mb-4" variant="secondary">
                        {event.city}, {event.state || event.country}
                      </Badge>
                      <h2 className="text-3xl md:text-5xl font-bold mb-3 text-white">
                        {event.title}
                      </h2>
                      <p className="text-lg text-white/90 mb-4 max-w-2xl line-clamp-2">
                        {event.description}
                      </p>
                      <div className="flex items-center gap-4 text-white/80">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">
                            {format(event.startDate, "PPP")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{event.city}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span className="text-sm">
                            {event.registrationCount} registered
                          </span>
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-1">Events Near You</h2>
              <p className="text-muted-foreground">
                Happening in {currentUser?.location?.city || "your area"}
              </p>
            </div>
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleViewLocalEvents}
            >
              View All <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-1 flex items-center gap-2">
                <Sparkles className="w-7 h-7 text-purple-400 animate-pulse animate-duration-3000" />
                Recommended for You
              </h2>
              <p className="text-muted-foreground">
                AI-personalized matches based on your skills and interests
              </p>
            </div>
            {!loadingRecs && recommendations.length > 0 && (
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => router.push("/recommendations")}
              >
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>

          {loadingRecs ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommendations.map((rec) => (
                <div key={rec.event._id} className="relative group">
                  <EventCard
                    event={rec.event}
                    variant="grid"
                    onClick={() => handleEventClick(rec.event.slug)}
                  />
                  {/* Percentage matching badge overlay */}
                  <div className="absolute top-3 left-3 z-10">
                    <Badge className="bg-purple-600 hover:bg-purple-600 text-white font-bold gap-1 px-2.5 py-1 text-xs shadow-md border border-purple-500/30">
                      <Sparkles className="w-3 h-3 text-white fill-white" />
                      {Math.round(rec.finalScore * 100)}% Match
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Browse events by category */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-6">Browse by Category</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {categoriesWithCounts.map((category) => (
            <Card
              key={category.id}
              className="py-2 group cursor-pointer hover:shadow-lg transition-all hover:border-purple-500/50"
              onClick={() => handleCategoryClick(category.id)}
            >
              <CardContent className="px-3 sm:p-6 flex items-center gap-3">
                <div className="text-3xl sm:text-4xl">{category.icon}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold mb-1 group-hover:text-purple-400 transition-colors">
                    {category.label}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {category.count} Event{category.count !== 1 ? "s" : ""}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Popular events across the country */}
      {popularEvents && popularEvents.length > 0 && (
        <div className="mb-16">
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-1">Popular Across India</h2>
            <p className="text-muted-foreground">Trending events nationwide</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

      {/*Empty state */}
      {!loadingFeatured &&
        !loadingLocal &&
        !loadingPopular &&
        (!featuredEvents || featuredEvents.length === 0) &&
        (!localEvents || localEvents.length === 0) &&
        (!popularEvents || popularEvents.length === 0) && (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold">No events yet</h2>
              <p className="text-muted-foreground">
                Be the first to create an event in your area!
              </p>
              <Button asChild className="gap-2">
                <a href="/create-event">Create Event</a>
              </Button>
            </div>
          </Card>
        )}
    </>
  );
};

export default ExplorePage;

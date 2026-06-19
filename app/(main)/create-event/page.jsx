/* eslint-disable react-hooks/incompatible-library */
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { State, City } from "country-state-city";
import { CalendarIcon, Loader2, Sparkles, Image as ImageIcon } from "lucide-react";
import { useConvexMutation, useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";

import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import UnsplashImagePicker from "@/components/unsplash-image-picker";
import AIEventCreator from "./_components/ai-event-creator";
import UpgradeModal from "@/components/upgrade-modal";
import { CATEGORIES } from "@/lib/data";
import Image from "next/image";

// HH:MM in 24h
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const eventSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.string().min(1, "Please select a category"),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date({ required_error: "End date is required" }),
  startTime: z.string().regex(timeRegex, "Start time must be HH:MM"),
  endTime: z.string().regex(timeRegex, "End time must be HH:MM"),
  locationType: z.enum(["physical", "online"]).default("physical"),
  venue: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  ticketType: z.enum(["free", "paid"]).default("free"),
  ticketPrice: z.number().optional(),
  coverImage: z.string().optional(),
  themeColor: z.string().default("#8B5CF6"),
});

export default function CreateEventPage() {
  const router = useRouter();
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState("limit"); // "limit" or "color"

  // Check if user has Pro plan
  const { has } = useAuth();
  const hasPro = has?.({ plan: "pro" });

  const { data: currentUser } = useConvexQuery(api.users.getCurrentUser);
  const { mutate: createEvent, isLoading } = useConvexMutation(
    api.events.createEvent,
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      locationType: "physical",
      ticketType: "free",
      capacity: 50,
      themeColor: "#8B5CF6",
      category: "",
      state: "",
      city: "",
      startTime: "",
      endTime: "",
    },
  });

  const themeColor = watch("themeColor");
  const ticketType = watch("ticketType");
  const selectedState = watch("state");
  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const coverImage = watch("coverImage");

  const indianStates = useMemo(() => State.getStatesOfCountry("IN"), []);
  const cities = useMemo(() => {
    if (!selectedState) return [];
    const st = indianStates.find((s) => s.name === selectedState);
    if (!st) return [];
    return City.getCitiesOfState("IN", st.isoCode);
  }, [selectedState, indianStates]);

  // Color presets
  const colorPresets = [
    "#8B5CF6", // Violet (Always available / New default)
    ...(hasPro ? ["#F472B6", "#FBBF24", "#34D399", "#38BDF8", "#F87171"] : []),
  ];

  const handleColorClick = (color) => {
    if (color !== "#8B5CF6" && !hasPro) {
      setUpgradeReason("color");
      setShowUpgradeModal(true);
      return;
    }
    setValue("themeColor", color);
  };

  const combineDateTime = (date, time) => {
    if (!date || !time) return null;
    const [hh, mm] = time.split(":").map(Number);
    const d = new Date(date);
    d.setHours(hh, mm, 0, 0);
    return d;
  };

  const onSubmit = async (data) => {
    try {
      const start = combineDateTime(data.startDate, data.startTime);
      const end = combineDateTime(data.endDate, data.endTime);

      if (!start || !end) {
        toast.error("Please select both date and time for start and end.");
        return;
      }
      if (end.getTime() <= start.getTime()) {
        toast.error("End date/time must be after start date/time.");
        return;
      }

      // Check event limit for Free users
      if (!hasPro && currentUser?.freeEventsCreated >= 1) {
        setUpgradeReason("limit");
        setShowUpgradeModal(true);
        return;
      }

      // Check if trying to use custom color without Pro
      if (data.themeColor !== "#8B5CF6" && !hasPro) {
        setUpgradeReason("color");
        setShowUpgradeModal(true);
        return;
      }

      await createEvent({
        title: data.title,
        description: data.description,
        category: data.category,
        tags: [data.category],
        startDate: start.getTime(),
        endDate: end.getTime(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        locationType: data.locationType,
        venue: data.venue || undefined,
        address: data.address || undefined,
        city: data.city,
        state: data.state || undefined,
        country: "India",
        capacity: data.capacity,
        ticketType: data.ticketType,
        ticketPrice: data.ticketPrice || undefined,
        coverImage: data.coverImage || undefined,
        themeColor: data.themeColor,
      });

      toast.success("Event created successfully! 🎉");
      router.push("/my-events");
    } catch (error) {
      toast.error(error.message || "Failed to create event");
    }
  };

  const handleAIGenerate = (generatedData) => {
    setValue("title", generatedData.title);
    setValue("description", generatedData.description);
    setValue("category", generatedData.category);
    setValue("capacity", generatedData.suggestedCapacity);
    setValue("ticketType", generatedData.suggestedTicketType);
    toast.success("Event details filled! Customize as needed.");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b-2 border-[var(--border)]">
        <div>
          <h1 className="text-4xl font-black font-[var(--font-display)] uppercase text-[var(--text-primary)]">Create Event</h1>
          {!hasPro && (
            <p className="text-xs font-bold text-[var(--text-secondary)] mt-2 uppercase">
              Free Plan: {currentUser?.freeEventsCreated || 0}/1 events created
            </p>
          )}
        </div>
        <AIEventCreator onEventGenerated={handleAIGenerate} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
        {/* LEFT: Image + Theme */}
        <div className="space-y-6">
          <div
            className="aspect-video lg:aspect-square w-full border-2 border-dashed border-[var(--border)] bg-[var(--bg-card)] flex flex-col items-center justify-center cursor-pointer shadow-[3px_3px_0px_0px_var(--shadow-color)] hover:shadow-[5px_5px_0px_0px_var(--shadow-color)] hover:translate-y-[-1px] transition-all overflow-hidden relative group"
            onClick={() => setShowImagePicker(true)}
          >
            {coverImage ? (
              <>
                <Image
                  src={coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                  width={500}
                  height={500}
                  priority
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs font-black uppercase text-white bg-[var(--border)] border border-white px-3 py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]">Change Image</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 p-4 text-center">
                <ImageIcon className="w-8 h-8 text-[var(--text-secondary)]" />
                <span className="text-xs font-black uppercase text-[var(--text-secondary)]">
                  Add cover image
                </span>
              </div>
            )}
          </div>

          <div className="border-2 border-[var(--border)] bg-[var(--bg-card)] shadow-[3px_3px_0px_0px_var(--shadow-color)] p-4 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase text-[var(--text-secondary)] tracking-wider">Theme Color</label>
              {!hasPro && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-black uppercase border border-[var(--border)] bg-[var(--color-primary)] text-white shadow-[1px_1px_0px_0px_var(--shadow-color)]">
                  <Sparkles className="w-2.5 h-2.5" />
                  Pro
                </span>
              )}
            </div>
            <div className="flex gap-2.5 flex-wrap">
              {colorPresets.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-9 h-9 border-2 border-[var(--border)] transition-all shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer ${
                    !hasPro && color !== "#8B5CF6"
                      ? "opacity-30 cursor-not-allowed"
                      : ""
                  }`}
                  style={{
                    backgroundColor: color,
                    outline: themeColor === color ? "3px solid var(--color-accent)" : "none",
                  }}
                  onClick={() => handleColorClick(color)}
                  title={
                    !hasPro && color !== "#8B5CF6"
                      ? "Upgrade to Pro for custom colors"
                      : ""
                  }
                />
              ))}
              {!hasPro && (
                <button
                  type="button"
                  onClick={() => {
                    setUpgradeReason("color");
                    setShowUpgradeModal(true);
                  }}
                  className="w-9 h-9 border-2 border-dashed border-[var(--border)] bg-[var(--bg-elevated)] flex items-center justify-center hover:bg-[var(--color-accent)] transition-all shadow-[2px_2px_0px_0px_var(--shadow-color)] cursor-pointer"
                  title="Unlock more colors with Pro"
                >
                  <Sparkles className="w-4 h-4 text-[var(--color-primary)]" />
                </button>
              )}
            </div>
            {!hasPro && (
              <p className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase">
                Upgrade to Pro to unlock custom theme colors
              </p>
            )}
          </div>
        </div>

        {/* RIGHT: Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="border-2 border-[var(--border)] bg-[var(--bg-card)] shadow-[4px_4px_0px_0px_var(--shadow-color)] p-6 md:p-8 space-y-6">
          {/* Title */}
          <div>
            <input
              {...register("title")}
              placeholder="Event Name"
              className="text-2xl md:text-3xl font-black bg-[var(--bg-card)] border-2 border-[var(--border)] text-[var(--text-primary)] rounded-none h-14 px-4 shadow-[3px_3px_0px_0px_var(--shadow-color)] focus:shadow-[4px_4px_0px_0px_var(--shadow-color)] focus:border-[var(--color-primary)] outline-none placeholder:text-[var(--text-muted)] font-[var(--font-display)] uppercase w-full"
            />
            {errors.title && (
              <p className="text-xs font-bold text-[var(--color-danger)] mt-2 uppercase">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Start */}
            <div className="space-y-1">
              <label className="text-xs font-black uppercase text-[var(--text-secondary)] tracking-wider">Start Date & Time</label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="w-full flex items-center justify-between bg-[var(--bg-card)] border-2 border-[var(--border)] text-[var(--text-primary)] rounded-none h-11 px-3 shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:bg-[var(--bg-elevated)] transition-all font-bold uppercase text-xs cursor-pointer"
                      >
                        <span>{startDate ? format(startDate, "PPP") : "Pick Date"}</span>
                        <CalendarIcon className="w-4 h-4 text-[var(--text-secondary)]" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="bg-[var(--bg-card)] border-2 border-[var(--border)] text-[var(--text-primary)] rounded-none shadow-[4px_4px_0px_0px_var(--shadow-color)] p-0 z-50">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => setValue("startDate", date)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <input
                  type="time"
                  {...register("startTime")}
                  placeholder="hh:mm"
                  className="bg-[var(--bg-card)] border-2 border-[var(--border)] text-[var(--text-primary)] rounded-none h-11 px-3 shadow-[2px_2px_0px_0px_var(--shadow-color)] focus:border-[var(--color-primary)] outline-none text-xs font-bold w-28 cursor-pointer"
                />
              </div>
              {(errors.startDate || errors.startTime) && (
                <p className="text-xs font-bold text-[var(--color-danger)] mt-1 uppercase">
                  {errors.startDate?.message || errors.startTime?.message}
                </p>
              )}
            </div>

            {/* End */}
            <div className="space-y-1">
              <label className="text-xs font-black uppercase text-[var(--text-secondary)] tracking-wider">End Date & Time</label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="w-full flex items-center justify-between bg-[var(--bg-card)] border-2 border-[var(--border)] text-[var(--text-primary)] rounded-none h-11 px-3 shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:bg-[var(--bg-elevated)] transition-all font-bold uppercase text-xs cursor-pointer"
                      >
                        <span>{endDate ? format(endDate, "PPP") : "Pick Date"}</span>
                        <CalendarIcon className="w-4 h-4 text-[var(--text-secondary)]" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="bg-[var(--bg-card)] border-2 border-[var(--border)] text-[var(--text-primary)] rounded-none shadow-[4px_4px_0px_0px_var(--shadow-color)] p-0 z-50">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => setValue("endDate", date)}
                        disabled={(date) => date < (startDate || new Date())}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <input
                  type="time"
                  {...register("endTime")}
                  placeholder="hh:mm"
                  className="bg-[var(--bg-card)] border-2 border-[var(--border)] text-[var(--text-primary)] rounded-none h-11 px-3 shadow-[2px_2px_0px_0px_var(--shadow-color)] focus:border-[var(--color-primary)] outline-none text-xs font-bold w-28 cursor-pointer"
                />
              </div>
              {(errors.endDate || errors.endTime) && (
                <p className="text-xs font-bold text-[var(--color-danger)] mt-1 uppercase">
                  {errors.endDate?.message || errors.endTime?.message}
                </p>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-xs font-black uppercase text-[var(--text-secondary)] tracking-wider">Category</label>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full bg-[var(--bg-card)] border-2 border-[var(--border)] text-[var(--text-primary)] rounded-none h-11 shadow-[2px_2px_0px_0px_var(--shadow-color)] focus:shadow-[3px_3px_0px_0px_var(--shadow-color)] focus:ring-0 focus:ring-offset-0 font-bold uppercase text-xs">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--bg-card)] border-2 border-[var(--border)] text-[var(--text-primary)] rounded-none shadow-[4px_4px_0px_0px_var(--shadow-color)] z-50">
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id} className="hover:bg-[var(--bg-elevated)] cursor-pointer focus:bg-[var(--bg-elevated)] focus:text-[var(--text-primary)] font-bold text-xs uppercase rounded-none">
                        {cat.icon} {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category && (
              <p className="text-xs font-bold text-[var(--color-danger)] mt-1 uppercase">{errors.category.message}</p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase text-[var(--text-secondary)] tracking-wider">Location & Region</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                control={control}
                name="state"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      field.onChange(val);
                      setValue("city", "");
                    }}
                  >
                    <SelectTrigger className="w-full bg-[var(--bg-card)] border-2 border-[var(--border)] text-[var(--text-primary)] rounded-none h-11 shadow-[2px_2px_0px_0px_var(--shadow-color)] focus:shadow-[3px_3px_0px_0px_var(--shadow-color)] focus:ring-0 focus:ring-offset-0 font-bold uppercase text-xs">
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent className="bg-[var(--bg-card)] border-2 border-[var(--border)] text-[var(--text-primary)] rounded-none shadow-[4px_4px_0px_0px_var(--shadow-color)] z-50">
                      {indianStates.map((s) => (
                        <SelectItem key={s.isoCode} value={s.name} className="hover:bg-[var(--bg-elevated)] cursor-pointer focus:bg-[var(--bg-elevated)] focus:text-[var(--text-primary)] font-bold text-xs uppercase rounded-none">
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />

              <Controller
                control={control}
                name="city"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!selectedState}
                  >
                    <SelectTrigger className="w-full bg-[var(--bg-card)] border-2 border-[var(--border)] text-[var(--text-primary)] rounded-none h-11 shadow-[2px_2px_0px_0px_var(--shadow-color)] focus:shadow-[3px_3px_0px_0px_var(--shadow-color)] focus:ring-0 focus:ring-offset-0 font-bold uppercase text-xs disabled:opacity-50 disabled:cursor-not-allowed">
                      <SelectValue
                        placeholder={
                          selectedState ? "Select City" : "Select State First"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-[var(--bg-card)] border-2 border-[var(--border)] text-[var(--text-primary)] rounded-none shadow-[4px_4px_0px_0px_var(--shadow-color)] z-50">
                      {cities.map((c) => (
                        <SelectItem key={c.name} value={c.name} className="hover:bg-[var(--bg-elevated)] cursor-pointer focus:bg-[var(--bg-elevated)] focus:text-[var(--text-primary)] font-bold text-xs uppercase rounded-none">
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-3 mt-4">
              <label className="text-xs font-black uppercase text-[var(--text-secondary)] tracking-wider">Venue Details</label>

              <input
                {...register("venue")}
                placeholder="Google Maps URL"
                type="url"
                className="bg-[var(--bg-card)] border-2 border-[var(--border)] text-[var(--text-primary)] rounded-none h-11 px-3 shadow-[2px_2px_0px_0px_var(--shadow-color)] focus:shadow-[3px_3px_0px_0px_var(--shadow-color)] focus:border-[var(--color-primary)] outline-none text-xs font-bold w-full"
              />
              {errors.venue && (
                <p className="text-xs font-bold text-[var(--color-danger)] mt-1 uppercase">{errors.venue.message}</p>
              )}

              <input
                {...register("address")}
                placeholder="Full address / building details (optional)"
                className="bg-[var(--bg-card)] border-2 border-[var(--border)] text-[var(--text-primary)] rounded-none h-11 px-3 shadow-[2px_2px_0px_0px_var(--shadow-color)] focus:shadow-[3px_3px_0px_0px_var(--shadow-color)] focus:border-[var(--color-primary)] outline-none text-xs font-bold w-full"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-black uppercase text-[var(--text-secondary)] tracking-wider">Description</label>
            <textarea
              {...register("description")}
              placeholder="Tell people about your event..."
              rows={5}
              className="bg-[var(--bg-card)] border-2 border-[var(--border)] text-[var(--text-primary)] rounded-none shadow-[3px_3px_0px_0px_var(--shadow-color)] focus:shadow-[4px_4px_0px_0px_var(--shadow-color)] focus:border-[var(--color-primary)] outline-none placeholder:text-[var(--text-muted)] p-3 text-sm font-semibold w-full resize-none"
            />
            {errors.description && (
              <p className="text-xs font-bold text-[var(--color-danger)] mt-1 uppercase">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Ticketing */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase text-[var(--text-secondary)] tracking-wider">Ticketing Options</label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 font-black uppercase text-xs text-[var(--text-primary)] cursor-pointer">
                <input
                  type="radio"
                  value="free"
                  {...register("ticketType")}
                  defaultChecked
                  className="w-4.5 h-4.5 accent-[var(--color-primary)] cursor-pointer"
                />{" "}
                Free Admission
              </label>
              <label className="flex items-center gap-2 font-black uppercase text-xs text-[var(--text-primary)] cursor-pointer">
                <input 
                  type="radio" 
                  value="paid" 
                  {...register("ticketType")} 
                  className="w-4.5 h-4.5 accent-[var(--color-primary)] cursor-pointer"
                />{" "}
                Paid Ticket
              </label>
            </div>

            {ticketType === "paid" && (
              <div className="max-w-xs animate-fade-in">
                <input
                  type="number"
                  placeholder="Ticket Price (₹)"
                  {...register("ticketPrice", { valueAsNumber: true })}
                  className="bg-[var(--bg-card)] border-2 border-[var(--border)] text-[var(--text-primary)] rounded-none h-11 px-3 shadow-[2px_2px_0px_0px_var(--shadow-color)] focus:shadow-[3px_3px_0px_0px_var(--shadow-color)] focus:border-[var(--color-primary)] outline-none text-xs font-bold w-full"
                />
              </div>
            )}
          </div>

          {/* Capacity */}
          <div className="space-y-1">
            <label className="text-xs font-black uppercase text-[var(--text-secondary)] tracking-wider">Venue Capacity</label>
            <input
              type="number"
              {...register("capacity", { valueAsNumber: true })}
              placeholder="Ex: 100"
              className="bg-[var(--bg-card)] border-2 border-[var(--border)] text-[var(--text-primary)] rounded-none h-11 px-3 shadow-[2px_2px_0px_0px_var(--shadow-color)] focus:shadow-[3px_3px_0px_0px_var(--shadow-color)] focus:border-[var(--color-primary)] outline-none text-xs font-bold w-full"
            />
            {errors.capacity && (
              <p className="text-xs font-bold text-[var(--color-danger)] mt-1 uppercase">{errors.capacity.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 text-sm font-black uppercase border-2 border-[var(--border)] bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-all cursor-pointer shadow-[3px_3px_0px_0px_var(--shadow-color)] hover:translate-y-[-1px] active:translate-y-[1px] flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Creating Event...
              </>
            ) : (
              "Create Event"
            )}
          </button>
        </form>
      </div>

      {/* Unsplash Picker */}
      {showImagePicker && (
        <UnsplashImagePicker
          isOpen={showImagePicker}
          onClose={() => setShowImagePicker(false)}
          onSelect={(url) => {
            setValue("coverImage", url);
            setShowImagePicker(false);
          }}
        />
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        trigger={upgradeReason}
      />
    </div>
  );
}

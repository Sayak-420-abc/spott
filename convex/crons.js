import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Check for approaching events and create notifications every hour
crons.interval(
  "check approaching events",
  { hours: 1 },
  internal.notifications.checkAndCreateNotifications
);

export default crons;

import { api } from "@/convex/_generated/api";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { format } from "date-fns";
import { CheckCircle, Circle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function AttendeeCard({ registration }) {
  const { mutate: checkInAttendee, isLoading } = useConvexMutation(
    api.registrations.checkInAttendee,
  );

  const handleManualCheckIn = async () => {
    try {
      const result = await checkInAttendee({ qrCode: registration.qrCode });
      if (result.success) {
        toast.success("Attendee checked in successfully");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(error.message || "Failed to check in attendee");
    }
  };

  return (
    <div className="border-2 border-[var(--border)] bg-[var(--bg-card)] shadow-[3px_3px_0px_0px_var(--shadow-color)] p-4 flex items-start gap-4 transition-all">
      <div
        className={`mt-0.5 p-2 border-2 border-[var(--border)] shadow-[1px_1px_0px_0px_var(--shadow-color)] ${
          registration.checkedIn ? "bg-[var(--color-success)]" : "bg-[var(--bg-elevated)]"
        }`}
      >
        {registration.checkedIn ? (
          <CheckCircle className="w-5 h-5 text-[var(--text-primary)]" />
        ) : (
          <Circle className="w-5 h-5 text-[var(--text-secondary)]" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-extrabold text-sm uppercase text-[var(--text-primary)] mb-0.5">{registration.attendeeName}</h3>
        <p className="text-xs font-semibold text-[var(--text-secondary)] mb-2">
          {registration.attendeeEmail}
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] font-bold text-[var(--text-secondary)] uppercase">
          <span className="flex items-center gap-1 bg-[var(--bg-elevated)] px-1.5 py-0.5 border border-[var(--border)] shadow-[1px_1px_0px_0px_var(--shadow-color)]">
            {registration.checkedIn ? "⏰ Checked in" : "📅 Registered"}{" "}
            {registration.checkedIn && registration.checkedInAt
              ? format(registration.checkedInAt, "PPp")
              : format(registration.registeredAt, "PPp")}
          </span>
          <span className="font-mono bg-[var(--bg-elevated)] px-1.5 py-0.5 border border-[var(--border)] shadow-[1px_1px_0px_0px_var(--shadow-color)]">QR: {registration.qrCode}</span>
        </div>
      </div>

      {!registration.checkedIn && (
        <button
          onClick={handleManualCheckIn}
          disabled={isLoading}
          className="font-bold text-xs uppercase px-3 py-1.5 border-2 border-[var(--border)] bg-[var(--color-success)] hover:bg-[var(--color-success)] text-[var(--text-primary)] transition-all shadow-[1.5px_1.5px_0px_0px_var(--shadow-color)] hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer inline-flex items-center gap-1.5 self-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Check In
            </>
          )}
        </button>
      )}
    </div>
  );
}

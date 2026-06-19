"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function AIEventCreator({ onEventGenerated }) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const generateEvent = async () => {
    if (!prompt.trim()) {
      toast.error("Please describe your event");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/generate-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      onEventGenerated(data);
      toast.success("Event details generated! Review and customize below.");
      setIsOpen(false);
      setPrompt("");
    } catch (error) {
      toast.error("Failed to generate event. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="font-bold text-xs uppercase px-4 py-2.5 border-2 border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--color-accent)] hover:text-[var(--text-primary)] transition-all shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer inline-flex items-center gap-1.5 self-start md:self-auto">
          <Sparkles className="w-4 h-4 text-[var(--color-primary)]" />
          Generate with AI
        </button>
      </DialogTrigger>
      <DialogContent className="bg-[var(--bg-card)] border-2 border-[var(--border)] text-[var(--text-primary)] rounded-none shadow-[6px_6px_0px_0px_var(--shadow-color)] max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-black uppercase text-lg text-[var(--text-primary)]">
            <Sparkles className="w-5 h-5 text-[var(--color-primary)]" />
            AI Event Creator
          </DialogTitle>
          <DialogDescription className="text-xs font-bold text-[var(--text-secondary)] mt-1 uppercase">
            Describe your event idea and let AI create the details for you
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: A tech meetup about React 19 for developers in Bangalore. It should cover new features like Actions and use hook improvements..."
            rows={6}
            className="resize-none bg-[var(--bg-card)] border-2 border-[var(--border)] text-[var(--text-primary)] rounded-none shadow-[2px_2px_0px_0px_var(--shadow-color)] focus:shadow-[3px_3px_0px_0px_var(--shadow-color)] focus-visible:ring-0 focus-visible:border-[var(--color-primary)] placeholder:text-[var(--text-muted)] p-3 text-sm font-semibold"
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 py-2.5 text-xs font-black uppercase border-2 border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all cursor-pointer shadow-[2px_2px_0px_0px_var(--shadow-color)]"
            >
              Cancel
            </button>
            <button
              onClick={generateEvent}
              disabled={loading || !prompt.trim()}
              className="flex-1 py-2.5 text-xs font-black uppercase border-2 border-[var(--border)] bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-all cursor-pointer shadow-[2px_2px_0px_0px_var(--shadow-color)] flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate
                </>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

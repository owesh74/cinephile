"use client";

import { useState, useTransition } from "react";

import {
  toggleWatchlistAction,
  toggleWatchedAction,
} from "@/lib/actions/tracking";

import { Button } from "@/components/ui/button";

export function TrackingButtons({
  movieId,
  initialOnWatchlist,
  initialWatched,
}: {
  movieId: string;
  initialOnWatchlist: boolean;
  initialWatched: boolean;
}) {
  const [onWatchlist, setOnWatchlist] = useState(initialOnWatchlist);
  const [isWatched, setIsWatched] = useState(initialWatched);
  const [pending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<
    "watchlist" | "watched" | null
  >(null);

  function handleWatchlist() {
    const previousWatchlist = onWatchlist;
    const previousWatched = isWatched;
    const next = !previousWatchlist;

    setPendingAction("watchlist");

    // Adding to watchlist removes Watched.
    setOnWatchlist(next);

    if (next) {
      setIsWatched(false);
    }

    startTransition(async () => {
      try {
        await toggleWatchlistAction(movieId, previousWatchlist);
      } catch (error) {
        setOnWatchlist(previousWatchlist);
        setIsWatched(previousWatched);

        console.error("Failed to update watchlist:", error);
      } finally {
        setPendingAction(null);
      }
    });
  }

  function handleWatched() {
    const previousWatched = isWatched;
    const previousWatchlist = onWatchlist;
    const next = !previousWatched;

    setPendingAction("watched");

    // Marking as watched removes Watchlist.
    setIsWatched(next);

    if (next) {
      setOnWatchlist(false);
    }

    startTransition(async () => {
      try {
        await toggleWatchedAction(movieId, previousWatched);
      } catch (error) {
        setIsWatched(previousWatched);
        setOnWatchlist(previousWatchlist);

        console.error("Failed to update watched status:", error);
      } finally {
        setPendingAction(null);
      }
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={onWatchlist ? "default" : "outline"}
        size="sm"
        onClick={handleWatchlist}
        disabled={pending}
        className={
          onWatchlist
            ? "bg-secondary text-secondary-foreground"
            : undefined
        }
      >
        {pendingAction === "watchlist"
          ? "Updating..."
          : onWatchlist
            ? "On Watchlist"
            : "Add to Watchlist"}
      </Button>

      <Button
        variant={isWatched ? "default" : "outline"}
        size="sm"
        onClick={handleWatched}
        disabled={pending}
        className={
          isWatched
            ? "bg-secondary text-secondary-foreground"
            : undefined
        }
      >
        {pendingAction === "watched"
          ? "Updating..."
          : isWatched
            ? "Watched"
            : "Mark as Watched"}
      </Button>
    </div>
  );
}
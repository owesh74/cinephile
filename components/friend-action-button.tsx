"use client";

import { useState, useTransition } from "react";

import {
    sendFriendRequestAction,
    acceptFriendRequestAction,
    rejectFriendRequestAction,
    removeFriendAction,
} from "@/lib/actions/friends";

import { Button } from "@/components/ui/button";

import type { FriendshipStatus } from "@/lib/data/friends";

type ActionResult =
    | {
          success: boolean;
          error?: string;
      }
    | {
          error: string;
          success?: boolean;
      };

export function FriendActionButton({
    targetUserId,
    initialStatus,
}: {
    targetUserId: string;
    initialStatus: FriendshipStatus;
}) {
    const [status, setStatus] =
        useState<FriendshipStatus>(initialStatus);

    const [error, setError] = useState<string | null>(
        null
    );

    const [pending, startTransition] = useTransition();

    function handleSend() {
        setError(null);
        setStatus("pending_outgoing");

        startTransition(async () => {
            const result =
                (await sendFriendRequestAction(
                    targetUserId
                )) as ActionResult;

            if (result.error) {
                setStatus(initialStatus);
                setError(result.error);
            }
        });
    }

    function handleAccept() {
        setError(null);
        setStatus("friends");

        startTransition(async () => {
            const result =
                (await acceptFriendRequestAction(
                    targetUserId
                )) as ActionResult;

            if (result.error) {
                setStatus(initialStatus);
                setError(result.error);
            }
        });
    }

    function handleReject() {
        setError(null);
        setStatus("none");

        startTransition(async () => {
            const result =
                (await rejectFriendRequestAction(
                    targetUserId
                )) as ActionResult;

            if (result.error) {
                setStatus(initialStatus);
                setError(result.error);
            }
        });
    }

    function handleRemove() {
        setError(null);

        startTransition(async () => {
            const result =
                (await removeFriendAction(
                    targetUserId
                )) as ActionResult;

            if (result.error) {
                setError(result.error);
                return;
            }

            setStatus("none");
        });
    }

    return (
        <div className="space-y-2">
            {status === "friends" && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemove}
                    disabled={pending}
                >
                    {pending
                        ? "Removing..."
                        : "Friends — Remove"}
                </Button>
            )}

            {status === "pending_outgoing" && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemove}
                    disabled={pending}
                >
                    {pending
                        ? "Processing..."
                        : "Request sent — Cancel"}
                </Button>
            )}

            {status === "pending_incoming" && (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        onClick={handleAccept}
                        disabled={pending}
                    >
                        {pending ? "Working..." : "Accept"}
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReject}
                        disabled={pending}
                    >
                        Reject
                    </Button>
                </div>
            )}

            {status === "none" && (
                <Button
                    size="sm"
                    onClick={handleSend}
                    disabled={pending}
                >
                    {pending
                        ? "Sending..."
                        : "Add Friend"}
                </Button>
            )}

            {error && (
                <p className="text-xs text-red-500">
                    {error}
                </p>
            )}
        </div>
    );
}
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

export function FriendActionButton({
  targetUserId,
  initialStatus,
}: {
  targetUserId: string;
  initialStatus: FriendshipStatus;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [pending, startTransition] = useTransition();

  function handleSend() {
    setStatus("pending_outgoing");
    startTransition(() => sendFriendRequestAction(targetUserId));
  }

  function handleAccept() {
    setStatus("friends");
    startTransition(() => acceptFriendRequestAction(targetUserId));
  }

  function handleReject() {
    setStatus("none");
    startTransition(() => rejectFriendRequestAction(targetUserId));
  }

  function handleRemove() {
    setStatus("none");
    startTransition(() => removeFriendAction(targetUserId));
  }

  if (status === "friends") {
    return (
      <Button variant="outline" size="sm" onClick={handleRemove} disabled={pending}>
        Friends — Remove
      </Button>
    );
  }

  if (status === "pending_outgoing") {
    return (
      <Button variant="outline" size="sm" onClick={handleRemove} disabled={pending}>
        Request sent — Cancel
      </Button>
    );
  }

  if (status === "pending_incoming") {
    return (
      <div className="flex gap-2">
        <Button size="sm" onClick={handleAccept} disabled={pending}>
          Accept
        </Button>
        <Button variant="outline" size="sm" onClick={handleReject} disabled={pending}>
          Reject
        </Button>
      </div>
    );
  }

  return (
    <Button size="sm" onClick={handleSend} disabled={pending}>
      Add Friend
    </Button>
  );
}
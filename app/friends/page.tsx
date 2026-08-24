import { requireUser } from "@/lib/auth/require-user";

import {
  getFriendsList,
  getIncomingRequests,
  getOutgoingRequests,
} from "@/lib/data/friends";

import { FriendActionButton } from "@/components/friend-action-button";

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";

import Link from "next/link";

export default async function FriendsPage() {
  const user = await requireUser();

  const [friends, incoming, outgoing] = await Promise.all([
    getFriendsList(user.id),
    getIncomingRequests(user.id),
    getOutgoingRequests(user.id),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-10 py-12">
      <h1 className="text-2xl font-semibold">Friends</h1>

      {incoming.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-medium">
            Incoming Requests
          </h2>

          {incoming.map((person) => (
            <div
              key={person.id}
              className="flex items-center justify-between rounded-md border p-3"
            >
              <Link
                href={`/user/${person.username}`}
                className="flex items-center gap-3"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={person.avatarUrl ?? undefined}
                  />
                  <AvatarFallback>
                    {person.username[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <span className="text-sm font-medium">
                  {person.username}
                </span>
              </Link>

              <FriendActionButton
                targetUserId={person.id}
                initialStatus="pending_incoming"
              />
            </div>
          ))}
        </section>
      ) : (
        <section className="space-y-3">
          <h2 className="text-lg font-medium">
            Incoming Requests
          </h2>

          <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No incoming friend requests yet.
          </div>
        </section>
      )}

      {outgoing.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-medium">
            Outgoing Requests
          </h2>

          {outgoing.map((person) => (
            <div
              key={person.id}
              className="flex items-center justify-between rounded-md border p-3"
            >
              <Link
                href={`/user/${person.username}`}
                className="flex items-center gap-3"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={person.avatarUrl ?? undefined}
                  />
                  <AvatarFallback>
                    {person.username[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <span className="text-sm font-medium">
                  {person.username}
                </span>
              </Link>

              <FriendActionButton
                targetUserId={person.id}
                initialStatus="pending_outgoing"
              />
            </div>
          ))}
        </section>
      ) : (
        <section className="space-y-3">
          <h2 className="text-lg font-medium">
            Outgoing Requests
          </h2>

          <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No outgoing friend requests yet.
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Your Friends</h2>

        {friends.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No friends yet — visit someone's profile to send a request.
          </div>
        ) : (
          friends.map((person) => (
            <div
              key={person.id}
              className="flex items-center justify-between rounded-md border p-3"
            >
              <Link
                href={`/user/${person.username}`}
                className="flex items-center gap-3"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={person.avatarUrl ?? undefined}
                  />
                  <AvatarFallback>
                    {person.username[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <span className="text-sm font-medium">
                  {person.username}
                </span>
              </Link>

              <FriendActionButton
                targetUserId={person.id}
                initialStatus="friends"
              />
            </div>
          ))
        )}
      </section>
    </div>
  );
}
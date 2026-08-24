import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import {
    Avatar,
    AvatarImage,
    AvatarFallback,
} from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/server";
import { getFriendshipStatus } from "@/lib/data/friends";
import { FriendActionButton } from "@/components/friend-action-button";
import { FriendComparison } from "@/components/friend-comparison";
import { ScoreBadge } from "@/components/score-badge";

export default async function PublicProfilePage({
    params,
}: {
    params: Promise<{ username: string }>;
}) {
    const { username } = await params;

    const profile = await db.query.users.findFirst({
        where: eq(users.username, username),
    });

    if (!profile) {
        notFound();
    }

    const supabase = await createClient();

    const {
        data: { user: currentUser },
    } = await supabase.auth.getUser();

    const isOwnProfile = currentUser?.id === profile.id;

    const friendshipStatus =
        currentUser && !isOwnProfile
            ? await getFriendshipStatus(
                  currentUser.id,
                  profile.id
              )
            : null;

    return (
        <div className="mx-auto max-w-lg space-y-6 py-16">
            <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                    <AvatarImage
                        src={profile.avatarUrl ?? undefined}
                    />

                    <AvatarFallback>
                        {profile.username[0]?.toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                <div>
                    <h1 className="text-2xl font-semibold">
                        {profile.username}
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        Joined{" "}
                        {profile.createdAt.toLocaleDateString()}
                    </p>
                </div>
            <ScoreBadge userId={profile.id} />

            </div>


            {friendshipStatus && (
                <FriendActionButton
                    targetUserId={profile.id}
                    initialStatus={friendshipStatus}
                />
            )}

            {profile.bio && (
                <p className="text-sm">{profile.bio}</p>
            )}

            {/* Compare movie history with a friend */}
            {friendshipStatus === "friends" && currentUser && (
                <FriendComparison
                    userId={currentUser.id}
                    friendId={profile.id}
                    friendUsername={profile.username}
                />
            )}
        </div>
    );
}
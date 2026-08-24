import { requireUser } from "@/lib/auth/require-user";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ProfileForm } from "@/components/profile-form";
import { AvatarUploader } from "@/components/avatar-uploader";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { ScoreBadge } from "@/components/score-badge";
import { StatsDashboard } from "@/components/stats-dashboard";
import { AchievementsGrid } from "@/components/achievements-grid";
import { getUserCreatedLists } from "@/lib/data/user-lists";
import Link from "next/link";

export default async function ProfilePage() {
  const user = await requireUser();

  const profile = await db.query.users.findFirst({
    where: eq(users.id, user.id),
  });

  if (!profile) {
    return <div className="p-6">Profile not found.</div>;
  }

  const ownedLists = await getUserCreatedLists(user.id);

  return (
    <div className="mx-auto max-w-lg space-y-8 py-16">
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
            {profile.email}
          </p>
        </div>
      </div>

      <ScoreBadge userId={profile.id} />

      <AvatarUploader />

      <ProfileForm
        defaultUsername={profile.username}
        defaultBio={profile.bio ?? ""}
      />

      <div className="border-t pt-8">
        <h2 className="mb-4 text-lg font-medium">
          Your Cinema Journey
        </h2>
        <StatsDashboard userId={profile.id} />
      </div>

      <div className="border-t pt-8">
        <h2 className="mb-4 text-lg font-medium">
          Achievements
        </h2>
        <AchievementsGrid userId={profile.id} />
      </div>

      <div className="border-t pt-8">
        <h2 className="mb-4 text-lg font-medium">
          Your Lists
        </h2>

        {ownedLists.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You haven't created any lists yet.{" "}
            <Link
              href="/lists/create"
              className="underline"
            >
              Create one
            </Link>
            .
          </p>
        ) : (
          <div className="space-y-2">
            {ownedLists.map((list) => (
              <Link
                key={list.id}
                href={`/lists/${list.id}`}
                className="block rounded-md border p-3 text-sm hover:bg-muted"
              >
                {list.title}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
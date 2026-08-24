import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logoutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Link from "next/link";
import { SearchBox } from "@/components/search-box";

export async function NavBar() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let username: string | null = null;

  if (user) {
    const profile = await db.query.users.findFirst({
      where: eq(users.id, user.id),
    });

    username = profile?.username ?? null;
  }

  return (
    <nav className="border-b border-border bg-card/80 px-6 py-4 backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        {/* Logo + Search */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="font-display text-xl tracking-tight text-primary"
          >
            Cinephile
          </Link>

          <SearchBox />
        </div>

        {/* Desktop navigation */}
        {username && (
          <div className="hidden items-center gap-4 sm:flex">
            <Link
              href="/watchlist"
              className="text-sm"
            >
              Watchlist
            </Link>

            <Link
              href="/watched"
              className="text-sm"
            >
              Watched
            </Link>

            <Link
              href="/ratings"
              className="text-sm"
            >
              Ratings
            </Link>

            <Link
              href="/lists"
              className="text-sm"
            >
              Lists
            </Link>

            <Link
              href="/discover"
              className="text-sm"
            >
              Discover
            </Link>

            <Link
              href="/friends"
              className="text-sm"
            >
              Friends
            </Link>

            <Link
              href="/activity"
              className="text-sm"
            >
              Activity
            </Link>
          </div>
        )}

        {/* Mobile navigation */}
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger
              className="sm:hidden inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>

            <SheetContent side="right" className="bg-card">
              <nav className="mt-8 flex flex-col gap-4 text-sm">
                <Link href="/discover">Discover</Link>
                <Link href="/lists">Lists</Link>

                {username && (
                  <>
                    <Link href="/watchlist">Watchlist</Link>
                    <Link href="/watched">Watched</Link>
                    <Link href="/ratings">Ratings</Link>
                    <Link href="/friends">Friends</Link>
                    <Link href="/activity">Activity</Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Auth state */}
          <div className="flex items-center gap-4">
            {username ? (
              <>
                <span className="hidden text-sm text-muted-foreground sm:inline">
                  Logged in as {username}
                </span>

                <form action={logoutAction}>
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                  >
                    Logout
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>

                <Link href="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
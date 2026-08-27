import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logoutAction } from "@/lib/actions/auth";

import { Button } from "@/components/ui/button";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";

import Link from "next/link";
import { SearchBox } from "@/components/search-box";
import { NavLink } from "@/components/nav-link";
import { MobileNav } from "@/components/mobile-nav";
import { Plus } from "lucide-react";

export async function NavBar() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    let profile: {
        username: string;
        avatarUrl: string | null;
    } | null = null;

    if (user) {
        const result = await db.query.users.findFirst({
            where: eq(users.id, user.id),
        });

        if (result) {
            profile = {
                username: result.username,
                avatarUrl: result.avatarUrl,
            };
        }
    }

    return (
        <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-2 px-4 sm:gap-4 sm:px-6">
                {/* LOGO */}

                <Link
                    href="/"
                    className="shrink-0 font-display text-xl font-semibold tracking-tight text-foreground transition-opacity hover:opacity-80"
                >
                    <span className="text-primary">Onyx</span>
                </Link>

                {/* DESKTOP SEARCH */}

                <div className="hidden min-w-0 flex-1 sm:block sm:max-w-xs lg:max-w-sm">
                    <SearchBox />
                </div>

                {/* DESKTOP NAV */}

                {profile && (
                    <div className="hidden items-center gap-1 rounded-full border border-border bg-card/60 p-1 lg:flex">
                        <NavLink href="/discover">
                            Discover
                        </NavLink>

                        <NavLink href="/people/browse">
                            People
                        </NavLink>

                        <NavLink href="/lists">
                            Lists
                        </NavLink>

                        <NavLink href="/friends">
                            Friends
                        </NavLink>
                    </div>
                )}

                {/* RIGHT SIDE */}

                <div className="ml-auto flex items-center gap-2">
                    {/* ADD MOVIE */}

                    {profile && (
                        <Link
                            href="/add"
                            className="hidden items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20 sm:flex"
                        >
                            <Plus className="h-4 w-4" />

                            <span className="hidden xl:inline">
                                Add Movie
                            </span>
                        </Link>
                    )}

                    {/* MOBILE MENU */}

                    <MobileNav
                        loggedIn={!!profile}
                        username={profile?.username}
                        avatarUrl={profile?.avatarUrl}
                    />

                    {/* DESKTOP ACCOUNT */}

                    {profile ? (
                        <div className="hidden items-center gap-3 lg:flex">
                            <NavLink
                                href="/profile"
                                exact
                                className="flex items-center gap-2 !px-2 !py-1.5"
                            >
                                <Avatar className="h-8 w-8 ring-2 ring-transparent transition-all hover:ring-primary/50">
                                    <AvatarImage
                                        src={
                                            profile.avatarUrl ??
                                            undefined
                                        }
                                        alt={profile.username}
                                    />

                                    <AvatarFallback className="bg-primary/15 font-semibold text-primary">
                                        {profile.username
                                            .charAt(0)
                                            .toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>

                                <span className="max-w-[120px] truncate text-sm font-medium">
                                    {profile.username}
                                </span>
                            </NavLink>

                            <form action={logoutAction}>
                                <Button
                                    type="submit"
                                    variant="outline"
                                    size="sm"
                                >
                                    Logout
                                </Button>
                            </form>
                        </div>
                    ) : (
                        <div className="hidden items-center gap-2 sm:flex">
                            <Link href="/login">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                >
                                    Log in
                                </Button>
                            </Link>

                            <Link href="/register">
                                <Button size="sm" className="font-semibold">
                                    Register
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
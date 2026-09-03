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
import Image from "next/image";

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
        <nav className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
            <div className="mx-auto flex h-[72px] max-w-[1600px] items-center gap-4 px-4 sm:px-6 lg:gap-7">

                {/* ================================================== */}
                {/* LOGO */}
                {/* ================================================== */}

                <Link
                    href="/"
                    aria-label="Popcorn home"
                    className="group flex shrink-0 items-center"
                >
                    <Image
                        src="/popcorn-logo.png"
                        alt="Popcorn"
                        width={220}
                        height={80}
                        priority
                        className="
                            h-auto
                            w-[125px]
                            object-contain
                            transition-transform
                            duration-200
                            group-hover:scale-[1.02]
                            sm:w-[145px]
                        "
                    />
                </Link>

                {/* ================================================== */}
                {/* DESKTOP SEARCH */}
                {/* ================================================== */}

                <div className="hidden min-w-0 flex-1 sm:block sm:max-w-[300px] lg:max-w-[380px] xl:max-w-[430px]">
                    <div className="relative">
                        <SearchBox />
                    </div>
                </div>

                {/* ================================================== */}
                {/* DESKTOP NAVIGATION */}
                {/* ================================================== */}

                {profile && (
                    <div className="hidden items-center gap-1 lg:flex">

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

                {/* ================================================== */}
                {/* RIGHT SIDE */}
                {/* ================================================== */}

                <div className="ml-auto flex items-center gap-2 sm:gap-3">

                    {/* ADD MOVIE */}

                    {profile && (
                        <Link
                            href="/add"
                            className="
                                hidden
                                items-center
                                gap-2
                                rounded-lg
                                border
                                border-primary/50
                                bg-primary/10
                                px-3.5
                                py-2
                                text-sm
                                font-semibold
                                text-primary
                                transition-all
                                duration-200
                                hover:bg-primary
                                hover:text-primary-foreground
                                sm:flex
                            "
                        >
                            <Plus className="h-4 w-4" />

                            <span className="hidden xl:inline">
                                Add Movie
                            </span>
                        </Link>
                    )}

                    {/* ================================================== */}
                    {/* MOBILE MENU */}
                    {/* ================================================== */}

                    <MobileNav
                        loggedIn={!!profile}
                        username={profile?.username}
                        avatarUrl={profile?.avatarUrl}
                    />

                    {/* ================================================== */}
                    {/* DESKTOP ACCOUNT */}
                    {/* ================================================== */}

                    {profile ? (
                        <div className="hidden items-center gap-3 lg:flex">

                            <NavLink
                                href="/profile"
                                exact
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    !rounded-lg
                                    !px-2
                                    !py-1.5
                                "
                            >
                                <Avatar
                                    className="
                                        h-9
                                        w-9
                                        border
                                        border-border
                                        ring-1
                                        ring-transparent
                                        transition-all
                                        duration-200
                                        hover:border-primary/60
                                        hover:ring-primary/20
                                    "
                                >
                                    <AvatarImage
                                        src={
                                            profile.avatarUrl ??
                                            undefined
                                        }
                                        alt={profile.username}
                                    />

                                    <AvatarFallback
                                        className="
                                            bg-primary/10
                                            font-semibold
                                            text-primary
                                        "
                                    >
                                        {profile.username
                                            .charAt(0)
                                            .toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>

                                <span className="max-w-[120px] truncate text-sm font-medium">
                                    {profile.username}
                                </span>
                            </NavLink>

                            {/* LOGOUT */}

                            <form action={logoutAction}>
                                <Button
                                    type="submit"
                                    variant="outline"
                                    size="sm"
                                    className="
                                        border-border/80
                                        transition-colors
                                        hover:border-primary/40
                                        hover:text-primary
                                    "
                                >
                                    Logout
                                </Button>
                            </form>

                        </div>
                    ) : (

                        /* ================================================== */
                        /* LOGGED OUT */
                        /* ================================================== */

                        <div className="hidden items-center gap-2 sm:flex">

                            <Link href="/login">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    Log in
                                </Button>
                            </Link>

                            <Link href="/register">
                                <Button
                                    size="sm"
                                    className="font-semibold shadow-sm"
                                >
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
"use client";

import { useState } from "react";
import Link from "next/link";

import {
    Menu,
    Plus,
    Search,
    Users,
} from "lucide-react";

import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";
import { SearchBox } from "@/components/search-box";
import { NavLink } from "@/components/nav-link";

type MobileNavProps = {
    username?: string | null;
    avatarUrl?: string | null;
    loggedIn: boolean;
};

export function MobileNav({
    username,
    avatarUrl,
    loggedIn,
}: MobileNavProps) {
    const [open, setOpen] = useState(false);

    function navigate() {
        setOpen(false);
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            {/* MENU BUTTON */}

            <SheetTrigger
                type="button"
                aria-label="Open navigation"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
            >
                <Menu className="h-5 w-5" />
            </SheetTrigger>

            <SheetContent
                side="right"
                className="w-[min(92vw,380px)] overflow-y-auto bg-card p-0"
            >
                <div className="flex min-h-full flex-col px-4 pb-8 pt-16 sm:px-5">
                    {/* ACCOUNT */}

                    {loggedIn && username && (
                        <Link
                            href="/profile"
                            onClick={navigate}
                            className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-muted"
                        >
                            <Avatar className="h-9 w-9 shrink-0 sm:h-10 sm:w-10">
                                <AvatarImage
                                    src={
                                        avatarUrl ??
                                        undefined
                                    }
                                    alt={username}
                                />

                                <AvatarFallback>
                                    {username
                                        .charAt(0)
                                        .toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            <div className="min-w-0">
                                <p className="truncate font-medium">
                                    {username}
                                </p>

                                <p className="text-xs text-muted-foreground">
                                    View profile
                                </p>
                            </div>
                        </Link>
                    )}

                    {/* SEARCH */}

                    <div className="mt-6">
                        <div className="mb-2 flex items-center gap-2 px-1">
                            <Search className="h-4 w-4 text-muted-foreground" />

                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Search
                            </p>
                        </div>

                        <SearchBox />
                    </div>

                    {/* EXPLORE */}

                    <div className="mt-8">
                        <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Explore
                        </p>

                        <div className="flex flex-col">
                            <NavLink
                                href="/discover"
                                onClick={navigate}
                            >
                                Discover
                            </NavLink>

                            <NavLink
                                href="/people/browse"
                                onClick={navigate}
                                className="flex items-center gap-2"
                            >
                                <Users className="h-4 w-4" />
                                People
                            </NavLink>

                            <NavLink
                                href="/lists"
                                onClick={navigate}
                            >
                                Lists
                            </NavLink>
                        </div>
                    </div>

                    {/* YOUR CINEMA */}

                    {loggedIn && (
                        <div className="mt-8">
                            <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Your Cinema
                            </p>

                            <div className="flex flex-col">
                                <NavLink
                                    href="/profile"
                                    onClick={navigate}
                                    exact
                                >
                                    Profile
                                </NavLink>

                                <NavLink
                                    href="/watchlist"
                                    onClick={navigate}
                                >
                                    Watchlist
                                </NavLink>

                                <NavLink
                                    href="/watched"
                                    onClick={navigate}
                                >
                                    Watched
                                </NavLink>

                                <NavLink
                                    href="/ratings"
                                    onClick={navigate}
                                >
                                    Ratings
                                </NavLink>

                                <NavLink
                                    href="/friends"
                                    onClick={navigate}
                                >
                                    Friends
                                </NavLink>

                                <NavLink
                                    href="/activity"
                                    onClick={navigate}
                                >
                                    Activity
                                </NavLink>

                                <NavLink
                                    href="/add"
                                    onClick={navigate}
                                    className="mt-3 flex items-center gap-2 border border-primary/40 text-primary hover:bg-primary/10"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Movie
                                </NavLink>
                            </div>
                        </div>
                    )}

                    {/* LOGGED OUT */}

                    {!loggedIn && (
                        <div className="mt-8 flex flex-col gap-2">
                            <Link
                                href="/login"
                                onClick={navigate}
                            >
                                <Button
                                    variant="outline"
                                    className="w-full"
                                >
                                    Log in
                                </Button>
                            </Link>

                            <Link
                                href="/register"
                                onClick={navigate}
                            >
                                <Button className="w-full">
                                    Register
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
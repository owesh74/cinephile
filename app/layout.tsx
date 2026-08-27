import type { Metadata } from "next";

import {
    Fraunces,
    Inter,
    IBM_Plex_Mono,
} from "next/font/google";

import { NavBar } from "@/components/nav-bar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { MadeByFooter } from "@/components/made-by-footer";

import { createClient } from "@/lib/supabase/server";

import "./globals.css";

const fraunces = Fraunces({
    subsets: ["latin"],
    variable: "--font-display",
    weight: ["600", "700"],
    style: ["normal", "italic"],
});

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-body",
});

const plexMono = IBM_Plex_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
    weight: ["400", "500"],
});

export const metadata: Metadata = {
    title: "Cinephile",
    description: "Track, rate, and discover movies with friends.",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    return (
        <html lang="en">
            <body
                className={`${fraunces.variable} ${inter.variable} ${plexMono.variable} font-body`}
            >
                <NavBar />

                <main className="min-h-[calc(100vh-4rem)] pb-20 lg:pb-0">
                    {children}
                </main>

                <MadeByFooter />

                {/* Mobile bottom navigation on every page */}
                <MobileBottomNav loggedIn={!!user} />
            </body>
        </html>
    );
}
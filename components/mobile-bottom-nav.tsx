import Link from "next/link";
import type { ComponentType } from "react";
import { Home, Compass, Bookmark, User } from "lucide-react";

export function MobileBottomNav({ loggedIn }: { loggedIn: boolean }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border bg-card/95 py-2 backdrop-blur lg:hidden">
      <BottomLink
        href="/"
        label="Home"
        icon={Home}
        active
      />

      <BottomLink
        href="/discover"
        label="Explore"
        icon={Compass}
      />

      <BottomLink
        href={loggedIn ? "/watchlist" : "/login"}
        label="Watchlist"
        icon={Bookmark}
      />

      <BottomLink
        href={loggedIn ? "/profile" : "/login"}
        label="Profile"
        icon={User}
      />
    </nav>
  );
}

function BottomLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1 px-4 py-1 text-xs"
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-full ${
          active
            ? "text-primary"
            : "text-muted-foreground"
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>

      <span
        className={
          active
            ? "font-medium text-primary"
            : "text-muted-foreground"
        }
      >
        {label}
      </span>
    </Link>
  );
}
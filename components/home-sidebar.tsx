import Link from "next/link";
import {
  Home,
  Compass,
  TrendingUp,
  Star,
  Clock,
  Bookmark,
  Users,
  ListVideo,
} from "lucide-react";
import type { ComponentType } from "react";

const SECTION_LINKS = [
  { href: "#trending", label: "Trending", icon: TrendingUp },
  { href: "#top-rated", label: "Top Rated", icon: Star },
  { href: "#upcoming", label: "Upcoming", icon: Clock },
];

const APP_LINKS = [
  { href: "/discover", label: "Explore", icon: Compass },
  { href: "/lists", label: "Lists", icon: ListVideo },
  { href: "/people/browse", label: "People", icon: Users },
];

export function HomeSidebar({ loggedIn }: { loggedIn: boolean }) {
  return (
    <nav className="sticky top-24 flex flex-col gap-6 text-sm">
      <div className="flex flex-col gap-1">
        <SidebarLink href="/" label="Home" icon={Home} active />
        {SECTION_LINKS.map((item) => (
          <SidebarLink key={item.href} {...item} />
        ))}
      </div>

      <div className="flex flex-col gap-1 border-t border-border pt-4">
        <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Browse
        </p>

        {APP_LINKS.map((item) => (
          <SidebarLink key={item.href} {...item} />
        ))}

        {loggedIn && (
          <SidebarLink href="/watchlist" label="Watchlist" icon={Bookmark} />
        )}
      </div>
    </nav>
  );
}

function SidebarLink({
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
      className={`flex items-center gap-3 rounded-lg px-3 py-2 font-medium transition-colors ${
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
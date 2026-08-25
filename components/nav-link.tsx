"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type {
    AnchorHTMLAttributes,
    ReactNode,
} from "react";

type NavLinkProps = {
    href: string;
    children: ReactNode;
    className?: string;
    exact?: boolean;
} & Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    "href" | "children" | "className"
>;

export function NavLink({
    href,
    children,
    className = "",
    exact = false,
    ...props
}: NavLinkProps) {
    const pathname = usePathname();

    const isActive = exact
        ? pathname === href
        : pathname === href ||
          pathname.startsWith(`${href}/`);

    return (
        <Link
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={[
                "rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                className,
            ].join(" ")}
            {...props}
        >
            {children}
        </Link>
    );
}
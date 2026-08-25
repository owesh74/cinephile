import Link from "next/link";

export function MadeByFooter() {
    return (
        <footer className="mt-16 border-t border-border/60">
            <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-1 px-4 py-8 sm:px-6">
                <p className="text-xs text-muted-foreground">
                    Made with{" "}
                    <span
                        aria-label="love"
                        className="text-primary"
                    >
                        ♥
                    </span>{" "}
                    by{" "}
                    <span className="font-medium text-foreground">
                        Owesh
                    </span>
                </p>

                <p className="text-[11px] text-muted-foreground/70">
                    {/* Cinephile */}
                </p>
            </div>
        </footer>
    );
}
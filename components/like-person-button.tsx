"use client";

import { useFormStatus } from "react-dom";

type LikePersonButtonProps = {
    action: (formData: FormData) => void | Promise<void>;
    isLiked: boolean;
};

function SubmitButton({ isLiked }: { isLiked: boolean }) {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className={`inline-flex min-w-[120px] items-center justify-center gap-2 rounded-full border px-5 py-2 text-sm font-medium transition ${
                isLiked
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:bg-muted"
            } disabled:cursor-not-allowed disabled:opacity-60`}
        >
            {pending ? (
                <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Saving...</span>
                </>
            ) : (
                <>
                    <span>{isLiked ? "♥" : "♡"}</span>
                    <span>{isLiked ? "Liked" : "Like person"}</span>
                </>
            )}
        </button>
    );
}

export function LikePersonButton({
    action,
    isLiked,
}: LikePersonButtonProps) {
    return (
        <form action={action} className="mt-5">
            <SubmitButton isLiked={isLiked} />
        </form>
    );
}
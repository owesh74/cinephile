"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Film } from "lucide-react";

import { loginAction } from "@/lib/actions/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setPending(true);
        setError(null);

        const formData = new FormData();

        formData.set("email", email);
        formData.set("password", password);

        try {
            const result = await loginAction(formData);

            if (!result) {
                setError("Something went wrong. Please try again.");
                setPending(false);
                return;
            }

            if (!result.success) {
                setError(result.error ?? "Invalid login details.");
                setPending(false);
                return;
            }

            router.push("/profile");
            router.refresh();
        } catch (error) {
            console.error(error);

            setError(
                "Something went wrong. Please try again."
            );

            setPending(false);
        }
    }

    return (
        <div className="mx-auto max-w-md px-4 py-16">
            <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Film className="h-6 w-6 text-primary" />
                    </div>

                    <p className="mb-2 text-sm font-medium text-primary">
                        Welcome back
                    </p>

                    <h1 className="text-3xl font-semibold">
                        Log in
                    </h1>

                    <p className="mt-3 text-muted-foreground">
                        Continue building your movie collection.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >
                    <div className="space-y-2">
                        <label
                            htmlFor="email"
                            className="text-sm font-medium"
                        >
                            Email
                        </label>

                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            placeholder="you@example.com"
                            autoComplete="email"
                            disabled={pending}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="password"
                            className="text-sm font-medium"
                        >
                            Password
                        </label>

                        <Input
                            id="password"
                            name="password"
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            placeholder="Your password"
                            autoComplete="current-password"
                            disabled={pending}
                            required
                        />
                    </div>

                    {error && (
                        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={pending}
                        className="w-full"
                    >
                        {pending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Logging in...
                            </>
                        ) : (
                            "Log in"
                        )}
                    </Button>
                </form>

                <div className="my-7 h-px bg-border" />

                <p className="text-center text-sm text-muted-foreground">
                    No account yet?{" "}
                    <button
                        type="button"
                        onClick={() => router.push("/register")}
                        className="font-medium text-foreground underline underline-offset-4"
                    >
                        Create an account
                    </button>
                </p>
            </div>
        </div>
    );
}
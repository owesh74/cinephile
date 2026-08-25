"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";

import { registerAction } from "@/lib/actions/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setPending(true);
        setError(null);

        const formData = new FormData();

        formData.set("username", username);
        formData.set("email", email);
        formData.set("password", password);

        try {
            const result = await registerAction(formData);

            if (!result) {
                setError("Something went wrong. Please try again.");
                setPending(false);
                return;
            }

            if (!result.success) {
                setError(result.error ?? "Something went wrong.");
                setPending(false);
                return;
            }

            if (result.requiresEmailConfirmation) {
                setEmailSent(true);
                setPending(false);
                return;
            }

            // Email confirmation is disabled,
            // so the user is already logged in.
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

    // ─────────────────────────────────────────────
    // EMAIL CONFIRMATION SCREEN
    // ─────────────────────────────────────────────

    if (emailSent) {
        return (
            <div className="mx-auto max-w-md px-4 py-16">
                <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <Mail className="h-8 w-8 text-primary" />
                    </div>

                    <p className="mb-2 text-sm font-medium text-primary">
                        Almost there
                    </p>

                    <h1 className="text-3xl font-semibold">
                        Check your email
                    </h1>

                    <p className="mt-4 text-muted-foreground">
                        We sent a confirmation link to:
                    </p>

                    <p className="mt-2 break-all font-medium text-foreground">
                        {email}
                    </p>

                    <div className="mt-6 rounded-lg border border-border bg-background p-4 text-left">
                        <div className="flex gap-3">
                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

                            <div>
                                <p className="font-medium">
                                    Confirm your email
                                </p>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Open the email from Cinephile and
                                    click the confirmation link.
                                </p>
                            </div>
                        </div>
                    </div>

                    <p className="mt-6 text-sm text-muted-foreground">
                        Once your email is confirmed, come back and
                        log in to your account.
                    </p>

                    <Button
                        type="button"
                        className="mt-6 w-full"
                        onClick={() => router.push("/login")}
                    >
                        Go to login
                    </Button>

                    <button
                        type="button"
                        onClick={() => setEmailSent(false)}
                        className="mt-4 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
                    >
                        Back to registration
                    </button>
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────
    // REGISTER FORM
    // ─────────────────────────────────────────────

    return (
        <div className="mx-auto max-w-md px-4 py-16">
            <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
                <div className="mb-8 text-center">
                    <p className="mb-2 text-sm font-medium text-primary">
                        Join Cinephile
                    </p>

                    <h1 className="text-3xl font-semibold">
                        Create your account
                    </h1>

                    <p className="mt-3 text-muted-foreground">
                        Start tracking what you watch and build your
                        personal movie collection.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >
                    <div className="space-y-2">
                        <label
                            htmlFor="username"
                            className="text-sm font-medium"
                        >
                            Username
                        </label>

                        <Input
                            id="username"
                            name="username"
                            value={username}
                            onChange={(event) =>
                                setUsername(event.target.value)
                            }
                            placeholder="yourusername"
                            autoComplete="username"
                            disabled={pending}
                            required
                        />
                    </div>

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
                            placeholder="Create a password"
                            autoComplete="new-password"
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
                                Creating account...
                            </>
                        ) : (
                            "Create account"
                        )}
                    </Button>
                </form>

                <div className="my-7 h-px bg-border" />

                <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <button
                        type="button"
                        onClick={() => router.push("/login")}
                        className="font-medium text-foreground underline underline-offset-4"
                    >
                        Log in
                    </button>
                </p>
            </div>
        </div>
    );
}
"use client";

import { useState } from "react";
import { updateProfileAction } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProfileForm({
  defaultUsername,
  defaultBio,
}: {
  defaultUsername: string;
  defaultBio: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    setSuccess(false);
    const result = await updateProfileAction(formData);
    setPending(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Username</label>
        <Input name="username" defaultValue={defaultUsername} required />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Bio</label>
        <textarea
          name="bio"
          defaultValue={defaultBio}
          maxLength={280}
          rows={3}
          className="w-full rounded-md border bg-transparent p-2 text-sm"
          placeholder="Tell people about your taste in film..."
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-green-600">Saved.</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
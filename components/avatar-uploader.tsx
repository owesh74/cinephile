"use client";

import { useState, useRef } from "react";
import { uploadAvatarAction } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";

export function AvatarUploader() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    const file = inputRef.current?.files?.[0];
    if (!file) return;

    setPending(true);
    setError(null);

    const formData = new FormData();
    formData.set("avatar", file);

    const result = await uploadAvatarAction(formData);
    setPending(false);

    if (result?.error) {
      setError(result.error);
    } else {
      window.location.reload();
    }
  }

  return (
    <div className="flex items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="text-sm"
      />
      {pending && <span className="text-sm text-muted-foreground">Uploading...</span>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
"use client";

import { useRef, useState } from "react";
import { uploadAvatarAction } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { ImageIcon, Upload } from "lucide-react";

export function AvatarUploader() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;

    setError(null);
    setSelectedFile(file);
  }

  async function handleUpload() {
    const file = inputRef.current?.files?.[0];

    if (!file) {
      setError("Please choose an image first.");
      return;
    }

    setPending(true);
    setError(null);

    const formData = new FormData();
    formData.set("avatar", file);

    const result = await uploadAvatarAction(formData);

    setPending(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    window.location.reload();
  }

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-medium">Profile photo</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Upload a photo for your Cinephile profile.
        </p>
      </div>

      <div
        className="rounded-xl border border-border bg-card/40 p-5 transition-colors hover:bg-card/60"
      >
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-muted">
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
          </div>

          <div>
            <p className="text-sm font-medium">
              {selectedFile ? selectedFile.name : "Choose a profile photo"}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              JPG, PNG, WEBP or GIF · Max 2MB
            </p>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="sr-only"
          />

          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => inputRef.current?.click()}
              disabled={pending}
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              Choose image
            </Button>

            {selectedFile && (
              <Button
                type="button"
                onClick={handleUpload}
                disabled={pending}
              >
                <Upload className="mr-2 h-4 w-4" />
                {pending ? "Uploading..." : "Upload photo"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
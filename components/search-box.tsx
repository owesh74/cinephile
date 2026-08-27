"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function SearchBox() {
  const router = useRouter();
  const [value, setValue] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const query = value.trim();

    if (!query) return;

    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search movies..."
        aria-label="Search movies"
        className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none transition focus:border-primary"
      />
    </form>
  );
}
import { getAllLists } from "@/lib/data/lists";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ListsPage() {
  const allLists = await getAllLists();

  const curated = allLists.filter((l) => l.isSystem);
  const community = allLists.filter((l) => !l.isSystem);

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto w-full max-w-... space-y-... px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Lists</h1>

        {user && (
          <Link href="/lists/create">
            <Button size="sm">Create a list</Button>
          </Link>
        )}
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Curated Lists</h2>

        {curated.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No curated lists yet.
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          {curated.map((list) => (
            <Link
              key={list.id}
              href={`/lists/${list.id}`}
              className="rounded-md border p-4 hover:bg-muted"
            >
              <p className="font-medium">{list.title}</p>

              {list.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {list.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Community Lists</h2>

        {community.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No community lists yet — be the first to create one.
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          {community.map((list) => (
            <Link
              key={list.id}
              href={`/lists/${list.id}`}
              className="rounded-md border p-4 hover:bg-muted"
            >
              <p className="font-medium">{list.title}</p>

              {list.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {list.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
import { requireUser } from "@/lib/auth/require-user";
import { createListAction } from "@/lib/actions/lists";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LIST_SIZES } from "@/lib/validations/list";

export default async function CreateListPage() {
  await requireUser();

  return (
    <div className="mx-auto max-w-lg space-y-6 py-16">
      <h1 className="text-2xl font-semibold">Create a list</h1>
      <p className="text-sm text-muted-foreground">
        Give it a title and size — you'll add and rank movies on the next page.
      </p>
      <form action={createListAction} className="space-y-4">
        <Input name="title" placeholder="List title *" required />
        <textarea
          name="description"
          placeholder="Description (optional)"
          rows={3}
          className="w-full rounded-md border bg-transparent p-2 text-sm"
        />
        <div>
          <label className="mb-1 block text-sm font-medium">Size</label>
          <select
            name="size"
            className="w-full rounded-md border bg-transparent p-2 text-sm"
            defaultValue="10"
          >
            {LIST_SIZES.map((s) => (
              <option key={s} value={s}>
                Top {s}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" className="w-full">
          Create list
        </Button>
      </form>
    </div>
  );
}
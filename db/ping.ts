import { db } from "./index";
import { sql } from "drizzle-orm";

async function main() {
  const result = await db.execute(sql`select 1 as ok`);
  console.log(result);
}

main();
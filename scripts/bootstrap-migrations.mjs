import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required");

const sql = postgres(databaseUrl, { max: 1, connect_timeout: 10 });
const requiredTables = [
  "conversation_sessions", "media_assets", "message_option_map", "messages",
  "option_reactions", "participants", "reminders", "trip_option_assets",
  "trip_options", "trips",
];

try {
  await sql`CREATE SCHEMA IF NOT EXISTS drizzle`;
  await sql`
    CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
      id SERIAL PRIMARY KEY, hash text NOT NULL, created_at bigint
    )
  `;
  const history = await sql`
    SELECT hash FROM drizzle.__drizzle_migrations ORDER BY created_at DESC
  `;
  if (history.length > 0) {
    console.log("Drizzle migration history already exists; skipping baseline.");
    process.exit(0);
  }

  const tables = await sql`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN (${sql.join(requiredTables.map((table) => sql`${table}`), sql`, `)})
  `;
  const present = new Set(tables.map(({ table_name }) => table_name));
  if (!requiredTables.every((table) => present.has(table))) {
    console.log("No existing baseline detected; normal migrations will run from the beginning.");
    process.exit(0);
  }

  const root = process.cwd();
  const journal = JSON.parse(await fs.readFile(path.join(root, "drizzle/meta/_journal.json"), "utf8"));
  for (const entry of journal.entries.filter(({ idx }) => idx < 5)) {
    const query = await fs.readFile(path.join(root, `drizzle/${entry.tag}.sql`), "utf8");
    const hash = crypto.createHash("sha256").update(query).digest("hex");
    await sql`INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES (${hash}, ${entry.when})`;
  }
  console.log("Bootstrapped 5 existing Drizzle migrations.");
} finally {
  await sql.end({ timeout: 5 });
}

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

export const db = databaseUrl ? drizzle(postgres(databaseUrl, { max: 5 }), { schema }) : null;

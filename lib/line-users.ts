import { Pool } from "pg";

const pool = new Pool({
  connectionString:
    process.env.POSTGRES_URL ??
    process.env.POSTGRES_PRISMA_URL ??
    process.env.POSTGRES_URL_NON_POOLING,
  ssl: { rejectUnauthorized: false },
});

export async function upsertLineUser(id: string, name: string) {
  await pool.query(
    `insert into line.users (id, name)
     values ($1, $2)
     on conflict (id)
     do update set name = excluded.name`,
    [id, name]
  );
}

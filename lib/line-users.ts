import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
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

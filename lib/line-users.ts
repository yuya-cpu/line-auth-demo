import { createHash } from "node:crypto";
import { Pool } from "pg";

const pool = new Pool({
  connectionString:
    process.env.POSTGRES_URL ??
    process.env.POSTGRES_PRISMA_URL ??
    process.env.POSTGRES_URL_NON_POOLING,
  ssl: { rejectUnauthorized: false },
});

const LINE_UUID_NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

function uuidFromLineId(lineId: string) {
  const namespace = Buffer.from(LINE_UUID_NAMESPACE.replaceAll("-", ""), "hex");
  const hash = createHash("sha1").update(namespace).update(lineId).digest();
  hash[6] = (hash[6] & 0x0f) | 0x50;
  hash[8] = (hash[8] & 0x3f) | 0x80;
  const hex = hash.subarray(0, 16).toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

export async function upsertLineUser(lineId: string, name: string) {
  const id = uuidFromLineId(lineId);
  await pool.query(
    `insert into line.users (id, name)
     values ($1::uuid, $2)
     on conflict (id)
     do update set name = excluded.name`,
    [id, name]
  );
}

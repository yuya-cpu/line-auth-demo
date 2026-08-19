import { createHash } from "node:crypto";
import { Pool } from "pg";
import { parse } from "pg-connection-string";

function getPool() {
  const raw =
    process.env.POSTGRES_URL_NON_POOLING ??
    process.env.POSTGRES_URL ??
    process.env.POSTGRES_PRISMA_URL;
  if (!raw) {
    throw new Error("POSTGRES_URL is not set");
  }

  const parsed = parse(raw);
  return new Pool({
    host: parsed.host ?? undefined,
    port: parsed.port ? Number(parsed.port) : 5432,
    user: parsed.user,
    password: parsed.password,
    database: parsed.database ?? undefined,
    ssl: { rejectUnauthorized: false },
    max: 1,
  });
}

let pool: Pool | undefined;

function poolInstance() {
  pool ??= getPool();
  return pool;
}

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
  const client = await poolInstance().connect();
  try {
    await client.query("create schema if not exists line");
    await client.query(`
      create table if not exists line.users (
        id uuid primary key,
        name text not null
      )
    `);
    await client.query(
      `insert into line.users (id, name)
       values ($1::uuid, $2)
       on conflict (id)
       do update set name = excluded.name`,
      [id, name]
    );
    console.info("[line.users] saved");
  } finally {
    client.release();
  }
}

export async function saveLineProfileFromUser(user: {
  id?: string;
  name?: string | null;
  email?: string | null;
}) {
  const name = user.name;
  if (!name) {
    console.error("[line.users] skip: no name");
    return;
  }

  const lineId = user.email?.endsWith("@line.invalid")
    ? user.email.replace(/@line\.invalid$/, "")
    : user.id;

  if (!lineId) {
    console.error("[line.users] skip: no line id");
    return;
  }

  await upsertLineUser(lineId, name);
}

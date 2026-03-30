import { ensureTables } from "../lib/ensure-tables";

interface Env {
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
}

type PitchRow = {
  id: string;
  name: string;
  formats: string; // JSON array string
  description: string | null;
  active: number;
};

function json(res: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(res), {
    ...(init ?? {}),
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  await ensureTables(context.env.DB);

  const rows = await context.env.DB
    .prepare(
      `SELECT id, name, formats, description, active
       FROM pitch
       WHERE active = 1
       ORDER BY name ASC`
    )
    .all<PitchRow>();

  const pitches = rows.results.map((r) => ({
    id: r.id,
    name: r.name,
    formats: JSON.parse(r.formats) as string[],
    description: r.description ?? undefined,
    active: r.active === 1,
  }));

  return json({ pitches });
};

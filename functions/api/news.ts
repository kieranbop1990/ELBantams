import { ensureTables } from "../lib/ensure-tables";
import { type Env, json, nowMs, randomId, requireAdmin } from "../lib/api-helpers";

type NewsRow = {
  id: string;
  title: string;
  text: string;
  body: string | null;
  link: string;
  linkText: string;
  sections: string | null; // JSON
  createdAt: number;
  updatedAt: number;
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  await ensureTables(context.env.DB);
  const rows = await context.env.DB
    .prepare(
      `SELECT id, title, text, body, link, linkText, sections, createdAt, updatedAt
       FROM news_item
       ORDER BY updatedAt DESC`
    )
    .all<NewsRow>();

  const items = rows.results.map((r) => ({
    id: r.id,
    title: r.title,
    text: r.text,
    body: r.body ?? undefined,
    link: r.link,
    linkText: r.linkText,
    sections: r.sections ? (JSON.parse(r.sections) as string[]) : undefined,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));

  return json({ items });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const result = await requireAdmin(context);
  if ("error" in result) return result.error;

  const body = (await context.request.json()) as Partial<{
    title: string;
    text: string;
    body: string;
    link: string;
    linkText: string;
    sections: string[];
  }>;

  const title = body.title?.trim() ?? "";
  const text = body.text?.trim() ?? "";
  const link = body.link?.trim() ?? "#";
  const linkText = body.linkText?.trim() ?? "Read More";

  if (!title || !text) return json({ error: "title and text are required" }, { status: 400 });

  const id = randomId("news");
  const ts = nowMs();
  const sections = body.sections ? JSON.stringify(body.sections) : null;

  await context.env.DB
    .prepare(
      `INSERT INTO news_item (id, title, text, body, link, linkText, sections, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(id, title, text, body.body ?? null, link, linkText, sections, ts, ts)
    .run();

  return json({ ok: true, id }, { status: 201 });
};

export const onRequestPatch: PagesFunction<Env> = async (context) => {
  const result = await requireAdmin(context);
  if ("error" in result) return result.error;

  const url = new URL(context.request.url);
  const id = url.searchParams.get("id") ?? "";
  if (!id) return json({ error: "id query param required" }, { status: 400 });

  const body = (await context.request.json()) as Partial<{
    title: string;
    text: string;
    body: string | null;
    link: string;
    linkText: string;
    sections: string[] | null;
  }>;

  const existing = await context.env.DB
    .prepare(`SELECT id FROM news_item WHERE id = ?`)
    .bind(id)
    .first<{ id: string }>();
  if (!existing) return json({ error: "Not found" }, { status: 404 });

  const sets: string[] = [];
  const binds: unknown[] = [];

  const set = (col: string, value: unknown) => {
    sets.push(`${col} = ?`);
    binds.push(value);
  };

  if (body.title !== undefined) set("title", body.title);
  if (body.text !== undefined) set("text", body.text);
  if (body.body !== undefined) set("body", body.body);
  if (body.link !== undefined) set("link", body.link);
  if (body.linkText !== undefined) set("linkText", body.linkText);
  if (body.sections !== undefined) {
    set("sections", body.sections === null ? null : JSON.stringify(body.sections));
  }

  set("updatedAt", nowMs());

  await context.env.DB
    .prepare(`UPDATE news_item SET ${sets.join(", ")} WHERE id = ?`)
    .bind(...binds, id)
    .run();

  return json({ ok: true });
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const result = await requireAdmin(context);
  if ("error" in result) return result.error;

  const url = new URL(context.request.url);
  const id = url.searchParams.get("id") ?? "";
  if (!id) return json({ error: "id query param required" }, { status: 400 });

  const res = await context.env.DB
    .prepare(`DELETE FROM news_item WHERE id = ?`)
    .bind(id)
    .run();

  return json({ ok: true, changes: res.meta.changes });
};


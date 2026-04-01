import { ensureTables } from "../lib/ensure-tables";
import { type Env, json, nowMs, requireAdmin } from "../lib/api-helpers";

type BookingRow = {
  id: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  teamName: string;
  teamSlug: string | null;
  teamLeague: string | null;
  format: string;
  notes: string | null;
  pitchName: string;
  pitchId: string;
  createdAt: number;
  requestId: string | null;
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  await ensureTables(context.env.DB);

  const url = new URL(context.request.url);
  const date = url.searchParams.get("date");   // YYYY-MM-DD (single day)
  const month = url.searchParams.get("month"); // YYYY-MM

  let query = `
    SELECT b.id, b.date, b.timeStart, b.timeEnd, b.teamName, b.teamSlug, b.teamLeague, b.format, b.notes,
           b.createdAt, b.requestId, p.name as pitchName, p.id as pitchId
    FROM booking b
    JOIN pitch p ON b.pitchId = p.id
  `;
  const binds: string[] = [];

  if (date) {
    query += ` WHERE b.date = ?`;
    binds.push(date);
  } else if (month) {
    query += ` WHERE b.date LIKE ?`;
    binds.push(`${month}-%`);
  }

  query += ` ORDER BY b.date ASC, b.timeStart ASC`;

  const rows = await context.env.DB
    .prepare(query)
    .bind(...binds)
    .all<BookingRow>();

  const bookings = rows.results.map((r) => ({
    id: r.id,
    date: r.date,
    timeStart: r.timeStart,
    timeEnd: r.timeEnd,
    teamName: r.teamName,
    teamSlug: r.teamSlug ?? undefined,
    teamLeague: r.teamLeague ?? undefined,
    format: r.format,
    notes: r.notes ?? undefined,
    pitchName: r.pitchName,
    pitchId: r.pitchId,
    createdAt: r.createdAt,
    requestId: r.requestId ?? undefined,
  }));

  return json({ bookings });
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const result = await requireAdmin(context);
  if ("error" in result) return result.error;

  const url = new URL(context.request.url);
  const id = url.searchParams.get("id") ?? "";
  if (!id) return json({ error: "id query param required" }, { status: 400 });

  const ts = nowMs();

  // Reset associated booking_request back to pending, then delete booking
  await context.env.DB.batch([
    context.env.DB
      .prepare(
        `UPDATE booking_request SET status = 'pending', updatedAt = ?
         WHERE id = (SELECT requestId FROM booking WHERE id = ?)`
      )
      .bind(ts, id),
    context.env.DB
      .prepare(`DELETE FROM booking WHERE id = ?`)
      .bind(id),
  ]);

  return json({ ok: true });
};

import "server-only";
import { getDatabase } from "./database";
export type PublicHistoricalEvent = { date: string; title: string; description: string; location: string; speakers: string };
// Deliberately read only event metadata, never the private attendance workbook.
export async function publicHistoricalEvents(): Promise<PublicHistoricalEvent[]> {
  if (!process.env.DATABASE_URL) return [];
  const db = getDatabase();
  if (!(await db.query("SELECT to_regclass('tpa.historical_event_details') AS relation")).rows[0].relation) return [];
  return (await db.query<PublicHistoricalEvent>("SELECT source_date::text AS date,title,description,location,speakers FROM tpa.historical_event_details WHERE source_date<=(now() AT TIME ZONE 'Asia/Kolkata')::date ORDER BY source_date DESC LIMIT 100")).rows;
}

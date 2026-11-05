import { publicHistoricalEvents } from "@/lib/public-historical-events";
import { HomepageEventsView, type HomeEvent } from "./homepage-events-view";
import { getDatabase } from "@/lib/database";

export async function HomepageEvents({heading}: {heading?: string} = {}) {
  const events: HomeEvent[] = process.env.DATABASE_URL
    ? (await getDatabase().query<HomeEvent>(
      "SELECT id,title,starts_at,location FROM tpa.events WHERE status='published' AND visibility='public' ORDER BY starts_at DESC,id LIMIT 3"
    )).rows : [];
  return <HomepageEventsView events={events} pastEvents={await publicHistoricalEvents()} heading={heading} />;
}

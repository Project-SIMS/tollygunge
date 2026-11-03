import type { PublicHistoricalEvent } from "@/lib/public-historical-events";
import { HistoricalEventPoster, hasHistoricalEventPoster } from "./historical-event-poster";

export function HistoricalEventCard({ event }: { event: PublicHistoricalEvent }) {
  const speakers = event.speakers.split(/[;\n]+/).map(name => name.trim()).filter(Boolean);
  return (
    <article className="event-row historical-event-card" id={`event-${event.date}`} aria-labelledby={`event-title-${event.date}`}>
      <header className="historical-event-card-header">
        <p className="historical-event-date"><time dateTime={event.date}>{new Intl.DateTimeFormat("en-IN", {day:"numeric",month:"long",year:"numeric",timeZone:"Asia/Kolkata"}).format(new Date(`${event.date}T12:00:00+05:30`))}</time></p>
        <h3 id={`event-title-${event.date}`}>{event.title}</h3>
      </header>
      {(event.location || speakers.length > 0 || event.description || hasHistoricalEventPoster(event.date)) && <div className="historical-event-card-body">
        <div className="historical-event-copy">
          {(event.location || speakers.length > 0) && <dl className="historical-event-facts">
            {event.location && <div className="historical-event-venue"><dt>Venue</dt><dd>{event.location}</dd></div>}
            {speakers.length > 0 && <div><dt>{speakers.length > 1 ? "Speakers" : "Speaker"}</dt><dd><ul>{speakers.map((speaker,index) => <li key={`${speaker}-${index}`}>{speaker}</li>)}</ul></dd></div>}
          </dl>}
          {event.description && <section className="historical-event-overview" aria-label="Event overview"><h4>Overview</h4><p>{event.description}</p></section>}
        </div>
        <HistoricalEventPoster date={event.date} />
      </div>}
    </article>
  );
}

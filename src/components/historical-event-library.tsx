import Link from "./navigation-link";
import { loadWorkbookAttendance } from "@/lib/workbook-attendance";

// Parent routes enforce events:manage before rendering this server component.
export async function HistoricalEventLibrary() {
  const events = await loadWorkbookAttendance();
  if (!events.length) return null;
  return (
    <section className="bento-card" aria-labelledby="historical-events-title">
      <div className="section-heading">
        <div>
          <h2 id="historical-events-title">Historical event registers</h2>
          <p>{events.length} event dates from the uploaded attendance workbook. Open a date to view its members.</p>
        </div>
      </div>
      <div className="table-wrap" role="region" aria-label="Historical event dates" tabIndex={0}>
        <table className="operations-table">
          <thead><tr><th scope="col">Event date</th><th scope="col">Members listed</th><th scope="col">Attended</th><th scope="col">Not attended</th><th scope="col">Not recorded</th><th scope="col">Register</th></tr></thead>
          <tbody>
            {events.map(event => (
              <tr key={event.date}>
                <th scope="row">{new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(`${event.date}T12:00:00+05:30`))}</th>
                <td>{event.rows.length}</td>
                <td>{event.rows.filter(row => row.status === "Attended").length}</td>
                <td>{event.rows.filter(row => row.status === "Not attended").length}</td>
                <td>{event.rows.filter(row => row.status === "Not recorded").length}</td>
                <td><Link href={`/admin/workspaces/events?view=participants&tab=attendance&eventDate=${event.date}`} aria-label={`View attendance register for ${event.date}`}>View register →</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>Blank signatures remain “Not recorded”. These historical registers do not open bookings or send event notifications.</p>
    </section>
  );
}

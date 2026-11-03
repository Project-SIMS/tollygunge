"use client";
import { useState } from "react";
import type { WorkbookEvent } from "@/lib/workbook-attendance";

export function WorkbookEventParticipants({ events, initialDate }: { events: WorkbookEvent[]; initialDate?: string }) {
  const initialEvent = events.find(event => event.date === initialDate) ?? events.find(event => event.rows.some(row => row.status === "Attended")) ?? events[0];
  const [date, setDate] = useState(initialEvent?.date || "");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(initialEvent?.rows.some(row => row.status === "Attended") ? "Attended" : "all");
  const event = events.find(e => e.date === date);
  const rows = event?.rows.filter(r => (status === "all" || r.status === status) && [r.name, r.number, r.email, r.mobile, r.organisation].join(" ").toLowerCase().includes(query.toLowerCase())) || [];
  return <section className="participant-directory workbook-attendance" data-portal-primary>
    <h2>Event attendance by date</h2>
    <p>Attendance from the supplied workbook, linked to the Database sheet by membership number. Blank signatures are not recorded as attendance.</p>
    <div className="participant-filters workbook-attendance-filters">
      <label>Event date<select value={date} onChange={e => {setDate(e.target.value); setQuery("");}}>{events.map(e => <option key={e.date} value={e.date}>{e.date.split("-").reverse().join("/")}{e.title ? ` · ${e.title}` : ""}</option>)}</select></label>
      <label>Attendance status<select value={status} onChange={e => setStatus(e.target.value)}>{["Attended", "Not attended", "Not recorded", "all"].map(s => <option key={s} value={s}>{s === "all" ? "All listed members" : s}</option>)}</select></label>
      <label>Search members<input value={query} onChange={e => setQuery(e.target.value)} placeholder="Name, number or contact" /></label>
    </div>
    {event?.title && <h3>{event.title}</h3>}
    {event?.description && <p>{event.description}</p>}
    {event?.location && <p>Venue: {event.location}</p>}
    {event?.speakers && <p>Speakers: {event.speakers}</p>}
    <p role="status">{rows.length} matching members · {event?.rows.filter(r => r.status === "Attended").length || 0} attended · {event?.rows.filter(r => r.status === "Not recorded").length || 0} not recorded</p>
    {rows.length ? <div className="table-wrap workbook-attendance-table" tabIndex={0} role="region" aria-label="Workbook event attendees">
      <table className="operations-table">
        <colgroup><col className="attendance-member-column" /><col className="attendance-number-column" /><col className="attendance-contact-column" /><col className="attendance-organisation-column" /><col className="attendance-status-column" /></colgroup>
        <thead><tr><th scope="col">Member</th><th scope="col">Membership no.</th><th scope="col">Contact</th><th scope="col">Organisation</th><th scope="col">Attendance</th></tr></thead>
        <tbody>{rows.map((r, i) => <tr key={`${r.number}-${i}`}>
          <td><strong className="attendance-primary">{r.name}</strong>{r.designation && <small className="attendance-secondary">{r.designation}</small>}{!r.matched && <small className="attendance-secondary attendance-match-note">No unique Database match; showing event-sheet details</small>}</td>
          <td><span className="attendance-number">{r.number || "Not provided"}</span></td>
          <td><span className="attendance-primary">{r.email || "Email not provided"}</span><small className="attendance-secondary attendance-number">{r.mobile || "Phone not provided"}</small></td>
          <td><span className="attendance-primary">{r.organisation || "Not provided"}</span></td>
          <td><span className="attendance-status">{r.status}</span></td>
        </tr>)}</tbody>
      </table>
    </div> : event && !event.rows.length ? <p>Attendee details have not been added for this event yet.</p> : <p>No members match this date and attendance status. Select “All listed members” to inspect unmarked records.</p>}
  </section>;
}

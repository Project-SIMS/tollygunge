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
  return <section className="participant-directory" data-portal-primary>
    <h2>Event attendance by date</h2>
    <p>Attendance from the supplied workbook, linked to the Database sheet by membership number. Blank signatures are not recorded as attendance.</p>
    <div className="participant-filters">
      <label>Event date<select value={date} onChange={e => {setDate(e.target.value); setQuery("");}}>{events.map(e => <option key={e.date} value={e.date}>{e.title ? `${e.title} · ` : ""}{e.date.split("-").reverse().join("/")}</option>)}</select></label>
      <label>Attendance status<select value={status} onChange={e => setStatus(e.target.value)}>{["Attended", "Not attended", "Not recorded", "all"].map(s => <option key={s} value={s}>{s === "all" ? "All listed members" : s}</option>)}</select></label>
      <label>Search members<input value={query} onChange={e => setQuery(e.target.value)} placeholder="Name, membership number or contact" /></label>
    </div>
    {event?.title && <h3>{event.title}</h3>}
    {event?.description && <p>{event.description}</p>}
    {event?.location && <p>Venue: {event.location}</p>}
    {event?.speakers && <p>Speakers: {event.speakers}</p>}
    <p role="status">{rows.length} matching members · {event?.rows.filter(r => r.status === "Attended").length || 0} attended · {event?.rows.filter(r => r.status === "Not recorded").length || 0} not recorded</p>
    {rows.length ? <div className="table-wrap" tabIndex={0} role="region" aria-label="Workbook event attendees"><table className="operations-table"><thead><tr><th>Member</th><th>Membership no.</th><th>Contact</th><th>Organisation</th><th>Attendance</th></tr></thead><tbody>{rows.map((r, i) => <tr key={`${r.number}-${i}`}><td><strong>{r.name}</strong><small>{r.designation}</small>{!r.matched && <small>No unique Database match; showing event-sheet details</small>}</td><td>{r.number || "Not provided"}</td><td>{r.email || "Email not provided"}<small>{r.mobile || "Phone not provided"}</small></td><td>{r.organisation || "Not provided"}</td><td>{r.status}</td></tr>)}</tbody></table></div> : <p>No members match this date and attendance status. Select “All listed members” to inspect unmarked records.</p>}
  </section>;
}

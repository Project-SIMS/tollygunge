"use client";
import { useEffect, useState } from "react";
import { api } from "./operations-client";
import type { EventJourney } from "./member-event-journey";
import { eventTime } from "@/domain/event-flow";
type History = Pick<EventJourney, "historicalAttendance" | "attendedEvents">;
export function MemberAttendanceHistory({ personId }: { personId: string }) {
  const [result, setResult] = useState<{ personId: string; data?: History; error?: string }>();
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    api<History>(`/api/staff/member-attendance?personId=${encodeURIComponent(personId)}`)
      .then(data => { if (active) setResult({ personId, data }); })
      .catch(error => { if (active) setResult({ personId, error: error.message }); });
    return () => { active = false; };
  }, [personId, retry]);
  const current = result?.personId === personId ? result : undefined;
  const count = (current?.data?.historicalAttendance?.length ?? 0) + (current?.data?.attendedEvents?.length ?? 0);
  return <section aria-label="Member event attendance">
    <h3>Event attendance</h3>
    {current?.error ? <p role="alert">{current.error} <button type="button" onClick={() => { setResult(undefined); setRetry(value => value + 1); }}>Retry attendance</button></p> : !current?.data ? <p role="status">Loading attendance history…</p> : <>
      <p>{count} attendance records · Platform events and historical registers</p>
      {count ? <ul className="event-journey-list">
        {current.data.attendedEvents?.map(event => <li key={event.id}><strong>{event.title}</strong><p>{eventTime(event.starts_at)} · Attended</p></li>)}
        {current.data.historicalAttendance?.map(event => <li key={event.date}><strong>{event.title}</strong><p>{new Intl.DateTimeFormat("en-IN", {day:"numeric",month:"long",year:"numeric",timeZone:"Asia/Kolkata"}).format(new Date(`${event.date}T12:00:00+05:30`))} · Attended</p><small>Historical attendance register</small></li>)}
      </ul> : <p>No attended events are recorded for this membership number. Unmarked entries are excluded.</p>}
    </>}
  </section>;
}

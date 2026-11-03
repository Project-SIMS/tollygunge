"use client";
import { useEffect, useState } from "react";
import { api } from "./operations-client";
import Link from "./navigation-link";
import { eventTime } from "@/domain/event-flow";
import { PortalIcon } from "./portal-icon";

export type EventJourney = {
  attendanceCount: number;
  historicalAttendance?: { date: string; title: string; source: "workbook" }[];
  attendedEvents?: { id: string; title: string; starts_at: string }[];
  badges: { id: string; name: string; description: string; icon: string }[];
  resources: {
    id: string;
    event_id: string;
    title: string;
    description: string;
    type: string;
  }[];
};

export function MemberEventJourney() {
  const [journey, setJourney] = useState<EventJourney | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    api<EventJourney>("/api/member/event-journey")
      .then((value) => {
        if (active) setJourney(value);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section
      className="content-section member-event-journey"
      aria-labelledby="event-journey-title"
    >
      <h2 id="event-journey-title">Your event journey</h2>
      {journey ? (
        <div className="event-journey-grid">
          <div className="event-attendance-stat">
            <PortalIcon name="calendar" />
            <strong>{journey.attendanceCount}</strong>
            <span>Events attended</span>
            <p>Platform event attendance.</p>
          </div>
          <section className="event-journey-detail">
            <h3>Events you attended</h3>
            {(journey.attendedEvents?.length || journey.historicalAttendance?.length) ? (
              <ul className="event-journey-list">
                {journey.attendedEvents?.map(event => <li key={event.id}><Link href={`/member/events?eventId=${event.id}`}>{event.title}</Link><p>{eventTime(event.starts_at)} · Attended</p></li>)}
                {journey.historicalAttendance?.map(event => <li key={event.date}><strong>{event.title}</strong><p>{new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(event.date + "T12:00:00+05:30"))} · Attended</p><small>Historical attendance register</small></li>)}
              </ul>
            ) : <p>No attended events are recorded for your membership yet. Contact the association if an event is missing.</p>}
            {!!journey.historicalAttendance?.length && <p>{journey.historicalAttendance.length} historical events recorded in addition to platform attendance.</p>}
          </section>
          <section className="event-journey-detail">
            <h3>
              <PortalIcon name="shield" /> Attendance badges
            </h3>
            {journey.badges.length ? (
              <ul className="event-journey-list">
                {journey.badges.map((b) => (
                  <li key={b.id}>
                    <strong>{b.name}</strong>
                    <p>{b.description}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <>
                <strong>No milestone badges yet</strong>
                <p>
                  Individual attendance badges appear with each event in your
                  history.
                </p>
              </>
            )}
          </section>
          <section className="event-journey-detail">
            <h3>
              <PortalIcon name="file" /> Unlocked resources
            </h3>
            {journey.resources.length ? (
              <ul className="event-journey-list">
                {journey.resources.map((r) => (
                  <li key={r.id}>
                    <a href={`/api/event-assets/${r.id}`}>{r.title}</a>
                    <p>
                      {r.type.replaceAll("_", " ")}
                      {r.description ? ` · ${r.description}` : ""}
                    </p>
                    <a href={`/member/events?eventId=${r.event_id}`}>
                      View event →
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <>
                <strong>Resources will appear here</strong>
                <p>There are no published resources available to you yet.</p>
              </>
            )}
          </section>
        </div>
      ) : (
        <p role={error ? "alert" : "status"}>
          {error || "Loading your event journey…"}
        </p>
      )}
    </section>
  );
}

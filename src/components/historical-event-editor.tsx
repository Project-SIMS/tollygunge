"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "./operations-client";
import type { HistoricalEventDetails } from "@/domain/historical-event-details";
import { ProfileInspector } from "./profile-preview";
export function HistoricalEventEditor({ date, details }: { date: string; details: HistoricalEventDetails }) {
  const router = useRouter();
  const trigger = useRef<HTMLButtonElement | null>(null);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(details);
  const [draft, setDraft] = useState(details);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  return <>
    <button ref={trigger} className="text-button" type="button" aria-expanded={editing} onClick={() => { setDraft(saved); setEditing(!editing); setMessage(""); }}>Edit details</button>
    {editing && <ProfileInspector label={`Edit event on ${date}`} returnFocus={trigger} onClose={() => { if (!busy) setEditing(false); }}>
    <h2 tabIndex={-1}>Past event details</h2>
    <form className="member-settings" aria-label={`Edit event on ${date}`} onSubmit={async event => {
      event.preventDefault(); setBusy(true); setMessage("");
      try {
        const result = await api<HistoricalEventDetails>("/api/staff/historical-events", { date, ...draft, reason });
        setSaved(result); setDraft(result); setReason(""); setEditing(false); setMessage("Event details saved."); router.refresh();
      } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save event details."); }
      finally { setBusy(false); }
    }}>
      <fieldset disabled={busy}>
        <legend>Past event details · {date}</legend>
        <label>Event title<input required minLength={3} maxLength={160} value={draft.title} onChange={event => setDraft({ ...draft, title: event.target.value })} /></label>
        <label>Description<textarea maxLength={5000} value={draft.description} onChange={event => setDraft({ ...draft, description: event.target.value })} /></label>
        <label>Venue<input maxLength={240} value={draft.location} onChange={event => setDraft({ ...draft, location: event.target.value })} /></label>
        <label>Speakers<input maxLength={500} value={draft.speakers} onChange={event => setDraft({ ...draft, speakers: event.target.value })} /></label>
        <label>Reason for editing<input required minLength={3} maxLength={1000} value={reason} onChange={event => setReason(event.target.value)} /></label>
        <p>The register date and attendance records remain attached to this event.</p>
        <div className="action-row"><button className="button" disabled={busy}>{busy ? "Saving…" : "Save event details"}</button><button type="button" className="button secondary" onClick={() => { setEditing(false); setReason(""); setMessage(""); }}>Cancel</button></div>
      </fieldset>
    </form>
    {message && <p role="status">{message}</p>}
    </ProfileInspector>}
    {!editing && message && <p role="status">{message}</p>}
  </>;
}

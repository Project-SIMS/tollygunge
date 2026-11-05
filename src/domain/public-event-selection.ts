export function eventMonth(value: Date | string): string {
  const parts = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", timeZone: "Asia/Kolkata" }).formatToParts(new Date(value));
  return `${parts.find(part => part.type === "year")!.value}-${parts.find(part => part.type === "month")!.value}`;
}
export function selectPublicEvents<E extends { starts_at: Date | string }, H extends { date: string }>(events: E[], historical: H[], month = "", limit: number | null = 3) {
  const combined = [
    ...events.map(event => ({ kind: "event" as const, event, time: new Date(event.starts_at).getTime(), month: eventMonth(event.starts_at) })),
    ...historical.map(event => ({ kind: "historical" as const, event, time: new Date(`${event.date}T12:00:00+05:30`).getTime(), month: event.date.slice(0, 7) })),
  ].sort((a, b) => b.time - a.time);
  const selected = month ? combined.filter(event => event.month === month) : limit === null ? combined : combined.slice(0, limit);
  return { events: selected.flatMap(row => row.kind === "event" ? [row.event] : []), historical: selected.flatMap(row => row.kind === "historical" ? [row.event] : []) };
}

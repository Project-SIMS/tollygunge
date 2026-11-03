export type AttendanceSheet = { date: string; rows: { number: string; status: string }[] };
export type HistoricalAttendance = { date: string; title: string; source: "workbook" };
export function attendanceMembershipKey(number: string) {
  return number.trim().toLowerCase().replace(/^0+(?=\d)/, "");
}
// Only authoritative membership numbers supplied by the server may be used here.
// Do not match on names, emails shared by households, or editable profile drafts.
export function ownWorkbookAttendance(events: AttendanceSheet[], numbers: string[]): HistoricalAttendance[] {
  const keys = new Set(numbers.map(attendanceMembershipKey).filter(Boolean));
  return events.filter(event => event.rows.some(row => row.status === "Attended" && keys.has(attendanceMembershipKey(row.number))))
    .map(event => ({date: event.date, title: "Association event", source: "workbook" as const}))
    .filter((event, index, all) => all.findIndex(other => other.date === event.date) === index)
    .sort((a, b) => b.date.localeCompare(a.date));
}

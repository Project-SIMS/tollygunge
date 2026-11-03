export type AttendanceSheet = { date: string; title?: string; rows: { number: string; mobile?: string; status: string }[] };
export type HistoricalAttendance = { date: string; title: string; source: "workbook" };
export function attendanceMembershipKey(number: string) {
  return number.trim().toLowerCase().replace(/^0+(?=\d)/, "");
}
export function attendanceMobileKey(value: string) {
  let digits = value.replace(/[+ ().-]/g, "");
  if (/^0091[6-9]\d{9}$/.test(digits)) digits = digits.slice(2);
  if (/^91[6-9]\d{9}$/.test(digits)) digits = digits.slice(2);
  return /^[6-9]\d{9}$/.test(digits) ? digits : "";
}
// Use server-owned membership and accepted mobile fields, never editable drafts.
export function ownWorkbookAttendance(events: AttendanceSheet[], numbers: string[], mobiles: string[] = []): HistoricalAttendance[] {
  const keys = new Set(numbers.map(attendanceMembershipKey).filter(Boolean));
  const phones = new Set(mobiles.map(attendanceMobileKey).filter(Boolean));
  // A phone reused by different workbook membership identities is ambiguous.
  const owners = new Map<string, Set<string>>();
  for (const event of events) for (const row of event.rows) {
    const phone = attendanceMobileKey(row.mobile || ""), number = attendanceMembershipKey(row.number);
    if (phone && number) owners.set(phone, new Set([...(owners.get(phone) || []), number]));
  }
  return events.filter(event => event.rows.some(row => {
    if (row.status !== "Attended") return false;
    if (phones.size) {
      const phone = attendanceMobileKey(row.mobile || "");
      return phones.has(phone) && owners.get(phone)?.size === 1;
    }
    return keys.has(attendanceMembershipKey(row.number));
  }))
    .map(event => ({date: event.date, title: event.title || "Association event", source: "workbook" as const}))
    .filter((event, index, all) => all.findIndex(other => other.date === event.date) === index)
    .sort((a, b) => b.date.localeCompare(a.date));
}

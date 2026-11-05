import test from "node:test";
import assert from "node:assert/strict";
import { upcomingMemberEvents } from "../src/domain/member-upcoming-events";
test("upcoming view includes only active registrations, in date order", () => {
  const base = { registration_status: "registered", starts_at: "2026-12-02T10:00:00Z", ends_at: "2026-12-02T12:00:00Z", completed_at: null, archived_at: null };
  const rows = [
    { ...base, id: "later" },
    { ...base, id: "earlier", starts_at: "2026-11-15T10:00:00Z", ends_at: "2026-11-15T12:00:00Z" },
    { ...base, id: "not-registered", registration_status: null },
    { ...base, id: "cancelled", registration_status: "cancelled" },
    { ...base, id: "completed", completed_at: "2026-11-01T10:00:00Z" },
    { ...base, id: "archived", archived_at: "2026-11-01T10:00:00Z" },
    { ...base, id: "past", ends_at: "2026-09-01T10:00:00Z" },
  ];
  assert.deepEqual(upcomingMemberEvents(rows, Date.parse("2026-11-05T10:00:00Z")).map(event => event.id), ["earlier", "later"]);
  assert.equal(rows[0].id, "later");
});

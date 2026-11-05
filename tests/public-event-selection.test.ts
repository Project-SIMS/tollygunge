import test from "node:test";
import assert from "node:assert/strict";
import { selectPublicEvents, eventMonth } from "../src/domain/public-event-selection";
import { portalNavigation } from "../src/domain/portal-navigation";
const historical = ["2026-11-03", "2026-10-03", "2026-09-02", "2026-08-14"].map(date => ({ date }));
test("latest three are selected across platform and historical events", () => {
  const selection = selectPublicEvents([{ starts_at: "2026-10-20T10:00:00Z" }], historical);
  assert.equal(selection.events.length + selection.historical.length, 3);
  assert.deepEqual(selection.historical.map(event => event.date), ["2026-11-03", "2026-10-03"]);
});
test("month selection includes all matching events and excludes other months", () => {
  const events = Array.from({ length: 4 }, (_, index) => ({ starts_at: `2026-09-${10 + index}T10:00:00Z` }));
  const selection = selectPublicEvents(events, historical, "2026-09");
  assert.equal(selection.events.length, 4);
  assert.deepEqual(selection.historical, [{ date: "2026-09-02" }]);
  assert.deepEqual(selectPublicEvents(events, historical, "2025-01"), { events: [], historical: [] });
  assert.equal(eventMonth("2026-09-30T20:00:00Z"), "2026-10");
});
test("members land in Events and have no Overview navigation", () => {
  const navigation = portalNavigation([]);
  assert.equal(navigation[0].items[0].href, "/member/events");
  assert.ok(!navigation.some(group => group.label === "Overview"));
  assert.ok(portalNavigation(["administrator"]).some(group => group.label === "Overview"));
});

test("member attendance can include full history without changing the public three-event limit", () => {
  assert.equal(selectPublicEvents([], historical, "", null).historical.length, 4);
  assert.equal(selectPublicEvents([], historical).historical.length, 3);
  assert.deepEqual(selectPublicEvents([], historical, "2026-08", null).historical, [{ date: "2026-08-14" }]);
});

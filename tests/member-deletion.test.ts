import test from "node:test";
import assert from "node:assert/strict";
import type { PoolClient } from "pg";
import { deleteMember } from "../src/lib/member-deletion";

function database(row?: Record<string, unknown>) {
  const calls: { sql: string; values: unknown[] }[] = [];
  const client = {
    async query(sql: string, values: unknown[] = []) {
      calls.push({ sql, values });
      return { rows: calls.length === 1 && row ? [row] : [], rowCount: 1 };
    },
  } as unknown as Pick<PoolClient, "query">;
  return { client, calls };
}

test("member deletion archives the profile, records history and preserves linked data", async () => {
  const db = database({ person_version: 3, membership_version: 2, archived_at: null });
  assert.deepEqual(await deleteMember(db.client, "admin", "person", 3, 2), {
    deleted: true, recoverable: true,
  });
  assert.match(db.calls[0].sql, /FOR UPDATE OF p,m/);
  assert.match(db.calls[1].sql, /archived_at=now\(\),published=NULL,version=version\+1/);
  assert.match(db.calls[2].sql, /tpa.person_revisions/);
  assert.equal(db.calls[3].values[1], "member.deleted");
  assert.ok(db.calls.every(({ sql }) => !/\bDELETE\b|UPDATE public\.|UPDATE tpa\.memberships/i.test(sql)));
});

for (const [name, row, expectedStatus] of [
  ["missing member", undefined, 404],
  ["stale profile", { person_version: 4, membership_version: 2 }, 409],
  ["stale membership", { person_version: 3, membership_version: 4 }, 409],
  ["already archived member", { person_version: 3, membership_version: 2, archived_at: new Date() }, 409],
] as const) {
  test(`member deletion rejects ${name} without writing`, async () => {
    const db = database(row);
    await assert.rejects(deleteMember(db.client, "admin", "person", 3, 2),
      (error: unknown) => (error as { status: number }).status === expectedStatus);
    assert.equal(db.calls.length, 1);
  });
}

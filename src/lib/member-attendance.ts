import "server-only";
import type { Pool, PoolClient } from "pg";
import { loadWorkbookAttendance } from "./workbook-attendance";
import { ownWorkbookAttendance } from "@/domain/member-attendance";

export async function memberWorkbookAttendance(db: Pool | PoolClient, userId: string) {
  // Fail closed for a number shared by multiple people, even if only one is linked.
  const { rows } = await db.query<{ membership_number: string }>(`
    SELECT m.membership_number FROM tpa.memberships m
    JOIN tpa.people p ON p.id=m.person_id WHERE p.user_id=$1
    AND nullif(btrim(m.membership_number),'') IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM tpa.memberships other
      WHERE other.person_id<>m.person_id
      AND ltrim(lower(btrim(other.membership_number)),'0')=ltrim(lower(btrim(m.membership_number)),'0')
    )`, [userId]);
  if (!rows.length) return [];
  return ownWorkbookAttendance(await loadWorkbookAttendance(), rows.map(row => row.membership_number));
}

import { randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import { OperationError } from "./operation-error";
import { audit } from "./operation-audit";

/** Run inside a transaction. Keep membership/account history recoverable. */
export async function deleteMember(
  client: Pick<PoolClient, "query">,
  actorId: string,
  personId: string,
  personVersion: number,
  membershipVersion: number,
) {
  const member = (await client.query(
    `SELECT p.version AS person_version,p.archived_at,m.version AS membership_version
     FROM tpa.people p JOIN tpa.memberships m ON m.person_id=p.id
     WHERE p.id=$1 FOR UPDATE OF p,m`, [personId],
  )).rows[0];
  if (!member) throw new OperationError("Member not found.", 404);
  if (member.archived_at) throw new OperationError("Member is already deleted.", 409);
  if (member.person_version !== personVersion || member.membership_version !== membershipVersion)
    throw new OperationError("Member changed. Reload before deleting.", 409);
  await client.query(
    "UPDATE tpa.people SET archived_at=now(),published=NULL,version=version+1,updated_at=now() WHERE id=$1", [personId],
  );
  await client.query(
    "INSERT INTO tpa.person_revisions(id,person_id,version,action,body,actor_id) SELECT $1,id,version,'archive',draft,$2 FROM tpa.people WHERE id=$3",
    [randomUUID(), actorId, personId],
  );
  await audit(client as PoolClient, actorId, "member.deleted", personId);
  return { deleted: true, recoverable: true };
}

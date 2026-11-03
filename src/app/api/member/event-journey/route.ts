import { authorized, operation } from '@/lib/operation-api';
import { getDatabase } from '@/lib/database';
import { memberEventJourney } from '@/lib/event-engagement';
import { memberWorkbookAttendance } from '@/lib/member-attendance';
export const runtime='nodejs';
export async function GET(request:Request) { return operation(async()=>{
 const actor=await authorized(request),db=getDatabase();
 const [journey,historicalAttendance,attendedEvents]=await Promise.all([
  memberEventJourney(db,actor.id),
  memberWorkbookAttendance(db,actor.id),
  db.query(`SELECT DISTINCT e.id,e.title,e.starts_at FROM tpa.event_registrations r JOIN tpa.event_attendance a ON a.registration_id=r.id JOIN tpa.events e ON e.id=r.event_id WHERE r.user_id=$1 AND a.outcome='attended' ORDER BY e.starts_at DESC`,[actor.id])
 ]);
 return {...journey,historicalAttendance,attendedEvents:attendedEvents.rows};
 }); }

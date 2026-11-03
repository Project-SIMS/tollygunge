import test from "node:test";
import assert from "node:assert/strict";
import { ownWorkbookAttendance } from "../src/domain/member-attendance";
const sheets = [
  {date: "2026-09-02",rows: [{number: "060477",status: "Attended"},{number: "999",status: "Attended"}]},
  {date: "2026-08-14",rows: [{number: "60477",status: "Not attended"}]},
  {date: "2026-10-03",rows: [{number: "60477",status: "Not recorded"}]},
];
test("only returns the signed-in member's explicitly attended dates", () => {
  assert.deepEqual(ownWorkbookAttendance(sheets,["60477"]),[{date:"2026-09-02",title:"Association event",source:"workbook"}]);
  assert.deepEqual(ownWorkbookAttendance(sheets,[]),[]);
  assert.deepEqual(ownWorkbookAttendance(sheets,["unknown"]),[]);
});
test("deduplicates repeated rows and sheets while sorting newest first", () => {
 const event={date:"2026-07-16",rows:[{number:"60477",status:"Attended"},{number:"060477",status:"Attended"}]};
 assert.deepEqual(ownWorkbookAttendance([...sheets,event,event],["60477"]).map(e=>e.date),["2026-09-02","2026-07-16"]);
});

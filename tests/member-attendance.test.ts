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
test("mobile matching handles Indian country codes and only explicit attendance", () => {
 const rows=[
  {date:"2026-07-16",rows:[{number:"0123",mobile:"98765 43210",status:"Attended"}]},
  {date:"2026-08-14",rows:[{number:"123",mobile:"+91 9876543210",status:"Attended"}]},
  {date:"2026-10-03",rows:[{number:"123",mobile:"919876543210",status:"Not recorded"}]},
 ];
 assert.equal(ownWorkbookAttendance(rows,[],["+919876543210"]).length,2);
 assert.equal(ownWorkbookAttendance(rows,["123"],["9999999999"]).length,0);
 assert.equal(ownWorkbookAttendance(rows,[],[""]).length,0);
});
test("a mobile shared by different workbook memberships never grants attendance", () => {
 const rows=[{date:"2026-07-16",rows:[{number:"123",mobile:"9876543210",status:"Attended"},{number:"456",mobile:"+919876543210",status:"Attended"}]}];
 assert.deepEqual(ownWorkbookAttendance(rows,["123"],["9876543210"]),[]);
});

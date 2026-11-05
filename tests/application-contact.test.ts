import test from "node:test";
import assert from "node:assert/strict";
import { registeredApplicationContact, prefillApplicationPhone } from "../src/domain/application-contact";
test("registered contacts prefer the admin member record with accepted/account fallbacks", () => {
  assert.deepEqual(registeredApplicationContact({ contact_email: "member@example.test", mobile_normalized: "+919876543210", accepted: { email: "old@example.test", phone: "old" } }, "account@example.test"), { email: "member@example.test", phone: "+919876543210" });
  assert.deepEqual(registeredApplicationContact({ accepted: { phone: "9876543210" } }, "account@example.test"), { email: "account@example.test", phone: "9876543210" });
  assert.deepEqual(registeredApplicationContact(null, "account@example.test"), { email: "account@example.test", phone: "" });
});
test("existing drafts receive missing admin phone details without losing member edits", () => {
  const saved = { fullName: "Example member", phone: "", qualification: "CA" };
  assert.deepEqual(prefillApplicationPhone(saved, "9876543210"), { ...saved, phone: "9876543210" });
  assert.equal(saved.phone, "");
  assert.equal(prefillApplicationPhone({ phone: "9123456789" }, "9876543210").phone, "9123456789");
});

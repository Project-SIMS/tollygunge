import test from "node:test";
import assert from "node:assert/strict";
import { copyOfficeToResidence, emptyAddress } from "../src/domain/address";
test("same-as-office copies structured and display addresses without changing unrelated details", () => {
  const structured = JSON.stringify({ ...emptyAddress, line1: "Example office", postalCode: "768018" });
  const original = { officeAddress: "Example office", officeAddressStructured: structured, residenceAddress: "Old residence", phone: "unchanged" };
  const copied = copyOfficeToResidence(original);
  assert.equal(copied.residenceAddress, "Example office");
  assert.equal(copied.residenceAddressStructured, structured);
  assert.equal(copied.phone, "unchanged");
  assert.equal(original.residenceAddress, "Old residence");
  assert.equal(copyOfficeToResidence({ ...copied, officeAddress: "Updated office" }).residenceAddress, "Updated office");
});
test("copying a legacy office address removes stale residential structured details", () => {
  const copied = copyOfficeToResidence({ officeAddress: "Legacy office", residenceAddressStructured: "stale" });
  assert.equal(copied.residenceAddress, "Legacy office");
  assert.equal(copied.residenceAddressStructured, undefined);
});

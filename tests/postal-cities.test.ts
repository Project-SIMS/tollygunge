import test from "node:test";
import assert from "node:assert/strict";
import { reviewedPostalCities } from "../src/domain/postal-cities";
import { postalCities, validateAddresses } from "../src/lib/member-address";
import { emptyAddress } from "../src/domain/address";
import type { Pool } from "pg";

const db = { query: async (sql: string) => ({ rows:
  sql.includes("postal_versions") ? [{ id: "reference" }] :
  sql.includes("SELECT pin,state,district,locality") ? [{ pin: "768018", state: "Odisha", district: "Sambalpur", locality: "Engineering College Burla" }] : []
}) } as unknown as Pick<Pool, "query">;

test("Burla is available only for reviewed PINs in the matching hierarchy", () => {
  assert.deepEqual(reviewedPostalCities({ pin: "768018", state: "Odisha", district: "Sambalpur" }), ["Burla"]);
  assert.deepEqual(reviewedPostalCities({ pin: "768001", state: "Odisha", district: "Sambalpur" }), []);
  assert.deepEqual(reviewedPostalCities({ pin: "768018", state: "Delhi" }), []);
  assert.deepEqual(reviewedPostalCities({ state: "Odisha", district: "Sambalpur" }), []);
});
test("city lookup suggestions do not constrain manually entered city names", async () => {
  assert.deepEqual(await postalCities(db, "reference", { pin: "768018" }), ["Burla"]);
  const address = { ...emptyAddress, country: "IN", line1: "Example street", postalCode: "768018", state: "Odisha", district: "Sambalpur", postalLocality: "Engineering College Burla", city: "burla" };
  const result = await validateAddresses(db, { office: address });
  assert.equal(result.office?.city, "burla");
  assert.equal((await validateAddresses(db, { office: { ...address, city: "User-entered city", postalLocality: "User-entered locality" } })).office?.postalLocality, "User-entered locality");
});

test("missing city mappings accept manual city while retaining postal validation", async () => {
  const reference = { query: async (sql: string) => ({ rows:
    sql.includes("postal_versions") ? [{ id: "reference" }] :
    sql.includes("SELECT pin,state,district,locality") ? [{ pin: "800001", state: "Bihar", district: "Patna", locality: "Patna GPO" }] : []
  }) } as unknown as Pick<Pool, "query">;
  const address = { ...emptyAddress, country: "IN", line1: "Example", postalCode: "800001", state: "Bihar", district: "Patna", postalLocality: "Patna GPO", city: " Patna " };
  assert.equal((await validateAddresses(reference, { office: address })).office?.city, "Patna");
  await assert.rejects(validateAddresses(reference, { office: { ...address, state: "Odisha" } }));
  assert.equal((await validateAddresses(reference, { office: { ...address, postalLocality: "Manual locality" } })).office?.postalLocality, "Manual locality");
});
test("unmapped PIN permits bounded manual location details", async () => {
  const reference = { query: async (sql: string) => ({ rows: sql.includes("postal_versions") ? [{ id: "reference" }] : [] }) } as unknown as Pick<Pool, "query">;
  const address = { ...emptyAddress, country: "IN", line1: "Example", postalCode: "999999", state: "Example state", district: "Example district", postalLocality: "Example locality", city: "Example city" };
  assert.equal((await validateAddresses(reference, { office: address })).office?.postalLocality, "Example locality");
  await assert.rejects(validateAddresses(reference, { office: { ...address, city: "x".repeat(121) } }));
});

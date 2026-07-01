import test from "node:test";
import assert from "node:assert/strict";
import {
  SIGNUP_SOURCES,
  parseSignupInput,
  buildWaitlistRow,
  classifyInsertResult,
  hashEmail,
} from "../../supabase/functions/signup/contract.mjs";

// These tests pin the public contract of the /functions/v1/signup edge
// function so CI fails if the funnel API surface regresses. They run
// without any Supabase credentials.

test("signup contract: accepts all four landing-funnel sources", () => {
  assert.deepEqual([...SIGNUP_SOURCES], ["hero", "signup", "diagnostic", "founding"]);
  for (const source of SIGNUP_SOURCES) {
    const r = parseSignupInput({ email: `ok-${source}@example.invalid`, source });
    assert.equal(r.ok, true, `source ${source} should be accepted`);
    assert.equal(r.value.source, source);
  }
});

test("signup contract: rejects unknown source", () => {
  const r = parseSignupInput({ email: "ok@example.invalid", source: "bogus" });
  assert.equal(r.ok, false);
  assert.equal(r.error, "Invalid source");
});

test("signup contract: rejects malformed email shapes", () => {
  const bad = [
    "not-an-email",
    "missing-at-sign.example",
    "two@@signs.example",
    "white space@example.invalid",
    "trailing-dot@example.",
    "",
  ];
  for (const email of bad) {
    const r = parseSignupInput({ email, source: "hero" });
    assert.equal(r.ok, false, `expected ${JSON.stringify(email)} to be rejected`);
    assert.equal(r.error, "Invalid email");
  }
});

test("signup contract: normalizes email to trimmed lowercase", () => {
  const r = parseSignupInput({ email: "  Mixed.Case@Example.INVALID  ", source: "hero" });
  assert.equal(r.ok, true);
  assert.equal(r.value.email, "mixed.case@example.invalid");
});

test("signup contract: caps email length at 254 chars", () => {
  const long = "a".repeat(244) + "@example.invalid"; // 244 + 16 = 260
  const r = parseSignupInput({ email: long, source: "hero" });
  assert.equal(r.ok, false);
  assert.equal(r.error, "Invalid email");
});

test("signup contract: name is optional and trimmed; empty becomes null", () => {
  const withName = parseSignupInput({ email: "n@example.invalid", source: "founding", name: "  Ada  " });
  assert.equal(withName.ok, true);
  assert.equal(withName.value.name, "Ada");

  const blank = parseSignupInput({ email: "n@example.invalid", source: "founding", name: "   " });
  assert.equal(blank.ok, true);
  assert.equal(blank.value.name, null);

  const omitted = parseSignupInput({ email: "n@example.invalid", source: "founding" });
  assert.equal(omitted.ok, true);
  assert.equal(omitted.value.name, null);
});

test("signup contract: non-object body is rejected", () => {
  for (const body of [null, undefined, "hi", 42]) {
    const r = parseSignupInput(body);
    assert.equal(r.ok, false);
    assert.equal(r.error, "Invalid body");
  }
});

test("signup contract: buildWaitlistRow always carries country (null if unknown)", () => {
  const row = buildWaitlistRow({ email: "a@example.invalid", source: "hero", name: null, country: null });
  assert.deepEqual(row, { email: "a@example.invalid", source: "hero", country: null });
  assert.equal(Object.prototype.hasOwnProperty.call(row, "name"), false,
    "name omitted when null so DB default applies");
});

test("signup contract: buildWaitlistRow includes name only when present", () => {
  const row = buildWaitlistRow({
    email: "a@example.invalid", source: "founding", name: "Ada", country: "Nigeria",
  });
  assert.deepEqual(row, { email: "a@example.invalid", source: "founding", country: "Nigeria", name: "Ada" });
});

test("signup contract: classifyInsertResult maps Supabase outcomes", () => {
  assert.deepEqual(classifyInsertResult(null), { status: "created" });
  assert.deepEqual(classifyInsertResult({ code: "23505", message: "duplicate" }), { status: "duplicate" });
  assert.deepEqual(classifyInsertResult({ code: "42P01", message: "missing table" }), { status: "error" });
});

test("signup contract: diagnostic → founding handoff is contract-compatible", () => {
  // The diagnostic page captures the email, then the founding page submits
  // again with the same email plus a name. Both submissions must produce
  // valid rows the DB can store; the second is allowed to be a duplicate.
  const diagnostic = parseSignupInput({ email: "applicant@example.invalid", source: "diagnostic" });
  const founding   = parseSignupInput({ email: "applicant@example.invalid", source: "founding", name: "Applicant" });
  assert.equal(diagnostic.ok, true);
  assert.equal(founding.ok, true);

  const firstRow  = buildWaitlistRow({ ...diagnostic.value, country: null });
  const secondRow = buildWaitlistRow({ ...founding.value,  country: null });
  assert.equal(firstRow.source, "diagnostic");
  assert.equal(secondRow.source, "founding");
  assert.equal(secondRow.name, "Applicant");

  // A duplicate on the second submit is the expected, supported behavior.
  assert.deepEqual(
    classifyInsertResult({ code: "23505", message: "duplicate" }),
    { status: "duplicate" },
  );
});

test("signup contract: hashEmail is stable and non-empty for typical inputs", () => {
  const a = hashEmail("hello@example.invalid");
  const b = hashEmail("hello@example.invalid");
  const c = hashEmail("world@example.invalid");
  assert.equal(a, b);
  assert.notEqual(a, c);
  assert.match(a, /^[0-9a-f]+$/);
});

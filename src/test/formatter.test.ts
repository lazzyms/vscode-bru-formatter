import assert from "assert";
import { formatBruDocument } from "../formatter";

describe("formatBruDocument", () => {
  // ─── Simple key-value blocks ────────────────────────────────────────────────

  it("formats a meta block with proper indentation", () => {
    const input = `meta {\nname: My Request\ntype: http\nseq: 1\n}`;
    const expected = `meta {\n  name: My Request\n  type: http\n  seq: 1\n}\n`;
    assert.strictEqual(formatBruDocument(input), expected);
  });

  it("normalises extra whitespace around colon in key-value pairs", () => {
    const input = `meta {\n  name :  My Request\n  type:http\n}`;
    const expected = `meta {\n  name: My Request\n  type: http\n}\n`;
    assert.strictEqual(formatBruDocument(input), expected);
  });

  it("formats a get block", () => {
    const input = `get {\nurl: https://example.com\nbody: none\nauth: none\n}`;
    const expected = `get {\n  url: https://example.com\n  body: none\n  auth: none\n}\n`;
    assert.strictEqual(formatBruDocument(input), expected);
  });

  it("formats a headers block", () => {
    const input = `headers {\nAuthorization: Bearer {{token}}\nContent-Type: application/json\n}`;
    const expected = `headers {\n  Authorization: Bearer {{token}}\n  Content-Type: application/json\n}\n`;
    assert.strictEqual(formatBruDocument(input), expected);
  });

  it("preserves URL values that contain colons", () => {
    const input = `get {\n  url: https://api.example.com/v1\n}`;
    const expected = `get {\n  url: https://api.example.com/v1\n}\n`;
    assert.strictEqual(formatBruDocument(input), expected);
  });

  // ─── Block separation ───────────────────────────────────────────────────────

  it("separates blocks with exactly one blank line", () => {
    const input = `meta {\n  name: Test\n  type: http\n  seq: 1\n}\nget {\n  url: https://example.com\n  body: none\n  auth: none\n}`;
    const expected =
      `meta {\n  name: Test\n  type: http\n  seq: 1\n}\n\n` +
      `get {\n  url: https://example.com\n  body: none\n  auth: none\n}\n`;
    assert.strictEqual(formatBruDocument(input), expected);
  });

  it("collapses multiple blank lines between blocks into one", () => {
    const input = `meta {\n  name: Test\n  type: http\n  seq: 1\n}\n\n\n\nget {\n  url: https://example.com\n  body: none\n  auth: none\n}`;
    const expected =
      `meta {\n  name: Test\n  type: http\n  seq: 1\n}\n\n` +
      `get {\n  url: https://example.com\n  body: none\n  auth: none\n}\n`;
    assert.strictEqual(formatBruDocument(input), expected);
  });

  it("removes empty lines inside a simple block", () => {
    const input = `meta {\n  name: Test\n\n  type: http\n\n  seq: 1\n}`;
    const expected = `meta {\n  name: Test\n  type: http\n  seq: 1\n}\n`;
    assert.strictEqual(formatBruDocument(input), expected);
  });

  // ─── Comments & annotations ─────────────────────────────────────────────────

  it("preserves comments inside blocks with proper indentation", () => {
    const input = `headers {\n# auth header\nAuthorization: Bearer {{token}}\n}`;
    const expected = `headers {\n  # auth header\n  Authorization: Bearer {{token}}\n}\n`;
    assert.strictEqual(formatBruDocument(input), expected);
  });

  it("preserves annotations inside blocks", () => {
    const input = `headers {\n@disabled\nAuthorization: Bearer {{token}}\n}`;
    const expected = `headers {\n  @disabled\n  Authorization: Bearer {{token}}\n}\n`;
    assert.strictEqual(formatBruDocument(input), expected);
  });

  // ─── Raw content blocks ─────────────────────────────────────────────────────

  it("preserves raw JSON body content verbatim", () => {
    const input =
      `body:json {\n` +
      `  {\n` +
      `    "name": "test",\n` +
      `    "value": 42\n` +
      `  }\n` +
      `}`;
    const expected =
      `body:json {\n` +
      `  {\n` +
      `    "name": "test",\n` +
      `    "value": 42\n` +
      `  }\n` +
      `}\n`;
    assert.strictEqual(formatBruDocument(input), expected);
  });

  it("preserves tests block content verbatim", () => {
    const input =
      `tests {\n` +
      `  test("should return 200", function() {\n` +
      `    expect(res.getStatus()).to.equal(200);\n` +
      `  });\n` +
      `}`;
    const expected =
      `tests {\n` +
      `  test("should return 200", function() {\n` +
      `    expect(res.getStatus()).to.equal(200);\n` +
      `  });\n` +
      `}\n`;
    assert.strictEqual(formatBruDocument(input), expected);
  });

  it("preserves script:pre-request block content verbatim", () => {
    const input =
      `script:pre-request {\n` +
      `  const token = bru.getEnvVar("token");\n` +
      `  req.setHeader("Authorization", "Bearer " + token);\n` +
      `}`;
    const expected =
      `script:pre-request {\n` +
      `  const token = bru.getEnvVar("token");\n` +
      `  req.setHeader("Authorization", "Bearer " + token);\n` +
      `}\n`;
    assert.strictEqual(formatBruDocument(input), expected);
  });

  it("preserves docs block content verbatim", () => {
    const input = `docs {\n  This endpoint returns all users.\n  Requires authentication.\n}`;
    const expected = `docs {\n  This endpoint returns all users.\n  Requires authentication.\n}\n`;
    assert.strictEqual(formatBruDocument(input), expected);
  });

  // ─── Full document ───────────────────────────────────────────────────────────

  it("formats a complete POST request document", () => {
    const input =
      `meta {\nname: Create User\ntype: http\nseq: 1\n}\n\n` +
      `post {\nurl: https://api.example.com/users\nbody: json\nauth: none\n}\n\n` +
      `headers {\nContent-Type: application/json\n}\n\n` +
      `body:json {\n  {\n    "name": "Alice"\n  }\n}`;

    const expected =
      `meta {\n  name: Create User\n  type: http\n  seq: 1\n}\n\n` +
      `post {\n  url: https://api.example.com/users\n  body: json\n  auth: none\n}\n\n` +
      `headers {\n  Content-Type: application/json\n}\n\n` +
      `body:json {\n  {\n    "name": "Alice"\n  }\n}\n`;

    assert.strictEqual(formatBruDocument(input), expected);
  });

  it("ensures exactly one trailing newline", () => {
    const input = `meta {\n  name: Test\n  type: http\n  seq: 1\n}\n\n\n`;
    const result = formatBruDocument(input);
    assert.ok(result.endsWith("\n"), "result should end with newline");
    assert.ok(
      !result.endsWith("\n\n"),
      "result should not end with double newline"
    );
  });

  it("formats vars:post-response with function-call values", () => {
    const input = `vars:post-response {\nprojectId: res('@id')\ndefaultBranchId: res('defaultBranch.@id')\n}`;
    const expected = `vars:post-response {\n  projectId: res('@id')\n  defaultBranchId: res('defaultBranch.@id')\n}\n`;
    assert.strictEqual(formatBruDocument(input), expected);
  });

  it("formats settings block", () => {
    const input = `settings {\nencodeUrl: true\ntimeout: 0\n}`;
    const expected = `settings {\n  encodeUrl: true\n  timeout: 0\n}\n`;
    assert.strictEqual(formatBruDocument(input), expected);
  });
});

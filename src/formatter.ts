/**
 * Blocks whose content is raw code/text (JavaScript, JSON, XML, plain text)
 * and should be preserved as-is (only trailing whitespace stripped per line).
 */
const RAW_CONTENT_BLOCK_NAMES = new Set([
  "tests",
  "docs",
  "body:json",
  "body:xml",
  "body:text",
  "body:graphql",
  "body:graphql:vars",
  "body:multipart-form",
  "body:form-urlencoded",
  "body:bytes",
  "script:pre-request",
  "script:post-response",
]);

/**
 * Returns true if the given block name should have its content preserved as-is.
 */
function isRawBlock(name: string): boolean {
  return (
    RAW_CONTENT_BLOCK_NAMES.has(name) ||
    name.startsWith("body:") ||
    name.startsWith("script:")
  );
}

/**
 * Formats a single key-value line inside a simple block.
 * Normalises indentation to 2 spaces and ensures exactly one space after the
 * first colon separator.
 *
 * Lines starting with `#` (comments) or `@` (annotations) are indented but
 * otherwise left unchanged.
 */
function formatKeyValueLine(rawLine: string): string {
  const trimmed = rawLine.trim();

  if (trimmed === "") {
    return "";
  }

  // Comments and annotations: just re-indent
  if (trimmed.startsWith("#") || trimmed.startsWith("@")) {
    return `  ${trimmed}`;
  }

  // Key: value pairs – split on the FIRST colon only
  const colonIdx = trimmed.indexOf(":");
  if (colonIdx > 0) {
    const key = trimmed.substring(0, colonIdx).trimEnd();
    const value = trimmed.substring(colonIdx + 1).trim();
    return `  ${key}: ${value}`;
  }

  // Fallback: just re-indent
  return `  ${trimmed}`;
}

/**
 * Formats a complete `.bru` document string and returns the formatted result.
 *
 * Formatting rules applied:
 * - Top-level blocks are separated by exactly one blank line.
 * - Each block opens with `blockName {` and closes with `}` on its own line.
 * - Simple key-value blocks (meta, get, post, headers, …) have their contents
 *   normalised to 2-space indentation and `key: value` spacing.
 * - Raw content blocks (body:json, tests, script:*, docs, …) have their
 *   contents preserved verbatim (trailing whitespace stripped per line only).
 * - A single trailing newline is added to the output.
 */
export function formatBruDocument(text: string): string {
  const lines = text.split(/\r?\n/);

  // Drop trailing blank lines so we can add exactly one at the end
  while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
    lines.pop();
  }

  const blocks: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip blank lines between blocks
    if (trimmed === "") {
      i++;
      continue;
    }

    // Match a top-level block opener: "blockName {" (possibly with colons,
    // hyphens or underscores in the name, e.g. "body:json", "vars:pre-request")
    const blockMatch = trimmed.match(/^([a-zA-Z][a-zA-Z0-9:._-]*)\s*\{$/);
    if (blockMatch) {
      const blockName = blockMatch[1];
      const raw = isRawBlock(blockName);
      const blockLines: string[] = [`${blockName} {`];
      i++;

      // Collect lines until we find the matching closing `}` at column 0.
      // In the .bru format every block closer appears un-indented on its own
      // line, so this simple heuristic is reliable.
      while (i < lines.length) {
        const inner = lines[i];
        const innerTrimmed = inner.trimEnd();

        if (innerTrimmed === "}") {
          blockLines.push("}");
          i++;
          break;
        }

        if (raw) {
          // Preserve raw content; just strip trailing whitespace
          blockLines.push(innerTrimmed);
        } else {
          const formatted = formatKeyValueLine(inner);
          if (formatted !== "") {
            blockLines.push(formatted);
          }
          // empty lines inside simple blocks are dropped
        }

        i++;
      }

      blocks.push(blockLines.join("\n"));
    } else {
      // Non-block top-level content is passed through unchanged
      blocks.push(trimmed);
      i++;
    }
  }

  return blocks.join("\n\n") + "\n";
}

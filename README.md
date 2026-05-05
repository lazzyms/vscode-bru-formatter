# vscode-bru-formatter

A VS Code extension that provides document formatting for [Bruno](https://www.usebruno.com/) API request files (`.bru`).

## Features

- **Format on Save** – Automatically format `.bru` files when you save (requires `editor.formatOnSave: true`).
- **Format Document** – Use the VS Code command palette (`Format Document`) or the keyboard shortcut to format the active `.bru` file.
- **Consistent block structure** – Each top-level block is separated by exactly one blank line, opens with `blockName {`, and closes with `}` on its own line.
- **Normalised key-value pairs** – Inside simple blocks (`meta`, HTTP method blocks, `headers`, `params`, `auth:*`, `vars`, `settings`, …) each entry is indented with 2 spaces and formatted as `key: value`.
- **Preserved raw content** – The contents of raw blocks (`body:json`, `body:xml`, `tests`, `script:pre-request`, `script:post-response`, `docs`, …) are left exactly as written; only trailing whitespace per line is trimmed.
- **Comment & annotation support** – Lines starting with `#` (comments) or `@` (annotations) are indented correctly and otherwise preserved.

## Example

**Before formatting:**
```
meta {
name: Create User
type: http
seq: 1
}
post {
  url: https://api.example.com/users
  body: json
    auth: none
}
headers {
Content-Type: application/json
}
body:json {
  {
    "name": "Alice"
  }
}
```

**After formatting:**
```
meta {
  name: Create User
  type: http
  seq: 1
}

post {
  url: https://api.example.com/users
  body: json
  auth: none
}

headers {
  Content-Type: application/json
}

body:json {
  {
    "name": "Alice"
  }
}
```

## Usage

The extension activates automatically for any file with the `.bru` extension. It registers itself as the **default formatter** for the `bru` language, so you can format with:

- **Format Document**: `Shift+Alt+F` (Windows/Linux) / `Shift+Option+F` (macOS)
- **Format on Save**: add `"editor.formatOnSave": true` to your VS Code settings.

## Development

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Bundle for packaging
npm run build

# Run tests
npm test
```

## License

MIT
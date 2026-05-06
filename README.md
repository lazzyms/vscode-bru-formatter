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

## Publishing

The extension is published to the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=lazzyms.vscode-bru-formatter) automatically via GitHub Actions whenever a new version tag is pushed.

### Release steps

1. Bump the `version` field in `package.json` (follow [semver](https://semver.org/)).
2. Commit the version bump and push to `master`.
3. Create and push a matching `vX.Y.Z` tag:
   ```bash
   git tag v0.2.0
   git push origin v0.2.0
   ```

The [publish workflow](.github/workflows/publish.yml) will then:
- Install dependencies and run all tests.
- Bundle the extension with esbuild (`vscode:prepublish`).
- Publish to the VS Code Marketplace using the `VSCE_PAT` repository secret.
- Attach the packaged `.vsix` file to the GitHub Release created for the tag.

### Setting up the `VSCE_PAT` secret

1. Generate a Personal Access Token (PAT) in [Azure DevOps](https://dev.azure.com) with the **Marketplace (Publish)** scope (see the [official guide](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#get-a-personal-access-token)).
2. Add it as a repository secret named **`VSCE_PAT`** under *Settings → Secrets and variables → Actions*.

## License

MIT
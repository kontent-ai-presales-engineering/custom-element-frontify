[![MIT License][license-shield]][license-url]
[![Discord][discord-shield]][discord-url]

# Kontent.ai — Frontify Custom Element

A [Kontent.ai custom element](https://kontent.ai/learn/docs/custom-elements) that lets content editors browse and select assets from [Frontify](https://www.frontify.com/) without leaving the Kontent.ai content editor.

The element uses the [Frontify Finder](https://github.com/Frontify/frontify-finder) library to embed an inline asset picker, authenticates editors via OAuth 2.0, and stores the selected asset metadata as the element's value.

---

## Features

- Browse and select assets from your Frontify Digital Asset Management system
- Preview thumbnails, file names, types, and sizes displayed inside Kontent.ai
- Supports single or multi-asset selection (configurable per content type)
- Remove individual assets or clear all selections
- Read-only mode respects Kontent.ai's disabled state (e.g. published items)
- Dynamic height — the element iframe expands when the Finder panel is open

---

## Getting Started

### Prerequisites

- A Frontify account with at least one brand/library
- An OAuth 2.0 application registered in the [Frontify developer portal](https://developer.frontify.com/)
  - Set the **Redirect URI** to the URL where you will host this custom element

### Running locally

1. Install dependencies:
   ```bash
   npm ci
   ```
2. Start the development server (HTTPS, required by the Custom Element API):
   ```bash
   npm run dev
   ```
3. Open the printed localhost URL and add it as a custom element in a Kontent.ai content type (see [Configuration](#configuration) below).

### Building for production

```bash
npm run build
```

The output is in the `dist/` folder. Host it on any static file host (Vercel, Netlify, GitHub Pages, Azure Static Web Apps, etc.) and use that URL as the custom element URL in Kontent.ai.

---

## Configuration

When adding this element to a content type in Kontent.ai, provide the following JSON in the **Configuration** field:

```json
{
  "frontifyDomain": "yourcompany.frontify.com",
  "clientId": "your-oauth-client-id",
  "multiSelect": true
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `frontifyDomain` | `string` | Yes | Your Frontify domain, e.g. `mycompany.frontify.com` |
| `clientId` | `string` | Yes | OAuth 2.0 client ID from your Frontify developer portal |
| `multiSelect` | `boolean` | No | Allow selecting multiple assets per session. Defaults to `false` |

---

## Stored value

The element stores a JSON object with the following shape:

```ts
{
  assets: Array<{
    id: string;
    title: string;
    type: string;           // e.g. "IMAGE", "DOCUMENT", "VIDEO"
    previewUrl: string | null;
    downloadUrl: string | null;
    filename: string | null;
    extension: string | null;
    width: number | null;
    height: number | null;
    size: number | null;    // bytes
  }>
}
```

You can read this value from the Kontent.ai Delivery API and use `previewUrl` or `downloadUrl` to render assets in your front end.

---

## How it works

1. The editor clicks **"Select from Frontify"**.
2. The Frontify Finder library opens an OAuth 2.0 popup (first time only; subsequent visits use cached credentials).
3. Once authenticated, the Finder renders an inline browsing panel inside the custom element iframe.
4. The editor selects one or more assets and confirms.
5. Asset metadata is saved to the element's value in Kontent.ai.

When `multiSelect` is `true`, each time the editor opens the Finder the newly selected assets are appended to the existing list. When `multiSelect` is `false`, the selection replaces the previous value.

---

## Project structure

```
src/
  customElement/
    types/
      customElement.d.ts   # Kontent.ai Custom Element API type declarations
    CustomElementContext.tsx # Core context — wraps CustomElement.init(), height, disabled state
    EnsureKontentAsParent.tsx # Guards against opening the element outside Kontent.ai
    config.ts              # Config type (frontifyDomain, clientId, multiSelect) + validator
    selectors.ts           # Wrappers around the Custom Element API (useElements, promptToSelectAssets, …)
    value.ts               # Value type (FrontifyAsset[]) + JSON parser
  types/
    frontify-finder.d.ts   # TypeScript shim for @frontify/frontify-finder
    vite-env.d.ts
  IntegrationApp.tsx       # Main UI — asset grid, empty state, inline Finder panel
  IntegrationApp.css       # Styles for the Frontify element UI
  main.tsx                 # React entry point
public/
  kontent-ai-app-styles.css  # Kontent.ai UI styles
index.html                   # Loads the Custom Element API script from Kontent.ai CDN
```

---

## Available hooks and utilities

These are provided by `CustomElementContext` and `selectors.ts` and can be used anywhere inside the element tree.

| Hook / function | Description |
|---|---|
| `useConfig()` | Returns the validated element configuration |
| `useValue()` | Returns `[value, setValue]` — read and write the element's stored value |
| `useIsDisabled()` | `true` when the element should be read-only (published item, insufficient permissions) |
| `useEnvironmentId()` | The Kontent.ai environment ID |
| `useItemInfo()` | Metadata about the current content item (name, codename, collection, type) |
| `useVariantInfo()` | The current language variant ID and codename |
| `useElements(codenames)` | Subscribe to the values of other elements in the same item |
| `promptToSelectAssets(options)` | Open the Kontent.ai asset picker |
| `promptToSelectItems(options)` | Open the Kontent.ai content item picker |

---

## License

Distributed under the MIT License. See [`LICENSE.md`](./LICENSE.md) for more information.


[license-shield]: https://img.shields.io/github/license/kontent-ai/custom-element-starter-react.svg?style=for-the-badge
[license-url]: https://github.com/kontent-ai/custom-element-starter-react/blob/master/LICENSE.md
[discord-shield]: https://img.shields.io/discord/821885171984891914?color=%237289DA&label=Kontent.ai%20Discord&logo=discord&style=for-the-badge
[discord-url]: https://discord.com/invite/SKCxwPtevJ

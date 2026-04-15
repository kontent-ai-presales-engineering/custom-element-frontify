// Type shim for @frontify/frontify-finder.
// The package ships types at dist/index.d.ts but its package.json "exports"
// field omits the "types" condition, so TypeScript's bundler module resolver
// cannot find them automatically. This file re-declares the public surface.

declare module '@frontify/frontify-finder' {
  export interface FinderOptions {
    allowMultiSelect?: boolean;
    autoClose?: boolean;
    permanentDownloadUrls?: boolean;
    filters?: Array<{ key: string; values: string[]; inverted: boolean }>;
  }

  export interface FrontifyAsset {
    id: string;
    externalId: string | null;
    title: string;
    description: string | null;
    type: string;
    author: string | null;
    createdAt: string;
    expiresAt: string | null;
    previewUrl?: string;
    thumbnailUrl?: string | null;
    dynamicPreviewUrl?: string | null;
    downloadUrl?: string | null;
    filename?: string | null;
    extension?: string;
    size?: number | null;
    width?: number;
    height?: number;
    duration?: number;
    bitrate?: number;
    pageCount?: number | null;
    focalPoint?: number[] | null;
  }

  export interface FrontifyFinderInstance {
    mount(parentNode: HTMLElement): void;
    onAssetsChosen(callback: (assets: FrontifyAsset[]) => void): FrontifyFinderInstance;
    onCancel(callback: () => void): FrontifyFinderInstance;
    close(): void;
  }

  export interface OpeningOptions {
    clientId: string;
    domain?: string;
    options?: FinderOptions;
  }

  /** create() is async — it handles OAuth authentication before resolving. */
  export function create(options: OpeningOptions): Promise<FrontifyFinderInstance>;

  export function logout(options: { clientId: string }): Promise<void>;
}

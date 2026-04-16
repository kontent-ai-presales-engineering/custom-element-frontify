import { useCallback, useEffect, useRef, useState } from 'react';
import { create } from '@frontify/frontify-finder';
import type { FrontifyFinderInstance, FrontifyAsset as FinderAsset } from '@frontify/frontify-finder';
import { useConfig, useIsDisabled, useValue } from './customElement/CustomElementContext';
import type { FrontifyAsset } from './customElement/value';
import './IntegrationApp.css';

// ---- Icons ---- //

const IconFrontify = () => (
  <svg className="frontify-logo" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18L20 8.5v7L12 19.82 4 15.5v-7l8-4.32z" />
  </svg>
);

const IconClose = () => (
  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <line x1="1" y1="1" x2="11" y2="11" />
    <line x1="11" y1="1" x2="1" y2="11" />
  </svg>
);

const IconFile = () => (
  <svg className="frontify-asset-card__placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const IconImage = () => (
  <svg className="frontify-empty__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

// ---- Utilities ---- //

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/** Map a raw Frontify Finder asset to our stored value shape. */
const mapAsset = (raw: FinderAsset): FrontifyAsset => ({
  id: raw.id,
  title: raw.title ?? '',
  type: raw.type ?? '',
  previewUrl: raw.previewUrl ?? null,
  downloadUrl: raw.downloadUrl ?? null,
  filename: raw.filename ?? null,
  extension: raw.extension ?? null,
  width: raw.width ?? null,
  height: raw.height ?? null,
  size: raw.size ?? null,
});

// ---- Asset card ---- //

type AssetCardProps = {
  asset: FrontifyAsset;
  onRemove: (id: string) => void;
  isDisabled: boolean;
};

const AssetCard = ({ asset, onRemove, isDisabled }: AssetCardProps) => (
  <div className="frontify-asset-card">
    {asset.previewUrl ? (
      <img
        className="frontify-asset-card__preview"
        src={asset.previewUrl}
        alt={asset.title}
        loading="lazy"
      />
    ) : (
      <div className="frontify-asset-card__placeholder">
        <IconFile />
      </div>
    )}

    <div className="frontify-asset-card__info">
      <p className="frontify-asset-card__title" title={asset.title}>
        {asset.title || asset.filename || 'Untitled'}
      </p>
      <div className="frontify-asset-card__meta">
        {asset.extension && (
          <span className="frontify-asset-card__type">{asset.extension.toUpperCase()}</span>
        )}
        {asset.size !== null && (
          <span className="frontify-asset-card__size">{formatBytes(asset.size)}</span>
        )}
      </div>
    </div>

    {!isDisabled && (
      <button
        className="frontify-asset-card__remove"
        onClick={() => onRemove(asset.id)}
        title="Remove asset"
        aria-label={`Remove ${asset.title}`}
      >
        <IconClose />
      </button>
    )}
  </div>
);

// ---- Main component ---- //

export const IntegrationApp = () => {
  const config = useConfig();
  const isDisabled = useIsDisabled();
  const [value, setValue] = useValue();

  const [isFinderOpen, setIsFinderOpen] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const finderContainerRef = useRef<HTMLDivElement>(null);
  const finderInstanceRef = useRef<FrontifyFinderInstance | null>(null);

  const assets = value?.assets ?? [];

  // Clean up the finder on unmount
  useEffect(() => {
    return () => {
      finderInstanceRef.current?.close();
    };
  }, []);

  const openFinder = useCallback(() => {
    const container = finderContainerRef.current;
    if (!container || isFinderOpen || isAuthenticating || isDisabled) return;

    setIsAuthenticating(true);
    setIsFinderOpen(true);

    // create() is async: it opens an OAuth popup/redirect via the
    // @frontify/frontify-authenticator package, then resolves once authenticated.
    create({
      clientId: config.clientId,
      domain: config.frontifyDomain.replace(/\/+$/, ''),
      options: {
        allowMultiSelect: config.multiSelect ?? false,
        autoClose: true,
      },
    })
      .then((finder) => {
        finderInstanceRef.current = finder;
        setIsAuthenticating(false);
        finder.mount(container);

        finder.onAssetsChosen((selectedAssets) => {
          const newAssets = selectedAssets.map(mapAsset);

          // Append when multiSelect is on, replace otherwise
          const updatedAssets = (config.multiSelect ?? false)
            ? [...assets, ...newAssets]
            : newAssets;

          setValue({ assets: updatedAssets });
          finderInstanceRef.current = null;
          setIsFinderOpen(false);
        });

        finder.onCancel(() => {
          finderInstanceRef.current = null;
          setIsFinderOpen(false);
        });
      })
      .catch(() => {
        // Authentication was cancelled or failed — close the panel silently
        finderInstanceRef.current = null;
        setIsAuthenticating(false);
        setIsFinderOpen(false);
      });
  }, [config, assets, setValue, isFinderOpen, isAuthenticating, isDisabled]);

  const closeFinder = useCallback(() => {
    finderInstanceRef.current?.close();
    finderInstanceRef.current = null;
    setIsFinderOpen(false);
    setIsAuthenticating(false);
  }, []);

  const removeAsset = useCallback(
    (assetId: string) => {
      setValue({ assets: assets.filter((a) => a.id !== assetId) });
    },
    [assets, setValue],
  );

  const clearAll = useCallback(() => {
    setValue({ assets: [] });
  }, [setValue]);

  const hasAssets = assets.length > 0;
  const selectLabel =
    hasAssets && (config.multiSelect ?? false) ? 'Add from Frontify' : 'Select from Frontify';

  return (
    <div className="frontify-element">
      {/* Toolbar – hidden while the Finder panel is open */}
      {!isFinderOpen && (
        <div className="frontify-toolbar">
          {!isDisabled && (
            <button className="frontify-btn frontify-btn--primary" onClick={openFinder}>
              <IconFrontify />
              {selectLabel}
            </button>
          )}
          {hasAssets && !isDisabled && (
            <button className="frontify-btn frontify-btn--danger" onClick={clearAll}>
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Asset grid */}
      {hasAssets && !isFinderOpen && (
        <div className="frontify-assets">
          {assets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onRemove={removeAsset}
              isDisabled={isDisabled}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!hasAssets && !isFinderOpen && (
        <div className="frontify-empty">
          <IconImage />
          <p className="frontify-empty__text">
            {isDisabled
              ? 'No assets have been selected.'
              : 'No assets selected. Click "Select from Frontify" to browse your brand assets.'}
          </p>
        </div>
      )}

      {/* Frontify Finder panel (inline iframe, mounted by the library) */}
      {isFinderOpen && (
        <div className="frontify-finder-panel">
          <div className="frontify-finder-panel__header">
            <span className="frontify-finder-panel__title">
              <IconFrontify />
              {isAuthenticating ? 'Authenticating with Frontify…' : 'Browse Frontify'}
            </span>
            <button className="frontify-btn frontify-btn--secondary" onClick={closeFinder}>
              Cancel
            </button>
          </div>
          {/* The Finder library mounts its iframe into this div */}
          <div className="frontify-finder-container" ref={finderContainerRef} />
        </div>
      )}
    </div>
  );
};

IntegrationApp.displayName = 'IntegrationApp';

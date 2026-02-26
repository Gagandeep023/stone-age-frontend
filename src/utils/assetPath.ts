import { createContext, useContext } from 'react';

export const AssetContext = createContext<string>('/assets/stone-age');

export function useAssetPath() {
  return useContext(AssetContext);
}

export function assetUrl(basePath: string, path: string): string {
  return `${basePath}/${path}`;
}

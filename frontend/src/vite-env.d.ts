/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Mapbox GL JS access token. When unset, the map renders a placeholder. */
  readonly VITE_MAPBOX_TOKEN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

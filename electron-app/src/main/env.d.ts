/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MAIN_VITE_ELECTRON_RENDERER_URL: string;
  readonly MAIN_VITE_COMPANY_NAME: string;
  readonly MAIN_VITE_COMPANY_ADDRESS: string;
  readonly MAIN_VITE_COMPANY_PHONE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export interface ApiTestSetupResult {
  call: (method: string, req?: unknown) => Promise<any>;
  call$: (method: string, req?: unknown) => any;
  stop: () => Promise<void>;
}

export type ApiTestSetup = () => ApiTestSetupResult | Promise<ApiTestSetupResult>;

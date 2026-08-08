import type { APIRequestContext, APIResponse } from '@playwright/test';

/** Auth state shared by reference across every client an ApiFactory creates. Mutating `token` after clients are cached still takes effect on their next request. */
export interface AuthState {
  token?: string;
}

interface RequestOptions {
  data?: unknown;
  params?: Record<string, string | number>;
  /** Retry on transient infrastructure failures (502/503/504/520/524). Defaults to true. */
  retry?: boolean;
}

// Infrastructure-layer failures worth retrying -- NOT a plain 500 (real app bug, retrying just
// delays the failure) and NOT any 4xx (the request itself is wrong, retrying won't fix that).
const RETRYABLE_STATUS_CODES = new Set([502, 503, 504, 520, 524]);
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000; // exponential backoff: 1s, 2s, 4s

/** Thin wrapper around Playwright's APIRequestContext: attaches the bearer token when authenticated, retries transient failures, and surfaces non-2xx responses as errors instead of silently returning them. */
export class BaseApiClient {
  constructor(
    protected readonly request: APIRequestContext,
    protected readonly authState: AuthState,
  ) {}

  protected get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.send<T>('GET', path, options);
  }

  protected post<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.send<T>('POST', path, options);
  }

  private async send<T>(method: string, path: string, options?: RequestOptions): Promise<T> {
    const response =
      options?.retry === false
        ? await this.fetchOnce(method, path, options)
        : await this.fetchWithRetry(method, path, options);
    return this.parseResponse<T>(method, path, response);
  }

  private buildHeaders(): Record<string, string> {
    return this.authState.token ? { Authorization: `Bearer ${this.authState.token}` } : {};
  }

  private fetchOnce(method: string, path: string, options?: RequestOptions): Promise<APIResponse> {
    return this.request.fetch(path, {
      method,
      headers: this.buildHeaders(),
      data: options?.data,
      params: options?.params,
    });
  }

  private async fetchWithRetry(method: string, path: string, options?: RequestOptions): Promise<APIResponse> {
    let response = await this.fetchOnce(method, path, options);
    for (let attempt = 1; RETRYABLE_STATUS_CODES.has(response.status()) && attempt <= MAX_RETRIES; attempt++) {
      await this.delay(BASE_DELAY_MS * 2 ** (attempt - 1));
      response = await this.fetchOnce(method, path, options);
    }
    return response;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async parseResponse<T>(method: string, path: string, response: APIResponse): Promise<T> {
    if (!response.ok()) {
      throw new Error(`${method} ${path} -> ${response.status()}: ${await response.text()}`);
    }
    return (await response.json()) as T;
  }
}

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
export type Query = Record<string, string | number | boolean>;
export interface RequestOptions {
    query?: Query;
    body?: Record<string, Json>;
    idempotencyKey?: string;
}
export interface CartDraft {
    draft_id: string;
    expires_at: string;
    share_url: string;
    [key: string]: Json;
}
export declare class ApiError extends Error {
    constructor(status: number, code: string, requestId?: string | null, retryAfter?: string | null);
    status: number;
    code: string;
    requestId: string | null;
    retryAfter: string | null;
}
/** Node.js 22+. Responses are unchanged server JSON; no automatic retries. */
export declare class VesremontClient {
    constructor(options?: { token?: string; timeout?: number });
    request<T = Json>(method: 'GET' | 'POST' | 'PATCH' | 'DELETE', path: string, options?: RequestOptions): Promise<T>;
    status(): Promise<Json>;
    search(q: string, query?: Query): Promise<Json>;
    product(id: number): Promise<Json>;
    cart(): Promise<Json>;
    cartDraft(productId: number, quantity?: number, draft?: string): Promise<CartDraft>;
}

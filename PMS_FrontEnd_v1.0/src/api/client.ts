const DEFAULT_API_BASE_URL = 'http://localhost:8000/api/v1';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;

export class ApiError extends Error {
  public status?: number;
  public details?: unknown;

  constructor(message: string, status?: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

interface RequestOptions extends RequestInit {
  token?: string | null;
  parseJson?: boolean;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, parseJson = true, headers, body, ...rest } = options;

  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;

  const requestHeaders: HeadersInit = {
    Accept: 'application/json',
    ...headers,
  };

  if (body && !(body instanceof FormData)) {
    requestHeaders['Content-Type'] = requestHeaders['Content-Type'] ?? 'application/json';
  }

  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...rest,
    headers: requestHeaders,
    body: body && body instanceof FormData ? body : body,
  });

  if (!response.ok) {
    let errorDetails: unknown = undefined;
    try {
      errorDetails = await response.json();
    } catch (err) {
      // ignore json parsing errors for non-JSON responses
    }

    throw new ApiError(response.statusText || 'Request failed', response.status, errorDetails);
  }

  if (!parseJson) {
    // caller explicitly disabled JSON parsing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return undefined as any;
  }

  if (response.status === 204) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return undefined as any;
  }

  return (await response.json()) as T;
}

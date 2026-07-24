export class ApiError extends Error {
  data: any;
  constructor(message: string, data: any) {
    super(message);
    this.data = data;
  }
}

export async function api(path: string, options: RequestInit = {}) {
  const res = await fetch('/api' + path, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data.error || 'Request failed', data);
  }
  return data;
}

export function fmtMoney(n: number) {
  return Number(n ?? 0).toFixed(2);
}

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "";

export async function apiFetch(
  path: string,
  options?: RequestInit,
  token?: string,
): Promise<unknown> {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (token) headers["authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...headers, ...(options?.headers as Record<string, string> | undefined) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as Record<string, string>).error ?? `HTTP ${res.status}`);
  return body;
}

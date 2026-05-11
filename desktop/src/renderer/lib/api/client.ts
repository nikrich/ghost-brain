export async function get<T>(path: string): Promise<T> {
  const result = await window.gb.api.request<T>('GET', path);
  if (!result.ok) throw new Error(result.error);
  return result.data;
}

export async function post<T>(path: string, body?: unknown): Promise<T> {
  const result = await window.gb.api.request<T>('POST', path, body);
  if (!result.ok) throw new Error(result.error);
  return result.data;
}

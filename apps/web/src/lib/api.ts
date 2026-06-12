const API_BASE = "/api";

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? "Request failed");
  }

  return data as T;
}

export const api = {
  health: () => request<{ status: string; timestamp: string }>("/health"),
  me: () => request<{ user: { id: string; email: string } | null }>("/auth/me"),
  notes: () => request<{ notes: unknown[] }>("/notes"),
};

import { AuthPayload } from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:3001/api";

const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID?.trim();

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }
  if (COMPANY_ID) {
    headers.set("x-company-id", COMPANY_ID);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    let message = `Erro ${response.status}`;
    try {
      const body = await response.json();
      if (typeof body?.message === "string") {
        message = body.message;
      } else if (Array.isArray(body?.message)) {
        message = body.message.join(", ");
      }
    } catch {
      // Keep default message when response body is not JSON.
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

export const authApi = {
  login(email: string, password: string) {
    return request<AuthPayload>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
  refresh() {
    return request<AuthPayload>("/auth/refresh", {
      method: "POST",
    });
  },
  me() {
    return request<AuthPayload["user"]>("/auth/me");
  },
  logout() {
    return request<{ success: boolean }>("/auth/logout", {
      method: "POST",
    });
  },
};

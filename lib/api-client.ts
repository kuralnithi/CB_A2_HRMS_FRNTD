import { signOut } from "next-auth/react";

export async function fetchApi(endpoint: string, token?: string | null, options: RequestInit = {}) {
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1").replace(/\/$/, "");
  const url = `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Set Content-Type to application/json by default if there's a body and it's not FormData
  if (options.body && !headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  try {
    console.log("fetchApi URL:", url, "Method:", options.method || "GET");
    const res = await fetch(url, { ...options, headers });

    if (res.status === 401) {
      if (typeof window !== "undefined") {
        signOut({ callbackUrl: "/login" });
      }
      throw new Error("Session expired. Please log in again.");
    }

    return res;
  } catch (error: any) {
    // Specifically catch network errors (connection refused, CORS issues, backend down)
    if (error.name === "TypeError" && error.message === "Failed to fetch") {
      throw new Error("Cannot connect to the server. Please check your network or ensure the backend is running.");
    }
    throw error;
  }
}

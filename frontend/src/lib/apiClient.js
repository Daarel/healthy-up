const API_BASE_URL = import.meta.env.API_BASE_URL;
const REQUEST_TIMEOUT_MS = 20000;
const TOKEN_KEY = "healthyup:token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function request(path, options = {}) {
  const token = getToken();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const message =
        data?.message ||
        data?.errors?.[0]?.message ||
        "Terjadi kesalahan pada server.";
      throw new Error(message);
    }
    return data;
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Server terlalu lama merespons. Coba lagi beberapa saat lagi.");
    }
    if (err.message) {
      throw err;
    }
    throw new Error("Tidak bisa terhubung ke server. Periksa koneksi atau coba lagi nanti.");
  } finally {
    clearTimeout(timeoutId);
  }
}

export function requestForm(path, formData, options = {}) {
  return request(path, {
    ...options,
    body: formData,
  });
}

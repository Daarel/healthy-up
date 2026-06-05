export const API_BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5001/api/v1";
export const REQUEST_TIMEOUT_MS = 20000;
export const TOKEN_KEY = "healthyup:token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function getErrorMessage(data, fallback = "Terjadi kesalahan pada server.") {
  return data?.message || data?.errors?.[0]?.message || fallback;
}

async function parseResponse(res, fallbackMessage) {
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(getErrorMessage(data, fallbackMessage));
  return data;
}

async function send(path, options = {}, fallbackMessage) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
    });
    return await parseResponse(res, fallbackMessage);
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Server terlalu lama merespons. Coba lagi beberapa saat lagi.");
    }
    if (err.message) throw err;
    throw new Error("Tidak bisa terhubung ke server. Periksa koneksi atau coba lagi nanti.");
  } finally {
    clearTimeout(timeoutId);
  }
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
        "Content-Type": "application/json",
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
  const token = getToken();
  return send(path, {
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: formData,
  });
}
/**
 * Decode JWT payload (Base64Url) secara aman di sisi client.
 * @param {string} token - JWT token string
 * @returns {{ id?: string, role?: 'admin' | 'user', exp?: number, iat?: number } | null}
 */
export function decodeJwt(token) {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );
    const jsonPayload = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Cek apakah JWT token sudah kedaluwarsa (expired) atau tidak valid.
 * @param {string} token
 * @returns {boolean}
 */
export function isTokenExpired(token) {
  const payload = decodeJwt(token);
  if (!payload) return true;
  if (typeof payload.exp === "number") {
    return payload.exp * 1000 <= Date.now();
  }
  return false;
}

/**
 * Ekstrak role pengguna ('admin' | 'user') langsung dari payload JWT token.
 * Mengembalikan null jika token tidak ada, tidak valid, atau sudah expired.
 * @param {string} token
 * @returns {'admin' | 'user' | null}
 */
export function getRoleFromToken(token) {
  if (!token || isTokenExpired(token)) return null;
  const payload = decodeJwt(token);
  return payload?.role || null;
}

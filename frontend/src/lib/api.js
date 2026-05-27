const BASE_URL = "/api/v1";

/**
 * Wrapper fetch yang otomatis set Content-Type JSON
 * dan parse response body.
 */
async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include", // kirim cookie JWT
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    // lempar pesan error dari server supaya bisa ditangkap di komponen
    throw new Error(data.message || "Terjadi kesalahan pada server");
  }

  return data;
}

export const authApi = {
  login: (email, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (username, email, password) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    }),

  logout: () =>
    request("/auth/logout", { method: "POST" }),

  forgotPassword: (email) =>
    request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (email, otp, newPassword, confirmedPassword) =>
    request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, otp, newPassword, confirmedPassword }),
    }),
};

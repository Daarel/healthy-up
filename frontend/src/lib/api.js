const API_BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5001/api/v1";
const REQUEST_TIMEOUT_MS = 20000;

const TOKEN_KEY = "healthyup:token";
function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}
function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}
async function request(path, options = {}) {
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
export const authApi = {
  login: async (email, password) => {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (data.data?.token) {
      setToken(data.data.token);
    }
    return data;
  },
  register: async (username, email, password) => {
    const data = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    });
    if (data.data?.token) {
      setToken(data.data.token);
    }
    return data;
  },
  logout: async () => {
    try {
      return await request("/auth/logout", {
        method: "POST",
      });
    } finally {
      removeToken();
    }
  },
  forgotPassword: async (email) => {
    return request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },
  resetPassword: async (email, otp, newPassword, confirmedPassword) => {
    return request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
        confirmedPassword,
      }),
    });
  },
  resendOtp: async (email) => {
    return request("/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },
};
export const userApi = {
  getAll: async ({ page = 1, limit = 20 } = {}) => {
    return request(`/users/all-users?page=${page}&limit=${limit}`);
  },
  deleteById: async (id) => {
    return request(`/users/${id}`, {
      method: "DELETE",
    });
  },
  getMe: async () => {
    return request("/users/user");
  },
  deleteMe: async () => {
    try {
      return await request("/users/user", {
        method: "DELETE",
      });
    } finally {
      removeToken();
    }
  },
  levelUp: async () => {
    return request("/users/user/level-up", {
      method: "POST",
    });
  },
  updatePicture: async (profilePicture) => {
    return request("/users/user/picture", {
      method: "PATCH",
      body: JSON.stringify({ profilePicture }),
    });
  },
};

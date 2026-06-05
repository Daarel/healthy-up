const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api/v1";
const TOKEN_KEY = "admin_token";
const REQUEST_TIMEOUT_MS = 20000;

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeAdminToken() {
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
    if (err.message) throw err;
    throw new Error("Tidak bisa terhubung ke server. Periksa koneksi atau coba lagi nanti.");
  } finally {
    clearTimeout(timeoutId);
  }
}

export const adminApi = {
  login: async (email, password) => {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (data.data?.token) setToken(data.data.token);
    return data;
  },
  logout: async () => {
    try {
      return await request("/auth/logout", { method: "POST" });
    } finally {
      removeAdminToken();
    }
  },
  getUsers: async ({ page = 1, limit = 20 } = {}) => {
    return request(`/users/all-users?page=${page}&limit=${limit}`);
  },
  getUserById: async (id) => {
    return request(`/users/${id}`);
  },
  deleteUser: async (id) => {
    return request(`/users/${id}`, { method: "DELETE" });
  },

  getPendingMissions: async (verificationStatus = 'pending') => {
    return request(`/missions/admin/pending?verificationStatus=${verificationStatus}`);
  },
  verifyMission: async (id, verificationStatus, rejectionReason = null) => {
    const payload = { verificationStatus };
    if (rejectionReason) {
      payload.rejectionReason = rejectionReason;
    }
    
    return request(`/missions/${id}/verify`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  getRewards: async (category) => {
    const query = category && category !== "semua" ? `?category=${encodeURIComponent(category)}` : "";
    return request(`/rewards${query}`);
  },
  createReward: async (payload) => {
    return request("/rewards", {
      method: "POST",
      body: payload instanceof FormData ? payload : JSON.stringify(payload),
    });
  },
  deleteReward: async (id) => {
    return request(`/rewards/${id}`, { method: "DELETE" });
  },
  toggleReward: async (id) => {
    return request(`/rewards/${id}/toggle`, { method: "PATCH" });
  }
};

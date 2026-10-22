import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from '../src/components/PrivateRoute';
import * as AuthContextModule from '../src/context/AuthContext';
import { setToken, removeToken } from '../src/lib/apiClient';
import { decodeJwt, getRoleFromToken, isTokenExpired } from '../lib/jwt';

// Helper untuk membuat fake JWT token
function createFakeJwt(payload) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

// Helper: render PrivateRoute dengan mock AuthContext
const renderPrivateRoute = ({
  user = null,
  role = null,
  isLoading = false,
  allowedRoles,
} = {}) => {
  vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
    user,
    role,
    isAdmin: role === 'admin',
    isLoading,
  });

  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route
          path="/protected"
          element={
            <PrivateRoute allowedRoles={allowedRoles}>
              <div>Halaman Terlindungi</div>
            </PrivateRoute>
          }
        />
        <Route path="/login" element={<div>Halaman Login</div>} />
        <Route path="/dashboard" element={<div>Halaman Dashboard User</div>} />
        <Route path="/admin/users" element={<div>Halaman Admin Users</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('PrivateRoute Component & JWT RBAC', () => {
  beforeEach(() => {
    removeToken();
  });

  it('renders tanpa error', () => {
    renderPrivateRoute({ user: { id: 1, username: 'test' } });
  });

  it('menampilkan layar loading saat isLoading true', () => {
    renderPrivateRoute({ isLoading: true });
    expect(screen.getByText('Memuat...')).toBeInTheDocument();
  });

  it('tidak menampilkan konten halaman saat isLoading true', () => {
    renderPrivateRoute({ isLoading: true });
    expect(screen.queryByText('Halaman Terlindungi')).not.toBeInTheDocument();
  });

  it('menampilkan spinner SVG saat loading', () => {
    renderPrivateRoute({ isLoading: true });
    const svg = document.querySelector('svg.animate-spin');
    expect(svg).toBeInTheDocument();
  });

  it('redirect ke /login saat user null dan tidak loading', () => {
    renderPrivateRoute({ user: null, isLoading: false });
    expect(screen.getByText('Halaman Login')).toBeInTheDocument();
    expect(screen.queryByText('Halaman Terlindungi')).not.toBeInTheDocument();
  });

  it('menampilkan children saat user sudah login', () => {
    renderPrivateRoute({ user: { id: 1, username: 'ghifari' }, isLoading: false });
    expect(screen.getByText('Halaman Terlindungi')).toBeInTheDocument();
  });

  it('tidak redirect saat user sudah login', () => {
    renderPrivateRoute({ user: { id: 1, username: 'ghifari' }, isLoading: false });
    expect(screen.queryByText('Halaman Login')).not.toBeInTheDocument();
  });

  it('mengekstrak role langsung dari JWT token dengan benar', () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    const token = createFakeJwt({ id: 'u-1', role: 'admin', exp: futureExp });
    expect(decodeJwt(token)?.role).toBe('admin');
    expect(isTokenExpired(token)).toBe(false);
    expect(getRoleFromToken(token)).toBe('admin');
  });

  it('mengizinkan akses halaman admin jika JWT token memiliki role admin', () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    setToken(createFakeJwt({ id: 'admin-1', role: 'admin', exp: futureExp }));

    renderPrivateRoute({
      user: { id: 'admin-1', username: 'admin' },
      allowedRoles: ['admin'],
    });
    expect(screen.getByText('Halaman Terlindungi')).toBeInTheDocument();
  });

  it('redirect user biasa ke /dashboard jika mencoba mengakses halaman khusus admin', () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    setToken(createFakeJwt({ id: 'user-1', role: 'user', exp: futureExp }));

    renderPrivateRoute({
      user: { id: 'user-1', username: 'budi' },
      allowedRoles: ['admin'],
    });
    expect(screen.getByText('Halaman Dashboard User')).toBeInTheDocument();
    expect(screen.queryByText('Halaman Terlindungi')).not.toBeInTheDocument();
  });

  it('redirect admin ke /admin/users jika mencoba mengakses halaman khusus user biasa', () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    setToken(createFakeJwt({ id: 'admin-1', role: 'admin', exp: futureExp }));

    renderPrivateRoute({
      user: { id: 'admin-1', username: 'admin' },
      allowedRoles: ['user'],
    });
    expect(screen.getByText('Halaman Admin Users')).toBeInTheDocument();
    expect(screen.queryByText('Halaman Terlindungi')).not.toBeInTheDocument();
  });

  it('redirect ke /login jika JWT token sudah kedaluwarsa (expired)', () => {
    const pastExp = Math.floor(Date.now() / 1000) - 3600;
    setToken(createFakeJwt({ id: 'user-1', role: 'user', exp: pastExp }));

    renderPrivateRoute({
      user: { id: 'user-1', username: 'budi' },
      allowedRoles: ['user'],
    });
    expect(screen.getByText('Halaman Login')).toBeInTheDocument();
  });
});

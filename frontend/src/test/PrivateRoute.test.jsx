import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from '../components/PrivateRoute';
import * as AuthContextModule from '../context/AuthContext';

// Helper: render PrivateRoute dengan mock AuthContext
const renderPrivateRoute = ({ user = null, isLoading = false } = {}) => {
  vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ user, isLoading });

  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route
          path="/protected"
          element={
            <PrivateRoute>
              <div>Halaman Terlindungi</div>
            </PrivateRoute>
          }
        />
        <Route path="/login" element={<div>Halaman Login</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('PrivateRoute Component', () => {
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
});

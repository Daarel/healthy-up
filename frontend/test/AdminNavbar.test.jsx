import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminNavbar from '../src/components/admin/AdminNavbar';
import * as AuthContextModule from '../src/context/AuthContext';
import { adminApi } from '../src/lib/api';

vi.mock('../src/lib/api', () => ({
  adminApi: {
    logout: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('../src/lib/apiClient', () => ({
  removeToken: vi.fn(),
}));

const renderAdminNavbar = (initialPath = '/admin/users') => {
  vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
    user: { id: 1, username: 'admin', role: 'admin' },
    setUser: vi.fn(),
    isLoading: false,
  });

  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AdminNavbar />
    </MemoryRouter>
  );
};

describe('AdminNavbar Component', () => {
  it('renders without crashing', () => {
    renderAdminNavbar();
  });

  it('menampilkan brand HealthyUp Admin Panel di desktop nav dan mobile header', () => {
    renderAdminNavbar();
    expect(screen.getAllByText('HealthyUp').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });

  it('menampilkan item navigasi desktop dan mobile (User, Misi, Reward)', () => {
    renderAdminNavbar();
    expect(screen.getByText('Manajemen User')).toBeInTheDocument();
    expect(screen.getByText('Verifikasi Misi')).toBeInTheDocument();
    expect(screen.getByText('Manajemen Reward')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('Misi')).toBeInTheDocument();
    expect(screen.getByText('Reward')).toBeInTheDocument();
  });

  it('menampilkan tombol Keluar di desktop dan mobile', () => {
    renderAdminNavbar();
    const logoutButtons = screen.getAllByText('Keluar');
    expect(logoutButtons.length).toBeGreaterThanOrEqual(2);
  });

  it('tombol navigasi mobile dapat diklik', () => {
    renderAdminNavbar('/admin/users');
    const misiButton = screen.getByText('Misi');
    fireEvent.click(misiButton);

    const rewardButton = screen.getByText('Reward');
    fireEvent.click(rewardButton);
  });

  it('tombol Keluar memanggil adminApi.logout', async () => {
    renderAdminNavbar();
    const logoutButtons = screen.getAllByText('Keluar');
    fireEvent.click(logoutButtons[0]);
    expect(adminApi.logout).toHaveBeenCalled();
  });
});

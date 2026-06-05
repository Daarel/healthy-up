import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import * as AuthContextModule from '../context/AuthContext';

// Mock ui/logo and ui/streak to avoid import issues
vi.mock('../components/ui/logo', () => ({ default: () => <span>HealthyUp</span> }));
vi.mock('../components/ui/streak', () => ({ default: ({ count }) => <span>{count} Streak</span> }));
vi.mock('../components/SetupTargetModal', () => ({
  default: ({ isOpen, onClose }) =>
    isOpen ? (
      <div role="dialog" aria-label="setup-modal">
        <button onClick={onClose}>Tutup Setup</button>
      </div>
    ) : null,
}));
vi.mock('../lib/api', () => ({
  authApi: {
    logout: vi.fn().mockResolvedValue({}),
  },
  userApi: {
    getMe: vi.fn().mockRejectedValue(new Error('no session')),
  },
}));

const renderDashboard = () => {
  vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
    user: { id: 1, username: 'ghifari' },
    setUser: vi.fn(),
    isLoading: false,
  });
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Dashboard />
    </MemoryRouter>
  );
};

describe('Dashboard Page', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('renders tanpa error', () => {
    renderDashboard();
  });

  it('menampilkan sapaan kepada pengguna', () => {
    renderDashboard();
    expect(screen.getByText(/Selamat Pagi, Pengguna/i)).toBeInTheDocument();
  });

  it('menampilkan motivasi harian', () => {
    renderDashboard();
    expect(screen.getByText(/Mari lanjutkan perjalanan sehatmu hari ini/i)).toBeInTheDocument();
  });

  it('menampilkan kartu Progress Minggu Ini', () => {
    renderDashboard();
    expect(screen.getByText('Progress Minggu Ini')).toBeInTheDocument();
    expect(screen.getAllByText('0%').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('selesai')).toBeInTheDocument();
  });

  it('menampilkan kartu Berat Badan', () => {
    renderDashboard();
    expect(screen.getByText('Berat Badan')).toBeInTheDocument();
  });

  it('menampilkan kartu Kalori Yang Terbakar Dari Olahraga', () => {
    renderDashboard();
    expect(screen.getByText('Kalori Yang Terbakar Dari Olahraga')).toBeInTheDocument();
  });

  it('menampilkan section Tugas Minggu ini', () => {
    renderDashboard();
    expect(screen.getByText('Tugas Minggu ini')).toBeInTheDocument();
  });

  it('menampilkan tombol Lihat Semua untuk tugas', () => {
    renderDashboard();
    expect(screen.getByText('Lihat Semua')).toBeInTheDocument();
  });

  it('tombol Lihat Semua tugas dapat diklik', () => {
    renderDashboard();
    const lihatSemua = screen.getByText('Lihat Semua');
    fireEvent.click(lihatSemua);
  });

  it('menampilkan banner pengingat berat badan saat belum dicatat minggu ini', () => {
    renderDashboard();
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Jangan lupa catat berat badan hari ini/i)).toBeInTheDocument();
    expect(screen.getByText(/Catat Sekarang/i)).toBeInTheDocument();
  });

  it('banner pengingat tidak muncul jika sudah dicatat minggu ini', () => {
    // Hitung thisWeekKey
    const now = new Date();
    const jan1 = new Date(now.getFullYear(), 0, 1);
    const week = Math.ceil(((now - jan1) / 86400000 + jan1.getDay() + 1) / 7);
    const thisWeekKey = `${now.getFullYear()}-W${String(week).padStart(2, '0')}`;

    window.localStorage.setItem(
      'healthyup:weightLog',
      JSON.stringify({
        currentWeight: 67,
        previousWeight: 68.5,
        lastLoggedDate: thisWeekKey,
        targetWeight: 65,
      })
    );
    renderDashboard();
    expect(screen.queryByText(/Jangan lupa catat berat badan hari ini/i)).not.toBeInTheDocument();
  });

  it('banner pengingat hilang setelah tombol tutup diklik', () => {
    renderDashboard();
    expect(screen.getByText(/Jangan lupa catat berat badan hari ini/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /tutup pengingat/i }));
    expect(screen.queryByText(/Jangan lupa catat berat badan hari ini/i)).not.toBeInTheDocument();
  });

  it('tombol Catat Sekarang di banner membuka modal', () => {
    renderDashboard();
    fireEvent.click(screen.getByText(/Catat Sekarang/i));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('menampilkan banner setup target untuk user baru', () => {
    renderDashboard();
    expect(screen.getByText('Belum ada target & tugas')).toBeInTheDocument();
    expect(screen.getByText('Mulai Setup')).toBeInTheDocument();
  });

  it('tombol Mulai Setup membuka modal setup', () => {
    renderDashboard();
    fireEvent.click(screen.getByText('Mulai Setup'));
    expect(screen.getByRole('dialog', { name: 'setup-modal' })).toBeInTheDocument();
  });

  it('menampilkan pesan tugas kosong sebelum setup', () => {
    renderDashboard();
    expect(
      screen.getByText(/Tugas akan muncul setelah kamu mengatur target di atas/i)
    ).toBeInTheDocument();
  });

  it('menampilkan teks Selesaikan tugas minggu ini', () => {
    renderDashboard();
    expect(screen.getByText(/Selesaikan tugas minggu ini dan klaim poinmu/i)).toBeInTheDocument();
  });

  it('menutup modal berat badan saat tombol Batal diklik', () => {
    renderDashboard();
    fireEvent.click(screen.getByText(/Catat Sekarang/i));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Batal/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('menampilkan error saat input berat badan tidak valid', () => {
    renderDashboard();
    fireEvent.click(screen.getByText(/Catat Sekarang/i));
    const input = screen.getByLabelText(/Berat Badan \(kg\)/i);
    fireEvent.change(input, { target: { value: '5' } });
    fireEvent.click(screen.getByRole('button', { name: /simpan/i }));
    expect(screen.getByText(/20 – 300 kg/i)).toBeInTheDocument();
  });

  it('memuat data berat dari localStorage saat halaman di-render ulang', () => {
    window.localStorage.setItem(
      'healthyup:weightLog',
      JSON.stringify({
        currentWeight: 66.2,
        previousWeight: 68.5,
        lastLoggedDate: '2000-01-01',
        targetWeight: 65,
      })
    );
    renderDashboard();
    expect(screen.getByText('66.2')).toBeInTheDocument();
  });
});

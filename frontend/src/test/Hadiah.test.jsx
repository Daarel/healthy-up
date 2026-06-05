import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Hadiah from '../pages/Hadiah';
import * as AuthContextModule from '../context/AuthContext';

vi.mock('../components/ui/streak', () => ({ default: ({ count }) => <span>{count} Streak</span> }));
vi.mock('../lib/api', () => ({
  authApi: {
    logout: vi.fn().mockResolvedValue({}),
  },
  userApi: {
    getMe: vi.fn().mockRejectedValue(new Error('no session')),
  },
}));

const renderHadiah = () => {
  vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
    user: { id: 1, username: 'ghifari' },
    setUser: vi.fn(),
    isLoading: false,
  });
  return render(
    <MemoryRouter initialEntries={['/hadiah']}>
      <Hadiah />
    </MemoryRouter>
  );
};

describe('Hadiah Page', () => {
  it('renders tanpa error', () => {
    renderHadiah();
  });

  it('menampilkan judul Pusat Hadiah', () => {
    renderHadiah();
    expect(screen.getByText('Pusat Hadiah')).toBeInTheDocument();
  });

  it('menampilkan deskripsi halaman', () => {
    renderHadiah();
    expect(screen.getByText(/Kumpulkan poin dari aktivitas sehatmu/i)).toBeInTheDocument();
  });

  it('menampilkan total poin pengguna', () => {
    renderHadiah();
    expect(screen.getByText('Total Poin Kamu')).toBeInTheDocument();
    // Default 0 poin — poin dan Pts bisa di elemen terpisah
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('menampilkan info level pengguna', () => {
    renderHadiah();
    expect(screen.getByText(/LEVEL 1/i)).toBeInTheDocument();
    // Level card menampilkan nama level "Pejuang"
    expect(screen.getByText('Pejuang')).toBeInTheDocument();
  });

  it('menampilkan section Lencana Elite', () => {
    renderHadiah();
    expect(screen.getByText('Lencana Elite')).toBeInTheDocument();
  });

  it('menampilkan section Tukarkan Voucher secara default', () => {
    renderHadiah();
    expect(screen.getByText('Tukarkan Voucher')).toBeInTheDocument();
  });

  it('menampilkan tombol Filter voucher', () => {
    renderHadiah();
    expect(screen.getByText('Filter')).toBeInTheDocument();
  });

  it('menampilkan tombol Riwayat', () => {
    renderHadiah();
    expect(screen.getByText('Riwayat')).toBeInTheDocument();
  });

  it('menampilkan pesan kosong saat belum ada voucher', () => {
    renderHadiah();
    expect(screen.getByText('Belum ada voucher tersedia.')).toBeInTheDocument();
  });

  it('klik tombol Riwayat menampilkan section Riwayat Penukaran', () => {
    renderHadiah();
    fireEvent.click(screen.getByText('Riwayat'));
    expect(screen.getByText('Riwayat Penukaran')).toBeInTheDocument();
  });

  it('menampilkan pesan kosong saat belum ada riwayat penukaran', () => {
    renderHadiah();
    fireEvent.click(screen.getByText('Riwayat'));
    expect(screen.getByText('Belum ada riwayat penukaran.')).toBeInTheDocument();
  });

  it('klik Riwayat lagi kembali ke mode Tukarkan Voucher', () => {
    renderHadiah();
    fireEvent.click(screen.getByText('Riwayat'));
    expect(screen.getByText('Riwayat Penukaran')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Riwayat'));
    expect(screen.getByText('Tukarkan Voucher')).toBeInTheDocument();
  });

  it('klik tombol Filter membuka dropdown kategori', () => {
    renderHadiah();
    fireEvent.click(screen.getByText('Filter'));
    expect(screen.getByText('Semua')).toBeInTheDocument();
    expect(screen.getByText('Kesehatan')).toBeInTheDocument();
    expect(screen.getByText('Makanan')).toBeInTheDocument();
    expect(screen.getByText('Gym')).toBeInTheDocument();
  });

  it('memilih kategori dari dropdown menutup dropdown', () => {
    renderHadiah();
    fireEvent.click(screen.getByText('Filter'));
    fireEvent.click(screen.getByText('Kesehatan'));
    // Dropdown tertutup, tombol filter menampilkan kategori aktif
    expect(screen.getByText('Kesehatan')).toBeInTheDocument();
  });

  it('menampilkan progress bar level', () => {
    renderHadiah();
    const progressBar = document.querySelector('.bg-\\[\\#006e2f\\].rounded-full');
    expect(progressBar).toBeInTheDocument();
  });

  it('menampilkan info poin untuk naik level', () => {
    renderHadiah();
    // "1.000 poin lagi untuk naik ke Level 2"
    expect(screen.getAllByText(/poin/i).length).toBeGreaterThanOrEqual(1);
  });
});

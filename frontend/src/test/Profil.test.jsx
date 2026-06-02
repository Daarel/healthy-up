import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Profile from '../pages/Profil';
import * as AuthContextModule from '../context/AuthContext';
import { authApi, userApi } from '../lib/api';

vi.mock('../components/ui/streak', () => ({ default: ({ count }) => <span>{count} Streak</span> }));
vi.mock('../lib/api', () => ({
  authApi: {
    logout: vi.fn().mockResolvedValue({}),
  },
  userApi: {
    getMe: vi.fn().mockResolvedValue({
      data: {
        user: {
          username: 'ghifari',
          email: 'ghifari@email.com',
          rankTitle: 'pemula',
          level: 1,
          experiencePoints: 120,
          rewardPoints: 40,
          streakCount: 3,
          profilePicture: '',
          badges: [],
        },
      },
    }),
    levelUp: vi.fn().mockResolvedValue({
      data: {
        user: {
          username: 'ghifari',
          rankTitle: 'penggerak',
          level: 2,
          experiencePoints: 20,
          badges: [],
        },
      },
    }),
    updatePicture: vi.fn().mockResolvedValue({
      data: {
        user: {
          username: 'ghifari',
          profilePicture: 'https://example.com/avatar.png',
        },
      },
    }),
    deleteMe: vi.fn().mockResolvedValue({ status: 'success' }),
  },
}));

const renderProfil = () => {
  vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
    user: { id: 1, username: 'ghifari' },
    setUser: vi.fn(),
    isLoading: false,
  });
  return render(
    <MemoryRouter initialEntries={['/profil']}>
      <Profile />
    </MemoryRouter>
  );
};

describe('Profil Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(window, 'prompt').mockReturnValue('https://example.com/avatar.png');
  });

  it('renders tanpa error', () => {
    renderProfil();
  });

  it('menampilkan level pengguna default', () => {
    renderProfil();
    expect(screen.getByText(/Level 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Pemula/i)).toBeInTheDocument();
  });

  it('memuat data profil dari backend', async () => {
    renderProfil();
    await waitFor(() => expect(screen.getByText('ghifari')).toBeInTheDocument());
    expect(screen.getByText('ghifari@email.com')).toBeInTheDocument();
    expect(screen.getByText(/120 EXP/i)).toBeInTheDocument();
    expect(screen.getByText(/40 poin hadiah/i)).toBeInTheDocument();
  });

  it('tombol Naik Level memanggil API level-up', async () => {
    renderProfil();
    fireEvent.click(screen.getByRole('button', { name: /Naik Level/i }));
    await waitFor(() => expect(userApi.levelUp).toHaveBeenCalled());
  });

  it('tombol edit foto profil memanggil API update picture', async () => {
    renderProfil();
    fireEvent.click(screen.getByRole('button', { name: /Edit foto profil/i }));
    await waitFor(() => expect(userApi.updatePicture).toHaveBeenCalledWith('https://example.com/avatar.png'));
  });

  it('menampilkan banner Catat Berat Badan Minggu Ini', () => {
    renderProfil();
    expect(screen.getByText('Catat Berat Badan Minggu Ini')).toBeInTheDocument();
  });

  it('menampilkan pesan belum ada catatan saat weightLog kosong', () => {
    renderProfil();
    expect(screen.getByText('Belum ada catatan berat badan.')).toBeInTheDocument();
  });

  it('menampilkan tombol Tambah Berat', () => {
    renderProfil();
    expect(screen.getByTestId('btn-catat-berat')).toBeInTheDocument();
    expect(screen.getByText('Tambah Berat')).toBeInTheDocument();
  });

  // ─── Modal input berat badan ─────────────────────────────────────────────────

  it('klik Tambah Berat membuka modal', () => {
    renderProfil();
    fireEvent.click(screen.getByTestId('btn-catat-berat'));
    expect(screen.getByText('Catat Berat Badan')).toBeInTheDocument();
  });

  it('modal menampilkan input berat badan', () => {
    renderProfil();
    fireEvent.click(screen.getByTestId('btn-catat-berat'));
    expect(screen.getByTestId('input-berat')).toBeInTheDocument();
  });

  it('modal menampilkan label Berat Badan (kg)', () => {
    renderProfil();
    fireEvent.click(screen.getByTestId('btn-catat-berat'));
    expect(screen.getByText('Berat Badan (kg)')).toBeInTheDocument();
  });

  it('modal menampilkan input catatan opsional (allowNote=true di Profil)', () => {
    renderProfil();
    fireEvent.click(screen.getByTestId('btn-catat-berat'));
    expect(screen.getByTestId('input-catatan')).toBeInTheDocument();
  });

  it('modal menampilkan tombol Batal dan Simpan', () => {
    renderProfil();
    fireEvent.click(screen.getByTestId('btn-catat-berat'));
    expect(screen.getByText('Batal')).toBeInTheDocument();
    expect(screen.getByTestId('btn-simpan-berat')).toBeInTheDocument();
  });

  it('tombol Batal menutup modal', () => {
    renderProfil();
    fireEvent.click(screen.getByTestId('btn-catat-berat'));
    expect(screen.getByText('Catat Berat Badan')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Batal'));
    expect(screen.queryByText('Catat Berat Badan')).not.toBeInTheDocument();
  });

  it('validasi: simpan tanpa mengisi angka menampilkan pesan error', () => {
    renderProfil();
    fireEvent.click(screen.getByTestId('btn-catat-berat'));
    fireEvent.click(screen.getByTestId('btn-simpan-berat'));
    expect(screen.getByText(/Masukkan angka berat badan yang valid/i)).toBeInTheDocument();
  });

  it('validasi: berat di bawah 20 kg menampilkan pesan error', () => {
    renderProfil();
    fireEvent.click(screen.getByTestId('btn-catat-berat'));
    fireEvent.change(screen.getByTestId('input-berat'), { target: { value: '10' } });
    fireEvent.click(screen.getByTestId('btn-simpan-berat'));
    expect(screen.getByText(/20 – 300 kg/i)).toBeInTheDocument();
  });

  it('validasi: berat di atas 300 kg menampilkan pesan error', () => {
    renderProfil();
    fireEvent.click(screen.getByTestId('btn-catat-berat'));
    fireEvent.change(screen.getByTestId('input-berat'), { target: { value: '999' } });
    fireEvent.click(screen.getByTestId('btn-simpan-berat'));
    expect(screen.getByText(/20 – 300 kg/i)).toBeInTheDocument();
  });

  it('menyimpan berat yang valid menutup modal dan menampilkan toast sukses', () => {
    renderProfil();
    fireEvent.click(screen.getByTestId('btn-catat-berat'));
    fireEvent.change(screen.getByTestId('input-berat'), { target: { value: '68.5' } });
    fireEvent.click(screen.getByTestId('btn-simpan-berat'));

    // Modal harus tertutup
    expect(screen.queryByText('Catat Berat Badan')).not.toBeInTheDocument();
    // Toast sukses muncul
    expect(screen.getByText(/Berat badan berhasil dicatat/i)).toBeInTheDocument();
  });

  it('perbandingan perubahan muncul saat mengetik angka di input', () => {
    renderProfil();
    fireEvent.click(screen.getByTestId('btn-catat-berat'));
    fireEvent.change(screen.getByTestId('input-berat'), { target: { value: '67.0' } });
    expect(screen.getByText(/Perubahan dari sebelumnya/i)).toBeInTheDocument();
  });

  it('dapat mengisi catatan opsional', () => {
    renderProfil();
    fireEvent.click(screen.getByTestId('btn-catat-berat'));
    fireEvent.change(screen.getByTestId('input-catatan'), { target: { value: 'Setelah olahraga pagi' } });
    expect(screen.getByDisplayValue('Setelah olahraga pagi')).toBeInTheDocument();
  });

  // ─── Riwayat berat badan / chart ─────────────────────────────────────────────

  it('menampilkan section Riwayat Berat Badan', () => {
    renderProfil();
    expect(screen.getByText('Riwayat Berat Badan')).toBeInTheDocument();
  });

  it('menampilkan toggle Mingguan dan Bulanan', () => {
    renderProfil();
    expect(screen.getByText('Mingguan')).toBeInTheDocument();
    expect(screen.getByText('Bulanan')).toBeInTheDocument();
  });

  it('toggle chart period dapat diklik', () => {
    renderProfil();
    fireEvent.click(screen.getByText('Bulanan'));
    fireEvent.click(screen.getByText('Mingguan'));
  });

  it('menampilkan pesan belum cukup data untuk grafik saat weightLog kosong', () => {
    renderProfil();
    expect(screen.getByText(/Belum cukup data untuk menampilkan grafik/i)).toBeInTheDocument();
  });

  it('menampilkan data berat badan tanpa target default', () => {
    renderProfil();
    expect(screen.getByText('Berat Awal')).toBeInTheDocument();
    expect(screen.getByText('Sekarang')).toBeInTheDocument();
    expect(screen.queryByText('Target')).not.toBeInTheDocument();
    expect(screen.queryByText('65 kg')).not.toBeInTheDocument();
    expect(screen.queryByText('Sisa menuju target')).not.toBeInTheDocument();
  });

  // ─── Stats & Settings ─────────────────────────────────────────────────────────

  it('menampilkan kartu Kalori Terbakar', () => {
    renderProfil();
    expect(screen.getByText('Kalori Terbakar')).toBeInTheDocument();
    expect(screen.getByText('Minggu ini')).toBeInTheDocument();
  });

  it('menampilkan section Pengaturan Akun', () => {
    renderProfil();
    expect(screen.getByText('Pengaturan Akun')).toBeInTheDocument();
  });

  it('menampilkan menu Informasi Pribadi', () => {
    renderProfil();
    expect(screen.getByText('Informasi Pribadi')).toBeInTheDocument();
  });

  it('menu Informasi Pribadi dapat diklik', () => {
    renderProfil();
    fireEvent.click(screen.getByText('Informasi Pribadi'));
  });

  it('tidak menampilkan toggle Mode Gelap', () => {
    renderProfil();
    expect(screen.queryByText('Mode Gelap')).not.toBeInTheDocument();
  });

  it('menampilkan tombol Keluar di pengaturan akun', () => {
    renderProfil();
    const keluarItems = screen.getAllByText('Keluar');
    expect(keluarItems.length).toBeGreaterThanOrEqual(1);
  });

  it('tombol Keluar di pengaturan akun memanggil API logout', () => {
    renderProfil();
    const keluarItems = screen.getAllByText('Keluar');
    fireEvent.click(keluarItems[keluarItems.length - 1]);
    expect(authApi.logout).toHaveBeenCalled();
  });

  it('menampilkan tombol Hapus Akun', () => {
    renderProfil();
    expect(screen.getByText('Hapus Akun')).toBeInTheDocument();
  });

  it('tombol Hapus Akun memanggil API delete profile', async () => {
    renderProfil();
    fireEvent.click(screen.getByText('Hapus Akun'));
    await waitFor(() => expect(userApi.deleteMe).toHaveBeenCalled());
  });

  it('setelah simpan berat, data baru muncul di riwayat', () => {
    renderProfil();
    fireEvent.click(screen.getByTestId('btn-catat-berat'));
    fireEvent.change(screen.getByTestId('input-berat'), { target: { value: '68.0' } });
    fireEvent.click(screen.getByTestId('btn-simpan-berat'));
    // Berat baru muncul di stats
    expect(screen.getAllByText(/68/i).length).toBeGreaterThanOrEqual(1);
  });
});

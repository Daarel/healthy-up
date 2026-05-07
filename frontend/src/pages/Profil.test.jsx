import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Profile from './Profil';

const renderProfil = () => {
  return render(
    <MemoryRouter initialEntries={['/profil']}>
      <Profile />
    </MemoryRouter>
  );
};

describe('Profil Page', () => {
  it('renders tanpa error', () => {
    renderProfil();
  });

  it('menampilkan nama pengguna', () => {
    renderProfil();
    expect(screen.getByText('Gathan Ghifari')).toBeInTheDocument();
  });

  it('menampilkan lokasi dan tanggal bergabung', () => {
    renderProfil();
    expect(screen.getByText(/Jakarta, Indonesia/i)).toBeInTheDocument();
    expect(screen.getByText(/Jan 2024/i)).toBeInTheDocument();
  });

  it('menampilkan level pengguna', () => {
    renderProfil();
    expect(screen.getByText(/Level 12/i)).toBeInTheDocument();
    expect(screen.getByText(/Pejuang/i)).toBeInTheDocument();
  });

  it('menampilkan info streak', () => {
    renderProfil();
    expect(screen.getByText('14')).toBeInTheDocument();
    expect(screen.getByText('Hari')).toBeInTheDocument();
  });

  it('menampilkan tombol Bagikan Profil', () => {
    renderProfil();
    expect(screen.getByText('Bagikan Profil')).toBeInTheDocument();
  });

  it('tombol Bagikan Profil dapat diklik', () => {
    renderProfil();
    fireEvent.click(screen.getByText('Bagikan Profil'));
  });

  // ─── Banner catat berat badan ───────────────────────────────────────────────

  it('menampilkan banner Catat Berat Badan Hari Ini', () => {
    renderProfil();
    expect(screen.getByText('Catat Berat Badan Hari Ini')).toBeInTheDocument();
  });

  it('menampilkan berat badan terakhir di banner', () => {
    renderProfil();
    // 69.2 kg muncul di banner, stats "Sekarang", dan log — pakai getAllByText
    expect(screen.getAllByText(/69\.2 kg/).length).toBeGreaterThanOrEqual(1);
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

  it('modal menampilkan input catatan opsional', () => {
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

  it('tombol X menutup modal', () => {
    renderProfil();
    fireEvent.click(screen.getByTestId('btn-catat-berat'));
    expect(screen.getByText('Catat Berat Badan')).toBeInTheDocument();
    // Temukan tombol X di modal dengan data-testid tombol tutup
    const allButtons = screen.getAllByRole('button');
    const xBtn = allButtons.find(btn => btn.className.includes('w-9') && btn.className.includes('h-9'));
    expect(xBtn).toBeTruthy();
    fireEvent.click(xBtn);
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

  it('menyimpan berat yang valid menutup modal dan menampilkan toast sukses', async () => {
    renderProfil();
    fireEvent.click(screen.getByTestId('btn-catat-berat'));
    fireEvent.change(screen.getByTestId('input-berat'), { target: { value: '68.5' } });
    fireEvent.click(screen.getByTestId('btn-simpan-berat'));

    // Modal harus tertutup
    expect(screen.queryByText('Catat Berat Badan')).not.toBeInTheDocument();
    // Toast sukses muncul
    expect(screen.getByText(/Berat badan berhasil dicatat/i)).toBeInTheDocument();
  });

  it('setelah simpan, berat terbaru terlihat di banner', async () => {
    renderProfil();
    fireEvent.click(screen.getByTestId('btn-catat-berat'));
    fireEvent.change(screen.getByTestId('input-berat'), { target: { value: '68.0' } });
    fireEvent.click(screen.getByTestId('btn-simpan-berat'));
    // Banner seharusnya menampilkan berat baru — pakai getAllByText karena mungkin muncul di beberapa tempat
    expect(screen.getAllByText(/68 kg/i).length).toBeGreaterThanOrEqual(1);
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

  it('menampilkan data berat badan (Awal, Sekarang, Target)', () => {
    renderProfil();
    expect(screen.getByText('Berat Awal')).toBeInTheDocument();
    // 78.5 kg muncul di chart stats dan di riwayat log
    expect(screen.getAllByText('78.5 kg').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Sekarang')).toBeInTheDocument();
    expect(screen.getByText('Target')).toBeInTheDocument();
    // 65 kg muncul di stats chart dan di progress bar
    expect(screen.getAllByText('65 kg').length).toBeGreaterThanOrEqual(1);
  });

  it('menampilkan section Catatan Terakhir', () => {
    renderProfil();
    expect(screen.getByText('Catatan Terakhir')).toBeInTheDocument();
  });

  it('menampilkan kartu progress sisa menuju target', () => {
    renderProfil();
    expect(screen.getByText('Sisa menuju target')).toBeInTheDocument();
  });

  // ─── Stats & Settings ─────────────────────────────────────────────────────────

  it('menampilkan kartu Kalori Terbakar', () => {
    renderProfil();
    expect(screen.getByText('Kalori Terbakar')).toBeInTheDocument();
    expect(screen.getByText('Minggu ini')).toBeInTheDocument();
  });

  it('menampilkan section Manajemen Akun', () => {
    renderProfil();
    expect(screen.getByText('Manajemen Akun')).toBeInTheDocument();
  });

  it('menampilkan menu Informasi Pribadi, Keamanan & Password, Metode Pembayaran', () => {
    renderProfil();
    expect(screen.getByText('Informasi Pribadi')).toBeInTheDocument();
    expect(screen.getByText('Keamanan & Password')).toBeInTheDocument();
    expect(screen.getByText('Metode Pembayaran')).toBeInTheDocument();
  });

  it('menu akun dapat diklik', () => {
    renderProfil();
    fireEvent.click(screen.getByText('Informasi Pribadi'));
    fireEvent.click(screen.getByText('Keamanan & Password'));
    fireEvent.click(screen.getByText('Metode Pembayaran'));
  });

  it('menampilkan section Preferensi Aplikasi', () => {
    renderProfil();
    expect(screen.getByText('Preferensi Aplikasi')).toBeInTheDocument();
  });

  it('menampilkan toggle Mode Gelap', () => {
    renderProfil();
    expect(screen.getByText('Mode Gelap')).toBeInTheDocument();
  });

  it('menampilkan toggle Peringatan Harian', () => {
    renderProfil();
    expect(screen.getByText('Peringatan Harian')).toBeInTheDocument();
  });

  it('toggle Mode Gelap dapat diklik', () => {
    renderProfil();
    const darkModeText = screen.getByText('Mode Gelap');
    const toggleContainer = darkModeText.closest('div').parentElement;
    const toggleButton = toggleContainer.querySelector('button');
    fireEvent.click(toggleButton);
    fireEvent.click(toggleButton);
  });

  it('toggle Peringatan Harian dapat diklik', () => {
    renderProfil();
    const reminderText = screen.getByText('Peringatan Harian');
    const toggleContainer = reminderText.closest('div').parentElement;
    const toggleButton = toggleContainer.querySelector('button');
    fireEvent.click(toggleButton);
  });

  it('menampilkan tombol Hapus Akun', () => {
    renderProfil();
    expect(screen.getByText('Hapus Akun')).toBeInTheDocument();
  });

  it('tombol Hapus Akun dapat diklik', () => {
    renderProfil();
    fireEvent.click(screen.getByText('Hapus Akun'));
  });
});

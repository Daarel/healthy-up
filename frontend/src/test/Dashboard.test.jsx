import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';

const renderDashboard = () => {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Dashboard />
    </MemoryRouter>
  );
};

const todayKey = (() => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
})();

describe('Dashboard Page', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders tanpa error', () => {
    renderDashboard();
  });

  it('menampilkan sapaan kepada pengguna', () => {
    renderDashboard();
    expect(screen.getByText(/Selamat Pagi, Ghifari/i)).toBeInTheDocument();
  });

  it('menampilkan motivasi harian', () => {
    renderDashboard();
    expect(screen.getByText(/Mari lanjutkan perjalanan sehatmu hari ini/i)).toBeInTheDocument();
  });

  it('menampilkan info streak', () => {
    renderDashboard();
    expect(screen.getByText('Streak')).toBeInTheDocument();
    expect(screen.getByText('14 Hari')).toBeInTheDocument();
  });

  it('menampilkan kartu Progress Minggu Ini dengan persentase 75%', () => {
    renderDashboard();
    expect(screen.getByText('Progress Minggu Ini')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('selesai')).toBeInTheDocument();
  });

  it('menampilkan kartu Berat Badan dengan data yang benar', () => {
    renderDashboard();
    expect(screen.getByText('Berat Badan')).toBeInTheDocument();
    expect(screen.getByText('68.5')).toBeInTheDocument();
    expect(screen.getByText('Target: 65 kg')).toBeInTheDocument();
  });

  it('menampilkan kartu Kalori Hari Ini', () => {
    renderDashboard();
    expect(screen.getByText('Kalori Hari Ini')).toBeInTheDocument();
    expect(screen.getByText('1,250')).toBeInTheDocument();
  });

  it('menampilkan daftar tugas hari ini', () => {
    renderDashboard();
    expect(screen.getByText('Tugas Hari Ini')).toBeInTheDocument();
    expect(screen.getByText('Minum air 8 gelas')).toBeInTheDocument();
    expect(screen.getByText('Makan sayur 3 porsi')).toBeInTheDocument();
    expect(screen.getByText('Jalan kaki 30 menit')).toBeInTheDocument();
    expect(screen.getByText('Tidur 8 jam')).toBeInTheDocument();
  });

  it('menampilkan kategori tugas', () => {
    renderDashboard();
    expect(screen.getByText('Hidrasi')).toBeInTheDocument();
    expect(screen.getByText('Nutrisi')).toBeInTheDocument();
    expect(screen.getByText('Olahraga')).toBeInTheDocument();
    expect(screen.getByText('Istirahat')).toBeInTheDocument();
  });

  it('menampilkan jadwal hari ini', () => {
    renderDashboard();
    expect(screen.getByText('Jadwal Hari Ini')).toBeInTheDocument();
    expect(screen.getByText('Sarapan sehat')).toBeInTheDocument();
    expect(screen.getByText('Makan siang')).toBeInTheDocument();
    expect(screen.getByText('Workout')).toBeInTheDocument();
  });

  it('menampilkan waktu aktivitas', () => {
    renderDashboard();
    expect(screen.getByText('07:00')).toBeInTheDocument();
    expect(screen.getByText('12:00')).toBeInTheDocument();
    expect(screen.getByText('17:00')).toBeInTheDocument();
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

  it('menampilkan tombol Tambah Aktivitas', () => {
    renderDashboard();
    expect(screen.getByText(/Tambah Aktivitas/i)).toBeInTheDocument();
  });

  it('menampilkan penurunan berat badan', () => {
    renderDashboard();
    expect(screen.getByText('-1.5 kg')).toBeInTheDocument();
    expect(screen.getByText('vs sebelumnya')).toBeInTheDocument();
  });

  it('menampilkan banner pengingat berat badan saat belum dicatat hari ini', () => {
    renderDashboard();
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Jangan lupa catat berat badan hari ini/i)).toBeInTheDocument();
    expect(screen.getByText(/Catat Sekarang/i)).toBeInTheDocument();
  });

  it('banner pengingat tidak muncul jika sudah dicatat hari ini', () => {
    window.localStorage.setItem(
      'healthyup:weightLog',
      JSON.stringify({
        currentWeight: 67,
        previousWeight: 68.5,
        lastLoggedDate: todayKey,
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

  it('banner pengingat hilang setelah berat badan berhasil dicatat', () => {
    renderDashboard();
    expect(screen.getByText(/Jangan lupa catat berat badan hari ini/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Catat Sekarang/i));
    const input = screen.getByLabelText(/Berat Badan \(kg\)/i);
    fireEvent.change(input, { target: { value: '67.0' } });
    fireEvent.click(screen.getByRole('button', { name: /simpan/i }));
    expect(screen.queryByText(/Jangan lupa catat berat badan hari ini/i)).not.toBeInTheDocument();
  });

  it('menampilkan tombol input berat badan saat belum dicatat hari ini', () => {
    renderDashboard();
    expect(
      screen.getByRole('button', { name: /tambah berat badan/i })
    ).toBeEnabled();
  });

  it('membuka modal input berat badan saat tombol diklik', () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /tambah berat badan/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Catat Berat Badan')).toBeInTheDocument();
    expect(screen.getByLabelText(/Berat Badan \(kg\)/i)).toBeInTheDocument();
  });

  it('menutup modal saat tombol Batal diklik', () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /tambah berat badan/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /batal/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('menampilkan error saat input berat badan tidak valid', () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /tambah berat badan/i }));
    const input = screen.getByLabelText(/Berat Badan \(kg\)/i);
    fireEvent.change(input, { target: { value: '5' } });
    fireEvent.click(screen.getByRole('button', { name: /simpan/i }));
    expect(screen.getByText(/20 – 300 kg/i)).toBeInTheDocument();
  });

  it('memperbarui berat badan setelah submit valid', () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /tambah berat badan/i }));
    const input = screen.getByLabelText(/Berat Badan \(kg\)/i);
    fireEvent.change(input, { target: { value: '67.0' } });
    fireEvent.click(screen.getByRole('button', { name: /simpan/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('67.0')).toBeInTheDocument();
    expect(screen.getByText('-1.5 kg')).toBeInTheDocument();
  });

  it('mengunci tombol input setelah berat badan dicatat hari ini', () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /tambah berat badan/i }));
    const input = screen.getByLabelText(/Berat Badan \(kg\)/i);
    fireEvent.change(input, { target: { value: '67.0' } });
    fireEvent.click(screen.getByRole('button', { name: /simpan/i }));
    const lockedBtn = screen.getByRole('button', {
      name: /berat badan hari ini sudah dicatat/i,
    });
    expect(lockedBtn).toBeDisabled();
    expect(screen.getByText(/Sudah dicatat hari ini/i)).toBeInTheDocument();
  });

  it('tidak membuka modal saat tombol input dalam keadaan terkunci', () => {
    window.localStorage.setItem(
      'healthyup:weightLog',
      JSON.stringify({
        currentWeight: 67,
        previousWeight: 68.5,
        lastLoggedDate: todayKey,
      })
    );
    renderDashboard();
    const lockedBtn = screen.getByRole('button', {
      name: /berat badan hari ini sudah dicatat/i,
    });
    fireEvent.click(lockedBtn);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('memuat data berat dari localStorage saat halaman di-render ulang', () => {
    window.localStorage.setItem(
      'healthyup:weightLog',
      JSON.stringify({
        currentWeight: 66.2,
        previousWeight: 68.5,
        lastLoggedDate: '2000-01-01',
      })
    );
    renderDashboard();
    expect(screen.getByText('66.2')).toBeInTheDocument();
    // tombol tidak terkunci karena bukan tanggal hari ini
    expect(
      screen.getByRole('button', { name: /tambah berat badan/i })
    ).toBeEnabled();
  });
});

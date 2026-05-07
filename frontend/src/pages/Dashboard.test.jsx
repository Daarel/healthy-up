import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from './Dashboard';

const renderDashboard = () => {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Dashboard />
    </MemoryRouter>
  );
};

describe('Dashboard Page', () => {
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
    expect(screen.getByText('vs minggu lalu')).toBeInTheDocument();
  });
});

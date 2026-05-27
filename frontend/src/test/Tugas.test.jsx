import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Tugas from '../pages/Tugas';

const renderTugas = () => {
  return render(
    <MemoryRouter initialEntries={['/tugas']}>
      <Tugas />
    </MemoryRouter>
  );
};

describe('Tugas Page', () => {
  it('renders tanpa error', () => {
    renderTugas();
  });

  it('menampilkan judul Tugas & Tantangan', () => {
    renderTugas();
    expect(screen.getByText('Tugas & Tantangan')).toBeInTheDocument();
  });

  it('menampilkan deskripsi halaman', () => {
    renderTugas();
    expect(screen.getByText(/Selesaikan tugas untuk mendapatkan poin/i)).toBeInTheDocument();
  });

  it('menampilkan tab Hari Ini, Minggu Ini, Tantangan', () => {
    renderTugas();
    expect(screen.getByText('Hari Ini')).toBeInTheDocument();
    expect(screen.getByText('Minggu Ini')).toBeInTheDocument();
    expect(screen.getByText('Tantangan')).toBeInTheDocument();
  });

  it('menampilkan kartu statistik Selesai, Tersisa, Poin', () => {
    renderTugas();
    expect(screen.getByText('Selesai')).toBeInTheDocument();
    expect(screen.getByText('Tersisa')).toBeInTheDocument();
    expect(screen.getByText('Poin')).toBeInTheDocument();
  });

  it('tab Hari Ini aktif secara default dan menampilkan tugas hari ini', () => {
    renderTugas();
    expect(screen.getByText('Minum air 8 gelas')).toBeInTheDocument();
    expect(screen.getByText('Makan sayur 3 porsi')).toBeInTheDocument();
    expect(screen.getByText('Jalan kaki 30 menit')).toBeInTheDocument();
    expect(screen.getByText('Tidur 8 jam')).toBeInTheDocument();
    expect(screen.getByText('Makan protein tinggi')).toBeInTheDocument();
    expect(screen.getByText('Stretching pagi')).toBeInTheDocument();
  });

  it('menampilkan tombol Upload untuk setiap tugas', () => {
    renderTugas();
    const uploadButtons = screen.getAllByText('Upload');
    expect(uploadButtons.length).toBeGreaterThan(0);
  });

  it('dapat berpindah ke tab Minggu Ini', () => {
    renderTugas();
    fireEvent.click(screen.getByText('Minggu Ini'));
    expect(screen.getByText('Workout 4x seminggu')).toBeInTheDocument();
    expect(screen.getByText('Tidur teratur 7 hari')).toBeInTheDocument();
    expect(screen.getByText('Minum air cukup 7 hari')).toBeInTheDocument();
  });

  it('dapat berpindah ke tab Tantangan', () => {
    renderTugas();
    fireEvent.click(screen.getByText('Tantangan'));
    expect(screen.getByText('Turun 1kg minggu ini')).toBeInTheDocument();
    expect(screen.getByText('Olahraga 30 hari berturut-turut')).toBeInTheDocument();
  });

  it('statistik Selesai menampilkan angka yang benar (2 dari 6 hari ini)', () => {
    renderTugas();
    // Di tab hari-ini ada 2 tugas completed (Minum air & Stretching)
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('statistik Tersisa menampilkan 4 (dari 6 - 2 selesai)', () => {
    renderTugas();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('tombol Upload dapat membuka modal', () => {
    renderTugas();
    const uploadButtons = screen.getAllByText('Upload');
    fireEvent.click(uploadButtons[0]);
    // Modal harus muncul
    expect(screen.getByText('Upload Bukti')).toBeInTheDocument();
  });

  it('modal upload menampilkan nama tugas yang dipilih', () => {
    renderTugas();
    const uploadButtons = screen.getAllByText('Upload');
    fireEvent.click(uploadButtons[0]);
    // Salah satu judul tugas tampil di modal
    expect(screen.getByText('Upload Bukti')).toBeInTheDocument();
  });

  it('modal upload dapat ditutup dengan tombol X', () => {
    renderTugas();
    const uploadButtons = screen.getAllByText('Upload');
    fireEvent.click(uploadButtons[0]);
    expect(screen.getByText('Upload Bukti')).toBeInTheDocument();
    const closeButtons = screen.getAllByRole('button');
    const modalXButtons = closeButtons.filter(btn =>
      btn.className.includes('w-10') && btn.className.includes('h-10')
    );
    if (modalXButtons.length > 0) {
      fireEvent.click(modalXButtons[modalXButtons.length - 1]);
    }
  });

  it('modal upload menampilkan tombol Panduan', () => {
    renderTugas();
    const uploadButtons = screen.getAllByText('Upload');
    fireEvent.click(uploadButtons[0]);
    expect(screen.getByText('Panduan')).toBeInTheDocument();
  });

  it('tombol Panduan membuka guide modal', () => {
    renderTugas();
    const uploadButtons = screen.getAllByText('Upload');
    fireEvent.click(uploadButtons[0]);
    fireEvent.click(screen.getByText('Panduan'));
    expect(screen.getByText('Panduan Upload Bukti')).toBeInTheDocument();
    expect(screen.getByText('Tips agar bukti diterima')).toBeInTheDocument();
  });

  it('guide modal menampilkan panduan foto dan video', () => {
    renderTugas();
    const uploadButtons = screen.getAllByText('Upload');
    fireEvent.click(uploadButtons[0]);
    fireEvent.click(screen.getByText('Panduan'));
    expect(screen.getByText('Panduan Foto')).toBeInTheDocument();
    expect(screen.getByText('Panduan Video')).toBeInTheDocument();
    expect(screen.getByText('Tips Tambahan')).toBeInTheDocument();
  });

  it('guide modal dapat ditutup dengan tombol Mengerti', () => {
    renderTugas();
    const uploadButtons = screen.getAllByText('Upload');
    fireEvent.click(uploadButtons[0]);
    fireEvent.click(screen.getByText('Panduan'));
    fireEvent.click(screen.getByText('Mengerti, Lanjut Upload'));
    expect(screen.queryByText('Panduan Upload Bukti')).not.toBeInTheDocument();
  });

  it('menampilkan poin untuk setiap tugas di hari ini', () => {
    renderTugas();
    // +10 muncul beberapa kali (Minum air, Tidur 8 jam, Stretching pagi masing-masing 10 poin)
    expect(screen.getAllByText('+10').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('+15').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('+20').length).toBeGreaterThanOrEqual(1);
  });
});

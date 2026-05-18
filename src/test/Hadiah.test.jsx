import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Hadiah from '../pages/Hadiah';

const renderHadiah = () => {
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
    // 12450 diformat dengan toLocaleString - mungkin muncul lebih dari sekali
    expect(screen.getAllByText(/12[.,]450/).length).toBeGreaterThanOrEqual(1);
  });

  it('menampilkan info level pengguna', () => {
    renderHadiah();
    expect(screen.getByText('LEVEL 12')).toBeInTheDocument();
    expect(screen.getByText('Pejuang Sehat')).toBeInTheDocument();
  });

  it('menampilkan streak pengguna', () => {
    renderHadiah();
    expect(screen.getByText('14')).toBeInTheDocument();
    expect(screen.getByText('Hari Streak')).toBeInTheDocument();
  });

  it('menampilkan lencana elite', () => {
    renderHadiah();
    expect(screen.getByText('Lencana Elite')).toBeInTheDocument();
  });

  it('menampilkan section Tukarkan Voucher', () => {
    renderHadiah();
    expect(screen.getByText('Tukarkan Voucher')).toBeInTheDocument();
  });

  it('menampilkan tab filter voucher (Semua, Kesehatan, Makanan, Gym)', () => {
    renderHadiah();
    expect(screen.getByText('Semua')).toBeInTheDocument();
    expect(screen.getByText('Kesehatan')).toBeInTheDocument();
    expect(screen.getByText('Makanan')).toBeInTheDocument();
    expect(screen.getByText('Gym')).toBeInTheDocument();
  });

  it('tab Semua aktif secara default dan menampilkan semua voucher', () => {
    renderHadiah();
    expect(screen.getByText('Voucher Medical Checkup')).toBeInTheDocument();
    expect(screen.getByText('1 Minggu Free Gym')).toBeInTheDocument();
    expect(screen.getByText('Diskon 50% SaladStop!')).toBeInTheDocument();
    expect(screen.getByText('Konsultasi Nutrisi')).toBeInTheDocument();
    expect(screen.getByText('Yoga Class Premium')).toBeInTheDocument();
    expect(screen.getByText('Healthy Snack Box')).toBeInTheDocument();
  });

  it('dapat memfilter voucher ke Kesehatan', () => {
    renderHadiah();
    fireEvent.click(screen.getByText('Kesehatan'));
    expect(screen.getByText('Voucher Medical Checkup')).toBeInTheDocument();
    expect(screen.getByText('Konsultasi Nutrisi')).toBeInTheDocument();
    expect(screen.queryByText('1 Minggu Free Gym')).not.toBeInTheDocument();
  });

  it('dapat memfilter voucher ke Makanan', () => {
    renderHadiah();
    fireEvent.click(screen.getByText('Makanan'));
    expect(screen.getByText('Diskon 50% SaladStop!')).toBeInTheDocument();
    expect(screen.getByText('Healthy Snack Box')).toBeInTheDocument();
    expect(screen.queryByText('Yoga Class Premium')).not.toBeInTheDocument();
  });

  it('dapat memfilter voucher ke Gym', () => {
    renderHadiah();
    fireEvent.click(screen.getByText('Gym'));
    expect(screen.getByText('1 Minggu Free Gym')).toBeInTheDocument();
    expect(screen.getByText('Yoga Class Premium')).toBeInTheDocument();
    expect(screen.queryByText('Voucher Medical Checkup')).not.toBeInTheDocument();
  });

  it('menampilkan badge Terbatas pada voucher Medical Checkup', () => {
    renderHadiah();
    expect(screen.getByText('Terbatas')).toBeInTheDocument();
  });

  it('menampilkan tombol Tukarkan Sekarang untuk voucher yang cukup poin', () => {
    renderHadiah();
    const tukarButtons = screen.getAllByText('Tukarkan Sekarang');
    expect(tukarButtons.length).toBeGreaterThan(0);
  });

  it('klik Tukarkan Sekarang membuka modal konfirmasi', () => {
    renderHadiah();
    const tukarButtons = screen.getAllByText('Tukarkan Sekarang');
    fireEvent.click(tukarButtons[0]);
    expect(screen.getByText('Konfirmasi Penukaran')).toBeInTheDocument();
  });

  it('modal konfirmasi menampilkan info poin', () => {
    renderHadiah();
    const tukarButtons = screen.getAllByText('Tukarkan Sekarang');
    fireEvent.click(tukarButtons[0]);
    expect(screen.getByText('Poin yang akan digunakan:')).toBeInTheDocument();
    expect(screen.getByText('Sisa poin setelahnya:')).toBeInTheDocument();
  });

  it('modal konfirmasi memiliki tombol Batal dan Tukar Sekarang', () => {
    renderHadiah();
    const tukarButtons = screen.getAllByText('Tukarkan Sekarang');
    fireEvent.click(tukarButtons[0]);
    expect(screen.getByText('Batal')).toBeInTheDocument();
    expect(screen.getByText('Tukar Sekarang')).toBeInTheDocument();
  });

  it('tombol Batal menutup modal', () => {
    renderHadiah();
    const tukarButtons = screen.getAllByText('Tukarkan Sekarang');
    fireEvent.click(tukarButtons[0]);
    expect(screen.getByText('Konfirmasi Penukaran')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Batal'));
    expect(screen.queryByText('Konfirmasi Penukaran')).not.toBeInTheDocument();
  });

  it('tombol Tukar Sekarang di modal menutup modal', () => {
    renderHadiah();
    const tukarButtons = screen.getAllByText('Tukarkan Sekarang');
    fireEvent.click(tukarButtons[0]);
    fireEvent.click(screen.getByText('Tukar Sekarang'));
    expect(screen.queryByText('Konfirmasi Penukaran')).not.toBeInTheDocument();
  });

  it('menampilkan section Riwayat Penukaran', () => {
    renderHadiah();
    expect(screen.getByText('Riwayat Penukaran')).toBeInTheDocument();
  });

  it('menampilkan riwayat penukaran voucher', () => {
    renderHadiah();
    expect(screen.getByText('Diskon 25% Juice It Up')).toBeInTheDocument();
    expect(screen.getByText('Personal Trainer 1-on-1')).toBeInTheDocument();
  });

  it('menampilkan status transaksi Berhasil dan Kadaluarsa', () => {
    renderHadiah();
    expect(screen.getByText('Berhasil')).toBeInTheDocument();
    expect(screen.getByText('Kadaluarsa')).toBeInTheDocument();
  });

  it('menampilkan tombol Lihat Semua di riwayat', () => {
    renderHadiah();
    expect(screen.getByText('Lihat Semua')).toBeInTheDocument();
  });

  it('menampilkan header tabel riwayat', () => {
    renderHadiah();
    expect(screen.getByText('Voucher')).toBeInTheDocument();
    expect(screen.getByText('Tanggal')).toBeInTheDocument();
    expect(screen.getByText('Poin Digunakan')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });
});

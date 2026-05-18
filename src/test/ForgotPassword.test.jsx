import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ForgotPassword from '../pages/ForgotPassword';

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/lupa-password']}>
      <ForgotPassword />
    </MemoryRouter>
  );

describe('ForgotPassword Page', () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => sessionStorage.clear());

  it('renders tanpa error', () => { renderPage(); });

  it('menampilkan judul Lupa Password', () => {
    renderPage();
    expect(screen.getByText('Lupa Password?')).toBeInTheDocument();
  });

  it('menampilkan deskripsi halaman', () => {
    renderPage();
    expect(screen.getByText(/Masukkan email yang terdaftar/i)).toBeInTheDocument();
  });

  it('menampilkan tombol Kembali ke Login', () => {
    renderPage();
    expect(screen.getByText(/Kembali ke Login/i)).toBeInTheDocument();
  });

  it('menampilkan input email', () => {
    renderPage();
    expect(screen.getByLabelText(/Alamat Email/i)).toBeInTheDocument();
  });

  it('menampilkan tombol Kirim Kode OTP', () => {
    renderPage();
    expect(screen.getByRole('button', { name: /Kirim Kode OTP/i })).toBeInTheDocument();
  });

  it('menampilkan error saat submit email kosong', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /Kirim Kode OTP/i }));
    expect(screen.getByText(/Email tidak boleh kosong/i)).toBeInTheDocument();
  });

  it('menampilkan error format email tidak valid', () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/Alamat Email/i), {
      target: { value: 'bukan-email' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Kirim Kode OTP/i }));
    expect(screen.getByText(/Format email tidak valid/i)).toBeInTheDocument();
  });

  it('error hilang saat user mengetik ulang', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /Kirim Kode OTP/i }));
    expect(screen.getByText(/Email tidak boleh kosong/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Alamat Email/i), {
      target: { value: 'a' },
    });
    expect(screen.queryByText(/Email tidak boleh kosong/i)).not.toBeInTheDocument();
  });

  it('submit email valid menampilkan pesan sukses', async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/Alamat Email/i), {
      target: { value: 'user@email.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Kirim Kode OTP/i }));
    expect(screen.getByText(/Email terkirim/i)).toBeInTheDocument();
    expect(screen.getByText(/user@email\.com/i)).toBeInTheDocument();
  });

  it('submit valid menyimpan email ke sessionStorage', () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/Alamat Email/i), {
      target: { value: 'user@email.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Kirim Kode OTP/i }));
    expect(sessionStorage.getItem('reset_email')).toBe('user@email.com');
  });
});

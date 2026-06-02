import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ForgotPassword from '../pages/ForgotPassword';
import { authApi } from '../lib/api';

vi.mock('../lib/api', () => ({
  authApi: {
    forgotPassword: vi.fn().mockResolvedValue({ status: 'success' }),
  },
}));

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/lupa-password']}>
      <ForgotPassword />
    </MemoryRouter>
  );

describe('ForgotPassword Page', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });
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

  it('submit email valid menyimpan email ke sessionStorage', async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/Alamat Email/i), {
      target: { value: 'user@email.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Kirim Kode OTP/i }));
    await waitFor(() => expect(authApi.forgotPassword).toHaveBeenCalledWith('user@email.com'));
    expect(sessionStorage.getItem('reset_email')).toBe('user@email.com');
  });

  it('submit email valid tidak menampilkan error', () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/Alamat Email/i), {
      target: { value: 'user@email.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Kirim Kode OTP/i }));
    expect(screen.queryByText(/tidak boleh kosong/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Format email tidak valid/i)).not.toBeInTheDocument();
  });

  it('menampilkan error dan menghentikan loading saat API gagal', async () => {
    authApi.forgotPassword.mockRejectedValueOnce(new Error('Server terlalu lama merespons.'));
    renderPage();

    fireEvent.change(screen.getByLabelText(/Alamat Email/i), {
      target: { value: 'user@email.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Kirim Kode OTP/i }));

    expect(screen.getByRole('button', { name: /Mengirim/i })).toBeDisabled();
    await waitFor(() => expect(screen.getByText(/Server terlalu lama merespons/i)).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /Kirim Kode OTP/i })).toBeInTheDocument();
  });
});

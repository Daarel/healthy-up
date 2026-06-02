import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ResetPasswordBaru from '../pages/ResetPasswordBaru';

vi.mock('../lib/api', () => ({
  authApi: {
    resetPassword: vi.fn().mockResolvedValue({ status: 'success' }),
  },
}));

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/reset-password/baru']}>
      <ResetPasswordBaru />
    </MemoryRouter>
  );

describe('ResetPasswordBaru Page', () => {
  beforeEach(() => {
    sessionStorage.setItem('reset_email', 'user@email.com');
    sessionStorage.setItem('reset_otp', '123456');
    vi.clearAllMocks();
  });

  afterEach(() => sessionStorage.clear());

  it('renders tanpa error', () => { renderPage(); });

  it('menampilkan judul Buat Password Baru', () => {
    renderPage();
    expect(screen.getByText('Buat Password Baru')).toBeInTheDocument();
  });

  it('menampilkan input Password Baru', () => {
    renderPage();
    expect(screen.getByLabelText(/Password Baru/i)).toBeInTheDocument();
  });

  it('menampilkan input Konfirmasi Password', () => {
    renderPage();
    expect(screen.getByLabelText(/Konfirmasi Password/i)).toBeInTheDocument();
  });

  it('menampilkan checklist syarat password', () => {
    renderPage();
    expect(screen.getByText(/Minimal 8 karakter/i)).toBeInTheDocument();
    expect(screen.getByText(/Mengandung huruf kapital/i)).toBeInTheDocument();
    expect(screen.getByText(/Mengandung angka/i)).toBeInTheDocument();
  });

  it('menampilkan tombol Simpan Password Baru', () => {
    renderPage();
    expect(screen.getByRole('button', { name: /Simpan Password Baru/i })).toBeInTheDocument();
  });

  it('menampilkan error saat submit form kosong', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /Simpan Password Baru/i }));
    expect(screen.getAllByText(/tidak boleh kosong/i).length).toBe(2);
  });

  it('menampilkan error password belum memenuhi syarat', () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/Password Baru/i), {
      target: { value: 'lemah' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Simpan Password Baru/i }));
    expect(screen.getByText(/belum memenuhi semua syarat/i)).toBeInTheDocument();
  });

  it('menampilkan error password tidak cocok', () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/Password Baru/i), {
      target: { value: 'Kuat123!' },
    });
    fireEvent.change(screen.getByLabelText(/Konfirmasi Password/i), {
      target: { value: 'Berbeda1!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Simpan Password Baru/i }));
    expect(screen.getByText(/Password tidak cocok/i)).toBeInTheDocument();
  });

  it('menampilkan strength bar saat mengetik password', () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/Password Baru/i), {
      target: { value: 'abc' },
    });
    expect(screen.getByText(/Kekuatan/i)).toBeInTheDocument();
  });

  it('menampilkan "Password cocok" saat konfirmasi sesuai', () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/Password Baru/i), {
      target: { value: 'Kuat123!' },
    });
    fireEvent.change(screen.getByLabelText(/Konfirmasi Password/i), {
      target: { value: 'Kuat123!' },
    });
    expect(screen.getByText(/Password cocok/i)).toBeInTheDocument();
  });

  it('toggle show/hide password berfungsi', () => {
    renderPage();
    const input = screen.getByLabelText(/Password Baru/i);
    const toggle = screen.getByRole('button', { name: /Tampilkan password/i });
    expect(input).toHaveAttribute('type', 'password');
    fireEvent.click(toggle);
    expect(input).toHaveAttribute('type', 'text');
  });

  it('submit valid menampilkan halaman sukses', async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/Password Baru/i), {
      target: { value: 'Kuat123!' },
    });
    fireEvent.change(screen.getByLabelText(/Konfirmasi Password/i), {
      target: { value: 'Kuat123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Simpan Password Baru/i }));
    await waitFor(() => expect(screen.getByText(/Password Berhasil Diubah/i)).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /Masuk Sekarang/i })).toBeInTheDocument();
  });
});

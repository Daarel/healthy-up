import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LinkTerkirim from '../pages/LinkTerkirim';

const renderPage = (email = null) => {
  if (email) sessionStorage.setItem('reset_email', email);
  return render(
    <MemoryRouter initialEntries={['/link-terkirim']}>
      <LinkTerkirim />
    </MemoryRouter>
  );
};

describe('LinkTerkirim Page', () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => sessionStorage.clear());

  it('renders tanpa error', () => {
    renderPage();
  });

  it('menampilkan judul Link Telah Dikirim', () => {
    renderPage();
    expect(screen.getByText('Link Telah Dikirim')).toBeInTheDocument();
  });

  it('menampilkan deskripsi pengiriman link', () => {
    renderPage();
    expect(
      screen.getByText(/Kami telah mengirimkan link reset password ke:/i)
    ).toBeInTheDocument();
  });

  it('menampilkan email dari sessionStorage', () => {
    renderPage('user@email.com');
    expect(screen.getByText('user@email.com')).toBeInTheDocument();
  });

  it('menampilkan email fallback jika sessionStorage kosong', () => {
    renderPage();
    expect(screen.getByText('emailmu@contoh.com')).toBeInTheDocument();
  });

  it('menampilkan instruksi membuka email', () => {
    renderPage();
    expect(
      screen.getByText(/Buka email kamu dan klik link yang kami kirimkan/i)
    ).toBeInTheDocument();
  });

  it('menampilkan info link berlaku 15 menit', () => {
    renderPage();
    expect(screen.getByText('15 menit')).toBeInTheDocument();
  });

  it('menampilkan info folder Spam', () => {
    renderPage();
    expect(screen.getByText('Spam')).toBeInTheDocument();
  });

  it('menampilkan tombol Kirim Ulang Email', () => {
    renderPage();
    expect(
      screen.getByRole('button', { name: /Kirim Ulang Email/i })
    ).toBeInTheDocument();
  });

  it('tombol Kirim Ulang Email dapat diklik', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /Kirim Ulang Email/i }));
  });

  it('menampilkan tombol Kembali', () => {
    renderPage();
    expect(screen.getByText('Kembali')).toBeInTheDocument();
  });

  it('tombol Kembali dapat diklik', () => {
    renderPage();
    fireEvent.click(screen.getByText('Kembali'));
  });

  it('menampilkan teks Sudah punya akun?', () => {
    renderPage();
    expect(screen.getByText('Sudah punya akun?')).toBeInTheDocument();
  });

  it('menampilkan link Masuk', () => {
    renderPage();
    expect(screen.getByRole('button', { name: /^Masuk$/i })).toBeInTheDocument();
  });

  it('tombol Masuk dapat diklik', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /^Masuk$/i }));
  });
});

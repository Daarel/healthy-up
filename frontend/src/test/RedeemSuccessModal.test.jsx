import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RedeemSuccessModal from '../components/RedeemSuccessModal';

const mockVoucher = {
  title: 'Voucher Medical Checkup',
  image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
  category: 'Kesehatan',
  points: 5000,
  code: 'HEALTH2024',
};

const renderModal = (overrides = {}) => {
  const props = {
    voucher: mockVoucher,
    remainingPts: 7450,
    onClose: vi.fn(),
    codeCopied: false,
    onCopy: vi.fn(),
    ...overrides,
  };
  return { ...render(<RedeemSuccessModal {...props} />), props };
};

describe('RedeemSuccessModal Component', () => {
  it('renders tanpa error', () => {
    renderModal();
  });

  it('tidak merender apapun jika voucher null', () => {
    const { container } = render(
      <RedeemSuccessModal
        voucher={null}
        remainingPts={0}
        onClose={vi.fn()}
        codeCopied={false}
        onCopy={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('menampilkan judul Penukaran Berhasil!', () => {
    renderModal();
    expect(screen.getByText('Penukaran Berhasil!')).toBeInTheDocument();
  });

  it('menampilkan pesan selamat', () => {
    renderModal();
    expect(
      screen.getByText(/Selamat! Voucher kamu sudah siap digunakan/i)
    ).toBeInTheDocument();
  });

  it('menampilkan nama voucher', () => {
    renderModal();
    expect(screen.getByText('Voucher Medical Checkup')).toBeInTheDocument();
  });

  it('menampilkan kategori voucher', () => {
    renderModal();
    expect(screen.getByText('Kesehatan')).toBeInTheDocument();
  });

  it('menampilkan gambar voucher dengan alt yang benar', () => {
    renderModal();
    const img = screen.getByAltText('Voucher Medical Checkup');
    expect(img).toBeInTheDocument();
  });

  it('menampilkan label Poin digunakan', () => {
    renderModal();
    expect(screen.getByText('Poin digunakan')).toBeInTheDocument();
  });

  it('menampilkan poin yang digunakan dengan format benar', () => {
    renderModal();
    expect(screen.getByText(/-5[.,]000 Pts/)).toBeInTheDocument();
  });

  it('menampilkan label Sisa poin kamu', () => {
    renderModal();
    expect(screen.getByText('Sisa poin kamu')).toBeInTheDocument();
  });

  it('menampilkan sisa poin dengan format benar', () => {
    renderModal();
    expect(screen.getByText(/7[.,]450 Pts/)).toBeInTheDocument();
  });

  it('menampilkan label Kode Voucher', () => {
    renderModal();
    expect(screen.getByText('Kode Voucher')).toBeInTheDocument();
  });

  it('menampilkan kode voucher', () => {
    renderModal();
    expect(screen.getByText('HEALTH2024')).toBeInTheDocument();
  });

  it('menampilkan tombol Salin saat belum disalin', () => {
    renderModal({ codeCopied: false });
    expect(screen.getByText('Salin')).toBeInTheDocument();
  });

  it('menampilkan tombol Tersalin saat sudah disalin', () => {
    renderModal({ codeCopied: true });
    expect(screen.getByText('Tersalin')).toBeInTheDocument();
  });

  it('memanggil onCopy saat tombol Salin diklik', () => {
    const { props } = renderModal({ codeCopied: false });
    fireEvent.click(screen.getByText('Salin'));
    expect(props.onCopy).toHaveBeenCalledTimes(1);
  });

  it('menampilkan instruksi penggunaan kode', () => {
    renderModal();
    expect(
      screen.getByText(/Tunjukkan kode ini kepada merchant/i)
    ).toBeInTheDocument();
  });

  it('menampilkan tombol Kembali ke Pusat Hadiah', () => {
    renderModal();
    expect(
      screen.getByRole('button', { name: /Kembali ke Pusat Hadiah/i })
    ).toBeInTheDocument();
  });

  it('memanggil onClose saat tombol Kembali ke Pusat Hadiah diklik', () => {
    const { props } = renderModal();
    fireEvent.click(screen.getByRole('button', { name: /Kembali ke Pusat Hadiah/i }));
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it('menampilkan tombol X untuk menutup modal', () => {
    renderModal();
    expect(screen.getByRole('button', { name: /Tutup modal/i })).toBeInTheDocument();
  });

  it('memanggil onClose saat tombol X diklik', () => {
    const { props } = renderModal();
    fireEvent.click(screen.getByRole('button', { name: /Tutup modal/i }));
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });
});

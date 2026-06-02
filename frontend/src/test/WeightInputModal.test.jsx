import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WeightInputModal from '../components/WeightInputModal';

const renderModal = (overrides = {}) => {
  const props = {
    isOpen: true,
    onClose: vi.fn(),
    onSuccess: vi.fn(),
    currentWeight: 68.5,
    targetWeight: 65,
    allowNote: false,
    allowMultiplePerDay: false,
    ...overrides,
  };
  return { ...render(<WeightInputModal {...props} />), props };
};

describe('WeightInputModal Component', () => {
  it('renders tanpa error saat isOpen true', () => {
    renderModal();
  });

  it('tidak merender apapun saat isOpen false', () => {
    const { container } = render(
      <WeightInputModal
        isOpen={false}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        currentWeight={68.5}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('menampilkan judul Catat Berat Badan', () => {
    renderModal();
    expect(screen.getByText('Catat Berat Badan')).toBeInTheDocument();
  });

  it('menampilkan label Berat Badan (kg)', () => {
    renderModal();
    expect(screen.getByLabelText(/Berat Badan \(kg\)/i)).toBeInTheDocument();
  });

  it('menampilkan placeholder dengan berat terakhir', () => {
    renderModal({ currentWeight: 68.5 });
    expect(screen.getByPlaceholderText('Terakhir: 68.5 kg')).toBeInTheDocument();
  });

  it('menampilkan tombol Batal', () => {
    renderModal();
    expect(screen.getByRole('button', { name: /Batal/i })).toBeInTheDocument();
  });

  it('menampilkan tombol Simpan', () => {
    renderModal();
    expect(screen.getByTestId('btn-simpan-berat')).toBeInTheDocument();
  });

  it('memanggil onClose saat tombol Batal diklik', () => {
    const { props } = renderModal();
    fireEvent.click(screen.getByRole('button', { name: /Batal/i }));
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it('memanggil onClose saat tombol X diklik', () => {
    const { props } = renderModal();
    fireEvent.click(screen.getByRole('button', { name: /Tutup/i }));
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it('menampilkan error saat submit tanpa mengisi input', () => {
    renderModal();
    fireEvent.click(screen.getByTestId('btn-simpan-berat'));
    expect(
      screen.getByText(/Masukkan angka berat badan yang valid/i)
    ).toBeInTheDocument();
  });

  it('menampilkan error saat berat di bawah 20 kg', () => {
    renderModal();
    fireEvent.change(screen.getByTestId('input-berat'), { target: { value: '10' } });
    fireEvent.click(screen.getByTestId('btn-simpan-berat'));
    expect(screen.getByText(/20 – 300 kg/i)).toBeInTheDocument();
  });

  it('menampilkan error saat berat di atas 300 kg', () => {
    renderModal();
    fireEvent.change(screen.getByTestId('input-berat'), { target: { value: '350' } });
    fireEvent.click(screen.getByTestId('btn-simpan-berat'));
    expect(screen.getByText(/20 – 300 kg/i)).toBeInTheDocument();
  });

  it('error hilang saat user mengetik ulang', () => {
    renderModal();
    fireEvent.click(screen.getByTestId('btn-simpan-berat'));
    expect(
      screen.getByText(/Masukkan angka berat badan yang valid/i)
    ).toBeInTheDocument();
    fireEvent.change(screen.getByTestId('input-berat'), { target: { value: '65' } });
    expect(
      screen.queryByText(/Masukkan angka berat badan yang valid/i)
    ).not.toBeInTheDocument();
  });

  it('memanggil onSuccess dengan nilai yang benar saat submit valid', () => {
    const { props } = renderModal();
    fireEvent.change(screen.getByTestId('input-berat'), { target: { value: '67.0' } });
    fireEvent.click(screen.getByTestId('btn-simpan-berat'));
    expect(props.onSuccess).toHaveBeenCalledWith(67, '');
  });

  it('menampilkan perubahan dari sebelumnya saat mengetik angka', () => {
    renderModal({ currentWeight: 68.5 });
    fireEvent.change(screen.getByTestId('input-berat'), { target: { value: '67.0' } });
    expect(screen.getByText(/Perubahan dari sebelumnya/i)).toBeInTheDocument();
  });

  it('menampilkan selisih negatif saat berat baru lebih kecil', () => {
    renderModal({ currentWeight: 68.5 });
    fireEvent.change(screen.getByTestId('input-berat'), { target: { value: '67.0' } });
    expect(screen.getByText('-1.5 kg')).toBeInTheDocument();
  });

  it('menampilkan selisih positif saat berat baru lebih besar', () => {
    renderModal({ currentWeight: 68.5 });
    fireEvent.change(screen.getByTestId('input-berat'), { target: { value: '70.0' } });
    expect(screen.getByText('+1.5 kg')).toBeInTheDocument();
  });

  it('menampilkan info target saat targetWeight diberikan dan input kosong', () => {
    renderModal({ targetWeight: 65 });
    expect(screen.getByText(/Berat sebelumnya:/i)).toBeInTheDocument();
    expect(screen.getByText(/Target:/i)).toBeInTheDocument();
  });

  it('tidak menampilkan field catatan secara default (allowNote false)', () => {
    renderModal({ allowNote: false });
    expect(screen.queryByTestId('input-catatan')).not.toBeInTheDocument();
  });

  it('menampilkan field catatan saat allowNote true', () => {
    renderModal({ allowNote: true });
    expect(screen.getByTestId('input-catatan')).toBeInTheDocument();
  });

  it('dapat mengisi field catatan saat allowNote true', () => {
    renderModal({ allowNote: true });
    fireEvent.change(screen.getByTestId('input-catatan'), {
      target: { value: 'Setelah olahraga pagi' },
    });
    expect(screen.getByDisplayValue('Setelah olahraga pagi')).toBeInTheDocument();
  });

  it('memanggil onSuccess dengan catatan saat allowNote true', () => {
    const { props } = renderModal({ allowNote: true });
    fireEvent.change(screen.getByTestId('input-berat'), { target: { value: '67.0' } });
    fireEvent.change(screen.getByTestId('input-catatan'), {
      target: { value: 'Setelah olahraga' },
    });
    fireEvent.click(screen.getByTestId('btn-simpan-berat'));
    expect(props.onSuccess).toHaveBeenCalledWith(67, 'Setelah olahraga');
  });

  it('menampilkan pesan sekali per minggu saat allowMultiplePerDay false', () => {
    renderModal({ allowMultiplePerDay: false });
    expect(
      screen.getByText(/Berat badan hanya bisa dicatat sekali per minggu/i)
    ).toBeInTheDocument();
  });

  it('tidak menampilkan pesan sekali per minggu saat allowMultiplePerDay true', () => {
    renderModal({ allowMultiplePerDay: true });
    expect(
      screen.queryByText(/Berat badan hanya bisa dicatat sekali per minggu/i)
    ).not.toBeInTheDocument();
  });

  it('modal memiliki role dialog', () => {
    renderModal();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('input dikosongkan setelah submit berhasil', () => {
    renderModal();
    const input = screen.getByTestId('input-berat');
    fireEvent.change(input, { target: { value: '67.0' } });
    fireEvent.click(screen.getByTestId('btn-simpan-berat'));
    expect(input.value).toBe('');
  });
});

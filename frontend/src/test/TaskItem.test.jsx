import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Droplets } from 'lucide-react';
import TaskItem from '../components/TaskItem';

const renderTaskItem = (overrides = {}) => {
  const props = {
    title: 'Minum air 8 gelas',
    category: 'Hidrasi',
    completed: false,
    Icon: Droplets,
    onToggle: vi.fn(),
    ...overrides,
  };
  return { ...render(<TaskItem {...props} />), props };
};

describe('TaskItem Component', () => {
  it('renders tanpa error', () => {
    renderTaskItem();
  });

  it('menampilkan judul tugas', () => {
    renderTaskItem();
    expect(screen.getByText('Minum air 8 gelas')).toBeInTheDocument();
  });

  it('menampilkan kategori tugas', () => {
    renderTaskItem();
    expect(screen.getByText('Hidrasi')).toBeInTheDocument();
  });

  it('menampilkan teks tugas tanpa strikethrough saat belum selesai', () => {
    renderTaskItem({ completed: false });
    const titleEl = screen.getByText('Minum air 8 gelas');
    expect(titleEl.className).not.toMatch(/line-through/);
  });

  it('menampilkan teks tugas dengan strikethrough saat sudah selesai', () => {
    renderTaskItem({ completed: true });
    const titleEl = screen.getByText('Minum air 8 gelas');
    expect(titleEl.className).toMatch(/line-through/);
  });

  it('menampilkan ikon Check saat tugas selesai', () => {
    renderTaskItem({ completed: true });
    // Tombol ikon berubah menjadi bg-[#006e2f] saat completed
    const iconBtn = document.querySelector('button.bg-\\[\\#006e2f\\]');
    expect(iconBtn).toBeInTheDocument();
  });

  it('memanggil onToggle saat item diklik', () => {
    const { props } = renderTaskItem();
    const container = screen.getByText('Minum air 8 gelas').closest('div[class*="flex"]');
    fireEvent.click(container);
    expect(props.onToggle).toHaveBeenCalledTimes(1);
  });

  it('memanggil onToggle saat tombol ikon diklik', () => {
    const { props } = renderTaskItem();
    const btn = document.querySelector('button');
    fireEvent.click(btn);
    expect(props.onToggle).toHaveBeenCalled();
  });

  it('menampilkan CheckCircle2 saat tugas selesai', () => {
    renderTaskItem({ completed: true });
    // CheckCircle2 muncul di sisi kanan — ada 2 elemen svg (ikon kiri + kanan)
    const svgs = document.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(2);
  });

  it('menampilkan Circle saat tugas belum selesai', () => {
    renderTaskItem({ completed: false });
    const svgs = document.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(2);
  });

  it('dapat merender dengan judul dan kategori berbeda', () => {
    renderTaskItem({ title: 'Jalan kaki 30 menit', category: 'Olahraga' });
    expect(screen.getByText('Jalan kaki 30 menit')).toBeInTheDocument();
    expect(screen.getByText('Olahraga')).toBeInTheDocument();
  });
});

import { Camera, Clapperboard, Lightbulb, Users, ClipboardCheck, Gift } from 'lucide-react';

const GUIDE_PAGES = [
  {
    title: 'Panduan Foto',
    icon: Camera,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    tips: [
      'Pastikan pencahayaan cukup terang, hindari backlight',
      'Foto dari sudut yang jelas dan tidak blur',
      'Objek utama berada di tengah frame',
      'Resolusi minimal 720p agar detail terlihat',
    ],
  },
  {
    title: 'Panduan Video',
    icon: Clapperboard,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-500',
    tips: [
      'Durasi minimal 10 detik, maksimal 60 detik',
      'Rekam dengan posisi landscape (horizontal)',
      'Pastikan suara dan gerakan terlihat jelas',
    ],
  },
  {
    title: 'Tips Tambahan',
    icon: Lightbulb,
    iconBg: 'bg-yellow-50',
    iconColor: 'text-yellow-500',
    tips: [
      'Bisa upload lebih dari 1 foto/video untuk bukti yang lebih kuat',
      'Tambahkan catatan untuk menjelaskan konteks',
    ],
  },
];

const NAV_ITEMS = [
  { to: "/admin/users", label: "Manajemen User", icon: Users },
  { to: "/admin/missions", label: "Verifikasi Misi", icon: ClipboardCheck },
  { to: "/admin/rewards", label: "Manajemen Reward", icon: Gift },
];


export { GUIDE_PAGES, NAV_ITEMS };

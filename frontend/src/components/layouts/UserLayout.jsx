import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar';

export default function UserLayout() {
  return (
    <div className='min-h-screen bg-[var(--color-bg)]'>
      <Navbar />
      <main className='lg:ml-72 pb-20 lg:pb-0'>
        <Outlet />
      </main>
    </div>
  );
}

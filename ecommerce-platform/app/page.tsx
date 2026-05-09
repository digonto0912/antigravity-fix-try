'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { seedData } from '@/lib/seed';

export default function Home() {
  const router = useRouter();
  useEffect(() => { seedData(); }, []);
  useEffect(() => { router.push('/admin'); }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-500" />
    </div>
  );
}

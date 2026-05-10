'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Redirect /account/orders to /account (orders are shown on the account page)
export default function OrdersRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/account'); }, [router]);
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500 mx-auto" />
    </div>
  );
}

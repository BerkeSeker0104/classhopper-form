'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import dynamic from 'next/dynamic';

// AdminDashboard'u dynamic import ile yükle
const AdminDashboard = dynamic(() => import('./AdminDashboard'), { ssr: false });

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { auth } = await import('@/lib/firebase');
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            setUser(user);
          } else {
            router.push('/admin/login');
          }
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Firebase auth error:', error);
        setLoading(false);
        router.push('/admin/login');
      }
    };

    let unsubscribe: (() => void) | undefined;
    initAuth().then((unsub) => {
      unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading-spinner w-8 h-8" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <span className="ml-4 text-sm text-gray-600">
                Hoş geldiniz, {user.email}
              </span>
            </div>
            <button
              onClick={() => {
                import('@/lib/firebase').then(({ auth }) => {
                  auth.signOut();
                  router.push('/admin/login');
                });
              }}
              className="btn-outline"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </header>

      {/* AdminDashboard Component */}
      <AdminDashboard />
    </div>
  );
}
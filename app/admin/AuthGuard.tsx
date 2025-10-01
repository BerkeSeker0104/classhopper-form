'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Firebase'i dynamic import ile yükle
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

  return <>{children}</>;
}

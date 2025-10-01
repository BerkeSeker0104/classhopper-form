'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Firebase'i dynamic import ile yükle
const LoginForm = dynamic(() => import('./LoginForm'), { ssr: false });

export default function AdminLoginPage() {
  return <LoginForm />;
}

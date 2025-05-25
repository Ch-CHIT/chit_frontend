'use client';

import BtnUserProfile from '@/components/atoms/button/BtnUserProfile';
import useAuthStore from '@/store/authStore';
import { useEffect, useRef } from 'react';

export default function AuthInitializerClient({ accessToken }: { accessToken: string | null }) {
  const {
    setAccessToken,
    isRehydrated,
  } = useAuthStore((state) => state);
  const isCalled = useRef(false);
  //새로고침시에 불러오기

  useEffect(() => {
    console.log('✅ Init triggered');
  }, []);

  useEffect(() => {
    if (isCalled.current) return;
    isCalled.current = true;
    if (accessToken) {
      setAccessToken(accessToken);
    }
  }, [setAccessToken]);

  if (!isRehydrated) return;
  return <BtnUserProfile />;
}

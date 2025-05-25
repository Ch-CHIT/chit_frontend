'use client';

import BtnUserProfile from '@/components/atoms/button/BtnUserProfile';
import useAuthStore from '@/store/authStore';
import { useEffect } from 'react';

export default function AuthInitializerClient({ accessToken }: { accessToken: string | null }) {
  const { setAccessToken, isRehydrated } = useAuthStore((state) => state);

  //새로고침시에 불러오기

  useEffect(() => {
    console.log('✅ Init triggered');
  }, []);

  useEffect(() => {
    if (accessToken) {
      setAccessToken(accessToken);
    }
  }, [setAccessToken, accessToken]);

  if (!isRehydrated) return;
  return <BtnUserProfile />;
}

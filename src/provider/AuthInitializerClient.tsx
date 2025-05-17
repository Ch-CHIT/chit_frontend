'use client';

import BtnUserProfile from '@/components/atoms/button/BtnUserProfile';
import useAuthStore from '@/store/authStore';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function AuthInitializerClient({
  accessToken,
  refreshToken,
}: {
  accessToken: string | null;
  refreshToken: string | null;
}) {
  const [bootstrapped, setBootstrapped] = useState(false);
  const setAccestoken = useAuthStore((state) => state.setAccessToken);
  //새로고침시에 불러오기

  useEffect(() => {
    console.log('✅ Init triggered');
    setBootstrapped(true);
  }, []);

  useEffect(() => {
    setAccestoken(accessToken);
  }, [accessToken, setAccestoken]);

  if (!refreshToken || !accessToken) {
    console.log('🔴 tokenInitializer  refreshToken 없음');
    return <div></div>;
  }
  if (!bootstrapped)
    return <Image src="/assets/loading.svg" alt="loading" width="40" height="40"></Image>;

  return <BtnUserProfile />;
}

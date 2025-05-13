'use client';

import BtnUserProfile from '@/components/atoms/button/BtnUserProfile';
import useLogout from '@/hooks/useLogout';
import useParamsParser from '@/hooks/useParamsParser';
import useAuthStore from '@/store/authStore';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AuthInitializerClient({
  accessToken,
  refreshToken,
}: {
  accessToken: string | null;
  refreshToken: string | null;
}) {
  const [bootstrapped, setBootstrapped] = useState(false);
  const { channelId, sessionCode } = useParamsParser();
  const router = useRouter();
  //새로고침시에 불러오기

  useEffect(() => {
    const init = async () => {
      console.log('✅ Init triggered');
      if (!accessToken) {
        if (channelId && sessionCode) {
          router.push(`/${channelId}/${sessionCode}`);
        } else router.push('/');
      }
    };

    init();
    setBootstrapped(true);
  }, [accessToken, channelId, router, sessionCode]);

  if (!refreshToken || !accessToken) {
    console.log('🔴 tokenInitializer  refreshToken 없음');
    return <div>없음</div>;
  }
  if (!bootstrapped)
    return <Image src="/assets/loading.svg" alt="loading" width="40" height="40"></Image>;

  return <BtnUserProfile />;
}

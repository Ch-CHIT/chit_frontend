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
  const resetLocal = useLogout();
  const { setAccessToken, setLogin, isLogin } = useAuthStore((state) => state);
  const [bootstrapped, setBootstrapped] = useState(false);
  const { channelId, sessionCode } = useParamsParser();
  const router = useRouter();
  //새로고침시에 불러오기

  useEffect(() => {
    const init = async () => {
      console.log('✅ Init triggered');
      console.log({ accessToken, refreshToken });
      console.log('isLogin', isLogin);
      if (!refreshToken) {
        console.log('🔴 tokenInitializer  refreshToken 없음');
        console.log('isLogin', isLogin);

        return;
      }
      if (!accessToken) {
        console.log('🔴 tokenInitializer  accessToken 없음');
        console.log('isLogin', isLogin);

        setLogin(false);
        return;
      }
      if (!isLogin && accessToken) {
        // ✅ SSR에서 받은 accessToken만 활용
        console.log('🔵 tokenInitializer  accessToken 있음');
        console.log(isLogin);
        setLogin(true);
        setAccessToken(accessToken);
      } else if (!isLogin && !accessToken) {
        resetLocal();
        if (channelId && sessionCode) {
          router.push(`/${channelId}/${sessionCode}`);
        } else router.push('/');
      }
      setBootstrapped(true);
    };

    init();
  }, [
    accessToken,
    bootstrapped,
    channelId,
    isLogin,
    refreshToken,
    resetLocal,
    router,
    sessionCode,
    setAccessToken,
    setLogin,
  ]);

  if (!refreshToken) {
    console.log('🔴 isLogin false');
    return null;
  }
  if (!bootstrapped)
    return <Image src="/assets/loading.svg" alt="loading" width="40" height="40"></Image>;

  return <BtnUserProfile />;
}

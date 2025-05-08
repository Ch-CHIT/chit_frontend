'use client';

import BtnUserProfile from '@/components/atoms/button/BtnUserProfile';
import useLogout from '@/hooks/useLogout';
import useParamsParser from '@/hooks/useParamsParser';
import useAuthStore from '@/store/authStore';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

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

  if (!refreshToken) toast.warn('refresh토큰이 없습니다!');
  useEffect(() => {
    const init = async () => {
      if (!isLogin && accessToken) {
        // ✅ SSR에서 받은 accessToken만 활용
        setLogin(true);
        setAccessToken(accessToken);
      } else if (!isLogin && !accessToken) {
        resetLocal();
        if (channelId && sessionCode) router.push(`/${channelId}/${sessionCode}`);
        else router.push('/');
      }
      setBootstrapped(true);
    };

    init();
  }, []);

  if (!bootstrapped)
    return <Image src="/assets/loading.svg" alt="loading" width="40" height="40"></Image>;
  if (!isLogin) {
    return null;
  }
  return <BtnUserProfile />;
}

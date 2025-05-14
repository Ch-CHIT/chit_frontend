'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import CommonLayout from '@/components/layout/CommonLayout';
import { login } from '@/services/auth/auth';
import { isErrorResponse } from '@/lib/handleErrors';
import useParamsParser from '@/hooks/useParamsParser';
import useChannelStore from '@/store/channelStore';

export default function Page() {
  const router = useRouter();
  const { setChannelId } = useChannelStore();
  const { channelId, sessionCode } = useParamsParser();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const isRehydrated = useAuthStore((state) => state.isRehydrated);
  const { setLogin, setAccessToken } = useAuthStore((state) => state);

  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!code || !state || !isRehydrated) return;

    const loginAndRedirect = async () => {
      setIsRedirecting(true);

      const response = await login({
        code: code,
        state: state,
      }).then((res) => {
        router.refresh();
        return res;
      });

      if (isErrorResponse(response)) {
        setIsRedirecting(false);
        return;
      }

      const { accessToken, channelId: userChannelId } = response;
      setAccessToken(accessToken);
      //시청자일때
      if (channelId) {
        setChannelId(channelId);
      } else {
        //스트리머일때
        setChannelId(userChannelId);
      }
      const targetUrl = channelId && sessionCode ? `/${channelId}/${sessionCode}` : '/';

      router.replace(targetUrl); //2번 케이스 채널 id가 있을 경우
    };

    loginAndRedirect();
  }, [
    code,
    state,
    channelId,
    setLogin,
    router,
    isRehydrated,
    sessionCode,
    setAccessToken,
    setChannelId,
  ]);

  if (!code && !state) {
    return (
      <CommonLayout>
        <div>재로그인이 필요합니다.</div>
        <button onClick={() => (window.location.href = '/login')}>로그인 하러 가기</button>
      </CommonLayout>
    );
  }

  return <CommonLayout>{isRedirecting ? <div>잠시만 기다려 주세요...</div> : null}</CommonLayout>;
}

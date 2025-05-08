'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useChannelStore from '@/store/channelStore';
import useAuthStore from '@/store/authStore';
import useContentsSessionStore from '@/store/sessionStore';
import CommonLayout from '@/components/layout/CommonLayout';
import { login } from '@/services/auth/auth';
import { isErrorResponse } from '@/lib/handleErrors';

export default function Page() {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const searchParams = useSearchParams();
  const sessionCode = useContentsSessionStore((state) => state.sessionInfo?.sessionCode);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const isRehydrated = useAuthStore((state) => state.isRehydrated);
  const { setChannelId, channelId } = useChannelStore((state) => state);
  const { setLogin, setAccessToken } = useAuthStore((state) => state);
  const router = useRouter();

  // 로그인의 경우의 수는 두가지
  //1. 홈으로 접속 로그인 후 바로 콜백페이지
  //2. 시청자로 링크타고 온 경우 (시청자는 별도의 ?파라미터 필요할듯)
  //1-2. 1의 경우 code와 state로 바로 대기 화면으로 이동시키면 됨
  //2-2. 2의 경우 1. 채널id와, role을 뽑아내어 리다이렉트 시켜야함 (channelId는 이미 페이지에 접속할 때 담겨있음)
  //*channelId 가 없을경우 기본 ""

  useEffect(() => {
    const onCompleteChannelId = async (channelId?: string | string[]) => {
      if (!code || !state)
        return (
          <CommonLayout>
            <div>잘못된 접근입니다. 다시 로그인해 주세요.</div>
            <button onClick={() => (window.location.href = '/login')}>로그인 하러 가기</button>
          </CommonLayout>
        );

      const requestData = {
        code: code,
        state: state,
      };

      const response = await login(requestData);
      if (!isErrorResponse(response)) {
        const { accessToken, channelId } = response;
        console.log('accessToken', accessToken);
        console.log('channelId', channelId);
        setChannelId(channelId);
        setAccessToken(accessToken);
        setLogin(true);
      }
      if (channelId && sessionCode) {
        router.push(`/${channelId}/${sessionCode}`); //2번 케이스 채널 id가 있을 경우
      } else {
        router.push('/');
      }
    };

    if (code && state && isRehydrated) {
      setIsRedirecting(true);
      onCompleteChannelId(channelId);
    }
  }, [code, state, channelId, setLogin, router, isRehydrated, sessionCode]);

  if (!code && state) {
    return (
      <CommonLayout>
        <div>재로그인이 필요합니다.</div>
        <button onClick={() => (window.location.href = '/login')}>로그인 하러 가기</button>
      </CommonLayout>
    );
  }

  return <CommonLayout>{isRedirecting ? <div>잠시만 기다려 주세요...</div> : null}</CommonLayout>;
}

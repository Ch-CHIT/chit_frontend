'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore, { UserRoleType } from '@/store/authStore';
import CommonLayout from '@/components/layout/CommonLayout';
import { login } from '@/services/auth/auth';
import useChannelStore from '@/store/channelStore';
import Loading from '@/app/loading';
type LoginClientPageProps = {
  code: string;
  state: string;
  role: UserRoleType;
};

export default function LoginClientPage({ code, state, role }: LoginClientPageProps) {
  const router = useRouter();
  const { isRehydrated } = useAuthStore((state) => state);
  const { setChannelId, setSessionCode, channelId, sessionCode } = useChannelStore(
    (state) => state,
  );
  const { setAccessToken, setRole, setLogin, isLogin } = useAuthStore((state) => state);

  console.log(code, state, role);
  useEffect(() => {
    if (!isRehydrated) return;
    if (isLogin) return;
    const loginAndRedirect = async () => {
      const response = await login({
        code: code,
        state: state,
      }).then((res) => {
        return res;
      });

      if (response.success) {
        const { accessToken, channelId: userChannelId } = response.data;
        setAccessToken(accessToken);
        setRole(role);
        setLogin(true);

        // 채널 상태 저장 (VIEWER/STREAMER 별 분기)
        if (role === 'STREAMER') {
          setChannelId(userChannelId);
        } else {
          if (channelId && sessionCode) {
            setChannelId(channelId);
            setSessionCode(sessionCode);
          }
        }
      }
    };

    loginAndRedirect();
  }, [
    isRehydrated,
    sessionCode,
    role,
    code,
    state,
    setAccessToken,
    setRole,
    setLogin,
    setChannelId,
    setSessionCode,
    channelId,
    isLogin,
  ]);

  // 2. 상태 변화 감지 후 리디렉트
  useEffect(() => {
    if (!isLogin) return;
    // VIEWER는 채널, 세션코드 필요
    let targetUrl = '/';
    if (role === 'VIEWER' && channelId && sessionCode) {
      targetUrl = `/viewer/${channelId}/${sessionCode}`;
    }
    router.replace(targetUrl);
  }, [isLogin, role, channelId, sessionCode, router]);

  if (!isRehydrated) {
    return <Loading />;
  }
  if (!code || !state || !role) {
    return (
      <CommonLayout>
        <div>재로그인이 필요합니다.</div>
        <button onClick={() => window.history.go(-2)}>로그인 하러 가기</button>
      </CommonLayout>
    );
  }

  return <Loading />;
}

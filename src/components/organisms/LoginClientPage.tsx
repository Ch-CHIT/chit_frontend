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
  const { setAccessToken, setRole } = useAuthStore((state) => state);

  useEffect(() => {
    if (!isRehydrated) return;

    const loginAndRedirect = async () => {
      const response = await login({
        code: code,
        state: state,
      }).then((res) => {
        router.refresh();
        return res;
      });
      console.log('respnse');
      console.log(response);
      if (response.success) {
        const { accessToken, channelId: userChannelId } = response.data;
        setAccessToken(accessToken);
        let targetId = userChannelId;

        //스트리머일때
        if (role === 'STREAMER') setChannelId(userChannelId);
        else {
          //시청자일때
          if (channelId && sessionCode) {
            setChannelId(channelId);
            setSessionCode(sessionCode);

            targetId = channelId;
          }
        }

        setRole(role);

        const targetUrl = role == 'VIEWER' ? `/${targetId}/${sessionCode}` : '/';
        router.replace(targetUrl);
      }
    };

    loginAndRedirect();
  }, [
    channelId,
    router,
    isRehydrated,
    sessionCode,
    setAccessToken,
    setChannelId,
    role,
    setSessionCode,
    code,
    state,
    setRole,
  ]);

  if (!isRehydrated) {
    <Loading />;
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

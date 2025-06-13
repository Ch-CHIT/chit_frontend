'use client';
import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore, { UserRoleType } from '@/store/authStore';
import CommonLayout from '@/components/layout/CommonLayout';
import { login } from '@/services/auth/auth';
import useChannelStore from '@/store/channelStore';
import Loading from '@/app/loading';
import { postStreamerInfo } from '@/services/streamer/streamer';
type LoginClientPageProps = {
  code: string;
  state: string;
  role: UserRoleType;
};

export default function LoginClientPage({ code, state, role }: LoginClientPageProps) {
  const router = useRouter();
  const { isRehydrated } = useAuthStore((state) => state);
  const { setChannelId, setSessionCode, channelId, sessionCode, setMyChannelInfo } =
    useChannelStore((state) => state);
  const {
    setAccessToken,
    setRole,
    setLogin,
    isLogin,
    accessToken: navAccessToken,
  } = useAuthStore((state) => state);

  const fetchMyData = useCallback(async (viewerChannelId: string) => {
    const response = await postStreamerInfo(viewerChannelId);
    if (response) {
    }
    return response;
  }, []);

  const handleAccessToken = useCallback(
    (accessToken: string | null | undefined) => {
      // 보통은 accessToken이 존재할 때만 set
      if (!navAccessToken && accessToken) {
        console.log('🔵 accessToken 설정');
        setAccessToken(accessToken);
      }
    },
    [navAccessToken, setAccessToken],
  );

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

        handleAccessToken(accessToken);
        setRole(role);
        setLogin(true);

        try {
          const myData = await fetchMyData(userChannelId);
          setMyChannelInfo(myData);
        } catch (error) {
          console.error('데이터를 가져오는 중 오류가 발생했습니다:', error);
        }

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
    setRole,
    setLogin,
    setChannelId,
    setSessionCode,
    channelId,
    isLogin,
    fetchMyData,
    setMyChannelInfo,
    handleAccessToken,
  ]);

  // 2. 상태 변화 감지 후 리디렉트
  useEffect(() => {
    if (!isLogin || !isRehydrated) return;
    // VIEWER는 채널, 세션코드 필요
    let targetUrl = '/';
    if (role === 'VIEWER' && channelId && sessionCode) {
      targetUrl = `/viewer/${channelId}/${sessionCode}/participation`;
    }
    router.replace(targetUrl);
  }, [isLogin, role, channelId, sessionCode, router, isRehydrated]);

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

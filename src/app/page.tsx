'use client';

import BtnWithChildren from '@/components/atoms/button/BtnWithChildren';
import Live from '@/components/atoms/label/Live';
import OFF from '@/components/atoms/label/Off';
import CategoryText from '@/components/atoms/text/CategoryText';
import RefreshText from '@/components/atoms/text/RefreshText';
import StreamerTextComment from '@/components/atoms/text/StreamerTextComment';
import StreamerTextLive from '@/components/atoms/text/StreamerTextLive';
import { postStreamerInfo } from '@/services/streamer/streamer';
import { StreamerInfo } from '@/services/streamer/type';
import useChannelStore from '@/store/channelStore';
import useAuthStore from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import CommonLayout from '@/components/layout/CommonLayout';
import HydrateProvider from '@/provider/HydrateProvider';
import BigProfileImg from '@/components/atoms/profile/BigProfileImg';
import Loading from './loading';
import { toast } from 'react-toastify';

export default function Home() {
  const router = useRouter();
  const { accessToken, isRehydrated, isLogin } = useAuthStore((state) => state);
  const [streamerInfo, setStateStreamerInfo] = useState<StreamerInfo | null>(null);
  const { channelId } = useChannelStore((state) => state);
  const setStreamerInfo = useChannelStore((state) => state.setStreamerInfo);

  const onClickCreateSession = () => {
    toast.warn(`😭code:43001

이미 진행중인 컨텐츠 세션이 존재해서 중복 생성할 수 없습니다.

로그아웃 또는 진행중인 세션이 종료될 때까지 잠시만 기다려 주세요!`);
    //router.push('/streamer/settings');
  };

  const fetchData = useCallback(async () => {
    if (!channelId) {
      router.replace('/login');
      return;
    }
    const response = await postStreamerInfo(channelId);

    if (response) {
      console.log('response', response);
      setStateStreamerInfo(response);
      setStreamerInfo(response);
    }
  }, [channelId, router, setStreamerInfo]);

  useEffect(() => {
    const init = async () => {
      await fetchData();
    };
    router.refresh();

    if (isRehydrated) {
      if (!accessToken && !isLogin) {
        console.log('로그인 정보가 없습니다. 로그인 페이지로 리다이렉트합니다.');
        router.replace('/login');
      } else {
        init();
      }
    }
  }, [accessToken, fetchData, isLogin, router, isRehydrated]);

  // 로드가 완료될 때까지 로딩 화면 표시
  if (!isRehydrated) {
    return <Loading />;
  }
  return (
    <CommonLayout>
      <HydrateProvider>
        {streamerInfo && (
          <div className="flex w-full flex-1 flex-col items-center justify-center">
            <section className="flex w-full flex-1 flex-col items-center justify-center">
              <div className="mb-10 flex flex-col items-center justify-center gap-2">
                <StreamerTextLive isLive={streamerInfo.status}></StreamerTextLive>
                <StreamerTextComment isLive={streamerInfo.status}></StreamerTextComment>
              </div>
              <BigProfileImg
                imageUrl={streamerInfo.channel.channelImageUrl}
                status={streamerInfo.status}
              />
              <div className="mt-3 flex flex-row items-center justify-center">
                {streamerInfo.status === 'OPEN' ? <Live /> : <OFF />}
                <div className="text-bold-large">{streamerInfo.channel.channelName}</div>
              </div>
              {streamerInfo.status === 'OPEN' ? (
                <CategoryText category={streamerInfo.liveCategoryValue || ''}></CategoryText>
              ) : (
                <RefreshText onClickHandler={fetchData} />
              )}
            </section>
            <BtnWithChildren
              onClickHandler={onClickCreateSession}
              type={streamerInfo.status === 'OPEN' ? 'default' : 'disable'}
            >
              시참 등록 생성할래요
            </BtnWithChildren>
          </div>
        )}
      </HydrateProvider>
    </CommonLayout>
  );
}

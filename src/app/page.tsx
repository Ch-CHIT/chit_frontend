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
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import CommonLayout from '@/components/layout/CommonLayout';
import { toast } from 'react-toastify';

export default function Home() {
  const router = useRouter();
  const setRole = useAuthStore((state) => state.setRole);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isRehydrated = useAuthStore((state) => state.isRehydrated);
  const [streamerInfo, setStateStreamerInfo] = useState<StreamerInfo | null>(null);
  const { setChannelId, channelId } = useChannelStore((state) => state);
  const setStreamerInfo = useChannelStore((state) => state.setStreamerInfo);
  const onClickCreateSession = () => {
    router.push('/streamer/settings');
  };

  const fetchData = useCallback(async () => {
    if (!channelId) {
      toast.error('채널 아이디가 없습니다.');
      router.push('/login');
      return;
    }
    const response = await postStreamerInfo(channelId);
    console.log('response', response);

    if (response) {
      setStateStreamerInfo(response);
      setChannelId(response.channel.channelId);
      setStreamerInfo(response);
    }
  }, [channelId, router, setChannelId, setStreamerInfo]);

  useEffect(() => {
    const init = async () => {
      await fetchData();
    };

    if (isRehydrated) {
      if (!accessToken) {
        setRole('STREAMER');
        router.push('/login');
      } else {
        init();
      }
      init();
    }
  }, [accessToken, fetchData, isRehydrated, router, setRole]);

  // 로드가 완료될 때까지 로딩 화면 표시
  if (!isRehydrated) {
    return (
      <CommonLayout>
        <div>Loading...</div>
      </CommonLayout>
    );
  }

  return (
    <CommonLayout>
      {streamerInfo && (
        <div className="flex w-full flex-1 flex-col items-center justify-center">
          <section className="flex w-full flex-1 flex-col items-center justify-center">
            <div className="mb-10 flex flex-col items-center justify-center gap-2">
              <StreamerTextLive isLive={streamerInfo.status}></StreamerTextLive>
              <StreamerTextComment isLive={streamerInfo.status}></StreamerTextComment>
            </div>
            <div
              className={`relative h-32 w-32 overflow-hidden rounded-full p-[3px] ring-4 ${streamerInfo.status === 'OPEN' ? 'ring-primary' : 'ring-disable'}`}
            >
              <Image
                src={streamerInfo.channel.channelImageUrl || '/assets/logo/logo_small.svg'}
                fill
                className={`${streamerInfo.channel.channelImageUrl ? 'object-cover' : 'object-contain p-3'}`}
                alt="profile"
              />
            </div>
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
          <BtnWithChildren onClickHandler={onClickCreateSession}>
            시참 등록 생성할래요
          </BtnWithChildren>
        </div>
      )}
    </CommonLayout>
  );
}

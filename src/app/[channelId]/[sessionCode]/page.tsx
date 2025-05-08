import Image from 'next/image';
import { notFound } from 'next/navigation';
import CategoryText from '@/components/atoms/text/CategoryText';
import Live from '@/components/atoms/label/Live';
import OFF from '@/components/atoms/label/Off';
import ViewerPageLayout from '@/components/layout/ViewerPageLayout';
import { postStreamerInfo } from '@/services/streamer/streamer';
import StreamerTextLive from '@/components/atoms/text/StreamerTextLive';
import dynamic from 'next/dynamic';

const BtnViewerLogin = dynamic(() => import('@/components/atoms/button/BtnViewerLogin'), {
  ssr: false,
});

interface PageProps {
  searchParams: Promise<{
    [key: string]: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  //로그인 되어있는지
  const { sessionCode, channelId } = await searchParams;
  const streamerInfo = await postStreamerInfo(channelId);

  if (!streamerInfo) {
    notFound();
  }

  if (streamerInfo.status === 'CLOSE') {
    return (
      <ViewerPageLayout>
        <section className="flex w-full flex-1 flex-col items-center justify-center">
          <div className="w-full">
            <div className="mb-12 flex w-full flex-col items-center justify-center">
              <p className="blcok text-bold-large">종료된 시참이에요</p>
              <p>다음 시참을 기대해주세요 :)</p>
            </div>
            <div className="flex w-full flex-col items-center justify-center">
              <p className="text-medium-small text-alert">스트리머가 시참을 진행중이라면</p>
              <p className="text-medium-small text-alert">시참 링크를 요청해보세요!</p>
            </div>
          </div>
        </section>
      </ViewerPageLayout>
    );
  }

  return (
    streamerInfo && (
      <>
        <section className="flex w-full flex-1 flex-col items-center justify-center">
          <div className="mb-10 flex flex-col items-center justify-center gap-2">
            <StreamerTextLive isLive={streamerInfo.status}></StreamerTextLive>
          </div>
          <Image
            src={streamerInfo.channel.channelImageUrl || '/tempImage.png'}
            width={128}
            height={128}
            alt="profile"
            className={`${streamerInfo.status === 'OPEN' ? 'shadow-inset-primary' : 'shadow-inset-disable'} overflow-hidden rounded-full p-[3px]`}
          />

          <div className="mt-3 flex flex-row items-center justify-center">
            {streamerInfo.status === 'OPEN' ? <Live /> : <OFF />}
            <div className="text-bold-large">{streamerInfo.channel.channelName}</div>
          </div>
          <CategoryText category={streamerInfo.liveCategoryValue || ''}></CategoryText>
        </section>
        <BtnViewerLogin
          channelId={channelId}
          sessionCode={sessionCode}
          streamerInfo={streamerInfo}
        ></BtnViewerLogin>
      </>
    )
  );
}

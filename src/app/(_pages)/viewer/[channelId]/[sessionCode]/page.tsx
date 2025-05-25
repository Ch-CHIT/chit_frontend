import { notFound } from 'next/navigation';
import CategoryText from '@/components/atoms/text/CategoryText';
import Live from '@/components/atoms/label/Live';
import OFF from '@/components/atoms/label/Off';
import ViewerPageLayout from '@/components/layout/ViewerPageLayout';
import { postStreamerInfo } from '@/services/streamer/streamer';
import StreamerTextLive from '@/components/atoms/text/StreamerTextLive';
import BtnViewerLogin from '@/components/atoms/button/BtnViewerLogin';
import BigProfileImg from '@/components/atoms/profile/BigProfileImg';

type Params = { params: Promise<{ channelId: string; sessionCode: string }> };

export default async function Page(props: Params) {
  const { params } = props;
  const { channelId: paramsChannelId, sessionCode: paramsSessionCode } = await params;
  console.log('paramsChannelId', paramsChannelId);
  console.log('paramsSessionCode', paramsSessionCode);
  const streamerInfo = await postStreamerInfo(paramsChannelId);
  if (!streamerInfo) {
    notFound();
  }

  if (streamerInfo?.status === 'CLOSE') {
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
          <BigProfileImg
            imageUrl={streamerInfo.channel.channelImageUrl}
            status={streamerInfo.status}
          ></BigProfileImg>
          <div className="mt-3 flex flex-row items-center justify-center">
            {streamerInfo.status === 'OPEN' ? <Live /> : <OFF />}
            <div className="text-bold-large">{streamerInfo.channel.channelName}</div>
          </div>
          <CategoryText category={streamerInfo.liveCategoryValue || ''}></CategoryText>
        </section>
        <BtnViewerLogin
          channelId={paramsChannelId}
          sessionCode={paramsSessionCode}
          streamerInfo={streamerInfo}
        ></BtnViewerLogin>
      </>
    )
  );
}

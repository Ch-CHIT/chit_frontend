'use client';

import BtnWithChildren from '@/components/atoms/button/BtnWithChildren';
import Live from '@/components/atoms/label/Live';
import OFF from '@/components/atoms/label/Off';
import MediumProfileImg from '@/components/atoms/profile/MediumProfileImg';
import HintText from '@/components/atoms/text/HintText';
import ViewerPageLayout from '@/components/layout/ViewerPageLayout';
import useParentPath from '@/hooks/useParentPath';
import useChannelStore from '@/store/channelStore';
import { useRouter } from 'next/navigation';

export default function Page() {
  const streamerInfo = useChannelStore((state) => state.streamerInfo);
  const router = useRouter();
  const parentPath = useParentPath();
  const onClickHandler = () => {
    router.replace(parentPath);
  };

  return (
    streamerInfo && (
      <ViewerPageLayout>
        <section className="flex flex-row justify-start">
          <MediumProfileImg
            imageUrl={streamerInfo.channel.channelImageUrl}
            status={streamerInfo.status}
          />
          <div className="ml-3 flex flex-col items-start justify-center">
            {streamerInfo.status === 'OPEN' ? <Live /> : <OFF />}
            <div className="text-bold-large">{streamerInfo.channel.channelName}</div>
          </div>
        </section>
        <section className="mt-11 flex w-full flex-1 flex-col items-start">
          <p className="text-bold-large">시참 목록에서 제외됐어요 😢</p>
          <div className="mt-4 text-bold-small">
            <p>
              내 차례에도 <span className="text-primary">오랫동안 응답이 없다면</span>
            </p>
            <p>
              <span className="text-secondary">스트리밍의 원활한 진행</span>을 위해
              <span className="text-primary"> 목록에서 제외</span>될 수 있어요
            </p>
          </div>
          <div className="mt-4">
            <HintText>시참 목록에 다시 참여할 수 있지만,</HintText>
            <HintText>
              너무 자주 자리를 비우신다면 <span className="text-alert">사용에 제한</span>이 생길 수
              있으니 조심하세요!
            </HintText>
          </div>
        </section>
        <BtnWithChildren type={'default'} onClickHandler={onClickHandler}>
          시참목록에서 다시 등록할래요
        </BtnWithChildren>
      </ViewerPageLayout>
    )
  );
}

'use client';

import useChannelStore from '@/store/channelStore';
import { useSSEStore } from '@/store/sseStore';
import useAuthStore from '@/store/authStore';
import useParamsParser from '@/hooks/useParamsParser';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import BtnWithChildren from '@/components/atoms/button/BtnWithChildren';
import CategoryText from '@/components/atoms/text/CategoryText';
import HintText from '@/components/atoms/text/HintText';
import ViewerPageLayout from '@/components/layout/ViewerPageLayout';
import Input from '@/components/atoms/input/Input';
import { useSessionStatus } from './../../../../../../hooks/useSessionStatus';

export default function Participation() {
  const [viewerGameNickname, setViewerGameNickname] = useState('');
  const { sessionCode, channelId } = useParamsParser();
  const router = useRouter();
  const { setViewerNickname } = useSSEStore();
  const streamerInfo = useChannelStore((state) => state.streamerInfo);
  const accessToken = useAuthStore((state) => state.accessToken);
  const { isSessionOpen, fetchSessionStatus } = useSessionStatus(channelId, accessToken);

  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setViewerGameNickname(e.target.value);
  };

  const isViewerNicknameValid = (nickname: string) => nickname.trim().length > 0;

  const handleSubmit = async () => {
    if (!isViewerNicknameValid || !isSessionOpen) return;

    setViewerNickname(viewerGameNickname);
    toast.success('시참에 참여했습니다. 조금만 기다려주세요!');
    router.replace(`waiting`);
  };

  if (!streamerInfo) {
    router.replace(`${channelId}/${sessionCode}`);
  }

  return (
    streamerInfo && (
      <ViewerPageLayout>
        <section className="flex w-full flex-1 flex-col items-start">
          <div className="mb-8">
            <CategoryText
              isLeft={true}
              isMiddle={true}
              category={streamerInfo?.liveCategoryValue || ''}
            />
            <div className="text-bold-small">처음 참여하시는 게임이네요!</div>
          </div>
          <div className="mb-5 w-full">
            <div className="mb-12 w-full text-bold-middle">
              <p>
                <span className="text-secondary">게임 닉네임</span>을 알려주시면
              </p>
              <p>스트리머에게 전달해드릴게요:)</p>
              <HintText>닉네임은 스트리머에게만 보여지며, 다른 목적으로 활용하지 않아요</HintText>
            </div>
            <Input
              type="text"
              value={viewerGameNickname}
              onChange={onChangeInput}
              name="gameNickname"
              placeholder="여기에 게임닉네임을 입력해 주세요"
            />
            <HintText>* 등록한 닉네임은 나중에 수정할 수 있어요</HintText>
          </div>
        </section>
        {!isSessionOpen && (
          <div
            className="mb-2 flex w-full cursor-pointer items-center justify-center text-bold-small text-hint"
            onClick={() => fetchSessionStatus()}
          >
            시참 상태 다시 불러오기
          </div>
        )}
        <BtnWithChildren
          onClickHandler={handleSubmit}
          type={isViewerNicknameValid && isSessionOpen ? 'default' : 'disable'}
        >
          {!isSessionOpen ? '아직 시참이 열리지 않았어요' : '닉네임 다 입력했어요'}
        </BtnWithChildren>
      </ViewerPageLayout>
    )
  );
}

'use client';

import Minus from '../../../../public/assets/icons/Minus';
import Plus from '../../../../public/assets/icons/Plus';
import { BtnSubmit } from '@/components/atoms/button/BtnWithChildren';
import { InputPassword } from '@/components/atoms/input/Input';
import CategoryText from '@/components/atoms/text/CategoryText';
import CommonLayout from '@/components/layout/CommonLayout';
import useDetectExit from '@/hooks/useDetectExit';
import { createContentsSession, updateContentsSession } from '@/services/streamer/streamer';
import useChannelStore from '@/store/channelStore';
import useContentsSessionStore from '@/store/sessionStore';
import { useSSEStore } from '@/store/sseStore';
import useAuthStore from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';

export default function Settings() {
  const [maxGroupParticipants, setmaxGroupParticipants] = useState(1);
  const router = useRouter();
  const { eventSource } = useSSEStore((state) => state);
  const accessToken = useAuthStore((state) => state.accessToken);
  const { streamerInfo } = useChannelStore((state) => state);
  const { setSessionInfo, setIsSession, isSession } = useContentsSessionStore((state) => state);

  //브라우저 종료시 실행되는 콜백 함수
  const handleExit = async () => {
    if (eventSource) {
      // await logout({ accessToken });
      //로그아웃 api 쓰기
    }
  };

  useDetectExit(handleExit);

  const onClickPlusMinusHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    const eventName = e.currentTarget.name;

    if (eventName === 'plus') {
      setmaxGroupParticipants((prev) => prev + 1);
    } else {
      if (maxGroupParticipants !== 1) {
        setmaxGroupParticipants((prev) => prev - 1);
      }
    }
  };

  const onChangeInputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const max = Number(e.currentTarget.max);
    const min = 0;
    const numericValue = Number(e.currentTarget.value);

    if (numericValue >= max) {
      window.alert('1000 이상의 숫자는 입력할 수 없습니다.');
    } else if (numericValue < min) {
      setmaxGroupParticipants(min);
    } else {
      setmaxGroupParticipants(numericValue);
    }
  };

  const onClickCreateSession = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // 기본 제출 동작 방지
    const formData = new FormData(e.currentTarget); // 현재 폼의 데이터 수집
    const { gameParticipationCode, maxGroupParticipants } = Object.fromEntries(formData.entries()); // 객체로 변환
    const strGameParticipationCode = gameParticipationCode as string;

    const reqData = {
      gameParticipationCode: strGameParticipationCode || null,
      maxGroupParticipants: Number(maxGroupParticipants),
    };

    if (!accessToken) {
      toast.warn('토큰이 없습니다. 잠시후 다시 시도해주세요');
      return;
    }
    if (!isSession) {
      const response = await createContentsSession(reqData, accessToken);
      if (response.success) {
        setSessionInfo(response.data.data);
        setIsSession(true); // 세션이 생성되었음을 상태에 반영
        toast.success('✅ 세션이 성공적으로 생성되었습니다!');
        router.push(`/streamer/list?max=${maxGroupParticipants}`);
      }
    } else {
      const response = await updateContentsSession(reqData, accessToken);
      if (response.success) {
        setSessionInfo(response.data.data);
        toast.success('✅ 세션이 성공적으로 업데이트 되었습니다!');
        router.push(`/streamer/list?max=${maxGroupParticipants}`);
      }
    }
  };

  return (
    <CommonLayout>
      {streamerInfo && (
        <div className="flex w-full flex-1 flex-col items-center justify-center">
          <form className="flex h-full w-full flex-col" onSubmit={onClickCreateSession}>
            <section className="flex w-full flex-1 flex-col items-start">
              <div className="mb-8">
                <CategoryText isMiddle={true} category={streamerInfo.liveCategoryValue || ''} />
                <div className="w-fit cursor-pointer border-b border-disable text-medium-small text-disable">
                  카테고리 정보 다시 불러오기
                </div>
              </div>
              <div className="mb-11 w-full text-bold-small">
                <p className="pb-2">
                  <span className="text-secondary">참여 코드</span>가 필요할까요?
                </p>
                <div className="h-11">
                  <InputPassword
                    className="p-0"
                    name="gameParticipationCode"
                    placeholder="참여코드가 있다면 입력해주세요"
                  />
                </div>
              </div>
              <div>
                <p className="text-bold-small">한 파티에 몇 명이 필요한가요?</p>
                <p className="mb-5 mt-[6px] w-fit text-medium text-hint">
                  다음 파티 호출 버튼을 클릭했을 때 설정할 인원 수 만큼 목록이 돌아가요.
                </p>
                <div className="flex items-center">
                  <button
                    name="minus"
                    type="button"
                    onClick={onClickPlusMinusHandler}
                    className="rounded-full bg-white p-1"
                  >
                    <Minus width={16} height={16}></Minus>
                  </button>
                  <input
                    onChange={onChangeInputHandler}
                    value={maxGroupParticipants.toString()}
                    name="maxGroupParticipants"
                    type="number"
                    max={1000}
                    className="mx-3 w-[102px] rounded px-3 py-2 text-center text-bold-middle text-black"
                  ></input>
                  <button
                    name="plus"
                    type="button"
                    onClick={onClickPlusMinusHandler}
                    className="rounded-full bg-white p-1"
                  >
                    <Plus width={16} height={16}></Plus>
                  </button>
                </div>
              </div>
            </section>
            <BtnSubmit>시참 설정 완료 🎉 </BtnSubmit>
          </form>
        </div>
      )}
    </CommonLayout>
  );
}

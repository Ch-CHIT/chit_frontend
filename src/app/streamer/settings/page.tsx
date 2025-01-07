'use client';
import Minus from '@/app/assets/icons/Minus';
import Plus from '@/app/assets/icons/Plus';
import { BtnSubmit } from '@/app/components/atoms/button/BtnWithChildren';
import { InputPassword } from '@/app/components/atoms/input/Input';
import CategoryText from '@/app/components/atoms/text/CategoryText';
import CommonLayout from '@/app/components/layout/CommonLayout';
import useAuthStore from '@/app/store/store';
import axios from 'axios';
import { useState } from 'react';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DUMMY_ON = {
  isLive: 1,
  name: '따효니',
  category: '월드오브 워크래프트 : 내부전쟁',
  isCreate: 'true',
};

const DUMMY = DUMMY_ON;

export default function Settings() {
  const [maxParticipantCount, setMaxParticipantCount] = useState(1);
  const accessToken = useAuthStore((state) => state.accessToken);
  const onClickPlusMinusHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    const eventName = e.currentTarget.name;

    if (eventName === 'plus') {
      setMaxParticipantCount((prev) => prev + 1);
    } else {
      if (maxParticipantCount !== 1) {
        setMaxParticipantCount((prev) => prev - 1);
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
      setMaxParticipantCount(min);
    } else {
      setMaxParticipantCount(numericValue);
    }
  };

  const onClickCreateSession = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // 기본 제출 동작 방지
    const formData = new FormData(e.currentTarget); // 현재 폼의 데이터 수집
    const { gameParticipationCode, maxParticipantCount } = Object.fromEntries(
      formData.entries(),
    ); // 객체로 변환

    const reqData = {
      gameParticipationCode,
      maxParticipantCount: Number(maxParticipantCount),
    };
    const response = await axios.post(
      'http://localhost:8080/api/v1/contents-session',
      reqData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`, // accessToken을 Bearer 토큰으로 추가
        },
      },
    );

    console.log(response);
  };

  return (
    <CommonLayout>
      <div className="flex w-full flex-1 flex-col items-center justify-center">
        <form
          className="flex h-full w-full flex-col"
          onSubmit={onClickCreateSession}
        >
          <section className="flex w-full flex-1 flex-col items-start">
            <div className="mb-8">
              <CategoryText isMiddle={true} category={DUMMY.category} />
              <span className="w-fit cursor-pointer border-b border-disable text-medium-small text-disable">
                카테고리 정보 다시 불러오기
              </span>
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
                다음 파티 호출 버튼을 클릭했을 때 설정할 인원 수 만큼 목록이
                돌아가요.
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
                  value={maxParticipantCount.toString()}
                  name="maxParticipantCount"
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
          <BtnSubmit>시참 목록 완성 🎉 </BtnSubmit>
        </form>
      </div>
    </CommonLayout>
  );
}

import { handleSessionError } from '@/lib/handleErrors';
import apiSession from '../axios/apiSession';
import {
  DeleteContentSessionViewerLeaveRequest,
  DeleteContentSessionViewerLeaveResponse,
  GetContentsSessionGameCodeRequest,
  GetContentsSessionGameCodeResponse,
  GetContentsSessionViewerSubscribeRequest,
} from './type';
import makeUrl from '@/lib/makeUrl';
import { SESSION_URLS } from '@/constants/urls';

//시청자 구독 요청
export const getContentsSessionViewerSubscribe = async ({
  sessionCode,
  gameNickname,
  accessToken,
}: GetContentsSessionViewerSubscribeRequest): Promise<any> => {
  try {
    const URL = makeUrl({
      accessToken,
      isStreamer: false,
      sessionCode,
      viewerNickname: gameNickname,
    });
    const response = await apiSession.get(URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`, // accessToken을 Bearer 토큰으로 추가
      },
    });

    return response.data; // 성공적인 응답 데이터 반환
  } catch (error: unknown) {
    return handleSessionError(error); // 에러 핸들링 함수 사용
  }
};

//게임코드 가져오기
export const getContentsSessionViewerGameCode = async ({
  sessionCode,
  accessToken,
}: GetContentsSessionGameCodeRequest): Promise<GetContentsSessionGameCodeResponse> => {
  try {
    const url = `${SESSION_URLS.contentsSession}/${sessionCode}/gameCode`;
    const response = await apiSession.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`, // accessToken을 Bearer 토큰으로 추가
      },
    });

    return response.data; // 성공적인 응답 데이터 반환
  } catch (error: unknown) {
    return handleSessionError(error); // 에러 핸들링 함수 사용
  }
};

//viewer 세션에서 나가기
export const deleteContentsSessionViewerLeave = async ({
  accessToken,
  sessionCode,
}: DeleteContentSessionViewerLeaveRequest): Promise<DeleteContentSessionViewerLeaveResponse> => {
  console.log(accessToken);
  try {
    const response = await apiSession.delete(
      `${SESSION_URLS.contentsSession}/${sessionCode}/leave`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`, // accessToken을 Bearer 토큰으로 추가
        },
      },
    );

    return response.data; // 성공적인 응답 데이터 반환
  } catch (error: unknown) {
    return handleSessionError(error); // 에러 핸들링 함수 사용
  }
};

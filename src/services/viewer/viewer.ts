import { handleError } from '@/lib/handleErrors';
import sessionClient from '../_axios/sessionClient';
import {
  DeleteContentSessionViewerLeaveRequest,
  DeleteContentSessionViewerLeaveResponse,
  GetContentsSessionGameCodeRequest,
  GetContentsSessionGameCodeResponse,
  GetContentsSessionViewerSubscribeRequest,
} from './type';
import makeUrl from '@/lib/makeUrl';
import { SESSION_URLS, SSE_URLS } from '@/constants/urls';

//시청자 구독 요청
export const getContentsSessionViewerSubscribe = async ({
  sessionCode,
  gameNickname,
  accessToken,
}: GetContentsSessionViewerSubscribeRequest): Promise<any> => {
  try {
    const URL = makeUrl({
      accessToken,
      sessionCode,
      viewerNickname: gameNickname,
    });
    const response = await sessionClient.get(URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`, // accessToken을 Bearer 토큰으로 추가
      },
    });

    return response.data; // 성공적인 응답 데이터 반환
  } catch (error: unknown) {
    return handleError(error); // 에러 핸들링 함수 사용
  }
};

//게임코드 가져오기
export const getContentsSessionViewerGameCode = async ({
  sessionCode,
  accessToken,
}: GetContentsSessionGameCodeRequest): Promise<GetContentsSessionGameCodeResponse> => {
  try {
    const url = `${SESSION_URLS.contentsSession}/${sessionCode}/gameCode`;
    const response = await sessionClient.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`, // accessToken을 Bearer 토큰으로 추가
      },
    });

    return response.data; // 성공적인 응답 데이터 반환
  } catch (error: unknown) {
    return handleError(error); // 에러 핸들링 함수 사용
  }
};

//viewer 세션에서 나가기
export const deleteContentsSessionViewerLeave = async ({
  accessToken,
  sessionCode,
}: DeleteContentSessionViewerLeaveRequest): Promise<DeleteContentSessionViewerLeaveResponse> => {
  try {
    const response = await sessionClient.delete(
      `${SESSION_URLS.contentsSession}/${sessionCode}/leave`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`, // accessToken을 Bearer 토큰으로 추가
        },
      },
    );

    return response.data; // 성공적인 응답 데이터 반환
  } catch (error: unknown) {
    return handleError(error); // 에러 핸들링 함수 사용
  }
};

//시청자 하트비트
export const heartBeatViewer = async (accessToken: string, sessionCode: string) => {
  try {
    const response = await sessionClient.get(`${SSE_URLS.heartBeat}?sessionCode=${sessionCode}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`, // accessToken을 Bearer 토큰으로 추가
      },
    });
    console.log('heartBeat');
    return response.data; // 성공적인 응답 데이터 반환
  } catch (error: unknown) {
    return handleError(error); // 에러 핸들링 함수 사용
  }
};
